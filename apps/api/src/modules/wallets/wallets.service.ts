import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAssets, tbNetworks, tbOrders, tbPayoutRequisites, tbUsers, tbWallets } from '../../db/schema.js';
import { SummaryService } from '../summary/summary.service.js';
import { CreateWalletSchema, type CreateWalletInput } from './wallets.dto.js';

@Injectable()
export class WalletsService {
  constructor(private readonly summaryService: SummaryService) {}

  async getSummary() {
    const user = await this.summaryService.getDemoUser();
    const [wallets, payoutRequisites, orders] = await Promise.all([
      db.select().from(tbWallets).where(eq(tbWallets.userId, user.id)).orderBy(desc(tbWallets.createdAt)).limit(50),
      db.select().from(tbPayoutRequisites).where(eq(tbPayoutRequisites.userId, user.id)).orderBy(desc(tbPayoutRequisites.createdAt)).limit(50),
      db.select().from(tbOrders).where(eq(tbOrders.userId, user.id)).orderBy(desc(tbOrders.updatedAt)).limit(50),
    ]);

    const activeOrders = orders.filter((item) => ['draft', 'awaiting_payment', 'payment_confirmed', 'processing'].includes(item.statusCode));
    const networks = new Set(wallets.map((item) => item.networkId));

    return {
      user: this.summaryService.toUserSummary(user),
      metrics: {
        wallets: wallets.length,
        verifiedWallets: wallets.filter((item) => item.isVerified).length,
        payoutRequisites: payoutRequisites.length,
        activeOrders: activeOrders.length,
        networks: networks.size,
      },
      wallets,
      payoutRequisites,
      orders: activeOrders.slice(0, 10),
    };
  }

  async list(userId?: string) {
    const query = db.select().from(tbWallets).orderBy(desc(tbWallets.createdAt)).limit(50);
    return userId ? query.where(eq(tbWallets.userId, userId)) : query;
  }

  async create(payload: Record<string, unknown>) {
    const parsed = CreateWalletSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: CreateWalletInput = parsed.data;
    const [user, asset, network] = await Promise.all([
      db.select().from(tbUsers).where(eq(tbUsers.id, input.user_id)).limit(1),
      db.select().from(tbAssets).where(and(eq(tbAssets.id, input.asset_id), eq(tbAssets.isActive, true))).limit(1),
      db.select().from(tbNetworks).where(and(eq(tbNetworks.id, input.network_id), eq(tbNetworks.isActive, true))).limit(1),
    ]);

    if (!user[0] || user[0].status !== 'active') {
      throw new NotFoundException({ message: 'User not found or inactive', user_id: input.user_id });
    }
    if (!asset[0]) {
      throw new NotFoundException({ message: 'Asset not found or inactive', asset_id: input.asset_id });
    }
    if (!network[0] || network[0].assetId !== asset[0].id) {
      throw new NotFoundException({ message: 'Network not found for asset or inactive', network_id: input.network_id, asset_id: input.asset_id });
    }

    const [wallet] = await db.insert(tbWallets).values({
      userId: input.user_id,
      assetId: input.asset_id,
      networkId: input.network_id,
      address: input.address,
      memo: input.memo ?? null,
      label: input.label ?? null,
      isVerified: false,
    }).returning();

    return wallet;
  }
}
