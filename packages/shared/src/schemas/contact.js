import { z } from 'zod';

export const ContactRequestSchema = z.object({
  name: z.string().min(2, 'Name is too short').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  country: z.string().optional().default(''),
  service: z.string().optional().default(''),
  projectType: z.string().optional().default(''),
  budget: z.string().optional().default(''),
  timeline: z.string().optional().default(''),
  subject: z.string().max(150).optional().default(''),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
  preferredContactMethod: z.enum(['email', 'phone', 'chat']).optional().default('email'),
  referralSource: z.string().optional().default(''),
  consent: z
    .object({
      accepted: z.boolean().default(true),
      acceptedAt: z.coerce.date().optional(),
      policyVersion: z.string().optional().default('1.0'),
    })
    .optional()
    .default({ accepted: true }),
  locale: z.enum(['vi', 'en']).default('vi'),
  // Anti-spam honeypot field (must remain empty)
  _hp: z.string().max(0, 'Spam detected').optional(),
  // Client submission timestamp to prevent instant bots (< 2 seconds)
  _t: z.coerce.number().optional(),
});

export const ContactStatusUpdateSchema = z.object({
  status: z
    .enum(['new', 'in_review', 'replied', 'closed', 'spam', 'contacted', 'in_progress'])
    .optional(),
  assignee: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  notes: z.string().max(2000).optional(),
});

export const ContactNoteCreateSchema = z.object({
  body: z.string().min(1).max(2000),
});
