import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service.js';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAuditLogs, tbDocuments, tbNotifications, tbOrderActions, tbOrders, tbOrderTimeline, tbPairs, tbPayoutRequisites, tbQuotes, tbUsers, tbWallets, tbWebhookEvents } from '../../db/schema.js';
import { CreateOrderSchema, ExecuteOrderActionSchema, UpdateOrderStatusSchema, type CreateOrderInput, type ExecuteOrderActionInput, type UpdateOrderStatusInput } from './orders.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly summaryService: SummaryService) {}

  private async createAuditAndWebhook(input: { actorType: string; actorId?: string | null; action: string; entityType: string; entityId: string; diff: Record<string, unknown>; requestId?: string | null; eventType: string; payload: Record<string, unknown> }) {
    await db.insert(tbAuditLogs).values({ actorType: input.actorType, actorId: input.actorId ?? null, action: input.action, entityType: input.entityType, entityId: input.entityId, diffJson: input.diff, requestId: input.requestId ?? null });
    await db.insert(tbWebhookEvents).values({ eventType: input.eventType, entityType: input.entityType, entityId: input.entityId, payloadJson: input.payload, status: 'pending' });
  }

  private async createStatusNotification(order: { userId: string; publicId: string }, fromStatus: string, toStatus: string) {
    await db.insert(tbNotifications).values({
      userId: order.userId,
      channel: 'in_app',
      templateCode: 'order_status_changed',
      title: 'Order status updated',
      body: `Order ${order.publicId}: ${fromStatus} → ${toStatus}`,
      payloadJson: {
        order_public_id: order.publicId,
        from_status: fromStatus,
        to_status: toStatus,
      },
    });
  }

  async list() {
    return db.select().from(tbOrders).orderBy(desc(tbOrders.createdAt)).limit(50);
  }

  async getByPublicId(publicId: string) {
    const rows = await db.select().from(tbOrders).where(eq(tbOrders.publicId, publicId)).limit(1);
    return rows[0] ?? null;
  }

  async getSummary(publicId: string) {
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    const [bundle, actions] = await Promise.all([
      this.summaryService.getOrderBundle(order),
      this.listActions(publicId),
    ]);

    return {
      ...bundle,
      actions,
    };
  }

  async getOperatorQueueSummary() {
    const orders = await db.select().from(tbOrders).orderBy(desc(tbOrders.updatedAt)).limit(50);
    const documents = await db.select().from(tbDocuments).orderBy(desc(tbDocuments.createdAt)).limit(100);

    const pendingByOrder = new Map<string, number>();
    for (const document of documents) {
      if (!document.orderId) continue;
      if (!['pending', 'submitted'].includes(document.status)) continue;
      pendingByOrder.set(document.orderId, (pendingByOrder.get(document.orderId) ?? 0) + 1);
    }

    const items = orders.map((order) => ({
      ...order,
      pendingDocuments: pendingByOrder.get(order.id) ?? 0,
    }));

    return {
      metrics: {
        total: items.length,
        active: items.filter((item) => ['draft', 'awaiting_payment', 'payment_confirmed', 'processing'].includes(item.statusCode)).length,
        completed: items.filter((item) => item.statusCode === 'completed').length,
        needsAttention: items.filter((item) => ['awaiting_payment', 'payment_confirmed', 'processing'].includes(item.statusCode) || item.pendingDocuments > 0).length,
        pendingDocuments: items.reduce((sum, item) => sum + item.pendingDocuments, 0),
      },
      items,
    };
  }

  async getOperatorSummary(publicId: string) {
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    const [bundle, actions] = await Promise.all([
      this.summaryService.getOrderBundle(order),
      this.listActions(publicId),
    ]);

    const { timeline, documents, notifications } = bundle;

    return {
      ...bundle,
      actions,
      metrics: {
        documentsPending: documents.filter((item) => ['pending', 'submitted'].includes(item.status)).length,
        notificationsCount: notifications.length,
        timelineEvents: timeline.length,
        availableActions: actions.length,
      },
    };
  }

  async listTimeline(publicId: string) {
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    return db.select().from(tbOrderTimeline).where(eq(tbOrderTimeline.orderId, order.id)).orderBy(desc(tbOrderTimeline.createdAt));
  }

  async updateStatus(publicId: string, payload: Record<string, unknown>) {
    const parsed = UpdateOrderStatusSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: UpdateOrderStatusInput = parsed.data;
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    const transitions: Record<string, string[]> = {
      draft: ['awaiting_payment', 'cancelled', 'expired'],
      awaiting_payment: ['payment_confirmed', 'cancelled', 'expired'],
      payment_confirmed: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      expired: [],
    };

    if (!transitions[order.statusCode]?.includes(input.status_code)) {
      throw new BadRequestException({
        message: 'Invalid order status transition',
        public_id: publicId,
        from_status: order.statusCode,
        to_status: input.status_code,
        allowed_transitions: transitions[order.statusCode] ?? [],
      });
    }

    const now = new Date();
    await db.update(tbOrders).set({ statusCode: input.status_code, updatedAt: now }).where(eq(tbOrders.id, order.id));
    await db.insert(tbOrderTimeline).values({
      orderId: order.id,
      eventType: 'status_changed',
      fromStatus: order.statusCode,
      toStatus: input.status_code,
      actorType: input.actor_type,
      actorId: input.actor_id ?? null,
      payloadJson: input.payload ?? {},
    });

    await this.createStatusNotification(order, order.statusCode, input.status_code);

    await this.createAuditAndWebhook({ actorType: input.actor_type, actorId: input.actor_id, action: 'order.status_changed', entityType: 'order', entityId: order.id, diff: { from_status: order.statusCode, to_status: input.status_code }, eventType: 'order.status_changed', payload: { order_id: order.id, order_public_id: order.publicId, from_status: order.statusCode, to_status: input.status_code } });

    const updated = await this.getByPublicId(publicId);
    if (!updated) {
      throw new NotFoundException({ message: 'Updated order could not be reloaded', public_id: publicId });
    }
    return updated;
  }

  async listActions(publicId: string) {
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }
    return db.select().from(tbOrderActions).where(eq(tbOrderActions.orderId, order.id)).orderBy(desc(tbOrderActions.createdAt));
  }

  async executeAction(publicId: string, payload: Record<string, unknown>) {
    const parsed = ExecuteOrderActionSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: ExecuteOrderActionInput = parsed.data;
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    const existingRows = await db.select().from(tbOrderActions).where(and(
      eq(tbOrderActions.orderId, order.id),
      eq(tbOrderActions.idempotencyKey, input.idempotency_key),
    )).limit(1);
    const existing = existingRows[0];
    if (existing) {
      return { action: existing, order, idempotent_replay: true };
    }

    const actionStatusMap: Record<ExecuteOrderActionInput['action_code'], string> = {
      confirm_payment: 'payment_confirmed',
      start_processing: 'processing',
      complete: 'completed',
      cancel: 'cancelled',
    };
    const targetStatus = actionStatusMap[input.action_code];
    const transitions: Record<string, string[]> = {
      draft: ['cancelled'],
      awaiting_payment: ['payment_confirmed', 'cancelled'],
      payment_confirmed: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      expired: [],
    };
    if (!transitions[order.statusCode]?.includes(targetStatus)) {
      throw new BadRequestException({
        message: 'Action is not allowed for current order status',
        public_id: publicId,
        action_code: input.action_code,
        current_status: order.statusCode,
        target_status: targetStatus,
        allowed_transitions: transitions[order.statusCode] ?? [],
      });
    }

    const now = new Date();
    const [action] = await db.insert(tbOrderActions).values({
      orderId: order.id,
      actionCode: input.action_code,
      requestId: input.request_id ?? null,
      idempotencyKey: input.idempotency_key,
      operatorId: input.operator_id,
      resultStatus: 'succeeded',
      payloadJson: input.payload ?? {},
    }).returning();
    await db.update(tbOrders).set({ statusCode: targetStatus, updatedAt: now }).where(eq(tbOrders.id, order.id));
    await db.insert(tbOrderTimeline).values({
      orderId: order.id,
      eventType: `action_${input.action_code}`,
      fromStatus: order.statusCode,
      toStatus: targetStatus,
      actorType: 'operator',
      actorId: input.operator_id,
      payloadJson: { action_id: action.id, request_id: input.request_id ?? null, ...(input.payload ?? {}) },
    });

    await this.createStatusNotification(order, order.statusCode, targetStatus);

    await this.createAuditAndWebhook({ actorType: 'operator', actorId: input.operator_id, action: `order.action.${input.action_code}`, entityType: 'order', entityId: order.id, diff: { from_status: order.statusCode, to_status: targetStatus, action_id: action.id }, requestId: input.request_id, eventType: 'order.status_changed', payload: { order_id: order.id, order_public_id: order.publicId, from_status: order.statusCode, to_status: targetStatus, action_code: input.action_code, action_id: action.id } });

    const updated = await this.getByPublicId(publicId);
    if (!updated) {
      throw new NotFoundException({ message: 'Updated order could not be reloaded', public_id: publicId });
    }
    return { action, order: updated, idempotent_replay: false };
  }

  async create(payload: Record<string, unknown>) {
    const parsed = CreateOrderSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: CreateOrderInput = parsed.data;

    const userRows = await db.select().from(tbUsers).where(eq(tbUsers.id, input.user_id)).limit(1);
    const user = userRows[0];
    if (!user || user.status !== 'active') {
      throw new NotFoundException({ message: 'User not found or inactive', user_id: input.user_id });
    }

    if (input.wallet_id) {
      const walletRows = await db.select().from(tbWallets).where(and(eq(tbWallets.id, input.wallet_id), eq(tbWallets.userId, input.user_id))).limit(1);
      if (!walletRows[0]) {
        throw new NotFoundException({ message: 'Wallet not found for user', wallet_id: input.wallet_id, user_id: input.user_id });
      }
    }

    if (input.payout_requisite_id) {
      const requisiteRows = await db.select().from(tbPayoutRequisites).where(and(eq(tbPayoutRequisites.id, input.payout_requisite_id), eq(tbPayoutRequisites.userId, input.user_id))).limit(1);
      if (!requisiteRows[0]) {
        throw new NotFoundException({ message: 'Payout requisite not found for user', payout_requisite_id: input.payout_requisite_id, user_id: input.user_id });
      }
    }

    const quoteRows = await db.select().from(tbQuotes).where(eq(tbQuotes.quoteUid, input.quote_id)).limit(1);
    const quote = quoteRows[0];

    if (!quote) {
      throw new NotFoundException({ message: 'Quote not found', quote_id: input.quote_id });
    }

    const expiresAt = new Date(String(quote.expiresAt));
    if (expiresAt.getTime() < Date.now()) {
      throw new BadRequestException({ message: 'Quote expired', quote_id: input.quote_id });
    }

    const pairRows = await db.select().from(tbPairs).where(eq(tbPairs.id, quote.pairId)).limit(1);
    const pair = pairRows[0];
    if (!pair) {
      throw new NotFoundException({
        message: 'Pair not found for quote',
        quote_id: input.quote_id,
        pair_id: quote.pairId,
      });
    }

    const publicId = `ord_${Date.now()}`;
    const statusCode = 'draft';

    await db.insert(tbOrders).values({
      publicId,
      userId: input.user_id,
      quoteId: quote.id,
      directionCode: pair.directionCode,
      statusCode,
      fiatAmount: quote.amountType === 'fiat' ? quote.amountIn : quote.amountOut,
      cryptoAmount: quote.amountType === 'fiat' ? quote.amountOut : quote.amountIn,
      rate: quote.rate,
      payoutRequisiteId: input.payout_requisite_id ?? null,
      walletId: input.wallet_id ?? null,
      metadata: {
        created_from: 'mvp-slice',
        quote_uid: input.quote_id,
        pair_id: pair.id,
      },
      expiresAt,
    });

    const created = await this.getByPublicId(publicId);
    if (!created) {
      throw new NotFoundException({ message: 'Created order could not be reloaded', public_id: publicId });
    }

    await db.insert(tbOrderTimeline).values({
      orderId: created.id,
      eventType: 'order_created',
      fromStatus: null,
      toStatus: statusCode,
      actorType: 'user',
      actorId: input.user_id,
      payloadJson: { quote_id: input.quote_id, pair_id: pair.id },
    });

    return created;
  }
}
