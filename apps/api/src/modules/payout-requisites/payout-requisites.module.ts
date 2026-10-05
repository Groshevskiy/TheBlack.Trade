import { Module } from '@nestjs/common';
import { PayoutRequisitesController } from './payout-requisites.controller.js';
import { PayoutRequisitesService } from './payout-requisites.service.js';

@Module({
  controllers: [PayoutRequisitesController],
  providers: [PayoutRequisitesService],
})
export class PayoutRequisitesModule {}
