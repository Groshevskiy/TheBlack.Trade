import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const documentsService = readFileSync(new URL('./documents.service.ts', import.meta.url), 'utf8');

describe('payment proof lifecycle wiring', () => {
  it('submits payment proof documents through the customer flow', () => {
    const customerOrderDetail = readFileSync(new URL('../../../../astro-web/src/pages/orders/[id].astro', import.meta.url), 'utf8');
    expect(customerOrderDetail).toContain("document_type: 'payment_proof'");
    expect(customerOrderDetail).toContain("await api(`/documents/${documentId}/status`");
    expect(customerOrderDetail).toContain("status: 'submitted'");
  });

  it('moves orders to payment_confirmed when payment proof is approved', () => {
    expect(documentsService).toContain("updated.documentType === 'payment_proof'");
    expect(documentsService).toContain("updated.status === 'approved' && order.statusCode === 'awaiting_payment'");
    expect(documentsService).toContain("toStatus: 'payment_confirmed'");
    expect(documentsService).toContain("eventType: 'status_changed'");
    expect(documentsService).toContain("source: 'document_review'");
  });

  it('returns orders to awaiting_payment when confirmed proof is rejected', () => {
    expect(documentsService).toContain("updated.status === 'rejected' && order.statusCode === 'payment_confirmed'");
    expect(documentsService).toContain("toStatus: 'awaiting_payment'");
    expect(documentsService).toContain("templateCode: 'order_status_changed'");
  });

  it('keeps payment proof gating and operator review connected to order actions', () => {
    const ordersService = readFileSync(new URL('../orders/orders.service.ts', import.meta.url), 'utf8');
    const operatorOrderDetail = readFileSync(new URL('../../../../astro-web/src/pages/operator/orders/[id].astro', import.meta.url), 'utf8');

    expect(ordersService).toContain("requires_payment_proof: true");
    expect(ordersService).toContain("document.documentType === 'payment_proof' && document.status === 'approved'");
    expect(operatorOrderDetail).toContain("body: JSON.stringify({ status: button.dataset.status, operator_id: ACTOR_OPERATOR_ID })");
    expect(operatorOrderDetail).toContain("notify(`Document ${documentStatusLabel(button.dataset.status)} successfully.`, 'success');");
  });

  it('keeps document review side effects recorded for audit and delivery', () => {
    expect(documentsService).toContain("action: 'document_status_changed'");
    expect(documentsService).toContain("eventType: 'document_status_changed'");
    expect(documentsService).toContain('order_status_change');
  });
});
