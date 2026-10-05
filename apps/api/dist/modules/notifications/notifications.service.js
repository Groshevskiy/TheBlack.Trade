var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { tbNotifications } from '../../db/schema.js';
import { SummaryService } from '../summary/summary.service.js';
import { NotificationQuerySchema } from './notifications.dto.js';
let NotificationsService = class NotificationsService {
    summaryService;
    constructor(summaryService) {
        this.summaryService = summaryService;
    }
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
    async list(query) {
        const parsed = NotificationQuerySchema.safeParse(query);
        if (!parsed.success)
            throw new BadRequestException(parsed.error.flatten());
        const conditions = [eq(tbNotifications.userId, parsed.data.user_id)];
        if (parsed.data.unread_only === 'true')
            conditions.push(isNull(tbNotifications.readAt));
        return db.select().from(tbNotifications).where(and(...conditions)).orderBy(desc(tbNotifications.createdAt)).limit(50);
    }
    async markRead(id) {
        const rows = await db.select().from(tbNotifications).where(eq(tbNotifications.id, id)).limit(1);
        if (!rows[0])
            throw new NotFoundException({ message: 'Notification not found', id });
        if (rows[0].readAt)
            return rows[0];
        const [notification] = await db.update(tbNotifications).set({ readAt: new Date() }).where(eq(tbNotifications.id, id)).returning();
        return notification;
    }
};
NotificationsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [SummaryService])
], NotificationsService);
export { NotificationsService };
//# sourceMappingURL=notifications.service.js.map