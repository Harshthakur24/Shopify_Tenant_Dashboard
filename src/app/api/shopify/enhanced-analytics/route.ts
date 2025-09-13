import { NextRequest, NextResponse } from 'next/server';
import { 
  getEnhancedProductData,
  getOrderAnalytics, 
  getCustomerInsights, 
  getInventoryData,
  getShopInfo,
  getSalesAnalytics 
} from '@/lib/shopify-enhanced';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shop = searchParams.get('shop') || process.env.SHOPIFY_STORE_DOMAIN;
    const accessToken = searchParams.get('token') || process.env.SHOPIFY_ACCESS_TOKEN;
    const type = searchParams.get('type') || 'dashboard';
    const days = parseInt(searchParams.get('days') || '30');

    if (!shop || !accessToken) {
      return NextResponse.json(
        { error: 'Missing shop domain or access token' },
        { status: 400 }
      );
    }

    let data;

    switch (type) {
      case 'products':
        data = await getEnhancedProductData(shop, accessToken);
        break;
      
      case 'orders':
        data = await getOrderAnalytics(shop, accessToken);
        break;
      
      case 'customers':
        data = await getCustomerInsights(shop, accessToken);
        break;
      
      case 'inventory':
        data = await getInventoryData(shop, accessToken);
        break;
      
      case 'shop':
        data = await getShopInfo(shop, accessToken);
        break;
      
      case 'sales':
        data = await getSalesAnalytics(shop, accessToken, days);
        break;
      
      case 'dashboard':
      default:
        // Get comprehensive dashboard data
        console.log('Fetching comprehensive dashboard data...');
        
        const [products, orders, customers, inventory, shopInfo, salesAnalytics] = await Promise.allSettled([
          getEnhancedProductData(shop, accessToken),
          getOrderAnalytics(shop, accessToken),
          getCustomerInsights(shop, accessToken),
          getInventoryData(shop, accessToken),
          getShopInfo(shop, accessToken),
          getSalesAnalytics(shop, accessToken, days)
        ]);

        // Helper function to extract data from settled promises
        const extractData = (result: PromiseSettledResult<any>) => {
          return result.status === 'fulfilled' ? result.value : null;
        };

        const extractedProducts = extractData(products);
        const extractedOrders = extractData(orders);
        const extractedCustomers = extractData(customers);
        const extractedInventory = extractData(inventory);
        const extractedShopInfo = extractData(shopInfo);
        const extractedSalesAnalytics = extractData(salesAnalytics);

        // Calculate dashboard summary
        const summary = {
          totalProducts: extractedProducts?.length || 0,
          totalOrders: extractedOrders?.length || 0,
          totalCustomers: extractedCustomers?.length || 0,
          totalInventoryItems: extractedInventory?.length || 0,
          totalRevenue: extractedSalesAnalytics?.totalRevenue || 0,
          averageOrderValue: extractedSalesAnalytics?.averageOrderValue || 0,
          lowStockItems: extractedInventory?.filter((item: any) => 
            item.inventoryQuantity !== null && item.inventoryQuantity < 10
          ).length || 0,
          newCustomersThisMonth: extractedCustomers?.filter((customer: any) => {
            const customerDate = new Date(customer.createdAt);
            const oneMonthAgo = new Date();
            oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
            return customerDate >= oneMonthAgo;
          }).length || 0,
        };

        // Enhanced analytics for charts
        const enhancedAnalytics = {
          // Revenue trends (last 30 days)
          revenueTrend: extractedSalesAnalytics?.dailySales ? 
            Object.entries(extractedSalesAnalytics.dailySales)
              .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
              .map(([date, data]: [string, any]) => ({
                date,
                revenue: data.revenue,
                orders: data.orders,
                customers: data.uniqueCustomers
              })) : [],
          
          // Top products by revenue
          topProductsByRevenue: extractedSalesAnalytics?.topProducts ? 
            Object.entries(extractedSalesAnalytics.topProducts)
              .sort(([, a]: [string, any], [, b]: [string, any]) => b.revenue - a.revenue)
              .slice(0, 10)
              .map(([name, data]: [string, any]) => ({
                name,
                revenue: data.revenue,
                quantity: data.quantity,
                vendor: data.vendor
              })) : [],
          
          // Customer segments
          customerSegmentation: extractedSalesAnalytics?.customerSegments || {
            new: 0,
            returning: 0,
            vip: 0
          },
          
          // Geographic distribution
          geographicRevenue: extractedSalesAnalytics?.geographicData ? 
            Object.entries(extractedSalesAnalytics.geographicData)
              .sort(([, a]: [string, any], [, b]: [string, any]) => b.revenue - a.revenue)
              .slice(0, 10)
              .map(([country, data]: [string, any]) => ({
                country,
                revenue: data.revenue,
                orders: data.orders
              })) : [],
          
          // Inventory alerts
          inventoryAlerts: {
            outOfStock: extractedInventory?.filter((item: any) => 
              item.inventoryQuantity === 0
            ).length || 0,
            lowStock: extractedInventory?.filter((item: any) => 
              item.inventoryQuantity !== null && 
              item.inventoryQuantity > 0 && 
              item.inventoryQuantity < 10
            ).length || 0,
            adequateStock: extractedInventory?.filter((item: any) => 
              item.inventoryQuantity >= 10
            ).length || 0
          },
          
          // Order status distribution
          orderStatusDistribution: extractedSalesAnalytics?.ordersByStatus || {},
          
          // Hourly sales pattern
          hourlySalesPattern: extractedSalesAnalytics?.hourlySales || {},
          
          // Top vendors performance
          topVendors: extractedSalesAnalytics?.topVendors ? 
            Object.entries(extractedSalesAnalytics.topVendors)
              .sort(([, a]: [string, any], [, b]: [string, any]) => b.revenue - a.revenue)
              .slice(0, 5)
              .map(([vendor, data]: [string, any]) => ({
                vendor,
                revenue: data.revenue,
                products: data.products
              })) : []
        };

        data = {
          products: extractedProducts,
          orders: extractedOrders,
          customers: extractedCustomers,
          inventory: extractedInventory,
          shop: extractedShopInfo,
          salesAnalytics: extractedSalesAnalytics,
          summary,
          enhancedAnalytics,
          errors: {
            products: products.status === 'rejected' ? products.reason?.message : null,
            orders: orders.status === 'rejected' ? orders.reason?.message : null,
            customers: customers.status === 'rejected' ? customers.reason?.message : null,
            inventory: inventory.status === 'rejected' ? inventory.reason?.message : null,
            shop: shopInfo.status === 'rejected' ? shopInfo.reason?.message : null,
            sales: salesAnalytics.status === 'rejected' ? salesAnalytics.reason?.message : null,
          }
        };
        break;
    }

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
      type,
      shop: shop.replace('.myshopify.com', '')
    });

  } catch (error) {
    console.error('Enhanced Shopify Analytics API Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch enhanced Shopify analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
