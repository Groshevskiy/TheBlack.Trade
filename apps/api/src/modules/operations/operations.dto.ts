import { z } from 'zod';

export const AuditQuerySchema = z.object({
  entity_type: z.string().trim().min(1).max(64),
  entity_id: z.string().trim().min(1).max(128),
});

export const WebhookQuerySchema = z.object({
  status: z.enum(['pending', 'delivered', 'failed']).optional(),
});

export const CreateWebhookAttemptSchema = z.object({
  response_code: z.number().int().min(100).max(599).optional(),
  response_body: z.string().max(4000).optional(),
});
