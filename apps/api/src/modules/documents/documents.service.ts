import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAuditLogs, tbDocuments, tbNotifications, tbOrders, tbOrderTimeline, tbUsers, tbWebhookEvents } from '../../db/schema.js';
import { CreateDocumentSchema, DocumentQuerySchema, UpdateDocumentStatusSchema, type CreateDocumentInput, type UpdateDocumentStatusInput } from './documents.dto.js';

@Injectable()
export class DocumentsService {
  async list(query: Record<string, unknown>) {
    const parsed = DocumentQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const conditions = [];
    if (parsed.data.user_id) conditions.push(eq(tbDocuments.ownerUserId, parsed.data.user_id));
    if (parsed.data.order_id) conditions.push(eq(tbDocuments.orderId, parsed.data.order_id));
    return db.select().from(tbDocuments).where(and(...conditions)).orderBy(desc(tbDocuments.createdAt)).limit(50);
  }

  async create(payload: Record<string, unknown>) {
    const parsed = CreateDocumentSchema.safeParse(payload);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const input: CreateDocumentInput = parsed.data;
    const userRows = await db.select().from(tbUsers).where(eq(tbUsers.id, input.owner_user_id)).limit(1);
    if (!userRows[0] || userRows[0].status !== 'active') throw new NotFoundException({ message: 'User not found or inactive', user_id: input.owner_user_id });

    let order: typeof tbOrders.$inferSelect | undefined;
    if (input.order_id) {
      const orderRows = await db.select().from(tbOrders).where(and(eq(tbOrders.id, input.order_id), eq(tbOrders.userId, input.owner_user_id))).limit(1);
      order = orderRows[0];
      if (!order) throw new NotFoundException({ message: 'Order not found for user', order_id: input.order_id, user_id: input.owner_user_id });
    }

    const [document] = await db.insert(tbDocuments).values({
      ownerUserId: input.owner_user_id,
      orderId: input.order_id ?? null,
      documentType: input.document_type,
      fileId: input.file_id,
      status: 'submitted',
      metadataJson: input.metadata ?? {},
    }).returning();

    if (order) {
      await db.insert(tbOrderTimeline).values({
        orderId: order.id,
        eventType: 'document_submitted',
        fromStatus: null,
        toStatus: null,
        actorType: 'user',
        actorId: input.owner_user_id,
        payloadJson: { document_id: document.id, document_type: document.documentType },
      });
    }
    return document;
  }

  async updateStatus(id: string, payload: Record<string, unknown>) {
    const parsed = UpdateDocumentStatusSchema.safeParse(payload);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const input: UpdateDocumentStatusInput = parsed.data;
    const rows = await db.select().from(tbDocuments).where(eq(tbDocuments.id, id)).limit(1);
    const document = rows[0];
    if (!document) throw new NotFoundException({ message: 'Document not found', id });
    const transitions: Record<string, string[]> = {
      pending: ['submitted'], submitted: ['approved', 'rejected'], approved: [], rejected: [],
    };
    if (!transitions[document.status]?.includes(input.status)) {
      throw new BadRequestException({ message: 'Invalid document status transition', document_id: id, from_status: document.status, to_status: input.status });
    }
    const metadata = { ...(document.metadataJson as Record<string, unknown> ?? {}), ...(input.reason ? { review_reason: input.reason } : {}) };
    const [updated] = await db.update(tbDocuments).set({ status: input.status, metadataJson: metadata }).where(eq(tbDocuments.id, id)).returning();
    let orderStatusChange: { fromStatus: string; toStatus: string } | null = null;

    if (updated.orderId && updated.documentType === 'payment_proof') {
      const orderRows = await db.select().from(tbOrders).where(eq(tbOrders.id, updated.orderId)).limit(1);
      const order = orderRows[0];
      if (order) {
        if (updated.status === 'approved' && order.statusCode === 'awaiting_payment') {
          orderStatusChange = { fromStatus: order.statusCode, toStatus: 'payment_confirmed' };
        }
        if (updated.status === 'rejected' && order.statusCode === 'payment_confirmed') {
          orderStatusChange = { fromStatus: order.statusCode, toStatus: 'awaiting_payment' };
        }
        if (orderStatusChange) {
          await db.update(tbOrders).set({ statusCode: orderStatusChange.toStatus, updatedAt: new Date() }).where(eq(tbOrders.id, order.id));
          await db.insert(tbOrderTimeline).values({
            orderId: order.id,
            eventType: 'status_changed',
            fromStatus: orderStatusChange.fromStatus,
            toStatus: orderStatusChange.toStatus,
            actorType: 'operator',
            actorId: input.operator_id ?? null,
            payloadJson: {
              source: 'document_review',
              document_id: updated.id,
              document_type: updated.documentType,
              document_status: updated.status,
            },
          });
          await db.insert(tbAuditLogs).values({
            actorType: 'operator',
            actorId: input.operator_id ?? null,
            action: 'order.status_changed',
            entityType: 'order',
            entityId: order.id,
            diffJson: {
              from_status: orderStatusChange.fromStatus,
              to_status: orderStatusChange.toStatus,
              source: 'document_review',
              document_id: updated.id,
            },
            requestId: `doc-review-${updated.id}-${randomUUID()}` ,
          });
          await db.insert(tbWebhookEvents).values({
            eventType: 'status_changed',
            entityType: 'order',
            entityId: order.id,
            payloadJson: {
              order_id: order.id,
              order_public_id: order.publicId,
              from_status: orderStatusChange.fromStatus,
              to_status: orderStatusChange.toStatus,
              source: 'document_review',
              document_id: updated.id,
              document_type: updated.documentType,
              document_status: updated.status,
            },
            status: 'pending',
          });
          await db.insert(tbNotifications).values({
            userId: order.userId,
            channel: 'in_app',
            templateCode: 'order_status_changed',
            title: 'Order status updated',
            body: `Order ${order.publicId} moved to ${orderStatusChange.toStatus.replace(/_/g, ' ')}` ,
            payloadJson: {
              order_id: order.id,
              order_public_id: order.publicId,
              from_status: orderStatusChange.fromStatus,
              to_status: orderStatusChange.toStatus,
              source: 'document_review',
              document_id: updated.id,
            },
          });
        }
      }
    }

    if (updated.orderId) {
      await db.insert(tbOrderTimeline).values({
        orderId: updated.orderId,
        eventType: 'document_reviewed',
        fromStatus: null,
        toStatus: null,
        actorType: 'operator',
        actorId: input.operator_id ?? null,
        payloadJson: { document_id: updated.id, document_type: updated.documentType, status: updated.status, ...(input.reason ? { reason: input.reason } : {}), ...(orderStatusChange ? { order_status_change: orderStatusChange } : {}) },
      });
    }
    await db.insert(tbAuditLogs).values({ actorType: 'operator', actorId: input.operator_id ?? null, action: 'document_status_changed', entityType: 'document', entityId: updated.id, diffJson: { from_status: document.status, to_status: updated.status, ...(input.reason ? { reason: input.reason } : {}) } });
    await db.insert(tbWebhookEvents).values({ eventType: 'document_status_changed', entityType: 'document', entityId: updated.id, payloadJson: { document_id: updated.id, order_id: updated.orderId, owner_user_id: updated.ownerUserId, from_status: document.status, to_status: updated.status, ...(input.reason ? { reason: input.reason } : {}) }, status: 'pending' });

    await db.insert(tbNotifications).values({
      userId: updated.ownerUserId,
      channel: 'in_app',
      templateCode: 'document_status_changed',
      title: 'Document review updated',
      body: `Your ${updated.documentType} document was ${updated.status}`,
      payloadJson: { document_id: updated.id, order_id: updated.orderId, document_type: updated.documentType, status: updated.status, ...(input.reason ? { reason: input.reason } : {}) },
    });
    return updated;
  }
}
