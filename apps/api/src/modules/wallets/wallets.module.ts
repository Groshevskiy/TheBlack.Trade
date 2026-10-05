import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller.js';
import { WalletsService } from './wallets.service.js';
import { SummaryModule } from '../summary/summary.module.js';

@Module({
  imports: [SummaryModule],
  controllers: [WalletsController],
  providers: [WalletsService],
})
export class WalletsModule {}
