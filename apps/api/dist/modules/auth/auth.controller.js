var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Controller, Get } from '@nestjs/common';
import { SummaryService } from '../summary/summary.service.js';
let AuthController = class AuthController {
    summaryService;
    constructor(summaryService) {
        this.summaryService = summaryService;
    }
    health() {
        return { module: 'auth', status: 'ok' };
    }
    async me() {
        const user = await this.summaryService.getDemoUser();
        return { item: this.summaryService.toUserSummary(user) };
    }
    async myOrdersSummary() {
        return { item: await this.summaryService.getCustomerOrdersSummary() };
    }
    async meSummary() {
        return { item: await this.summaryService.getAccountSummary() };
    }
};
__decorate([
    Get('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "health", null);
__decorate([
    Get('me'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    Get('me/orders-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "myOrdersSummary", null);
__decorate([
    Get('me/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "meSummary", null);
AuthController = __decorate([
    Controller('auth'),
    __metadata("design:paramtypes", [SummaryService])
], AuthController);
export { AuthController };
//# sourceMappingURL=auth.controller.js.map