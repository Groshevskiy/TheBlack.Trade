import { Body, Controller, Post } from '@nestjs/common';
import { QuotesService } from './quotes.service.js';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post('calculate')
  async calculate(@Body() body: Record<string, unknown>) {
    return this.quotesService.calculate(body);
  }
}
