import { contactService } from './contact.service.js';
import { sendSuccess } from '../../core/http/index.js';

export const contactController = {
  async submitContact(req, res) {
    const clientMeta = {
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      referrer: req.get('referrer'),
      pageUrl: req.originalUrl,
    };

    const result = await contactService.submitContact(req.body, clientMeta);
    return sendSuccess(res, result, 201);
  },

  async adminList(req, res) {
    const result = await contactService.listContactRequests(req.query);
    return sendSuccess(res, result);
  },

  async adminGetById(req, res) {
    const doc = await contactService.getContactRequestById(req.params.id);
    return sendSuccess(res, doc);
  },

  async adminUpdate(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const doc = await contactService.updateContactRequest(req.params.id, req.body, callerId);
    return sendSuccess(res, doc);
  },

  async adminAddNote(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    const doc = await contactService.addNote(req.params.id, req.body.body, callerId);
    return sendSuccess(res, doc);
  },

  async adminDelete(req, res) {
    const callerId = req.auth?.user?._id || req.auth?.user?.id;
    await contactService.deleteContactRequest(req.params.id, callerId);
    return res.status(204).end();
  },
};
