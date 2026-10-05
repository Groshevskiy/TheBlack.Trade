import { Module } from '@nestjs/common';
import { OperationsController } from './operations.controller.js';
import { OperationsService } from './operations.service.js';
import { SummaryModule } from '../summary/summary.module.js';

@Module({
  imports: [SummaryModule],
  controllers: [OperationsController],
  providers: [OperationsService],
})
export class OperationsModule {}
