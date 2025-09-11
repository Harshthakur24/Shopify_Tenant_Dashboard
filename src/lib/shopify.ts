export type ShopifyClient = {
  getCustomers: () => Promise<any[]>;
  getOrders: () => Promise<any[]>;
  getProducts: () => Promise<any[]>;
};

/**
 * Creates a Shopify REST Admin API client. Prefers Admin access token. If a token
 * is not provided, falls back to Basic auth using apiKey + apiSecret (legacy private apps).
 */
export function createShopifyClient(
  shop: string,
  token?: string | null,
  opts?: { apiKey?: string | null; apiSecret?: string | null }
): ShopifyClient {
  const base = `https://${shop}/admin/api/2024-10`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["X-Shopify-Access-Token"] = token;
  } else if (opts?.apiKey && opts?.apiSecret) {
    const basic = Buffer.from(`${opts.apiKey}:${opts.apiSecret}`).toString("base64");
    headers["Authorization"] = `Basic ${basic}`;
  }

  return {
    async getCustomers() {
      const res = await fetch(`${base}/customers.json`, { headers });
      const json = await res.json();
      return json.customers ?? [];
    },
    async getOrders() {
      const res = await fetch(`${base}/orders.json?status=any`, { headers });
      const json = await res.json();
      return json.orders ?? [];
    },
    async getProducts() {
      const res = await fetch(`${base}/products.json`, { headers });
      const json = await res.json();
      return json.products ?? [];
    },
  };
}

export function verifyShopifyWebhookHmac(payload: string, hmacHeader: string | undefined): boolean {
  const secret = process.env.SHOPIFY_API_SECRET || process.env.WEBHOOK_SECRET || "";
  if (!secret || !hmacHeader) return false;
  const crypto = require("crypto") as typeof import("crypto");
  const digest = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}


