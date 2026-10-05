import { Controller, Get } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('health')
  health() {
    return { module: 'auth', status: 'ok' };
  }

  @Get('me')
  async me() {
    const user = await this.summaryService.getDemoUser();
    return { item: this.summaryService.toUserSummary(user) };
  }

  @Get('me/orders-summary')
  async myOrdersSummary() {
    return { item: await this.summaryService.getCustomerOrdersSummary() };
  }

  @Get('me/summary')
  async meSummary() {
    return { item: await this.summaryService.getAccountSummary() };
  }
}
