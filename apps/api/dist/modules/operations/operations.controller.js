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
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OperationsService } from './operations.service.js';
let OperationsController = class OperationsController {
    operationsService;
    constructor(operationsService) {
        this.operationsService = operationsService;
    }
    async summary() {
        return { item: await this.operationsService.getSummary() };
    }
    async listAudit(query) {
        const items = await this.operationsService.listAudit(query);
        return { items };
    }
    async listWebhookEvents(query) {
        const items = await this.operationsService.listWebhookEvents(query);
        return { items };
    }
    async createAttempt(id, body) {
        return this.operationsService.createAttempt(id, body);
    }
};
__decorate([
    Get('operations/summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "summary", null);
__decorate([
    Get('audit-logs'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "listAudit", null);
__decorate([
    Get('webhook-events'),
    __param(0, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "listWebhookEvents", null);
__decorate([
    Post('webhook-events/:id/attempts'),
    __param(0, Param('id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OperationsController.prototype, "createAttempt", null);
OperationsController = __decorate([
    Controller(),
    __metadata("design:paramtypes", [OperationsService])
], OperationsController);
export { OperationsController };
//# sourceMappingURL=operations.controller.js.map