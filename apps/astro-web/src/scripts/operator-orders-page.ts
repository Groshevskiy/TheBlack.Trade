const API = `${window.location.protocol}//${window.location.hostname}:4000/api`;

type OperatorOrder = { publicId?: string; statusCode?: string; directionCode?: string; fiatAmount?: number; cryptoAmount?: number; updatedAt?: string | number | Date; pendingDocuments?: number };
type QueueMetrics = { total?: number; active?: number; completed?: number; needsAttention?: number };

const body = document.getElementById('ordersBody') as HTMLTableSectionElement | null;
const filter = document.getElementById('statusFilter') as HTMLSelectElement | null;
const notice = document.getElementById('notice') as HTMLDivElement | null;
const summary = document.getElementById('summary') as HTMLElement | null;
const refreshBtn = document.getElementById('refresh') as HTMLButtonElement | null;

if (!body || !filter || !notice || !summary || !refreshBtn) {
  throw new Error('Operator orders page DOM is incomplete');
}

const fmt = (value: unknown) => Number(value ?? 0).toLocaleString('en-US');
const date = (value: string | number | Date | undefined) => value ? new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

function setNotice(message = '') {
  if (!message) {
    notice.hidden = true;
    notice.textContent = '';
    return;
  }
  notice.hidden = false;
  notice.textContent = message;
}

function updateStats(metrics: QueueMetrics = {}) {
  (document.getElementById('stat-total') as HTMLElement).textContent = String(metrics.total ?? 0);
  (document.getElementById('stat-active') as HTMLElement).textContent = String(metrics.active ?? 0);
  (document.getElementById('stat-completed') as HTMLElement).textContent = String(metrics.completed ?? 0);
  (document.getElementById('stat-attention') as HTMLElement).textContent = String(metrics.needsAttention ?? 0);
}

function renderRows(items: OperatorOrder[]) {
  const selected = filter.value;
  const filtered = selected === 'all' ? items : items.filter((item) => item.statusCode === selected);
  summary.textContent = `${filtered.length} visible / ${items.length} total`;
  if (!filtered.length) {
    body.innerHTML = '<tr><td colspan="7" class="empty">No orders match this filter.</td></tr>';
    return;
  }
  body.innerHTML = filtered.map((item) => `
    <tr>
      <td class="mono">${item.publicId}</td>
      <td><span class="status ${item.statusCode}">${item.statusCode}</span></td>
      <td>${item.directionCode}</td>
      <td>${fmt(item.fiatAmount)}</td>
      <td>${fmt(item.cryptoAmount)}</td>
      <td>${date(item.updatedAt)}</td>
      <td><a class="action-link" href="/operator/orders/${item.publicId}">Open${item.pendingDocuments ? ` · docs ${item.pendingDocuments}` : ''}</a></td>
    </tr>
  `).join('');
}

async function loadOrders() {
  try {
    refreshBtn.disabled = true;
    setNotice('');
    body.innerHTML = '<tr><td colspan="7" class="empty">Loading orders…</td></tr>';
    const response = await fetch(`${API}/orders/operator/queue-summary`);
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || 'Failed to load queue');
    const item = data.item || {};
    updateStats(item.metrics || {});
    renderRows(item.items || []);
  } catch (error) {
    console.error('operator queue load failed', error);
    body.innerHTML = '<tr><td colspan="7" class="empty">Unable to load orders.</td></tr>';
    setNotice(errorMessage(error));
  } finally {
    refreshBtn.disabled = false;
  }
}

filter.addEventListener('change', loadOrders);
refreshBtn.addEventListener('click', loadOrders);
loadOrders();
