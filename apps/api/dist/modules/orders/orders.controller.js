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
import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async list() {
        const items = await this.ordersService.list();
        return { items, next_cursor: null };
    }
    async create(body) {
        return this.ordersService.create(body);
    }
    async actions(publicId) {
        const items = await this.ordersService.listActions(publicId);
        return { items };
    }
    async executeAction(publicId, body) {
        return this.ordersService.executeAction(publicId, body);
    }
    async timeline(publicId) {
        const items = await this.ordersService.listTimeline(publicId);
        return { items };
    }
    async summary(publicId) {
        const item = await this.ordersService.getSummary(publicId);
        return { item };
    }
    async operatorQueueSummary() {
        const item = await this.ordersService.getOperatorQueueSummary();
        return { item };
    }
    async operatorSummary(publicId) {
        const item = await this.ordersService.getOperatorSummary(publicId);
        return { item };
    }
    async updateStatus(publicId, body) {
        const item = await this.ordersService.updateStatus(publicId, body);
        return { item };
    }
    async getById(publicId) {
        const order = await this.ordersService.getByPublicId(publicId);
        if (!order) {
            throw new NotFoundException({ message: 'Order not found', publicId });
        }
        return order;
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    Get(':publicId/actions'),
    __param(0, Param('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "actions", null);
__decorate([
    Post(':publicId/actions'),
    __param(0, Param('publicId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "executeAction", null);
__decorate([
    Get(':publicId/timeline'),
    __param(0, Param('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "timeline", null);
__decorate([
    Get(':publicId/summary'),
    __param(0, Param('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "summary", null);
__decorate([
    Get('operator/queue-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "operatorQueueSummary", null);
__decorate([
    Get(':publicId/operator-summary'),
    __param(0, Param('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "operatorSummary", null);
__decorate([
    Post(':publicId/status'),
    __param(0, Param('publicId')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
__decorate([
    Get(':publicId'),
    __param(0, Param('publicId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getById", null);
OrdersController = __decorate([
    Controller('orders'),
    __metadata("design:paramtypes", [OrdersService])
], OrdersController);
export { OrdersController };
//# sourceMappingURL=orders.controller.js.map