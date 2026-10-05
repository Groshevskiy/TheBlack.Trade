import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
const authController = readFileSync(new URL('../auth/auth.controller.ts', import.meta.url), 'utf8');
const ordersController = readFileSync(new URL('../orders/orders.controller.ts', import.meta.url), 'utf8');
const ordersService = readFileSync(new URL('../orders/orders.service.ts', import.meta.url), 'utf8');
const summaryService = readFileSync(new URL('./summary.service.ts', import.meta.url), 'utf8');
describe('summary endpoint smoke coverage', () => {
    it('keeps auth summary endpoints wired', () => {
        expect(authController).toContain("@Get('me/summary')");
        expect(authController).toContain("@Get('me/orders-summary')");
        expect(authController).toContain('this.summaryService.getAccountSummary()');
        expect(authController).toContain('this.summaryService.getCustomerOrdersSummary()');
    });
    it('keeps operator and customer order summary endpoints wired', () => {
        expect(ordersController).toContain("@Get('operator/queue-summary')");
        expect(ordersController).toContain("@Get(':publicId/operator-summary')");
        expect(ordersController).toContain("@Get(':publicId/summary')");
        expect(ordersService).toContain('async getOperatorQueueSummary()');
        expect(ordersService).toContain('async getOperatorSummary(publicId: string)');
        expect(ordersService).toContain('async getSummary(publicId: string)');
    });
    it('uses the shared SummaryService builders', () => {
        expect(summaryService).toContain('async getDemoUser()');
        expect(summaryService).toContain('async getAccountSummary()');
        expect(summaryService).toContain('async getCustomerOrdersSummary()');
        expect(summaryService).toContain('async getOrderBundle(order: typeof tbOrders.$inferSelect)');
        expect(ordersService).toContain('this.summaryService.getOrderBundle(order)');
    });
});
//# sourceMappingURL=summary.endpoints.spec.js.map