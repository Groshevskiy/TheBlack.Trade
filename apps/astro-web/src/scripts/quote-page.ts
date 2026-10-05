const API = `${window.location.protocol}//${window.location.hostname}:4000/api`;
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000401';

type AssetRef = { code: string };
type NetworkRef = { code: string; assetCode?: string; asset_code?: string; directionCode?: string; direction_code?: string; isActive?: boolean; is_active?: boolean };
type Quote = { quote_id?: string; id?: string; direction_code?: string; asset_code?: string; network_code?: string; fiat_amount?: number; fiatAmount?: number; crypto_amount?: number; cryptoAmount?: number; amount_in?: number; amount_out?: number; amount_type?: 'fiat' | 'crypto'; fiat_currency_code?: string; rate?: number };
type LatestOrder = { publicId?: string; statusCode?: string; fiatAmount?: number; cryptoAmount?: number };

const noticeEl = document.getElementById('notice') as HTMLDivElement | null;
const formEl = document.getElementById('quoteForm') as HTMLFormElement | null;
const directionEl = document.getElementById('direction') as HTMLSelectElement | null;
const assetEl = document.getElementById('asset') as HTMLSelectElement | null;
const networkEl = document.getElementById('network') as HTMLSelectElement | null;
const amountTypeEl = document.getElementById('amountType') as HTMLSelectElement | null;
const amountEl = document.getElementById('amount') as HTMLInputElement | null;
const fiatCurrencyEl = document.getElementById('fiatCurrency') as HTMLInputElement | null;
const calculateBtnEl = document.getElementById('calculateBtn') as HTMLButtonElement | null;
const resetBtnEl = document.getElementById('resetBtn') as HTMLButtonElement | null;
const createOrderBtnEl = document.getElementById('createOrderBtn') as HTMLButtonElement | null;
const quoteEmptyEl = document.getElementById('quoteEmpty') as HTMLDivElement | null;
const quoteResultEl = document.getElementById('quoteResult') as HTMLDivElement | null;
const quoteStateEl = document.getElementById('quoteState') as HTMLElement | null;
const latestOrderEl = document.getElementById('latestOrder') as HTMLDivElement | null;
const quoteIdEl = document.getElementById('quoteId') as HTMLElement | null;
const quoteDirectionEl = document.getElementById('quoteDirection') as HTMLElement | null;
const quoteAssetEl = document.getElementById('quoteAsset') as HTMLElement | null;
const quoteNetworkEl = document.getElementById('quoteNetwork') as HTMLElement | null;
const quoteFiatEl = document.getElementById('quoteFiat') as HTMLElement | null;
const quoteCryptoEl = document.getElementById('quoteCrypto') as HTMLElement | null;
const quoteRateEl = document.getElementById('quoteRate') as HTMLElement | null;

if (
  !noticeEl || !formEl || !directionEl || !assetEl || !networkEl || !amountTypeEl || !amountEl || !fiatCurrencyEl ||
  !calculateBtnEl || !resetBtnEl || !createOrderBtnEl || !quoteEmptyEl || !quoteResultEl || !quoteStateEl ||
  !latestOrderEl || !quoteIdEl || !quoteDirectionEl || !quoteAssetEl || !quoteNetworkEl || !quoteFiatEl ||
  !quoteCryptoEl || !quoteRateEl
) {
  throw new Error('Quote page DOM is incomplete');
}

let assets: AssetRef[] = [];
let networks: NetworkRef[] = [];
let activeQuote: Quote | null = null;
let loadingNetworks = false;

const fmt = (value: unknown, digits = 2) => Number(value ?? 0).toLocaleString('en-US', { maximumFractionDigits: digits });

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unexpected error';
}

function setNotice(message = '', type = 'error') {
  if (!message) {
    noticeEl.hidden = true;
    noticeEl.className = 'notice';
    noticeEl.textContent = '';
    return;
  }
  noticeEl.hidden = false;
  noticeEl.className = `notice ${type === 'success' ? 'success' : ''}`.trim();
  noticeEl.textContent = message;
}

async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload?.message === 'string'
      ? payload.message
      : JSON.stringify(payload ?? {}).slice(0, 200) || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload;
}

function renderAssets(items: AssetRef[]) {
  assetEl.innerHTML = items.map((item) => `<option value="${item.code}">${item.code}</option>`).join('');
}

function renderNetworks(items: NetworkRef[]) {
  if (!items.length) {
    networkEl.innerHTML = '<option value="">No active networks</option>';
    networkEl.disabled = true;
    return;
  }
  const previousValue = networkEl.value;
  networkEl.disabled = false;
  networkEl.innerHTML = items.map((item) => `<option value="${item.code}">${item.code}</option>`).join('');
  const codes = items.map((item) => item.code);
  if (previousValue && codes.includes(previousValue)) {
    networkEl.value = previousValue;
    return;
  }
  networkEl.value = items[0]?.code ?? '';
}

async function loadReferenceData() {
  const assetsPayload = await api('/reference/assets');
  assets = Array.isArray(assetsPayload?.items) ? assetsPayload.items : [];
  renderAssets(assets);
  await updateNetworks();
}

async function updateNetworks() {
  const assetCode = assetEl.value;
  const directionCode = directionEl.value;
  loadingNetworks = true;
  networkEl.disabled = true;
  networkEl.innerHTML = '<option value="">Loading networks…</option>';
  try {
    const query = new URLSearchParams({
      is_active: 'true',
      asset_code: assetCode,
      direction_code: directionCode,
    });
    const payload = await api(`/reference/networks?${query.toString()}`);
    networks = Array.isArray(payload?.items) ? payload.items : [];
    renderNetworks(networks);
  } catch (error) {
    networks = [];
    renderNetworks([]);
    setNotice(errorMessage(error));
  } finally {
    loadingNetworks = false;
  }
}

function validateQuoteForm() {
  if (loadingNetworks) {
    throw new Error('Wait until available networks finish loading.');
  }
  if (!networkEl.value || networkEl.value.trim().length < 2) {
    throw new Error('Select an active network before requesting a quote.');
  }
}

function resetQuote() {
  activeQuote = null;
  quoteResultEl.hidden = true;
  quoteEmptyEl.hidden = false;
  quoteStateEl.textContent = 'Quote not requested yet';
  createOrderBtnEl.disabled = true;
}

function renderQuote(payload: Quote) {
  activeQuote = payload;
  const quoteId = payload.quote_id ?? payload.id ?? '—';
  const fiatCode = (payload.fiat_currency_code ?? fiatCurrencyEl.value ?? 'RUB').toUpperCase();
  const amountType = payload.amount_type ?? amountTypeEl.value;
  const amountIn = Number(payload.amount_in ?? 0);
  const amountOut = Number(payload.amount_out ?? 0);
  const fiatAmount = amountType === 'fiat'
    ? amountIn
    : amountOut;
  const cryptoAmount = amountType === 'fiat'
    ? amountOut
    : amountIn;

  quoteIdEl.textContent = quoteId;
  quoteDirectionEl.textContent = payload.direction_code ?? directionEl.value;
  quoteAssetEl.textContent = payload.asset_code ?? assetEl.value;
  quoteNetworkEl.textContent = payload.network_code ?? networkEl.value;
  quoteFiatEl.textContent = `${fmt(fiatAmount, 2)} ${fiatCode}`;
  quoteCryptoEl.textContent = `${fmt(cryptoAmount, 8)} ${payload.asset_code ?? assetEl.value}`;
  quoteRateEl.textContent = fmt(payload.rate, 8);
  quoteEmptyEl.hidden = true;
  quoteResultEl.hidden = false;
  quoteStateEl.textContent = 'Quote ready';
  createOrderBtnEl.disabled = false;
}

function renderLatestOrder(order: LatestOrder | null) {
  if (!order) {
    latestOrderEl.innerHTML = '<p class="tiny">No order created in this session.</p>';
    return;
  }
  latestOrderEl.innerHTML = `
    <div class="order-pill">
      <strong>${order.publicId ?? '—'}</strong>
      <span>Status: ${order.statusCode ?? 'draft'}</span>
      <span>Fiat: ${fmt(order.fiatAmount, 2)}</span>
      <span>Crypto: ${fmt(order.cryptoAmount, 8)}</span>
    </div>
  `;
}

async function createOrder() {
  if (!activeQuote) {
    setNotice('Request quote before creating an order.');
    return;
  }

  createOrderBtnEl.disabled = true;
  setNotice('');
  try {
    const payload = await api('/orders', {
      method: 'POST',
      body: JSON.stringify({
        quote_id: activeQuote.quote_id ?? activeQuote.id,
        user_id: DEMO_USER_ID,
      }),
    });
    const createdOrder = payload?.item ?? payload ?? null;
    renderLatestOrder(createdOrder);
    const publicId = createdOrder?.publicId ?? createdOrder?.public_id;
    if (publicId) {
      window.location.href = `/orders/${publicId}`;
      return;
    }
    setNotice('Order created successfully.', 'success');
  } catch (error) {
    createOrderBtnEl.disabled = false;
    setNotice(errorMessage(error));
  }
}

async function calculateQuote(event: SubmitEvent) {
  event.preventDefault();
  calculateBtnEl.disabled = true;
  createOrderBtnEl.disabled = true;
  setNotice('');

  try {
    validateQuoteForm();
    const payload = await api('/quotes/calculate', {
      method: 'POST',
      body: JSON.stringify({
        direction_code: directionEl.value,
        fiat_currency_code: fiatCurrencyEl.value.trim().toUpperCase(),
        asset_code: assetEl.value,
        network_code: networkEl.value,
        amount_type: amountTypeEl.value,
        amount: Number(amountEl.value),
      }),
    });
    renderQuote(payload?.item ?? payload);
  } catch (error) {
    resetQuote();
    setNotice(errorMessage(error));
  } finally {
    calculateBtnEl.disabled = false;
  }
}

async function bootstrap() {
  resetQuote();
  renderLatestOrder(null);
  try {
    await loadReferenceData();
  } catch (error) {
    setNotice(errorMessage(error));
    calculateBtnEl.disabled = true;
  }
}

directionEl.addEventListener('change', () => { void updateNetworks(); });
assetEl.addEventListener('change', () => { void updateNetworks(); });
formEl.addEventListener('submit', calculateQuote);
createOrderBtnEl.addEventListener('click', createOrder);
resetBtnEl.addEventListener('click', () => {
  formEl.reset();
  fiatCurrencyEl.value = 'RUB';
  amountEl.value = '15000';
  void updateNetworks();
  resetQuote();
  setNotice('');
});

bootstrap();
