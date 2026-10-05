import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('summary')
  async summary() {
    return { item: await this.notificationsService.getSummary() };
  }

  @Get()
  async list(@Query() query: Record<string, unknown>) {
    const items = await this.notificationsService.list(query);
    return { items };
  }

  @Post(':id/read')
  async markRead(@Param('id') id: string) {
    const item = await this.notificationsService.markRead(id);
    return { item };
  }
}
