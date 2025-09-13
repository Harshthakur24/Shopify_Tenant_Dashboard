import { shopifyApi, ApiVersion } from '@shopify/shopify-api';

// Initialize Shopify API with comprehensive scopes
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET || '',
  scopes: [
    'read_products', 
    'read_orders', 
    'read_customers', 
    'read_analytics', 
    'read_inventory',
    'read_reports',
    'read_sales_channels',
    'read_marketing_events',
    'read_discounts',
    'read_price_rules'
  ],
  hostName: process.env.SHOPIFY_APP_URL || 'localhost',
  apiVersion: ApiVersion.October23,
  isEmbeddedApp: false,
});

// Enhanced session creation
function createSession(shop: string) {
  return shopify.session.customAppSession(shop);
}

// Advanced Product Analytics with Rich Data
export async function getEnhancedProductData(shop: string, accessToken: string) {
  const session = createSession(shop);
  session.accessToken = accessToken;
  
  const client = new shopify.clients.Graphql({ session });

  const query = `
    query getEnhancedProducts {
      products(first: 100) {
        edges {
          node {
            id
            title
            handle
            status
            vendor
            productType
            tags
            createdAt
            updatedAt
            totalInventory
            onlineStoreUrl
            publishedAt
            description
            descriptionHtml
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  price
                  compareAtPrice
                  inventoryQuantity
                  sku
                  barcode
                  weight
                  weightUnit
                  availableForSale
                  requiresShipping
                  taxable
                  inventoryPolicy
                  inventoryManagement
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            images(first: 10) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            metafields(first: 10) {
              edges {
                node {
                  key
                  value
                  type
                  namespace
                }
              }
            }
            seo {
              title
              description
            }
            collections(first: 5) {
              edges {
                node {
                  id
                  title
                  handle
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    const responseData = (response.body as unknown) as { data?: { products?: { edges?: Array<{ node: Record<string, unknown> }> } } };
    return responseData?.data?.products?.edges?.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Error fetching enhanced product data:', error);
    throw error;
  }
}

// Comprehensive Order Analytics
export async function getOrderAnalytics(shop: string, accessToken: string) {
  const session = createSession(shop);
  session.accessToken = accessToken;
  
  const client = new shopify.clients.Graphql({ session });

  const query = `
    query getOrderAnalytics {
      orders(first: 250, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            name
            email
            createdAt
            updatedAt
            processedAt
            cancelledAt
            cancelReason
            financialStatus
            fulfillmentStatus
            totalPrice
            subtotalPrice
            totalTax
            totalShippingPrice
            totalDiscounts
            totalTipReceived
            currencyCode
            orderNumber
            confirmed
            tags
            note
            phone
            referring_site: referringSite
            source_name: sourceName
            customer {
              id
              firstName
              lastName
              email
              phone
              acceptsMarketing
              createdAt
              totalSpent
              ordersCount
              state
              tags
              defaultAddress {
                city
                country
                province
                zip
              }
            }
            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity
                  originalUnitPrice
                  discountedUnitPrice
                  vendor
                  variant {
                    id
                    title
                    price
                    sku
                    barcode
                    inventoryQuantity
                    product {
                      id
                      title
                      vendor
                      productType
                      handle
                    }
                  }
                  discountAllocations {
                    allocatedAmount
                    discountApplication {
                      ... on DiscountCodeApplication {
                        code
                        applicable
                      }
                      ... on ManualDiscountApplication {
                        title
                        description
                      }
                    }
                  }
                }
              }
            }
            shippingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              country
              province
              zip
              phone
            }
            billingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              country
              province
              zip
              phone
            }
            discountApplications(first: 10) {
              edges {
                node {
                  allocationMethod
                  targetSelection
                  targetType
                  value {
                    ... on MoneyV2 {
                      amount
                      currencyCode
                    }
                    ... on PricingPercentageValue {
                      percentage
                    }
                  }
                }
              }
            }
            fulfillments(first: 10) {
              id
              status
              createdAt
              updatedAt
              trackingCompany
              trackingNumbers
              trackingUrls
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    const responseData = (response.body as unknown) as { data?: { orders?: { edges?: Array<{ node: Record<string, unknown> }> } } };
    return responseData?.data?.orders?.edges?.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Error fetching order analytics:', error);
    throw error;
  }
}

// Customer Insights & Segmentation
export async function getCustomerInsights(shop: string, accessToken: string) {
  const session = createSession(shop);
  session.accessToken = accessToken;
  
  const client = new shopify.clients.Graphql({ session });

  const query = `
    query getCustomerInsights {
      customers(first: 250) {
        edges {
          node {
            id
            firstName
            lastName
            email
            phone
            acceptsMarketing
            emailMarketingConsent {
              state
              optInLevel
              consentUpdatedAt
            }
            smsMarketingConsent {
              state
              optInLevel
              consentUpdatedAt
            }
            createdAt
            updatedAt
            ordersCount
            totalSpent
            averageOrderValue
            state
            tags
            note
            verifiedEmail
            taxExempt
            addresses(first: 5) {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              country
              province
              zip
              phone
            }
            defaultAddress {
              city
              country
              province
              zip
            }
            lastOrder {
              id
              name
              totalPrice
              createdAt
              financialStatus
              fulfillmentStatus
            }
            metafields(first: 10) {
              edges {
                node {
                  key
                  value
                  type
                  namespace
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    const responseData = (response.body as unknown) as { data?: { customers?: { edges?: Array<{ node: Record<string, unknown> }> } } };
    return responseData?.data?.customers?.edges?.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Error fetching customer insights:', error);
    throw error;
  }
}

// Inventory & Stock Management
export async function getInventoryData(shop: string, accessToken: string) {
  const session = createSession(shop);
  session.accessToken = accessToken;
  
  const client = new shopify.clients.Graphql({ session });

  const query = `
    query getInventoryData {
      productVariants(first: 250) {
        edges {
          node {
            id
            title
            sku
            barcode
            inventoryQuantity
            inventoryPolicy
            inventoryManagement
            price
            compareAtPrice
            weight
            weightUnit
            requiresShipping
            taxable
            availableForSale
            product {
              id
              title
              vendor
              productType
              status
              handle
              tags
            }
            inventoryItem {
              id
              tracked
              requiresShipping
              cost
              countryCodeOfOrigin
              provinceCodeOfOrigin
              harmonizedSystemCode
              countryHarmonizedSystemCodes(first: 10) {
                edges {
                  node {
                    countryCode
                    harmonizedSystemCode
                  }
                }
              }
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    const responseData = (response.body as unknown) as { data?: { productVariants?: { edges?: Array<{ node: Record<string, unknown> }> } } };
    return responseData?.data?.productVariants?.edges?.map((edge) => edge.node) ?? [];
  } catch (error) {
    console.error('Error fetching inventory data:', error);
    throw error;
  }
}

// Sales Performance & Revenue Analytics
export async function getSalesAnalytics(shop: string, accessToken: string, days: number = 30) {
  const orders = await getOrderAnalytics(shop, accessToken);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentOrders = orders.filter((order: Record<string, unknown>) => 
    new Date(order.createdAt as string) >= cutoffDate
  );

  // Calculate comprehensive analytics
  const analytics = {
    totalRevenue: 0,
    totalOrders: recentOrders.length,
    averageOrderValue: 0,
    totalTax: 0,
    totalShipping: 0,
    totalDiscounts: 0,
    refundedOrders: 0,
    topProducts: {} as Record<string, { quantity: number; revenue: number; vendor: string }>,
    topCustomers: {} as Record<string, { orders: number; revenue: number; email: string }>,
    topVendors: {} as Record<string, { products: number; revenue: number }>,
    dailySales: {} as Record<string, { revenue: number; orders: number; customers: Set<string> }>,
    hourlySales: {} as Record<string, number>,
    ordersByStatus: {
      pending: 0,
      authorized: 0,
      paid: 0,
      partially_paid: 0,
      refunded: 0,
      voided: 0,
      partially_refunded: 0,
    },
    customerSegments: {
      new: 0,
      returning: 0,
      vip: 0, // customers with > 5 orders
    },
    geographicData: {} as Record<string, { orders: number; revenue: number }>,
    deviceSources: {} as Record<string, number>,
    paymentMethods: {} as Record<string, number>,
  };

  // Process each order
  recentOrders.forEach((order: Record<string, unknown>) => {
    const revenue = parseFloat((order.totalPrice as string) || '0');
    analytics.totalRevenue += revenue;
    analytics.totalTax += parseFloat((order.totalTax as string) || '0');
    analytics.totalShipping += parseFloat((order.totalShippingPrice as string) || '0');
    analytics.totalDiscounts += parseFloat((order.totalDiscounts as string) || '0');

    // Daily sales tracking
    const date = new Date(order.createdAt as string).toISOString().split('T')[0];
    if (!analytics.dailySales[date]) {
      analytics.dailySales[date] = { revenue: 0, orders: 0, customers: new Set() };
    }
    analytics.dailySales[date].revenue += revenue;
    analytics.dailySales[date].orders += 1;
    
    const customer = order.customer as Record<string, unknown> | undefined;
    if (customer?.email) {
      analytics.dailySales[date].customers.add(customer.email as string);
    }

    // Hourly sales
    const hour = new Date(order.createdAt as string).getHours();
    analytics.hourlySales[hour] = (analytics.hourlySales[hour] || 0) + revenue;

    // Order status tracking
    const financialStatus = order.financialStatus as string;
    if (financialStatus && financialStatus in analytics.ordersByStatus) {
      analytics.ordersByStatus[financialStatus as keyof typeof analytics.ordersByStatus]++;
    }

    // Customer segmentation
    if (customer) {
      const customerKey = (customer.email as string) || (customer.id as string);
      if (!analytics.topCustomers[customerKey]) {
        analytics.topCustomers[customerKey] = { 
          orders: 0, 
          revenue: 0, 
          email: (customer.email as string) || 'Unknown' 
        };
      }
      analytics.topCustomers[customerKey].orders += 1;
      analytics.topCustomers[customerKey].revenue += revenue;

      // Customer segment classification
      const ordersCount = customer.ordersCount as number;
      if (ordersCount <= 1) {
        analytics.customerSegments.new++;
      } else if (ordersCount > 5) {
        analytics.customerSegments.vip++;
      } else {
        analytics.customerSegments.returning++;
      }
    }

    // Geographic analysis
    const shippingAddress = order.shippingAddress as Record<string, unknown> | undefined;
    const billingAddress = order.billingAddress as Record<string, unknown> | undefined;
    const country = (shippingAddress?.country as string) || (billingAddress?.country as string) || 'Unknown';
    if (!analytics.geographicData[country]) {
      analytics.geographicData[country] = { orders: 0, revenue: 0 };
    }
    analytics.geographicData[country].orders += 1;
    analytics.geographicData[country].revenue += revenue;

    // Product analysis
    const lineItems = order.lineItems as { edges?: Array<Record<string, unknown>> } | undefined;
    if (lineItems?.edges) {
      lineItems.edges.forEach((item: Record<string, unknown>) => {
        const product = item.node as Record<string, unknown>;
        const variant = product.variant as Record<string, unknown> | undefined;
        const variantProduct = variant?.product as Record<string, unknown> | undefined;
        
        const productTitle = (variantProduct?.title as string) || (product.title as string) || 'Unknown';
        const vendor = (variantProduct?.vendor as string) || (product.vendor as string) || 'Unknown';
        const itemRevenue = parseFloat((product.originalUnitPrice as string) || '0') * ((product.quantity as number) || 0);

        // Top products
        if (!analytics.topProducts[productTitle]) {
          analytics.topProducts[productTitle] = { quantity: 0, revenue: 0, vendor };
        }
        analytics.topProducts[productTitle].quantity += (product.quantity as number) || 0;
        analytics.topProducts[productTitle].revenue += itemRevenue;

        // Top vendors
        if (!analytics.topVendors[vendor]) {
          analytics.topVendors[vendor] = { products: 0, revenue: 0 };
        }
        analytics.topVendors[vendor].revenue += itemRevenue;
      });
    }

    // Device/source tracking
    const source = (order.source_name as string) || (order.referring_site as string) || 'Direct';
    analytics.deviceSources[source] = (analytics.deviceSources[source] || 0) + 1;
  });

  // Calculate averages
  if (analytics.totalOrders > 0) {
    analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
  }

  // Convert Sets to counts for JSON serialization
  const dailySalesFormatted = Object.entries(analytics.dailySales).reduce((acc, [date, data]) => {
    acc[date] = {
      revenue: data.revenue,
      orders: data.orders,
      uniqueCustomers: data.customers.size
    };
    return acc;
  }, {} as Record<string, { revenue: number; orders: number; uniqueCustomers: number }>);

  return {
    ...analytics,
    dailySales: dailySalesFormatted,
    conversionMetrics: {
      averageOrderValue: analytics.averageOrderValue,
      revenuePerCustomer: analytics.totalRevenue / Object.keys(analytics.topCustomers).length || 0,
      ordersPerCustomer: analytics.totalOrders / Object.keys(analytics.topCustomers).length || 0,
    }
  };
}

// Shop Information & Settings
export async function getShopInfo(shop: string, accessToken: string) {
  const session = createSession(shop);
  session.accessToken = accessToken;
  
  const client = new shopify.clients.Graphql({ session });

  const query = `
    query getShopInfo {
      shop {
        id
        name
        email
        description
        url
        myshopifyDomain
        plan {
          displayName
          partnerDevelopment
          shopifyPlus
        }
        primaryDomain {
          host
          sslEnabled
          url
        }
        currencyCode
        enabledPresentmentCurrencies
        timezoneAbbreviation
        ianaTimezone
        weightUnit
        billingAddress {
          firstName
          lastName
          company
          address1
          address2
          city
          country
          province
          zip
          phone
        }
        contactEmail
        customerEmail
        createdAt
        updatedAt
        taxesIncluded
        taxShipping
        countyTaxes
        checkoutApiSupported
        multiLocationEnabled
        setupRequired
        preLaunchEnabled
        orderNumberFormat
        customerAccounts
        transactionalSmsDisabled
        marketingSmsContentEnabledAtCheckout
      }
    }
  `;

  try {
    const response = await client.query({ data: query });
    const responseData = (response.body as unknown) as { data?: { shop?: Record<string, unknown> } };
    return responseData?.data?.shop ?? null;
  } catch (error) {
    console.error('Error fetching shop info:', error);
    throw error;
  }
}

export { shopify };
