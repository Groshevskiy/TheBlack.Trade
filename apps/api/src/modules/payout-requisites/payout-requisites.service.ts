import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbFiatCurrencies, tbPayoutRequisites, tbUsers } from '../../db/schema.js';
import { CreatePayoutRequisiteSchema, type CreatePayoutRequisiteInput } from './payout-requisites.dto.js';

@Injectable()
export class PayoutRequisitesService {
  async list(userId?: string) {
    const query = db.select().from(tbPayoutRequisites).orderBy(desc(tbPayoutRequisites.createdAt)).limit(50);
    return userId ? query.where(eq(tbPayoutRequisites.userId, userId)) : query;
  }

  async create(payload: Record<string, unknown>) {
    const parsed = CreatePayoutRequisiteSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: CreatePayoutRequisiteInput = parsed.data;
    const [user, fiatCurrency] = await Promise.all([
      db.select().from(tbUsers).where(eq(tbUsers.id, input.user_id)).limit(1),
      db.select().from(tbFiatCurrencies).where(and(eq(tbFiatCurrencies.id, input.fiat_currency_id), eq(tbFiatCurrencies.isActive, true))).limit(1),
    ]);

    if (!user[0] || user[0].status !== 'active') {
      throw new NotFoundException({ message: 'User not found or inactive', user_id: input.user_id });
    }
    if (!fiatCurrency[0]) {
      throw new NotFoundException({ message: 'Fiat currency not found or inactive', fiat_currency_id: input.fiat_currency_id });
    }

    const [requisite] = await db.insert(tbPayoutRequisites).values({
      userId: input.user_id,
      fiatCurrencyId: input.fiat_currency_id,
      requisiteType: input.requisite_type,
      bankName: input.bank_name ?? null,
      cardMask: input.card_mask ?? null,
      sbpPhone: input.sbp_phone ?? null,
      ownerName: input.owner_name ?? null,
      status: 'active',
      metadata: input.metadata ?? {},
    }).returning();

    return requisite;
  }
}
