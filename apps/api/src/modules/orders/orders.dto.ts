import { z } from 'zod';

export const CreateOrderSchema = z.object({
  quote_id: z.string().min(3),
  user_id: z.string().uuid(),
  payout_requisite_id: z.string().uuid().optional(),
  wallet_id: z.string().uuid().optional(),
});

export const ORDER_STATUSES = [
  'draft',
  'awaiting_payment',
  'payment_confirmed',
  'processing',
  'completed',
  'cancelled',
  'expired',
] as const;

export const UpdateOrderStatusSchema = z.object({
  status_code: z.enum(ORDER_STATUSES),
  actor_type: z.enum(['user', 'operator', 'system']).default('operator'),
  actor_id: z.string().trim().min(1).max(128).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof UpdateOrderStatusSchema>;

export const ORDER_ACTIONS = ['confirm_payment', 'start_processing', 'complete', 'cancel'] as const;

export const ExecuteOrderActionSchema = z.object({
  action_code: z.enum(ORDER_ACTIONS),
  operator_id: z.string().trim().min(1).max(128),
  idempotency_key: z.string().trim().min(8).max(128),
  request_id: z.string().trim().min(1).max(128).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type ExecuteOrderActionInput = z.infer<typeof ExecuteOrderActionSchema>;
