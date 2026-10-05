import { Controller, Get } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbNotifications, tbOrders, tbPayoutRequisites, tbUsers, tbWallets } from '../../db/schema.js';

@Controller('dashboard')
export class DashboardController {
  @Get('summary')
  async summary() {
    const orders = await db.select().from(tbOrders).orderBy(desc(tbOrders.createdAt)).limit(50);
    const [latestOrder] = orders;
    const userId = latestOrder?.userId ?? null;
    const user = userId ? (await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1))[0] ?? null : null;
    const notifications = userId
      ? await db.select().from(tbNotifications).where(eq(tbNotifications.userId, userId)).orderBy(desc(tbNotifications.createdAt)).limit(5)
      : [];
    const unreadNotifications = userId
      ? await db.select().from(tbNotifications).where(and(eq(tbNotifications.userId, userId), isNull(tbNotifications.readAt))).limit(50)
      : [];
    const wallets = userId
      ? await db.select().from(tbWallets).where(eq(tbWallets.userId, userId)).orderBy(desc(tbWallets.createdAt)).limit(5)
      : [];
    const payoutRequisites = userId
      ? await db.select().from(tbPayoutRequisites).where(eq(tbPayoutRequisites.userId, userId)).orderBy(desc(tbPayoutRequisites.createdAt)).limit(5)
      : [];

    return {
      item: {
        user,
        metrics: {
          totalOrders: orders.length,
          openOrders: orders.filter((item) => ['draft', 'awaiting_payment', 'payment_confirmed', 'processing'].includes(item.statusCode)).length,
          completedOrders: orders.filter((item) => item.statusCode === 'completed').length,
          unreadNotifications: unreadNotifications.length,
          wallets: wallets.length,
          payoutRequisites: payoutRequisites.length,
        },
        orders: orders.slice(0, 5),
        notifications,
        wallets,
        payoutRequisites,
      },
    };
  }
}
