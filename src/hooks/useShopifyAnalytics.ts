import { useState, useEffect, useCallback } from 'react';

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  totalInventory: number;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        inventoryQuantity: number;
        sku: string;
      };
    }>;
  };
}

export interface ShopifyOrder {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  financialStatus: string;
  fulfillmentStatus: string;
  totalPrice: string;
  currencyCode: string;
  customer?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface ShopifyCustomer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: string;
  state: string;
}

export interface ShopifyInventory {
  id: string;
  title: string;
  sku: string;
  inventoryQuantity: number;
  price: string;
  product: {
    id: string;
    title: string;
    vendor: string;
  };
}

export interface ShopInfo {
  id: string;
  name: string;
  email: string;
  currencyCode: string;
  plan: {
    displayName: string;
  };
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  topProducts: Record<string, { quantity: number; revenue: number; vendor: string }>;
  topCustomers: Record<string, { orders: number; revenue: number; email: string }>;
  dailySales: Record<string, { revenue: number; orders: number; uniqueCustomers: number }>;
}

export interface ShopifyAnalytics {
  products: ShopifyProduct[];
  orders: ShopifyOrder[];
  customers: ShopifyCustomer[];
  inventory: ShopifyInventory[];
  shop: ShopInfo;
  salesAnalytics: SalesAnalytics;
  summary: {
    totalProducts: number;
    totalOrders: number;
    totalCustomers: number;
    totalInventoryItems: number;
    totalRevenue: number;
    averageOrderValue: number;
    lowStockItems: number;
    newCustomersThisMonth: number;
  };
  enhancedAnalytics: {
    revenueTrend: Array<{
      date: string;
      revenue: number;
      orders: number;
      customers: number;
    }>;
    topProductsByRevenue: Array<{
      name: string;
      revenue: number;
      quantity: number;
      vendor: string;
    }>;
    customerSegmentation: {
      new: number;
      returning: number;
      vip: number;
    };
    geographicRevenue: Array<{
      country: string;
      revenue: number;
      orders: number;
    }>;
    inventoryAlerts: {
      outOfStock: number;
      lowStock: number;
      adequateStock: number;
    };
    orderStatusDistribution: Record<string, number>;
    hourlySalesPattern: Record<string, number>;
    topVendors: Array<{
      vendor: string;
      revenue: number;
      products: number;
    }>;
  };
  errors: Record<string, string | null>;
}

interface UseShopifyAnalyticsOptions {
  type?: 'dashboard' | 'products' | 'orders' | 'customers' | 'inventory' | 'shop' | 'sales';
  days?: number;
  refreshInterval?: number;
  shop?: string;
  token?: string;
}

interface UseShopifyAnalyticsReturn {
  data: ShopifyAnalytics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useShopifyAnalytics(options: UseShopifyAnalyticsOptions = {}): UseShopifyAnalyticsReturn {
  const {
    type = 'dashboard',
    days = 30,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
    shop,
    token
  } = options;

  const [data, setData] = useState<ShopifyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        type,
        days: days.toString(),
        ...(shop && { shop }),
        ...(token && { token })
      });

      const response = await fetch(`/api/shopify/enhanced-analytics?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch analytics');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Analytics request failed');
      }

      setData(result.data);
      setLastUpdated(new Date());
      
      // Log any partial errors
      if (result.data.errors) {
        const errorMessages = Object.entries(result.data.errors)
          .filter(([, error]) => error !== null)
          .map(([key, error]) => `${key}: ${error}`)
          .join(', ');
        
        if (errorMessages) {
          console.warn('Partial analytics errors:', errorMessages);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [type, days, shop, token]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchAnalytics();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchAnalytics, refreshInterval, loading]);

  return {
    data,
    loading,
    error,
    refresh: fetchAnalytics,
    lastUpdated
  };
}

// Specialized hooks for specific analytics
export function useProductAnalytics(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'products' });
}

export function useOrderAnalytics(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'orders' });
}

export function useCustomerAnalytics(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'customers' });
}

export function useInventoryAnalytics(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'inventory' });
}

export function useSalesAnalytics(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'sales' });
}

export function useShopInfo(options: Omit<UseShopifyAnalyticsOptions, 'type'> = {}) {
  return useShopifyAnalytics({ ...options, type: 'shop' });
}

// Real-time analytics hook (for webhook-driven updates)
export function useRealTimeAnalytics(options: UseShopifyAnalyticsOptions = {}) {
  const analyticsHook = useShopifyAnalytics({
    ...options,
    refreshInterval: 30 * 1000 // Refresh every 30 seconds for real-time feel
  });

  // In a real implementation, you might also:
  // - Connect to WebSocket for real-time updates
  // - Listen for Server-Sent Events
  // - Use React Query with automatic background refetching
  // - Cache data in localStorage/sessionStorage

  return analyticsHook;
}
