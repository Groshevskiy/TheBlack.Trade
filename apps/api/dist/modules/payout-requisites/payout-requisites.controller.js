var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PayoutRequisitesService } from './payout-requisites.service.js';
let PayoutRequisitesController = class PayoutRequisitesController {
    payoutRequisitesService;
    constructor(payoutRequisitesService) {
        this.payoutRequisitesService = payoutRequisitesService;
    }
    async list(userId) {
        const items = await this.payoutRequisitesService.list(userId);
        return { items };
    }
    async create(body) {
        const item = await this.payoutRequisitesService.create(body);
        return { item };
    }
};
__decorate([
    Get(),
    __param(0, Query('user_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PayoutRequisitesController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutRequisitesController.prototype, "create", null);
PayoutRequisitesController = __decorate([
    Controller('payout-requisites'),
    __metadata("design:paramtypes", [PayoutRequisitesService])
], PayoutRequisitesController);
export { PayoutRequisitesController };
//# sourceMappingURL=payout-requisites.controller.js.map