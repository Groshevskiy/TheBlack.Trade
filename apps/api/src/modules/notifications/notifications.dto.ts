import { z } from 'zod';

export const NotificationQuerySchema = z.object({
  user_id: z.string().uuid(),
  unread_only: z.enum(['true', 'false']).optional(),
});

export type NotificationQueryInput = z.infer<typeof NotificationQuerySchema>;
