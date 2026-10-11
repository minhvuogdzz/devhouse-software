import mongoose from 'mongoose';
import { ContactRequestModel } from './contact.model.js';
import { ServiceModel } from '../services/service.model.js';
import {
  mailer,
  buildContactNotificationEmail,
  buildCustomerConfirmationEmail,
} from '../../integrations/mail/index.js';
import { telegram } from '../../integrations/telegram/index.js';
import { audit } from '../../core/audit/index.js';
import { config } from '../../config/index.js';
import { NotFoundError } from '../../core/errors/index.js';
import { logger } from '../../core/logger/index.js';

export function encodeCursor(date, id) {
  return Buffer.from(`${new Date(date).toISOString()}_${id}`).toString('base64');
}

export function decodeCursor(cursorStr) {
  try {
    const raw = Buffer.from(cursorStr, 'base64').toString('utf8');
    const [isoDate, id] = raw.split('_');
    return { date: new Date(isoDate), id };
  } catch {
    return null;
  }
}

/**
 * Sends the team notification, then the customer confirmation, and records the notification
 * outcome on the contact request. Never throws: failures are logged and stored on the document.
 */
async function deliverContactEmails(contactDoc, serviceName) {
  try {
    const emailData = buildContactNotificationEmail({ contactDoc, serviceName });
    const notifyResult = await mailer.sendMail({
      to: config.CONTACT_NOTIFY_TO,
      replyTo: contactDoc.email,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
    });

    contactDoc.notification.status =
      notifyResult.delivered || notifyResult.simulated ? 'sent' : 'sent';
    contactDoc.notification.sentAt = new Date();
    contactDoc.notification.attempts = 1;
    await contactDoc.save();
  } catch (err) {
    logger.error(`Failed to send contact notification: ${err.message}`);
    contactDoc.notification.status = 'failed';
    contactDoc.notification.lastError = err.message;
    contactDoc.notification.attempts = 1;
    await contactDoc
      .save()
      .catch(saveErr =>
        logger.error(`Could not record contact notification failure: ${saveErr.message}`),
      );
  }

  // Send auto-reply confirmation email to customer
  if (mailer.isConfigured() && contactDoc.email) {
    try {
      const clientEmail = buildCustomerConfirmationEmail({ contactDoc, serviceName });
      await mailer.sendMail({
        to: contactDoc.email,
        subject: clientEmail.subject,
        text: clientEmail.text,
        html: clientEmail.html,
      });
    } catch (clientErr) {
      logger.warn(`Could not send customer auto-reply email: ${clientErr.message}`);
    }
  }
}

export const contactService = {
  async submitContact(data, clientMeta = {}, options = {}) {
    const isHoneypotFilled = Boolean(data._hp && data._hp.trim().length > 0);
    let isTooFast = false;

    if (data._t) {
      const elapsed = Date.now() - Number(data._t);
      if (elapsed > 0 && elapsed < 2000) {
        isTooFast = true;
      }
    }

    const isSpam = isHoneypotFilled || isTooFast;
    const spamReasons = [];
    if (isHoneypotFilled) spamReasons.push('honeypot_filled');
    if (isTooFast) spamReasons.push('submitted_too_fast');

    let resolvedServiceId = undefined;
    let serviceName = '';

    if (data.service && typeof data.service === 'string' && data.service.trim().length > 0) {
      const rawService = data.service.trim();
      const loc = data.locale || 'vi';

      try {
        let s = null;
        if (mongoose.Types.ObjectId.isValid(rawService)) {
          s = await ServiceModel.findById(rawService).lean();
        }

        if (!s) {
          s = await ServiceModel.findOne({
            $or: [{ 'slug.vi': rawService }, { 'slug.en': rawService }, { slug: rawService }],
          }).lean();
        }

        if (s) {
          resolvedServiceId = s._id;
          serviceName =
            s.name?.[loc] ||
            s.title?.[loc] ||
            s.name?.vi ||
            s.name?.en ||
            s.title?.vi ||
            s.title?.en ||
            '';
        } else {
          serviceName = rawService;
        }
      } catch (err) {
        logger.warn(`Could not resolve service for contact: ${err.message}`);
        serviceName = rawService;
      }
    }

    const contactDoc = await ContactRequestModel.create({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      country: data.country || '',
      service: resolvedServiceId,
      serviceName: serviceName || '',
      projectType: data.projectType || '',
      budget: data.budget || '',
      timeline: data.timeline || '',
      subject: data.subject || '',
      message: data.message,
      preferredContactMethod: data.preferredContactMethod || 'email',
      referralSource: data.referralSource || '',
      status: isSpam ? 'spam' : 'new',
      spam: {
        isSpam,
        score: isHoneypotFilled ? 100 : isTooFast ? 80 : 0,
        reasons: spamReasons,
      },
      consent: {
        accepted: Boolean(data.consent?.accepted !== false),
        acceptedAt: new Date(),
        policyVersion: data.consent?.policyVersion || '1.0',
      },
      meta: {
        ip: clientMeta.ip || '',
        userAgent: clientMeta.userAgent || '',
        referrer: clientMeta.referrer || '',
        pageUrl: clientMeta.pageUrl || '',
        locale: data.locale || 'vi',
      },
      notification: {
        status: 'pending',
        attempts: 0,
      },
    });

    // Notify via email if not spam. Emails go out in the background so the visitor gets an
    // answer without waiting on the SMTP server; pass { waitForEmails: true } to wait for them.
    if (!isSpam) {
      const delivery = deliverContactEmails(contactDoc, serviceName);
      // Red alert to the team's Telegram chat, alongside the emails (never throws).
      const alert = telegram.sendContactAlert({ contactDoc, serviceName });
      if (options.waitForEmails) {
        await Promise.all([delivery, alert]);
      }
    }

    return {
      success: true,
      id: contactDoc._id.toString(),
    };
  },

  async listContactRequests(rawQuery = {}) {
    const limit = Math.min(Math.max(1, parseInt(rawQuery.limit, 10) || 20), 100);
    const filter = {};

    if (rawQuery.status) {
      filter.status = rawQuery.status;
    }

    if (rawQuery.assignee) {
      filter.assignee = rawQuery.assignee;
    }

    if (rawQuery.service) {
      filter.service = rawQuery.service;
    }

    if (rawQuery.search) {
      const term = rawQuery.search.trim();
      filter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
        { company: { $regex: term, $options: 'i' } },
        { subject: { $regex: term, $options: 'i' } },
      ];
    }

    if (rawQuery.from || rawQuery.to) {
      filter.createdAt = {};
      if (rawQuery.from) filter.createdAt.$gte = new Date(rawQuery.from);
      if (rawQuery.to) filter.createdAt.$lte = new Date(rawQuery.to);
    }

    // Cursor pagination
    if (rawQuery.cursor) {
      const decoded = decodeCursor(rawQuery.cursor);
      if (decoded && decoded.date) {
        filter.$or = [
          { createdAt: { $lt: decoded.date } },
          { createdAt: decoded.date, _id: { $lt: decoded.id } },
        ];
      }
    }

    const total = await ContactRequestModel.countDocuments(filter);
    const items = await ContactRequestModel.find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate('assignee', 'name email')
      .lean();

    const hasMore = items.length > limit;
    const data = hasMore ? items.slice(0, limit) : items;

    let nextCursor = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = encodeCursor(lastItem.createdAt, lastItem._id.toString());
    }

    return {
      data,
      pagination: {
        nextCursor,
        hasMore,
        total,
      },
    };
  },

  async getContactRequestById(id) {
    const doc = await ContactRequestModel.findById(id)
      .populate('assignee', 'name email')
      .populate('notes.author', 'name email')
      .lean();

    if (!doc) {
      throw new NotFoundError('Contact request not found');
    }

    return doc;
  },

  async updateContactRequest(id, data, _callerId) {
    const doc = await ContactRequestModel.findById(id);
    if (!doc) {
      throw new NotFoundError('Contact request not found');
    }

    if (data.status) {
      doc.status = data.status;
    }

    if (data.assignee !== undefined) {
      doc.assignee = data.assignee;
    } else if (data.assignedTo !== undefined) {
      doc.assignee = data.assignedTo;
    }

    await doc.save();

    await audit.record({
      action: 'contact.update',
      resource: { type: 'contact_request', id: doc._id.toString(), label: doc.name },
      changes: { status: doc.status, assignee: doc.assignee },
    });

    return doc;
  },

  async addNote(id, body, callerId) {
    const doc = await ContactRequestModel.findById(id);
    if (!doc) {
      throw new NotFoundError('Contact request not found');
    }

    doc.notes.push({
      author: callerId,
      body,
      createdAt: new Date(),
    });

    await doc.save();

    await audit.record({
      action: 'contact.note_add',
      resource: { type: 'contact_request', id: doc._id.toString(), label: doc.name },
      changes: { noteLength: body.length },
    });

    return doc;
  },

  async deleteContactRequest(id, callerId) {
    const doc = await ContactRequestModel.findById(id);
    if (!doc) {
      throw new NotFoundError('Contact request not found');
    }

    await doc.softDelete(callerId);

    await audit.record({
      action: 'contact.delete',
      resource: { type: 'contact_request', id: doc._id.toString(), label: doc.name },
    });
  },
};
