import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { ContactRequestModel } from '../src/modules/contact/contact.model.js';
import {
  contactService,
  encodeCursor,
  decodeCursor,
} from '../src/modules/contact/contact.service.js';
import { ServiceModel } from '../src/modules/services/service.model.js';

describe('Contact Module (M9)', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devhouse_dev';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await ContactRequestModel.deleteMany({});
    await ServiceModel.deleteMany({});
  });

  beforeEach(async () => {
    await ContactRequestModel.deleteMany({});
    await ServiceModel.deleteMany({});
  });

  describe('Cursor encoding/decoding helper', () => {
    it('encodes and decodes date and id properly', () => {
      const date = new Date('2026-05-15T10:00:00.000Z');
      const id = '507f1f77bcf86cd799439011';
      const encoded = encodeCursor(date, id);
      const decoded = decodeCursor(encoded);

      expect(decoded.date.toISOString()).toBe(date.toISOString());
      expect(decoded.id).toBe(id);
    });
  });

  describe('Public Contact Submission', () => {
    it('creates contact request with notification dispatched', async () => {
      const service = await ServiceModel.create({
        name: { vi: 'Tư vấn kiến trúc', en: 'Architecture Consulting' },
        slug: { vi: 'tu-van-kien-truc', en: 'architecture-consulting' },
        status: 'published',
      });

      const submission = {
        name: 'Nguyen Van B',
        email: 'client@example.com',
        phone: '0901234567',
        company: 'Example Corp',
        service: service._id.toString(),
        message: 'We need enterprise system architecture consulting for our company.',
        locale: 'en',
      };

      const result = await contactService.submitContact(submission, {
        ip: '127.0.0.1',
        userAgent: 'TestBrowser',
      });

      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();

      const created = await ContactRequestModel.findById(result.id);
      expect(created.name).toBe('Nguyen Van B');
      expect(created.serviceName).toBe('Architecture Consulting');
      expect(created.status).toBe('new');
      expect(created.notification.status).toBe('sent');
      expect(created.meta.ip).toBe('127.0.0.1');
    });

    it('detects honeypot trap and marks as spam without sending email', async () => {
      const submission = {
        name: 'Spam Bot',
        email: 'bot@spammer.net',
        message: 'Cheap services for you here click now!',
        _hp: 'http://spammer.net', // Honeypot filled
      };

      const result = await contactService.submitContact(submission);
      expect(result.success).toBe(true);

      const created = await ContactRequestModel.findById(result.id);
      expect(created.status).toBe('spam');
      expect(created.spam.isSpam).toBe(true);
      expect(created.spam.reasons).toContain('honeypot_filled');
      expect(created.notification.status).toBe('pending'); // No email sent
    });

    it('detects sub-2-second bot submissions and flags as spam', async () => {
      const submission = {
        name: 'Fast Bot',
        email: 'fast@bot.net',
        message: 'Automated rapid form submitter message.',
        _t: Date.now() - 500, // Submitted in 500ms
      };

      const result = await contactService.submitContact(submission);
      expect(result.success).toBe(true);

      const created = await ContactRequestModel.findById(result.id);
      expect(created.status).toBe('spam');
      expect(created.spam.isSpam).toBe(true);
      expect(created.spam.reasons).toContain('submitted_too_fast');
      expect(created.notification.status).toBe('pending');
    });
  });

  describe('Admin Inbox Management', () => {
    it('supports cursor pagination and filtering by status', async () => {
      for (let i = 1; i <= 5; i++) {
        await ContactRequestModel.create({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          message: `Inquiry message ${i} from client.`,
          status: i % 2 === 0 ? 'in_review' : 'new',
        });
      }

      const page1 = await contactService.listContactRequests({ limit: 3 });
      expect(page1.data).toHaveLength(3);
      expect(page1.pagination.hasMore).toBe(true);
      expect(page1.pagination.nextCursor).toBeDefined();

      const page2 = await contactService.listContactRequests({
        limit: 3,
        cursor: page1.pagination.nextCursor,
      });
      expect(page2.data).toHaveLength(2);
      expect(page2.pagination.hasMore).toBe(false);

      const filtered = await contactService.listContactRequests({ status: 'in_review' });
      expect(filtered.data).toHaveLength(2);
      expect(filtered.data.every(d => d.status === 'in_review')).toBe(true);
    });

    it('updates request status and adds internal notes', async () => {
      const request = await ContactRequestModel.create({
        name: 'Customer X',
        email: 'customerx@example.com',
        message: 'Looking for a partnership with Dev House.',
        status: 'new',
      });

      const updated = await contactService.updateContactRequest(
        request._id.toString(),
        { status: 'replied' },
        '507f1f77bcf86cd799439011',
      );
      expect(updated.status).toBe('replied');

      const withNote = await contactService.addNote(
        request._id.toString(),
        'Spoke with client on phone; scheduled follow-up meeting on Friday.',
        '507f1f77bcf86cd799439011',
      );
      expect(withNote.notes).toHaveLength(1);
      expect(withNote.notes[0].body).toContain('scheduled follow-up meeting');
    });

    it('soft deletes contact request', async () => {
      const request = await ContactRequestModel.create({
        name: 'Temporary User',
        email: 'temp@example.com',
        message: 'A message that will be removed.',
      });

      await contactService.deleteContactRequest(request._id.toString(), '507f1f77bcf86cd799439011');

      const found = await ContactRequestModel.findById(request._id);
      expect(found).toBeNull();

      const withDeleted = await ContactRequestModel.findOne({ _id: request._id }).setOptions({
        withDeleted: true,
      });
      expect(withDeleted.isDeleted).toBe(true);
    });
  });
});
