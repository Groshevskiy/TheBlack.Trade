import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ordersService = readFileSync(new URL('./orders.service.ts', import.meta.url), 'utf8');
const documentsService = readFileSync(new URL('../documents/documents.service.ts', import.meta.url), 'utf8');
const customerOrderPage = readFileSync(new URL('../../../../astro-web/src/pages/orders/[id].astro', import.meta.url), 'utf8');
const operatorOrderPage = readFileSync(new URL('../../../../astro-web/src/pages/operator/orders/[id].astro', import.meta.url), 'utf8');

describe('order actions availability wiring', () => {
  it('defines backend action availability from order status instead of recorded action history', () => {
    expect(ordersService).toContain('private availableActionDefinitions(statusCode: string)');
    expect(ordersService).toContain("draft: [");
    expect(ordersService).toContain("awaiting_payment: [");
    expect(ordersService).toContain("payment_confirmed: [");
    expect(ordersService).toContain("processing: [");
    expect(ordersService).toContain("{ code: string; label: string; next_status: string; requires_payment_proof?: boolean }[]");
    expect(ordersService).not.toContain("actor_type: 'operator'");
    expect(ordersService).not.toContain("return db.select().from(tbOrderActions).where(eq(tbOrderActions.orderId, order.id)).orderBy(desc(tbOrderActions.createdAt));");
  });

  it('gates confirm_payment on approved payment proof while order is awaiting payment', () => {
    expect(ordersService).toContain("requires_payment_proof: true");
    expect(ordersService).toContain("order.statusCode === 'awaiting_payment'");
    expect(ordersService).toContain("document.documentType === 'payment_proof' && document.status === 'approved'");
    expect(ordersService).toContain("return available.filter((action) => !action.requires_payment_proof || hasApprovedPaymentProof)");
  });

  it('keeps payment proof review capable of advancing order status', () => {
    expect(documentsService).toContain("updated.documentType === 'payment_proof'");
    expect(documentsService).toContain("updated.status === 'approved' && order.statusCode === 'awaiting_payment'");
    expect(documentsService).toContain("toStatus: 'payment_confirmed'");
  });

  it('renders backend-provided actions on both customer and operator pages', () => {
    expect(customerOrderPage).not.toContain('function actionDefinitions(status)');
    expect(customerOrderPage).toContain('api(`/orders/${publicId}/actions`)');
    expect(customerOrderPage).toContain('const hint = item.hint || item.next_status ? `Next status: ${item.next_status || item.nextStatus}` :');
    expect(operatorOrderPage).toContain('const nextStatus = item.next_status || item.nextStatus;');
    expect(operatorOrderPage).toContain("const detail = item.hint || (nextStatus ? `Next status: ${statusLabel(nextStatus)}` : 'Available action from current order state.');");
  });
});
