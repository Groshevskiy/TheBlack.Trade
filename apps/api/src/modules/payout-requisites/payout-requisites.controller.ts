import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PayoutRequisitesService } from './payout-requisites.service.js';

@Controller('payout-requisites')
export class PayoutRequisitesController {
  constructor(private readonly payoutRequisitesService: PayoutRequisitesService) {}

  @Get()
  async list(@Query('user_id') userId?: string) {
    const items = await this.payoutRequisitesService.list(userId);
    return { items };
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    const item = await this.payoutRequisitesService.create(body);
    return { item };
  }
}
