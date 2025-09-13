type GlobalWithCron = typeof globalThis & { __syncCron?: NodeJS.Timer | null };

function getBaseUrl(): string {
  const url = process.env.CRON_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function ensureSyncCron(): void {
  if (process.env.CRON_ENABLED !== "true") return;
  const g = globalThis as GlobalWithCron;
  if (g.__syncCron) return; // already running

  const intervalSec = Number(process.env.CRON_INTERVAL_SECONDS || 900); // default 15m
  const secret = process.env.CRON_SECRET || "";
  const syncUrl = `${getBaseUrl()}/api/shopify/sync-all`;
  const abandonUrl = `${getBaseUrl()}/api/shopify/abandonment/sweep`;

  async function tick() {
    try {
      await fetch(syncUrl, {
        method: "POST",
        headers: secret ? { "x-cron-key": secret } : {},
        cache: "no-store",
      });
      // Trigger abandonment sweep a bit after sync
      setTimeout(() => {
        fetch(abandonUrl, {
          method: "POST",
          headers: secret ? { "x-cron-key": secret } : {},
          cache: "no-store",
        }).catch(() => {});
      }, 3000);
    } catch {
      // ignore errors; best-effort cron
    }
  }

  // Kick once on start, then on interval
  tick();
  g.__syncCron = setInterval(tick, Math.max(60, intervalSec) * 1000);
}


