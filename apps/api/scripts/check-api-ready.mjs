const baseUrl = process.env.API_BASE_URL ?? 'http://localhost:4000/api';
const timeoutMs = Number(process.env.API_READY_TIMEOUT_MS ?? 20000);
const intervalMs = Number(process.env.API_READY_INTERVAL_MS ?? 1000);
const healthUrl = `${baseUrl}/health`;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startedAt = Date.now();
let lastReason = 'unknown readiness failure';

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(healthUrl);
    const payload = await response.json().catch(() => null);
    if (response.ok && payload?.status === 'ok') {
      console.log(`API is ready: ${healthUrl}`);
      process.exit(0);
    }
    lastReason = response.ok ? 'unexpected health payload' : `HTTP ${response.status}`;
  } catch (error) {
    lastReason = error instanceof Error ? error.message : String(error);
  }
  await sleep(intervalMs);
}

console.error(`API is not ready after ${timeoutMs}ms: ${healthUrl} (${lastReason})`);
process.exit(1);
