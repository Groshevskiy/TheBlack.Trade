import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { SummaryModule } from '../summary/summary.module.js';

@Module({
  imports: [SummaryModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
