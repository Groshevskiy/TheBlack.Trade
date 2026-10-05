import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { SummaryModule } from '../summary/summary.module.js';

@Module({
  imports: [SummaryModule],
  controllers: [AuthController],
})
export class AuthModule {}
