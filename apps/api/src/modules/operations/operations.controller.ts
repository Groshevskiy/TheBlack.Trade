import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OperationsService } from './operations.service.js';

@Controller()
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get('operations/summary')
  async summary() {
    return { item: await this.operationsService.getSummary() };
  }

  @Get('audit-logs')
  async listAudit(@Query() query: Record<string, unknown>) {
    const items = await this.operationsService.listAudit(query);
    return { items };
  }

  @Get('webhook-events')
  async listWebhookEvents(@Query() query: Record<string, unknown>) {
    const items = await this.operationsService.listWebhookEvents(query);
    return { items };
  }

  @Post('webhook-events/:id/attempts')
  async createAttempt(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.operationsService.createAttempt(id, body);
  }
}
