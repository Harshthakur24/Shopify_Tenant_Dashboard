import { AreaChartData, BarChartData, LineChartData } from '@/components/charts'

export interface ShopifyProduct {
  id: number | string;
  title: string;
  vendor?: string;
  product_type?: string;
  status?: string;
  created_at?: string;
  variants?: {
    id: number | string;
    title: string;
    price?: string;
    inventory_quantity?: number | null;
    option1?: string | null;
  }[];
}

/**
 * Transform products created over time into area chart data
 */
export function transformProductsToAreaChart(products: ShopifyProduct[]): AreaChartData[] {
  const byMonth: Record<string, { total: number; active: number }> = {};
  
  for (const product of products) {
    if (!product.created_at) continue;
    
    const date = new Date(product.created_at);
    if (isNaN(date.getTime())) continue;
    
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    
    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { total: 0, active: 0 };
    }
    
    byMonth[monthKey].total++;
    if (product.status === 'active') {
      byMonth[monthKey].active++;
    }
  }
  
  // Sort by date and return last 6 months
  const sortedEntries = Object.entries(byMonth)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6);
  
  return sortedEntries.map(([period, data]) => ({
    period,
    desktop: data.total, // Total products
    mobile: data.active  // Active products
  }));
}

/**
 * Transform price buckets into bar chart data
 */
export function transformPricesToBarChart(products: ShopifyProduct[]): BarChartData[] {
  const buckets = [
    { range: "<₹500", min: 0, max: 500 },
    { range: "₹500-999", min: 500, max: 1000 },
    { range: "₹1000-1999", min: 1000, max: 2000 },
    { range: "₹2000-4999", min: 2000, max: 5000 },
    { range: "₹5000+", min: 5000, max: Infinity }
  ];
  
  const bucketCounts = buckets.map(bucket => ({
    category: bucket.range,
    desktop: 0, // Total variants in price range
    mobile: 0   // Available variants in price range
  }));
  
  for (const product of products) {
    for (const variant of product.variants || []) {
      const price = Number(variant.price || 0);
      const isAvailable = (variant.inventory_quantity ?? 0) > 0;
      
      const bucketIndex = buckets.findIndex(bucket => 
        price >= bucket.min && price < bucket.max
      );
      
      if (bucketIndex !== -1) {
        bucketCounts[bucketIndex].desktop++;
        if (isAvailable) {
          bucketCounts[bucketIndex].mobile++;
        }
      }
    }
  }
  
  return bucketCounts;
}

/**
 * Transform vendor distribution into line chart data
 */
export function transformVendorsToLineChart(products: ShopifyProduct[]): LineChartData[] {
  const vendorsByMonth: Record<string, Record<string, number>> = {};
  
  for (const product of products) {
    if (!product.created_at) continue;
    
    const date = new Date(product.created_at);
    if (isNaN(date.getTime())) continue;
    
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    const vendor = product.vendor || 'Unknown';
    
    if (!vendorsByMonth[monthKey]) {
      vendorsByMonth[monthKey] = {};
    }
    
    vendorsByMonth[monthKey][vendor] = (vendorsByMonth[monthKey][vendor] || 0) + 1;
  }
  
  // Get top 2 vendors overall
  const vendorTotals: Record<string, number> = {};
  for (const product of products) {
    const vendor = product.vendor || 'Unknown';
    vendorTotals[vendor] = (vendorTotals[vendor] || 0) + 1;
  }
  
  const topVendors = Object.entries(vendorTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([vendor]) => vendor);
  
  // Sort months and get last 6
  const sortedMonths = Object.keys(vendorsByMonth)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    .slice(-6);
  
  return sortedMonths.map(month => ({
    period: month,
    desktop: vendorsByMonth[month][topVendors[0]] || 0,
    mobile: vendorsByMonth[month][topVendors[1]] || 0
  }));
}

/**
 * Calculate trend percentage
 */
export function calculateTrend(data: { desktop: number; mobile: number }[]): number {
  if (data.length < 2) return 0;
  
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  
  const currentTotal = current.desktop + current.mobile;
  const previousTotal = previous.desktop + previous.mobile;
  
  if (previousTotal === 0) return 0;
  
  return Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
}

/**
 * Create chart config with your app's colors
 */
export const chartConfig = {
  desktop: {
    label: "Primary",
    color: "hsl(262.1 83.3% 57.8%)", // Your violet color
  },
  mobile: {
    label: "Secondary", 
    color: "hsl(221.2 83.2% 53.3%)", // Your blue color
  },
}
