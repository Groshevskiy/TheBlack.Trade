import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { desc, eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbAuditLogs, tbWebhookAttempts, tbWebhookEvents } from '../../db/schema.js';
import { SummaryService } from '../summary/summary.service.js';
import { AuditQuerySchema, CreateWebhookAttemptSchema, WebhookQuerySchema } from './operations.dto.js';

@Injectable()
export class OperationsService {
  constructor(private readonly summaryService: SummaryService) {}

  async getSummary() {
    const [webhookEvents, webhookAttempts, auditLogs] = await Promise.all([
      db.select().from(tbWebhookEvents).orderBy(desc(tbWebhookEvents.createdAt)).limit(100),
      db.select().from(tbWebhookAttempts).orderBy(desc(tbWebhookAttempts.attemptedAt)).limit(100),
      db.select().from(tbAuditLogs).orderBy(desc(tbAuditLogs.createdAt)).limit(100),
    ]);

    const delivered = webhookEvents.filter((item) => item.status === 'delivered').length;
    const failed = webhookEvents.filter((item) => item.status === 'failed').length;
    const pending = webhookEvents.filter((item) => item.status === 'pending').length;
    const entityTypes = new Set(auditLogs.map((item) => item.entityType).filter(Boolean));
    const actionTypes = new Set(auditLogs.map((item) => item.action).filter(Boolean));

    return {
      metrics: {
        webhookEvents: webhookEvents.length,
        deliveredWebhookEvents: delivered,
        failedWebhookEvents: failed,
        pendingWebhookEvents: pending,
        webhookAttempts: webhookAttempts.length,
        auditLogs: auditLogs.length,
        auditEntityTypes: entityTypes.size,
        auditActions: actionTypes.size,
      },
      webhookEvents,
      webhookAttempts,
      auditLogs,
    };
  }

  async listAudit(query: Record<string, unknown>) {
    const parsed = AuditQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    return db.select().from(tbAuditLogs).where(eq(tbAuditLogs.entityType, parsed.data.entity_type)).orderBy(desc(tbAuditLogs.createdAt)).limit(100).then((rows) => rows.filter((row) => row.entityId === parsed.data.entity_id));
  }

  async listWebhookEvents(query: Record<string, unknown>) {
    const parsed = WebhookQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    if (parsed.data.status) return db.select().from(tbWebhookEvents).where(eq(tbWebhookEvents.status, parsed.data.status)).orderBy(desc(tbWebhookEvents.createdAt)).limit(100);
    return db.select().from(tbWebhookEvents).orderBy(desc(tbWebhookEvents.createdAt)).limit(100);
  }

  async createAttempt(eventId: string, payload: Record<string, unknown>) {
    const parsed = CreateWebhookAttemptSchema.safeParse(payload);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const rows = await db.select().from(tbWebhookEvents).where(eq(tbWebhookEvents.id, eventId)).limit(1);
    const event = rows[0];
    if (!event) throw new NotFoundException({ message: 'Webhook event not found', id: eventId });
    const status = parsed.data.response_code && parsed.data.response_code >= 200 && parsed.data.response_code < 300 ? 'delivered' : 'failed';
    const [attempt] = await db.insert(tbWebhookAttempts).values({ webhookEventId: eventId, responseCode: parsed.data.response_code ?? null, responseBody: parsed.data.response_body ?? null }).returning();
    const [updatedEvent] = await db.update(tbWebhookEvents).set({ status, deliveredAt: status === 'delivered' ? new Date() : null }).where(eq(tbWebhookEvents.id, eventId)).returning();
    return { attempt, event: updatedEvent };
  }
}
