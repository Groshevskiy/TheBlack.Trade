export const CABINET_API = `${window.location.protocol}//${window.location.hostname}:4000/api`;

export function emptyMarkup(message: string) {
  return `<p class="empty">${message}</p>`;
}

export function formatRuDate(value?: string | number | Date | null) {
  return value
    ? new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
    : '—';
}

export function setNotice(target: HTMLElement, message = '') {
  target.hidden = !message;
  target.textContent = message;
}

export async function fetchJson(path: string) {
  const response = await fetch(`${CABINET_API}${path}`);
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || `HTTP ${response.status}`);
  return payload;
}

export function renderStatusPill(templateEl: HTMLTemplateElement, text: string, tone?: string) {
  const raw = templateEl.innerHTML.trim();
  return raw.replace('template', text).replace('neutral', tone || 'neutral');
}
