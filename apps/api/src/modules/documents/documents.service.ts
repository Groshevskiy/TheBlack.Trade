import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAuditLogs, tbDocuments, tbNotifications, tbOrderTimeline, tbOrders, tbUsers, tbWebhookEvents } from '../../db/schema.js';
import { CreateDocumentSchema, DocumentQuerySchema, UpdateDocumentStatusSchema, type CreateDocumentInput, type UpdateDocumentStatusInput } from './documents.dto.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';

@Injectable()
export class DocumentsService {
  async createForUser(userId: string, payload: Record<string, unknown>) {
    const parsed = CreateDocumentSchema.safeParse(payload);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const input: CreateDocumentInput = parsed.data;

    const userRows = await db.select().from(tbUsers).where(eq(tbUsers.id, userId)).limit(1);
    if (!userRows[0] || (userRows[0].status !== 'active' && userRows[0].status !== null)) {
      throw new NotFoundException({ message: 'User not found or inactive', user_id: userId });
    }

    let order: typeof tbOrders.$inferSelect | undefined;
    if (input.order_id) {
      const orderRows = await db.select().from(tbOrders).where(and(eq(tbOrders.id, input.order_id), eq(tbOrders.userId, userId))).limit(1);
      order = orderRows[0];
      if (!order) throw new NotFoundException({ message: 'Order not found for user', order_id: input.order_id, user_id: userId });
    }

    const kycCase = null;
    if (input.kyc_case_id) {
      throw new BadRequestException({ message: 'KYC document attachment is unavailable until tb_kyc_cases schema is applied', kyc_case_id: input.kyc_case_id, block_reason: 'kyc_schema_unavailable' });
    }

    const [document] = await db.insert(tbDocuments).values({
      ownerUserId: userId,
      orderId: input.order_id ?? null,
      documentType: input.document_type,
      fileId: input.file_id,
      status: 'submitted',
      metadataJson: input.metadata ?? {},
    }).returning({
      id: tbDocuments.id,
      ownerUserId: tbDocuments.ownerUserId,
      orderId: tbDocuments.orderId,
      documentType: tbDocuments.documentType,
      fileId: tbDocuments.fileId,
      status: tbDocuments.status,
      metadataJson: tbDocuments.metadataJson,
      createdAt: tbDocuments.createdAt,
    });

    if (order) {
      await db.insert(tbOrderTimeline).values({
        orderId: order.id,
        eventType: 'document_submitted',
        fromStatus: null,
        toStatus: null,
        actorType: 'user',
        actorId: userId,
        payloadJson: { document_id: document.id, document_type: document.documentType },
      });
    }

    return document;
  }

  async listForUser(userId: string, query: Record<string, unknown>) {
    const parsed = DocumentQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());

    const conditions = [eq(tbDocuments.ownerUserId, userId)];
    if (parsed.data.order_id) conditions.push(eq(tbDocuments.orderId, parsed.data.order_id));
    if (parsed.data.kyc_case_id) {
      throw new BadRequestException({ message: 'KYC case filtering is unavailable until tb_kyc_cases schema is applied', kyc_case_id: parsed.data.kyc_case_id, block_reason: 'kyc_schema_unavailable' });
    }

    return db.select({ id: tbDocuments.id, ownerUserId: tbDocuments.ownerUserId, orderId: tbDocuments.orderId, documentType: tbDocuments.documentType, fileId: tbDocuments.fileId, status: tbDocuments.status, metadataJson: tbDocuments.metadataJson, createdAt: tbDocuments.createdAt }).from(tbDocuments).where(and(...conditions)).orderBy(desc(tbDocuments.createdAt));
  }

  async updateStatusAsOperator(operator: AuthenticatedUser, id: string, payload: Record<string, unknown>) {
    const parsed = UpdateDocumentStatusSchema.safeParse(payload);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const input: UpdateDocumentStatusInput = parsed.data;

    const rows = await db.select({ id: tbDocuments.id, ownerUserId: tbDocuments.ownerUserId, orderId: tbDocuments.orderId, documentType: tbDocuments.documentType, fileId: tbDocuments.fileId, status: tbDocuments.status, metadataJson: tbDocuments.metadataJson, createdAt: tbDocuments.createdAt }).from(tbDocuments).where(eq(tbDocuments.id, id)).limit(1);
    const document = rows[0];
    if (!document) throw new NotFoundException({ message: 'Document not found', id });

    const transitions: Record<string, string[]> = { pending: ['submitted'], submitted: ['approved', 'rejected'], approved: [], rejected: [] };
    if (!transitions[document.status]?.includes(input.status)) {
      throw new BadRequestException({ message: 'Invalid document status transition', document_id: id, from_status: document.status, to_status: input.status });
    }

    const [updated] = await db.update(tbDocuments).set({ status: input.status, metadataJson: { ...(document.metadataJson ?? {}), review_reason: input.reason ?? null, reviewed_by: operator.id } }).where(eq(tbDocuments.id, id)).returning({ id: tbDocuments.id, ownerUserId: tbDocuments.ownerUserId, orderId: tbDocuments.orderId, documentType: tbDocuments.documentType, fileId: tbDocuments.fileId, status: tbDocuments.status, metadataJson: tbDocuments.metadataJson, createdAt: tbDocuments.createdAt });

    await db.insert(tbAuditLogs).values({
      actorType: operator.role,
      actorId: operator.id,
      action: 'document.status_updated',
      entityType: 'document',
      entityId: updated.id,
      diffJson: { from_status: document.status, to_status: updated.status, reason: input.reason ?? null },
      requestId: null,
    });

    if (updated.ownerUserId) {
      await db.insert(tbNotifications).values({
        userId: updated.ownerUserId,
        channel: 'in_app',
        templateCode: 'document_status_updated',
        title: `Document ${updated.status}`,
        body: input.reason ? `Reason: ${input.reason}` : 'Your document review status changed.',
        payloadJson: { document_id: updated.id, status: updated.status, reason: input.reason ?? null },
      });
    }

    await db.insert(tbWebhookEvents).values({
      eventType: 'document.status_updated',
      entityType: 'document',
      entityId: updated.id,
      payloadJson: { document_id: updated.id, status: updated.status, owner_user_id: updated.ownerUserId ?? null, reason: input.reason ?? null, operator_id: operator.id },
      status: 'pending',
    });

    if (updated.orderId) {
      const orderRows = await db.select().from(tbOrders).where(eq(tbOrders.id, updated.orderId)).limit(1);
      const order = orderRows[0];

      await db.insert(tbOrderTimeline).values({
        orderId: updated.orderId,
        eventType: 'document_reviewed',
        fromStatus: null,
        toStatus: null,
        actorType: 'operator',
        actorId: operator.id,
        payloadJson: { document_id: updated.id, document_type: updated.documentType, document_status: updated.status, reason: input.reason ?? null },
      });

      if (order && updated.documentType === 'payment_proof') {
        if (updated.status === 'approved' && order.statusCode === 'awaiting_payment') {
          await db.update(tbOrders).set({ statusCode: 'payment_confirmed', updatedAt: new Date() }).where(eq(tbOrders.id, order.id));

          await db.insert(tbOrderTimeline).values({
            orderId: order.id,
            eventType: 'status_changed',
            fromStatus: 'awaiting_payment',
            toStatus: 'payment_confirmed',
            actorType: 'operator',
            actorId: operator.id,
            payloadJson: { document_id: updated.id, document_type: updated.documentType, trigger: 'payment_proof_approved' },
          });

          if (order.userId) {
            await db.insert(tbNotifications).values({
              userId: order.userId,
              channel: 'in_app',
              templateCode: 'order_status_changed',
              title: 'Order status updated',
              body: 'Your order moved to payment_confirmed.',
              payloadJson: { order_id: order.id, order_public_id: order.publicId, from_status: 'awaiting_payment', to_status: 'payment_confirmed' },
            });
          }

          await db.insert(tbAuditLogs).values({
            actorType: operator.role,
            actorId: operator.id,
            action: 'order.status_changed',
            entityType: 'order',
            entityId: order.id,
            diffJson: { from_status: 'awaiting_payment', to_status: 'payment_confirmed', trigger: 'payment_proof_approved', document_id: updated.id },
            requestId: null,
          });

          await db.insert(tbWebhookEvents).values({
            eventType: 'order.status_changed',
            entityType: 'order',
            entityId: order.id,
            payloadJson: { order_id: order.id, order_public_id: order.publicId, from_status: 'awaiting_payment', to_status: 'payment_confirmed', trigger: 'payment_proof_approved', document_id: updated.id },
            status: 'pending',
          });
        }

        if (updated.status === 'rejected' && order.statusCode === 'payment_confirmed') {
          await db.update(tbOrders).set({ statusCode: 'awaiting_payment', updatedAt: new Date() }).where(eq(tbOrders.id, order.id));

          await db.insert(tbOrderTimeline).values({
            orderId: order.id,
            eventType: 'status_changed',
            fromStatus: 'payment_confirmed',
            toStatus: 'awaiting_payment',
            actorType: 'operator',
            actorId: operator.id,
            payloadJson: { document_id: updated.id, document_type: updated.documentType, trigger: 'payment_proof_rejected', reason: input.reason ?? null },
          });
        }
      }
    }

    return updated;
  }
}
