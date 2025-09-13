import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Webhook payload interfaces
interface WebhookOrder {
  id: string;
  name: string;
  email: string;
  total_price: string;
  currency: string;
  customer?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  line_items?: Array<unknown>;
}

interface WebhookProduct {
  id: string;
  title: string;
  vendor: string;
  product_type: string;
  status: string;
  variants?: Array<unknown>;
  images?: Array<unknown>;
}

interface WebhookCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  accepts_marketing: boolean;
  created_at: string;
}

interface WebhookInventoryLevel {
  inventory_item_id: string;
  location_id: string;
  available: number;
  updated_at: string;
}

// Webhook verification
function verifyWebhook(rawBody: string, signature: string): boolean {
  const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('SHOPIFY_WEBHOOK_SECRET not configured');
    return false;
  }

  const computedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('base64');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(computedSignature)
  );
}

// Handle webhook events
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shop = request.headers.get('x-shopify-shop-domain');
    
    if (!signature || !topic || !shop) {
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    
    // Verify webhook authenticity
    if (!verifyWebhook(rawBody, signature)) {
      console.error('Webhook verification failed');
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 401 }
      );
    }

    const data = JSON.parse(rawBody);
    
    console.log(`Received webhook: ${topic} from ${shop}`);

    // Handle different webhook topics
    switch (topic) {
      case 'orders/create':
        await handleOrderCreated(data);
        break;
      
      case 'orders/updated':
        await handleOrderUpdated(data);
        break;
      
      case 'orders/paid':
        await handleOrderPaid(data);
        break;
      
      case 'orders/cancelled':
        await handleOrderCancelled(data);
        break;
      
      case 'orders/fulfilled':
        await handleOrderFulfilled(data);
        break;
      
      case 'products/create':
        await handleProductCreated(data);
        break;
      
      case 'products/update':
        await handleProductUpdated(data);
        break;
      
      case 'customers/create':
        await handleCustomerCreated(data);
        break;
      
      case 'customers/update':
        await handleCustomerUpdated(data);
        break;
      
      case 'inventory_levels/update':
        await handleInventoryUpdated(data);
        break;
      
      case 'app/uninstalled':
        await handleAppUninstalled(data, shop);
        break;
      
      default:
        console.log(`Unhandled webhook topic: ${topic}`);
    }

    return NextResponse.json({
      success: true,
      topic,
      shop,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Webhook handlers
async function handleOrderCreated(order: WebhookOrder) {
  console.log(`New order created: ${order.name} for $${order.total_price}`);
  
  // Here you could:
  // - Send notifications
  // - Update analytics cache
  // - Trigger email campaigns
  // - Update inventory forecasts
  // - Log to analytics database
  
  // Example: Log to console for now
  console.log('Order details:', {
    id: order.id,
    email: order.email,
    total: order.total_price,
    currency: order.currency,
    customer: order.customer ? {
      id: order.customer.id,
      email: order.customer.email,
      first_name: order.customer.first_name,
      last_name: order.customer.last_name
    } : null,
    line_items: order.line_items?.length || 0
  });
}

async function handleOrderUpdated(order: WebhookOrder) {
  console.log(`Order updated: ${order.name}`);
  // Handle order status changes, shipping updates, etc.
}

async function handleOrderPaid(order: WebhookOrder) {
  console.log(`Order paid: ${order.name} for $${order.total_price}`);
  // Handle payment confirmation, trigger fulfillment, etc.
}

async function handleOrderCancelled(order: WebhookOrder) {
  console.log(`Order cancelled: ${order.name}`);
  // Handle inventory restoration, refund processing, etc.
}

async function handleOrderFulfilled(order: WebhookOrder) {
  console.log(`Order fulfilled: ${order.name}`);
  // Handle shipping notifications, tracking updates, etc.
}

async function handleProductCreated(product: WebhookProduct) {
  console.log(`New product created: ${product.title}`);
  
  console.log('Product details:', {
    id: product.id,
    title: product.title,
    vendor: product.vendor,
    product_type: product.product_type,
    status: product.status,
    variants: product.variants?.length || 0,
    images: product.images?.length || 0
  });
}

async function handleProductUpdated(product: WebhookProduct) {
  console.log(`Product updated: ${product.title}`);
  // Handle product changes, price updates, inventory changes, etc.
}

async function handleCustomerCreated(customer: WebhookCustomer) {
  console.log(`New customer: ${customer.email}`);
  
  console.log('Customer details:', {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name,
    last_name: customer.last_name,
    accepts_marketing: customer.accepts_marketing,
    created_at: customer.created_at
  });
}

async function handleCustomerUpdated(customer: WebhookCustomer) {
  console.log(`Customer updated: ${customer.email}`);
  // Handle customer profile changes, marketing preferences, etc.
}

async function handleInventoryUpdated(inventoryLevel: WebhookInventoryLevel) {
  console.log(`Inventory updated for item: ${inventoryLevel.inventory_item_id}`);
  
  console.log('Inventory details:', {
    inventory_item_id: inventoryLevel.inventory_item_id,
    location_id: inventoryLevel.location_id,
    available: inventoryLevel.available,
    updated_at: inventoryLevel.updated_at
  });
}

async function handleAppUninstalled(_data: Record<string, unknown>, shop: string) {
  console.log(`App uninstalled from shop: ${shop}`);
  // Handle cleanup, data removal, etc.
}

// GET endpoint for webhook verification during setup
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get('challenge');
  
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }
  
  return NextResponse.json({
    message: 'Shopify Webhook Endpoint',
    status: 'active',
    supportedTopics: [
      'orders/create',
      'orders/updated', 
      'orders/paid',
      'orders/cancelled',
      'orders/fulfilled',
      'products/create',
      'products/update',
      'customers/create',
      'customers/update',
      'inventory_levels/update',
      'app/uninstalled'
    ],
    timestamp: new Date().toISOString()
  });
}
