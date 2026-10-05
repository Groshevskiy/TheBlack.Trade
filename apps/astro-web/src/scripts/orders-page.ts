const API = `${window.location.protocol}//${window.location.hostname}:4000/api`;

type OrderItem = {
  publicId?: string;
  public_id?: string;
  statusCode?: string;
  status_code?: string;
  directionCode?: string;
  direction_code?: string;
  assetCode?: string;
  asset_code?: string;
  networkCode?: string;
  network_code?: string;
  fiatAmount?: number;
  fiat_amount?: number;
  cryptoAmount?: number;
  crypto_amount?: number;
  rate?: number;
  updatedAt?: string | number | Date;
  createdAt?: string | number | Date;
};

const listEl = document.getElementById('ordersList') as HTMLDivElement | null;
const priorityEl = document.getElementById('priorityList') as HTMLDivElement | null;
const filterStatusEl = document.getElementById('statusFilter') as HTMLSelectElement | null;
const filterSearchEl = document.getElementById('searchFilter') as HTMLInputElement | null;
const filterSortEl = document.getElementById('sortFilter') as HTMLSelectElement | null;
const summaryEl = document.getElementById('summary') as HTMLElement | null;
const visibleCountEl = document.getElementById('visibleCount') as HTMLElement | null;
const noticeEl = document.getElementById('notice') as HTMLDivElement | null;
const insightTitleEl = document.getElementById('insightTitle') as HTMLElement | null;
const insightCopyEl = document.getElementById('insightCopy') as HTMLElement | null;
const refreshBtn = document.getElementById('refresh') as HTMLButtonElement | null;

if (!listEl || !priorityEl || !filterStatusEl || !filterSearchEl || !filterSortEl || !summaryEl || !visibleCountEl || !noticeEl || !insightTitleEl || !insightCopyEl || !refreshBtn) {
  throw new Error('Orders page DOM is incomplete');
}

let orders: OrderItem[] = [];

const fmt = (value: unknown, digits = 2) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: digits });
const date = (value: string | number | Date | undefined) => value ? new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—';

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error';
}

function setNotice(message = '') {
  if (!message) {
    noticeEl.hidden = true;
    noticeEl.textContent = '';
    return;
  }
  noticeEl.hidden = false;
  noticeEl.textContent = message;
}

function normalizeStatus(order: OrderItem) {
  return order.statusCode || order.status_code || 'draft';
}

function orderTitle(order: OrderItem) {
  return order.publicId || order.public_id || '—';
}

function statusInsight(items: OrderItem[]) {
  if (items.some((item) => normalizeStatus(item) === 'awaiting_payment')) {
    return {
      title: 'Customer payment is the top priority',
      copy: 'At least one visible order is waiting for fiat payment. Open it first and guide the customer to upload proof or finish the transfer.',
    };
  }
  if (items.some((item) => normalizeStatus(item) === 'payment_confirmed' || normalizeStatus(item) === 'processing')) {
    return {
      title: 'Processing is underway',
      copy: 'Use the detail flow to monitor execution and recent notifications for active orders already moving through operations.',
    };
  }
  if (items.some((item) => normalizeStatus(item) === 'draft')) {
    return {
      title: 'Fresh drafts are available',
      copy: 'Draft orders were recently created. Review quote details and move into the next payment step from the detail page.',
    };
  }
  if (items.some((item) => normalizeStatus(item) === 'completed')) {
    return {
      title: 'Completed orders dominate the list',
      copy: 'Most visible items are closed successfully. Use them as reference cases or a support audit trail.',
    };
  }
  return {
    title: 'No urgent customer action detected',
    copy: 'The current filter result does not show an immediately actionable lifecycle state.',
  };
}

function updateStats(items: OrderItem[]) {
  const total = items.length;
  const completed = items.filter((item) => normalizeStatus(item) === 'completed').length;
  const open = items.filter((item) => ['draft', 'awaiting_payment', 'payment_confirmed', 'processing'].includes(normalizeStatus(item))).length;
  const action = items.filter((item) => ['draft', 'awaiting_payment'].includes(normalizeStatus(item))).length;
  (document.getElementById('stat-total') as HTMLElement).textContent = String(total);
  (document.getElementById('stat-open') as HTMLElement).textContent = String(open);
  (document.getElementById('stat-completed') as HTMLElement).textContent = String(completed);
  (document.getElementById('stat-action') as HTMLElement).textContent = String(action);
}

function applyFilters() {
  const status = filterStatusEl.value;
  const q = filterSearchEl.value.trim().toLowerCase();
  const sort = filterSortEl.value;

  let filtered = orders.filter((order) => {
    const statusMatch = status === 'all' || normalizeStatus(order) === status;
    const haystack = [
      order.publicId,
      order.assetCode,
      order.asset_code,
      order.networkCode,
      order.network_code,
      order.directionCode,
      order.direction_code,
    ].filter(Boolean).join(' ').toLowerCase();
    const searchMatch = !q || haystack.includes(q);
    return statusMatch && searchMatch;
  });

  filtered = filtered.sort((a, b) => {
    if (sort === 'updated_asc') return new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime();
    if (sort === 'fiat_desc') return Number(b.fiatAmount || b.fiat_amount || 0) - Number(a.fiatAmount || a.fiat_amount || 0);
    if (sort === 'fiat_asc') return Number(a.fiatAmount || a.fiat_amount || 0) - Number(b.fiatAmount || b.fiat_amount || 0);
    return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
  });

  renderOrders(filtered);
  renderPriority(filtered);
  updateStats(filtered);
  summaryEl.textContent = `${filtered.length} visible of ${orders.length} total`;
  visibleCountEl.textContent = `${filtered.length} shown`;
  const insight = statusInsight(filtered);
  insightTitleEl.textContent = insight.title;
  insightCopyEl.textContent = insight.copy;
}

function renderPriority(items: OrderItem[]) {
  const priority = items
    .filter((item) => ['awaiting_payment', 'draft', 'payment_confirmed', 'processing'].includes(normalizeStatus(item)))
    .slice(0, 4);
  if (!priority.length) {
    priorityEl.innerHTML = '<p class="empty">No orders in the priority queue for the current filter.</p>';
    return;
  }
  priorityEl.innerHTML = priority.map((item) => `
    <div class="priority-item">
      <div class="priority-copy">
        <strong>${orderTitle(item)}</strong>
        <p>${normalizeStatus(item)} · ${item.directionCode || item.direction_code || '—'}</p>
        <p>${fmt(item.fiatAmount || item.fiat_amount, 2)} fiat · updated ${date(item.updatedAt)}</p>
      </div>
      <a href="/orders/${orderTitle(item)}">Open</a>
    </div>
  `).join('');
}

function renderOrders(items: OrderItem[]) {
  if (!items.length) {
    listEl.innerHTML = '<p class="empty">No orders match the current filters.</p>';
    return;
  }

  listEl.innerHTML = items.map((order) => {
    const status = normalizeStatus(order);
    const publicId = orderTitle(order);
    const direction = order.directionCode || order.direction_code || '—';
    const asset = order.assetCode || order.asset_code || '—';
    const network = order.networkCode || order.network_code || '—';
    const fiat = fmt(order.fiatAmount || order.fiat_amount, 2);
    const crypto = fmt(order.cryptoAmount || order.crypto_amount, 8);
    const rate = fmt(order.rate, 6);
    const actionCopy = status === 'awaiting_payment'
      ? 'Customer should complete payment and submit proof.'
      : status === 'draft'
        ? 'Recently created order waiting for first action.'
        : status === 'processing'
          ? 'Execution is in progress.'
          : status === 'completed'
            ? 'Lifecycle closed successfully.'
            : 'Open detail page for full lifecycle context.';

    return `
      <article class="order-card">
        <div class="order-head">
          <div class="order-copy">
            <h4 class="mono">${publicId}</h4>
            <p>${direction} · ${asset} via ${network}</p>
          </div>
          <span class="status ${status}">${status}</span>
        </div>
        <div class="amounts">
          <div><span>Fiat</span><strong>${fiat}</strong></div>
          <div><span>Crypto</span><strong>${crypto}</strong></div>
          <div><span>Rate</span><strong>${rate}</strong></div>
        </div>
        <div class="order-meta">
          <div class="meta-line">
            <span>Updated: ${date(order.updatedAt)}</span>
            <span>Created: ${date(order.createdAt)}</span>
          </div>
          <span class="tiny">${actionCopy}</span>
        </div>
        <div class="cta-row">
          <span class="tiny">Open the detail view for timeline, actions, notifications and documents.</span>
          <a href="/orders/${publicId}">Open detail</a>
        </div>
      </article>
    `;
  }).join('');
}

async function loadOrders() {
  refreshBtn.disabled = true;
  summaryEl.textContent = 'Loading orders…';
  setNotice('');
  try {
    const response = await fetch(`${API}/auth/me/orders-summary`, {
      headers: { 'Content-Type': 'application/json' },
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(payload?.message || `HTTP ${response.status}`);
    }
    const summary = payload?.item ?? payload;
    orders = Array.isArray(summary?.orders) ? summary.orders : Array.isArray(payload?.items) ? payload.items : [];
    applyFilters();
  } catch (error) {
    listEl.innerHTML = '<p class="empty">Failed to load orders.</p>';
    priorityEl.innerHTML = '<p class="empty">Priority queue unavailable.</p>';
    setNotice(errorMessage(error));
  } finally {
    refreshBtn.disabled = false;
  }
}

filterStatusEl.addEventListener('change', applyFilters);
filterSearchEl.addEventListener('input', applyFilters);
filterSortEl.addEventListener('change', applyFilters);
refreshBtn.addEventListener('click', loadOrders);

loadOrders();
