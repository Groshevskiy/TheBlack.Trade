import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async list() {
    const items = await this.ordersService.list();
    return { items, next_cursor: null };
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    return this.ordersService.create(body);
  }

  @Get(':publicId/actions')
  async actions(@Param('publicId') publicId: string) {
    const items = await this.ordersService.listActions(publicId);
    return { items };
  }

  @Post(':publicId/actions')
  async executeAction(@Param('publicId') publicId: string, @Body() body: Record<string, unknown>) {
    return this.ordersService.executeAction(publicId, body);
  }

  @Get(':publicId/timeline')
  async timeline(@Param('publicId') publicId: string) {
    const items = await this.ordersService.listTimeline(publicId);
    return { items };
  }

  @Get(':publicId/summary')
  async summary(@Param('publicId') publicId: string) {
    const item = await this.ordersService.getSummary(publicId);
    return { item };
  }

  @Get('operator/queue-summary')
  async operatorQueueSummary() {
    const item = await this.ordersService.getOperatorQueueSummary();
    return { item };
  }

  @Get(':publicId/operator-summary')
  async operatorSummary(@Param('publicId') publicId: string) {
    const item = await this.ordersService.getOperatorSummary(publicId);
    return { item };
  }

  @Post(':publicId/status')
  async updateStatus(@Param('publicId') publicId: string, @Body() body: Record<string, unknown>) {
    const item = await this.ordersService.updateStatus(publicId, body);
    return { item };
  }

  @Get(':publicId')
  async getById(@Param('publicId') publicId: string) {
    const order = await this.ordersService.getByPublicId(publicId);
    if (!order) {
      throw new NotFoundException({ message: 'Order not found', publicId });
    }
    return order;
  }
}
