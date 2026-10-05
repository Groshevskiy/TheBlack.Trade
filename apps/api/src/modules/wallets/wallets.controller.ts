import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { WalletsService } from './wallets.service.js';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('summary')
  async summary() {
    return { item: await this.walletsService.getSummary() };
  }

  @Get()
  async list(@Query('user_id') userId?: string) {
    const items = await this.walletsService.list(userId);
    return { items };
  }

  @Post()
  async create(@Body() body: Record<string, unknown>) {
    const item = await this.walletsService.create(body);
    return { item };
  }
}
