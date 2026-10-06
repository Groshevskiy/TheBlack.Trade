import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service.js';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAuditLogs, tbDocuments, tbNotifications, tbOrderActions, tbOrders, tbOrderTimeline, tbPairs, tbPayoutRequisites, tbQuotes, tbUsers, tbWallets, tbWebhookEvents } from '../../db/schema.js';
import { CreateOrderSchema, ExecuteOrderActionSchema, UpdateOrderStatusSchema, type CreateOrderInput, type ExecuteOrderActionInput, type UpdateOrderStatusInput } from './orders.dto.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';


@Injectable()
export class OrdersService {
  private async assertKycEligibleForTrading(userId: string) {
    const userRows = await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1);
    const user = userRows[0];

    let status = user?.kycLevel ?? 'not_started';

    try {
      const [{ tbKycCases }, { eq: eqDynamic }] = await Promise.all([
        import('../../db/schema.js'),
        import('drizzle-orm'),
      ]);
      const kycRows = await db.select().from(tbKycCases).where(eqDynamic(tbKycCases.userId, userId)).limit(1);
      status = kycRows[0]?.status ?? status;
    } catch (error) {
      const code = typeof error === 'object' && error && 'cause' in error && typeof error.cause === 'object' && error.cause && 'code' in error.cause ? String(error.cause.code) : null;
      if (code !== '42P01') throw error;
    }

    if (status !== 'approved') {
      throw new ForbiddenException({
        message: 'KYC approval is required before order creation',
        block_reason: 'kyc_required',
        kyc_status: status,
        guidance: { block_reason: 'kyc_required', next_step: status === 'resubmission_requested' ? 'update_and_resubmit_kyc' : status === 'rejected' ? 'contact_support_or_resubmit_kyc' : 'complete_kyc' },
      });
    }
  }
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

  async listForUser(userId: string) {
    return db.select().from(tbOrders).where(eq(tbOrders.userId, userId)).orderBy(desc(tbOrders.createdAt)).limit(50);
  }

  async getByPublicId(publicId: string) {
    const rows = await db.select().from(tbOrders).where(eq(tbOrders.publicId, publicId)).limit(1);
    return rows[0] ?? null;
  }

  async getByPublicIdForUser(userId: string, publicId: string) {
    const rows = await db.select().from(tbOrders).where(and(eq(tbOrders.publicId, publicId), eq(tbOrders.userId, userId))).limit(1);
    return rows[0] ?? null;
  }

  private async requireOwnedOrder(userId: string, publicId: string) {
    const order = await this.getByPublicIdForUser(userId, publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }
    return order;
  }

  async getSummaryForUser(userId: string, publicId: string) {
    const order = await this.requireOwnedOrder(userId, publicId);
    const [bundle, actions] = await Promise.all([
      this.summaryService.getOrderBundle(order),
      this.listActionsForUser(userId, publicId),
    ]);

    return {
      ...bundle,
      actions,
    };
  }

  async getOperatorQueueSummary() {
    const orders = await db.select().from(tbOrders).orderBy(desc(tbOrders.updatedAt)).limit(50);
    const documents = await db.select({ id: tbDocuments.id, ownerUserId: tbDocuments.ownerUserId, orderId: tbDocuments.orderId, documentType: tbDocuments.documentType, fileId: tbDocuments.fileId, status: tbDocuments.status, metadataJson: tbDocuments.metadataJson, createdAt: tbDocuments.createdAt }).from(tbDocuments).orderBy(desc(tbDocuments.createdAt)).limit(100);

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

  async listTimelineForUser(userId: string, publicId: string) {
    const order = await this.requireOwnedOrder(userId, publicId);
    return db.select().from(tbOrderTimeline).where(eq(tbOrderTimeline.orderId, order.id)).orderBy(desc(tbOrderTimeline.createdAt));
  }

  async updateStatusAsOperator(operator: AuthenticatedUser, publicId: string, payload: Record<string, unknown>) {
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
      actorType: 'operator',
      actorId: operator.id,
      payloadJson: input.payload ?? {},
    });

    await this.createStatusNotification(order, order.statusCode, input.status_code);

    await this.createAuditAndWebhook({ actorType: 'operator', actorId: operator.id, action: 'order.status_changed', entityType: 'order', entityId: order.id, diff: { from_status: order.statusCode, to_status: input.status_code }, eventType: 'order.status_changed', payload: { order_id: order.id, order_public_id: order.publicId, from_status: order.statusCode, to_status: input.status_code, operator_id: operator.id } });

    const updated = await this.getByPublicId(publicId);
    if (!updated) {
      throw new NotFoundException({ message: 'Updated order could not be reloaded', public_id: publicId });
    }
    return updated;
  }

  private availableActionDefinitions(statusCode: string) {
    const definitions: Record<string, { code: string; label: string; next_status: string; requires_payment_proof?: boolean }[]> = {
      draft: [
        { code: 'request_payment', label: 'Request payment', next_status: 'awaiting_payment' },
        { code: 'cancel', label: 'Cancel order', next_status: 'cancelled' },
      ],
      awaiting_payment: [
        { code: 'confirm_payment', label: 'Confirm payment', next_status: 'payment_confirmed', requires_payment_proof: true },
        { code: 'cancel', label: 'Cancel order', next_status: 'cancelled' },
      ],
      payment_confirmed: [
        { code: 'start_processing', label: 'Start processing', next_status: 'processing' },
        { code: 'cancel', label: 'Cancel order', next_status: 'cancelled' },
      ],
      processing: [
        { code: 'complete', label: 'Complete order', next_status: 'completed' },
        { code: 'cancel', label: 'Cancel order', next_status: 'cancelled' },
      ],
    };
    return definitions[statusCode] ?? [];
  }

  async listActions(publicId: string) {
    const order = await this.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', public_id: publicId });
    }

    const available = this.availableActionDefinitions(order.statusCode);
    if (!available.length) {
      return [];
    }

    if (order.statusCode === 'awaiting_payment') {
      const documents = await db.select().from(tbDocuments).where(eq(tbDocuments.orderId, order.id)).orderBy(desc(tbDocuments.createdAt));
      const hasApprovedPaymentProof = documents.some((document) => document.documentType === 'payment_proof' && document.status === 'approved');
      return available.filter((action) => !action.requires_payment_proof || hasApprovedPaymentProof);
    }

    return available;
  }

  async listActionsForUser(userId: string, publicId: string) {
    await this.requireOwnedOrder(userId, publicId);
    return this.listActions(publicId);
  }

  async executeActionAsOperator(operator: AuthenticatedUser, publicId: string, payload: Record<string, unknown>) {
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
      request_payment: 'awaiting_payment',
      confirm_payment: 'payment_confirmed',
      start_processing: 'processing',
      complete: 'completed',
      cancel: 'cancelled',
    };
    const targetStatus = actionStatusMap[input.action_code];
    const transitions: Record<string, string[]> = {
      draft: ['awaiting_payment', 'cancelled'],
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
      operatorId: operator.id,
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
      actorId: operator.id,
      payloadJson: { action_id: action.id, request_id: input.request_id ?? null, ...(input.payload ?? {}) },
    });

    await this.createStatusNotification(order, order.statusCode, targetStatus);

    await this.createAuditAndWebhook({ actorType: 'operator', actorId: operator.id, action: `order.action.${input.action_code}`, entityType: 'order', entityId: order.id, diff: { from_status: order.statusCode, to_status: targetStatus, action_id: action.id }, requestId: input.request_id, eventType: 'order.status_changed', payload: { order_id: order.id, order_public_id: order.publicId, from_status: order.statusCode, to_status: targetStatus, action_code: input.action_code, action_id: action.id, operator_id: operator.id } });

    const updated = await this.getByPublicId(publicId);
    if (!updated) {
      throw new NotFoundException({ message: 'Updated order could not be reloaded', public_id: publicId });
    }
    return { action, order: updated, idempotent_replay: false };
  }

  async createForUser(userId: string, payload: Record<string, unknown>) {
    await this.assertKycEligibleForTrading(userId);
    const parsed = CreateOrderSchema.safeParse(payload);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const input: CreateOrderInput = parsed.data;

    const userRows = await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1);
    const user = userRows[0];
    if (!user || (user.status !== 'active' && user.status !== null)) {
      throw new NotFoundException({ message: 'User not found or inactive', user_id: userId });
    }

    if (input.wallet_id) {
      const walletRows = await db.select().from(tbWallets).where(and(eq(tbWallets.id, input.wallet_id), eq(tbWallets.userId, userId))).limit(1);
      if (!walletRows[0]) {
        throw new NotFoundException({ message: 'Wallet not found for user', wallet_id: input.wallet_id, user_id: userId });
      }
    }

    if (input.payout_requisite_id) {
      const requisiteRows = await db.select().from(tbPayoutRequisites).where(and(eq(tbPayoutRequisites.id, input.payout_requisite_id), eq(tbPayoutRequisites.userId, userId))).limit(1);
      if (!requisiteRows[0]) {
        throw new NotFoundException({ message: 'Payout requisite not found for user', payout_requisite_id: input.payout_requisite_id, user_id: userId });
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
      userId,
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

    const created = await this.getByPublicIdForUser(userId, publicId);
    if (!created) {
      throw new NotFoundException({ message: 'Created order could not be reloaded', public_id: publicId });
    }

    await db.insert(tbOrderTimeline).values({
      orderId: created.id,
      eventType: 'order_created',
      fromStatus: null,
      toStatus: statusCode,
      actorType: 'user',
      actorId: userId,
      payloadJson: { quote_id: input.quote_id, pair_id: pair.id },
    });

    return created;
  }
}
