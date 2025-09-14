# Xeno Assignment Project by Harsh Thakur - Shopify Analytics Dashboard

A comprehensive Shopify analytics and integration platform built with Next.js, featuring real-time data synchronization, multi-tenant support, and advanced analytics visualization.

## 🚀 Features

- **Multi-tenant Shopify Integration**: Support for multiple Shopify stores with secure tenant isolation
- **Real-time Data Sync**: Automated synchronization of products, orders, and customers via API and webhooks
- **Interactive Dashboard**: Dual-state navigation with products/customers/orders switching and overview analytics
- **Analytics Dashboard**: Rich data visualization with charts and insights
- **Authentication System**: Secure user authentication with JWT and password reset functionality
- **Email Integration**: Automated email notifications using Nodemailer
- **Caching Layer**: Redis-based caching for improved performance
- **Background Processing**: Automated cron jobs for data synchronization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js + React)                  │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Auth Pages  │  Integration  │  Charts & Analytics │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js API Routes)             │
├─────────────────────────────────────────────────────────────────┤
│ Auth APIs │ Shopify APIs │ Webhook Handlers │ Analytics APIs     │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                ▼                ▼                ▼
    ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │   Database       │ │  Shopify API     │ │   Redis Cache    │
    │  (PostgreSQL)    │ │                  │ │                  │
    │                  │ │ - Products       │ │ - Session Data   │
    │ - Users/Tenants  │ │ - Orders         │ │ - API Cache      │
    │ - Products       │ │ - Customers      │ │ - Sync Status    │
    │ - Orders         │ │ - Webhooks       │ │                  │
    │ - Customers      │ │                  │ │                  │
    │ - Events/Logs    │ │                  │ │                  │
    └──────────────────┘ └──────────────────┘ └──────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────┐
                    │    Background Jobs       │
                    │                          │
                    │ - Periodic Sync (15min)  │
                    │ - Abandonment Sweeps     │
                    │ - Data Cleanup          │
                    └──────────────────────────┘
```

## 📋 Setup Instructions

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Redis instance (optional, for caching)
- Shopify Partner Account
- Gmail account (for email functionality)

### 1. Clone and Install

```bash
git clone <repository-url>
cd Xeno_Assignment_Project
pnpm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/xeno_db"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Shopify Configuration
SHOPIFY_API_KEY="your_shopify_api_key"
SHOPIFY_API_SECRET="your_shopify_api_secret"
SHOPIFY_APP_URL="https://yourdomain.com"
SHOPIFY_WEBHOOK_SECRET="your_webhook_secret"
SHOPIFY_SHOP_DOMAIN="your-store.myshopify.com"
SHOPIFY_ACCESS_TOKEN="your_access_token"
SHOPIFY_API_VERSION="2025-07"

# Email Configuration (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-gmail-app-password"

# Redis (Optional)
UPSTASH_REDIS_REST_URL="your_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_redis_token"

# Application URLs
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Background Jobs
CRON_ENABLED="true"
CRON_SECRET="your-cron-secret"
CRON_INTERVAL_SECONDS="900"
CRON_URL="http://localhost:3000"

# Cart Abandonment
ABANDON_THRESHOLD_MINUTES="60"
ABANDON_WINDOW_HOURS="48"

# Sync Configuration
SYNC_ALL_TENANT_PAUSE_MS="300"
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma:generate

# Push schema to database (for development)
pnpm db:push

# Or run migrations (for production)
pnpm db:migrate
```

### 4. Shopify App Configuration

1. Create a new Shopify app in your Partner Dashboard
2. Configure the following scopes:
   - `read_products`
   - `read_orders` 
   - `read_customers`
   - `read_analytics`
   - `read_inventory`
   - `read_reports`
   - `read_sales_channels`
   - `read_marketing_events`
   - `read_discounts`
   - `read_price_rules`

3. Set up webhooks for:
   - `orders/create`, `orders/updated`, `orders/paid`, `orders/cancelled`, `orders/fulfilled`
   - `products/create`, `products/update`
   - `customers/create`, `customers/update`
   - `inventory_levels/update`
   - `checkouts/create`, `checkouts/update`
   - `carts/create`, `carts/update`

### 5. Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Google Account Settings → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `GMAIL_APP_PASSWORD`

### 6. Run the Application

```bash
# Development
pnpm dev

# Production
pnpm build
pnpm start
```

The application will be available at `http://localhost:3000`

## 📊 Dashboard Usage

### Navigation Overview

The dashboard features a dual-state navigation system:

#### Top Navigation Buttons
- **Your Products** (Orange): Displays product grid and management interface
- **Your Customers** (Blue): Shows customer list and analytics
- **Your Orders** (Purple): Displays order management and tracking
- **Shopify Integration** (Green): Links to Shopify setup and configuration

#### Bottom Tab Navigation
- **Overview**: Analytics dashboard with charts and graphs (default)
- **Performance**: Performance metrics and KPIs
- **Vendors**: Vendor management and analytics

### Default View
- **Products Content**: Shows by default when page loads
- **Overview Analytics**: Charts and graphs display simultaneously
- **Independent Control**: Top buttons and bottom tabs work independently

### Data Refresh
- Products data refreshes automatically every 3.5 seconds after sync operations
- Real-time updates via webhooks for immediate data changes
- Manual refresh available through sync buttons

## 📚 API Endpoints

### Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration with tenant creation |
| POST | `/api/auth/login` | User authentication |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Shopify Integration APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shopify/products` | Fetch products with analytics |
| GET | `/api/shopify/customers` | Fetch customers data |
| GET | `/api/shopify/orders` | Fetch orders data |
| POST | `/api/shopify/sync` | Manual data synchronization |
| POST | `/api/shopify/sync-all` | Sync all tenants (cron job) |
| GET/POST | `/api/shopify/webhooks` | Webhook endpoint for Shopify events |
| GET | `/api/shopify/enhanced-analytics` | Advanced analytics data |
| POST | `/api/shopify/abandonment/sweep` | Cart abandonment processing |

### Event Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/webhooks/events` | Retrieve webhook events and statistics |

### Request/Response Examples

#### User Registration
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "tenantName": "My Store",
  "shopDomain": "my-store.myshopify.com",
  "accessToken": "shpat_xxxxx"
}
```

#### Get Products
```bash
GET /api/shopify/products?tenantId=optional
Authorization: Cookie: auth=jwt_token
```

#### Webhook Event
```bash
POST /api/shopify/webhooks
X-Shopify-Topic: orders/create
X-Shopify-Hmac-Sha256: hmac_signature
Content-Type: application/json

{
  "id": 12345,
  "total_price": "100.00",
  // ... Shopify order data
}
```

## 🗄️ Database Schema

### Core Models

#### Tenant
```sql
CREATE TABLE "Tenant" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shopDomain" TEXT UNIQUE NOT NULL,
    "apiKey" TEXT,
    "apiSecret" TEXT, 
    "accessToken" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

#### User
```sql
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
    "createdAt" TIMESTAMP DEFAULT NOW()
);
```

#### Product
```sql
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
    "shopId" TEXT NOT NULL, -- Shopify product ID
    "title" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("tenantId", "shopId")
);
```

#### Customer
```sql
CREATE TABLE "Customer" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
    "shopId" TEXT NOT NULL, -- Shopify customer ID
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "totalSpend" DECIMAL(12,2) DEFAULT 0,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("tenantId", "shopId")
);
```

#### Order
```sql
CREATE TABLE "Order" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
    "shopId" TEXT NOT NULL, -- Shopify order ID
    "customerId" TEXT REFERENCES "Customer"("id"),
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL,
    "processedAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    UNIQUE("tenantId", "shopId")
);
```

#### Event (Webhook Events)
```sql
CREATE TABLE "Event" (
    "id" TEXT PRIMARY KEY,
    "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
    "topic" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT NOW()
);
```

### Relationships

- **Tenant** → **User** (One-to-Many): Each tenant can have multiple users
- **Tenant** → **Product/Customer/Order** (One-to-Many): Multi-tenant data isolation
- **Customer** → **Order** (One-to-Many): Customer order history
- **User** → **PasswordResetToken** (One-to-Many): Password reset functionality

## 🎯 Key Features Detail

### Interactive Dashboard
- **Dual-State Navigation**: Independent control of content sections and analytics tabs
- **Product Management**: View and manage Shopify products with real-time data
- **Customer Analytics**: Customer insights and relationship management
- **Order Tracking**: Order management and fulfillment tracking
- **Overview Analytics**: Charts, graphs, and performance metrics
- **Responsive Design**: Optimized for desktop and mobile viewing

### Multi-Tenant Architecture
- Complete data isolation between tenants
- Shared application infrastructure
- Tenant-specific Shopify configurations

### Real-time Synchronization
- **API Sync**: Manual and automated data fetching
- **Webhooks**: Real-time event processing
- **Background Jobs**: Periodic data updates (15-minute intervals)
- **Data Refresh**: Automatic data updates every 3.5 seconds after sync operations

### Analytics Capabilities
- Revenue trends and forecasting
- Customer segmentation analysis
- Product performance metrics
- Geographic revenue distribution
- Inventory alerts and management

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- HMAC webhook verification
- Protected route middleware
- Secure cookie management

## ⚠️ Known Limitations and Assumptions

### Limitations

1. **Shopify API Rate Limits**
   - Subject to Shopify's REST API rate limits (40 requests/second)
   - Bulk operations may experience throttling
   - Large data sets require pagination

2. **Real-time Sync Delays**
   - Webhook delivery is not guaranteed to be immediate
   - Network issues can cause sync delays
   - Failed webhooks require manual retry

3. **Data Storage Constraints**
   - Historical data retention depends on database capacity
   - No automatic data archiving implemented
   - Large tenants may require database optimization

4. **Email Delivery**
   - Dependent on Gmail API availability
   - Subject to Gmail sending limits
   - No email delivery confirmation tracking

5. **Background Jobs**
   - Single-instance cron jobs (no distributed processing)
   - Long-running syncs may timeout
   - No job queue persistence during restarts

### Assumptions

1. **Shopify Setup**
   - Assumes Shopify stores have consistent data structures
   - Requires manual webhook configuration
   - Expects standard Shopify API responses

2. **Database Performance**
   - Assumes PostgreSQL with adequate performance characteristics
   - No database sharding or read replicas configured
   - Relies on standard indexing for query optimization

3. **Network Reliability**
   - Assumes stable network connectivity to Shopify
   - No offline mode or data queuing for network failures
   - Expects consistent webhook delivery

4. **User Behavior**
   - Single user per tenant in current implementation
   - Assumes users have valid Shopify access tokens
   - No user permission/role management system

5. **Data Consistency**
   - Assumes Shopify data integrity
   - No conflict resolution for concurrent updates
   - Relies on Shopify's "updated_at" timestamps for synchronization

### Recommended Improvements

1. **Scalability Enhancements**
   - Implement database read replicas
   - Add distributed job processing (Bull/Agenda)
   - Implement horizontal scaling strategies

2. **Reliability Improvements**
   - Add webhook retry mechanisms
   - Implement data backup strategies
   - Add comprehensive error monitoring

3. **Feature Additions**
   - Role-based access control
   - Advanced analytics and reporting
   - Email template customization
   - Multi-language support

4. **Performance Optimizations**
   - Implement advanced caching strategies
   - Add database query optimization
   - Implement lazy loading for large datasets

## 🔧 Development

### Testing
```bash
# Run linting
pnpm lint

# Type checking
pnpm type-check
```

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate new migration
npx prisma migrate dev --name feature_name
```

### Monitoring
- Check `/api/webhooks/events` for webhook activity
- Monitor database sync logs via `SyncLog` table
- Use browser developer tools for frontend debugging

## 📄 License

This project is private and proprietary to Xeno Assignment.

## 🤝 Contributing

This is an assignment project. Please refer to the project requirements and guidelines for any modifications or improvements.