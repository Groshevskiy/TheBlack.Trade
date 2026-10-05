import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ordersDto = readFileSync(new URL('./orders.dto.ts', import.meta.url), 'utf8');
const ordersService = readFileSync(new URL('./orders.service.ts', import.meta.url), 'utf8');
const ordersController = readFileSync(new URL('./orders.controller.ts', import.meta.url), 'utf8');

describe('order status update contract wiring', () => {
  it('accepts operator_id in the status update schema', () => {
    expect(ordersDto).toContain('export const UpdateOrderStatusSchema = z.object({');
    expect(ordersDto).toContain('operator_id: z.string().trim().min(1).max(128)');
    expect(ordersDto).not.toContain("actor_type: z.enum(['user', 'operator', 'system']).default('operator')");
    expect(ordersDto).not.toContain('actor_id: z.string().trim().min(1).max(128).optional()');
  });

  it('keeps the controller wired to POST :publicId/status', () => {
    expect(ordersController).toContain("@Post(':publicId/status')");
    expect(ordersController).toContain('this.ordersService.updateStatus(publicId, body)');
  });

  it('records status transitions as operator-driven audit and webhook events', () => {
    expect(ordersService).toContain("actorType: 'operator'");
    expect(ordersService).toContain('actorId: input.operator_id');
    expect(ordersService).toContain("action: 'order.status_changed'");
    expect(ordersService).toContain("eventType: 'order.status_changed'");
    expect(ordersService).toContain('operator_id: input.operator_id');
    expect(ordersService).not.toContain('input.actor_id');
  });
});
