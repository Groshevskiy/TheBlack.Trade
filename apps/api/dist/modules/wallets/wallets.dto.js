import { z } from 'zod';
export const CreateWalletSchema = z.object({
    user_id: z.string().uuid(),
    asset_id: z.string().uuid(),
    network_id: z.string().uuid(),
    address: z.string().trim().min(3).max(256),
    memo: z.string().trim().min(1).max(256).optional(),
    label: z.string().trim().min(1).max(100).optional(),
});
//# sourceMappingURL=wallets.dto.js.map