import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'dashboard';

   
    const mockData = {
      products: [],
      orders: [],
      customers: [],
      inventory: [],
      shop: { name: 'Demo Store', currencyCode: 'USD' },
      salesAnalytics: {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        ordersByStatus: {},
        topProducts: {},
        topCustomers: {},
        dailySales: {},
      },
      summary: {
        totalProducts: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalInventoryItems: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        lowStockItems: 0,
        newCustomersThisMonth: 0,
      },
      enhancedAnalytics: {
        revenueTrend: [],
        topProductsByRevenue: [],
        customerSegmentation: { new: 0, returning: 0, vip: 0 },
        geographicRevenue: [],
        inventoryAlerts: { outOfStock: 0, lowStock: 0, adequateStock: 0 },
        orderStatusDistribution: {},
        hourlySalesPattern: {},
        topVendors: []
      },
      errors: {
        products: null,
        orders: null,
        customers: null,
        inventory: null,
        shop: null,
        sales: null,
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString(),
      type,
      shop: 'demo-store'
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
