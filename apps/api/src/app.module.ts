import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { QuotesModule } from './modules/quotes/quotes.module.js';
import { SummaryModule } from './modules/summary/summary.module.js';
import { ReferenceModule } from './modules/reference/reference.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { PayoutRequisitesModule } from './modules/payout-requisites/payout-requisites.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { OperationsModule } from './modules/operations/operations.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';

@Module({
  imports: [HealthModule, AuthModule, ReferenceModule, OrdersModule, QuotesModule, WalletsModule, PayoutRequisitesModule, NotificationsModule, DocumentsModule, OperationsModule, DashboardModule],
})
export class AppModule {}
