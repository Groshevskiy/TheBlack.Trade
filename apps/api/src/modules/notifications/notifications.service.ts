import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbNotifications } from '../../db/schema.js';
import { SummaryService } from '../summary/summary.service.js';
import { NotificationQuerySchema } from './notifications.dto.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly summaryService: SummaryService) {}

  async getSummary() {
    const user = await this.summaryService.getDemoUser();
    const notifications = await db
      .select()
      .from(tbNotifications)
      .where(eq(tbNotifications.userId, user.id))
      .orderBy(desc(tbNotifications.createdAt))
      .limit(50);

    const unread = notifications.filter((item) => !item.readAt);
    const channels = new Set(notifications.map((item) => item.channel).filter(Boolean));
    const templates = new Set(notifications.map((item) => item.templateCode).filter(Boolean));
    const actionRequired = notifications.filter((item) => !item.readAt && ['email', 'push', 'system'].includes(item.channel)).length;

    return {
      user: this.summaryService.toUserSummary(user),
      metrics: {
        total: notifications.length,
        unread: unread.length,
        read: notifications.length - unread.length,
        channels: channels.size,
        templates: templates.size,
        actionRequired,
      },
      notifications,
    };
  }

  async list(query: Record<string, unknown>) {
    const parsed = NotificationQuerySchema.safeParse(query);
    if (!parsed.success) throw new BadRequestException(parsed.error.flatten());
    const conditions = [eq(tbNotifications.userId, parsed.data.user_id)];
    if (parsed.data.unread_only === 'true') conditions.push(isNull(tbNotifications.readAt));
    return db.select().from(tbNotifications).where(and(...conditions)).orderBy(desc(tbNotifications.createdAt)).limit(50);
  }

  async markRead(id: string) {
    const rows = await db.select().from(tbNotifications).where(eq(tbNotifications.id, id)).limit(1);
    if (!rows[0]) throw new NotFoundException({ message: 'Notification not found', id });
    if (rows[0].readAt) return rows[0];
    const [notification] = await db.update(tbNotifications).set({ readAt: new Date() }).where(eq(tbNotifications.id, id)).returning();
    return notification;
  }
}
