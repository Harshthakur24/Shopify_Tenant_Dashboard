export type ShopifyProduct = {
  id: number | string;
  title: string;
  variants?: Array<{ price?: string | number }>;
};

export type ShopifyCustomer = {
  id: number | string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  total_spent?: string | number | null;
};

export type ShopifyOrder = {
  id: number | string;
  total_price?: string | number | null;
  currency?: string | null;
  processed_at?: string | null;
  created_at?: string | null;
  customer?: { id?: number | string } | null;
};

export type ShopifyClient = {
  getCustomers: () => Promise<ShopifyCustomer[]>;
  getOrders: () => Promise<ShopifyOrder[]>;
  getProducts: () => Promise<ShopifyProduct[]>;
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
    async getCustomers(): Promise<ShopifyCustomer[]> {
      const res = await fetch(`${base}/customers.json`, { headers });
      const json = await res.json();
      return json.customers ?? [];
    },
    async getOrders(): Promise<ShopifyOrder[]> {
      const res = await fetch(`${base}/orders.json?status=any`, { headers });
      const json = await res.json();
      return json.orders ?? [];
    },
    async getProducts(): Promise<ShopifyProduct[]> {
      const res = await fetch(`${base}/products.json`, { headers });
      const json = await res.json();
      return json.products ?? [];
    },
  };
}

// export function verifyShopifyWebhookHmac(payload: string, hmacHeader: string | undefined): boolean {
//   const secret = process.env.SHOPIFY_API_SECRET || process.env.WEBHOOK_SECRET || "";
//   if (!secret || !hmacHeader) return false;
//   const crypto = require("crypto") as typeof import("crypto");
//   const digest = crypto.createHmac("sha256", secret).update(payload, "utf8").digest("base64");
//   return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
// }


