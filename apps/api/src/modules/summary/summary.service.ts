import { Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbDocuments, tbNotifications, tbOrders, tbOrderTimeline, tbPayoutRequisites, tbUsers, tbWallets } from '../../db/schema.js';

@Injectable()
export class SummaryService {
  async getDemoUser() {
    const [latestOrder] = await db
      .select({ userId: tbOrders.userId })
      .from(tbOrders)
      .orderBy(desc(tbOrders.createdAt))
      .limit(1);

    if (!latestOrder?.userId) {
      throw new NotFoundException({ message: 'No demo user context available' });
    }

    const [user] = await db
      .select()
      .from(tbUsers)
      .where(eq(tbUsers.id, latestOrder.userId))
      .limit(1);

    if (!user) {
      throw new NotFoundException({ message: 'Demo user not found', user_id: latestOrder.userId });
    }

    return user;
  }

  toUserSummary(user: typeof tbUsers.$inferSelect) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      telegram: user.telegram,
      locale: user.locale,
      kycLevel: user.kycLevel,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getAccountSummary() {
    const user = await this.getDemoUser();
    const [orders, notifications, wallets, payoutRequisites] = await Promise.all([
      db.select().from(tbOrders).where(eq(tbOrders.userId, user.id)).orderBy(desc(tbOrders.createdAt)).limit(10),
      db.select().from(tbNotifications).where(and(eq(tbNotifications.userId, user.id), isNull(tbNotifications.readAt))).orderBy(desc(tbNotifications.createdAt)).limit(10),
      db.select().from(tbWallets).where(eq(tbWallets.userId, user.id)).orderBy(desc(tbWallets.createdAt)).limit(10),
      db.select().from(tbPayoutRequisites).where(eq(tbPayoutRequisites.userId, user.id)).orderBy(desc(tbPayoutRequisites.createdAt)).limit(10),
    ]);

    return {
      user: this.toUserSummary(user),
      metrics: {
        orders: orders.length,
        unreadNotifications: notifications.length,
        wallets: wallets.length,
        payoutRequisites: payoutRequisites.length,
      },
      orders,
      notifications,
      wallets,
      payoutRequisites,
    };
  }

  async getCustomerOrdersSummary() {
    const user = await this.getDemoUser();
    const orders = await db.select().from(tbOrders).where(eq(tbOrders.userId, user.id)).orderBy(desc(tbOrders.createdAt)).limit(50);

    return {
      user: this.toUserSummary(user),
      metrics: {
        total: orders.length,
        open: orders.filter((item) => ['draft', 'awaiting_payment', 'payment_confirmed', 'processing'].includes(item.statusCode)).length,
        completed: orders.filter((item) => item.statusCode === 'completed').length,
        needsAction: orders.filter((item) => ['awaiting_payment', 'expired', 'cancelled'].includes(item.statusCode)).length,
      },
      orders,
    };
  }

  async getOrderBundle(order: typeof tbOrders.$inferSelect) {
    const [timeline, documents, notifications] = await Promise.all([
      db.select().from(tbOrderTimeline).where(eq(tbOrderTimeline.orderId, order.id)).orderBy(desc(tbOrderTimeline.createdAt)).limit(50),
      db.select().from(tbDocuments).where(eq(tbDocuments.orderId, order.id)).orderBy(desc(tbDocuments.createdAt)).limit(50),
      db.select().from(tbNotifications).where(eq(tbNotifications.userId, order.userId)).orderBy(desc(tbNotifications.createdAt)).limit(20),
    ]);

    return { order, timeline, documents, notifications };
  }
}
