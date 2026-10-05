import { z } from 'zod';
export const DOCUMENT_STATUSES = ['pending', 'submitted', 'approved', 'rejected'];
export const CreateDocumentSchema = z.object({
    owner_user_id: z.string().uuid(),
    order_id: z.string().uuid().optional(),
    document_type: z.enum(['payment_proof', 'identity', 'address_proof', 'other']),
    file_id: z.string().trim().min(1).max(256),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
export const DocumentQuerySchema = z.object({
    user_id: z.string().uuid().optional(),
    order_id: z.string().uuid().optional(),
}).refine((data) => data.user_id || data.order_id, { message: 'user_id or order_id is required' });
export const UpdateDocumentStatusSchema = z.object({
    status: z.enum(DOCUMENT_STATUSES),
    operator_id: z.string().trim().min(1).max(128).optional(),
    reason: z.string().trim().min(1).max(500).optional(),
}).superRefine((value, ctx) => {
    if (value.status === 'rejected' && !value.reason) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['reason'], message: 'reason is required for rejected status' });
    }
});
//# sourceMappingURL=documents.dto.js.map