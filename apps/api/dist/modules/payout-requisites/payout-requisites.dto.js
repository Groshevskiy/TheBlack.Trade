import { z } from 'zod';
export const CreatePayoutRequisiteSchema = z.object({
    user_id: z.string().uuid(),
    fiat_currency_id: z.string().uuid(),
    requisite_type: z.enum(['bank_card', 'sbp']),
    bank_name: z.string().trim().min(1).max(120).optional(),
    card_mask: z.string().trim().min(4).max(32).optional(),
    sbp_phone: z.string().trim().min(6).max(32).optional(),
    owner_name: z.string().trim().min(2).max(120).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
}).superRefine((value, ctx) => {
    if (value.requisite_type === 'bank_card' && !value.card_mask) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['card_mask'], message: 'card_mask is required for bank_card' });
    }
    if (value.requisite_type === 'sbp' && !value.sbp_phone) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['sbp_phone'], message: 'sbp_phone is required for sbp' });
    }
});
//# sourceMappingURL=payout-requisites.dto.js.map