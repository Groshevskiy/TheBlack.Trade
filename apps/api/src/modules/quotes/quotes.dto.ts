import { z } from 'zod';

export const QuoteCalculateSchema = z.object({
  direction_code: z.enum(['buy', 'sell']),
  fiat_currency_code: z.string().min(3).max(10),
  asset_code: z.string().min(2).max(20),
  network_code: z.string().min(2).max(20),
  amount_type: z.enum(['fiat', 'crypto']),
  amount: z.coerce.number().positive(),
});

export type QuoteCalculateInput = z.infer<typeof QuoteCalculateSchema>;
