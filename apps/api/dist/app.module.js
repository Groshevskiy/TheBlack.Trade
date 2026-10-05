var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { QuotesModule } from './modules/quotes/quotes.module.js';
import { ReferenceModule } from './modules/reference/reference.module.js';
import { WalletsModule } from './modules/wallets/wallets.module.js';
import { PayoutRequisitesModule } from './modules/payout-requisites/payout-requisites.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { DocumentsModule } from './modules/documents/documents.module.js';
import { OperationsModule } from './modules/operations/operations.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
let AppModule = class AppModule {
};
AppModule = __decorate([
    Module({
        imports: [HealthModule, AuthModule, ReferenceModule, OrdersModule, QuotesModule, WalletsModule, PayoutRequisitesModule, NotificationsModule, DocumentsModule, OperationsModule, DashboardModule],
    })
], AppModule);
export { AppModule };
//# sourceMappingURL=app.module.js.map