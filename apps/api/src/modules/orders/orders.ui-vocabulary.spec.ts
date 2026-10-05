import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const customerOrderPage = readFileSync(new URL('../../../../astro-web/src/pages/orders/[id].astro', import.meta.url), 'utf8');
const operatorOrderPage = readFileSync(new URL('../../../../astro-web/src/pages/operator/orders/[id].astro', import.meta.url), 'utf8');

describe('order detail UI vocabulary wiring', () => {
  it('maps lifecycle statuses to friendly labels on customer and operator pages', () => {
    expect(customerOrderPage).toContain('function statusLabel(status)');
    expect(customerOrderPage).toContain("return 'Awaiting payment';");
    expect(customerOrderPage).toContain("return 'Payment confirmed';");
    expect(customerOrderPage).toContain('statusBadge.textContent = statusLabel(status);');
    expect(customerOrderPage).toContain('Current status: ${statusLabel(status)}. Updated ${date(order.updatedAt)}.');

    expect(operatorOrderPage).toContain('function statusLabel(status)');
    expect(operatorOrderPage).toContain("return 'Awaiting payment';");
    expect(operatorOrderPage).toContain("return 'Payment confirmed';");
    expect(operatorOrderPage).toContain("$('#status').textContent = statusLabel(order.statusCode);");
  });

  it('renders timeline events and transitions with friendly labels', () => {
    expect(customerOrderPage).toContain('function timelineEventLabel(eventType)');
    expect(customerOrderPage).toContain("return 'Status updated';");
    expect(customerOrderPage).toContain("return 'Document submitted';");
    expect(customerOrderPage).toContain("return 'Document review updated';");
    expect(customerOrderPage).toContain("<b>${timelineEventLabel(item.eventType)}</b>");
    expect(customerOrderPage).toContain("<span>${statusLabel(item.fromStatus) || '—'} → ${statusLabel(item.toStatus) || '—'}</span>");

    expect(operatorOrderPage).toContain('function timelineEventLabel(eventType)');
    expect(operatorOrderPage).toContain("<strong>${timelineEventLabel(item.eventType)}</strong>");
    expect(operatorOrderPage).toContain("<p>${statusLabel(item.fromStatus) || '—'} → ${statusLabel(item.toStatus) || '—'}</p>");
  });

  it('keeps document, action, and notification labels product-friendly', () => {
    expect(customerOrderPage).toContain('function documentStatusLabel(status)');
    expect(customerOrderPage).toContain('function documentTypeLabel(documentType)');
    expect(customerOrderPage).toContain('function actionLabel(actionCode)');
    expect(customerOrderPage).toContain('function notificationLabel(templateCode)');
    expect(customerOrderPage).toContain('Latest ${documentTypeLabel(latestProof.documentType || latestProof.document_type)}: ${documentStatusLabel(latestStatus)}');
    expect(customerOrderPage).toContain('<b>${actionLabel(item.actionCode || item.action_code)}</b>');
    expect(customerOrderPage).toContain("notificationLabel(item.templateCode || item.template_code)");

    expect(operatorOrderPage).toContain('function documentStatusLabel(status)');
    expect(operatorOrderPage).toContain('function documentTypeLabel(documentType)');
    expect(operatorOrderPage).toContain('function actionLabel(actionCode)');
    expect(operatorOrderPage).toContain('function notificationLabel(templateCode, title)');
    expect(operatorOrderPage).toContain("documentTypeLabel(item.documentType || item.document_type)");
    expect(operatorOrderPage).toContain("notify(`Document ${documentStatusLabel(button.dataset.status)} successfully.`, 'success');");
    expect(operatorOrderPage).toContain("notificationLabel(item.templateCode || item.template_code, item.title)");
  });
});
