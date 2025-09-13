"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ShoppingCart,
    Package,
    Users,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ArrowLeft,
    Webhook,
    Database,
    Zap,
    BarChart3,
    RefreshCw,
    Settings
} from "lucide-react";

type Event = {
    id: string;
    topic: string;
    payload: Record<string, unknown> & {
        minutesInactive?: number;
        token?: string;
        email?: string;
    };
    createdAt: string;
    tenant: {
        name: string;
        shopDomain: string;
    };
};

type EventStats = Record<string, number>;

export default function ShopifyIntegrationPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [stats, setStats] = useState<EventStats>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dataSource, setDataSource] = useState<'hybrid' | 'db' | 'shopify'>('hybrid');
    const [lastFetch, setLastFetch] = useState<string>('');
    const [sourceInfo, setSourceInfo] = useState<{
        source?: string;
        webhook_events?: number;
        shopify_events?: number;
    }>({});

    const fetchEvents = async () => {
        setLoading(true);
        setError(null);
        try {
            const url = `/api/webhooks/events?source=${dataSource}&limit=50`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setEvents(data.events || []);
            setStats(data.stats || {});
            setSourceInfo({
                source: data.source,
                webhook_events: data.webhook_events,
                shopify_events: data.shopify_events,
            });
            setLastFetch(new Date().toLocaleTimeString());
        } catch (e) {
            setError(`Failed to load events: ${String(e)}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
        // Refresh every 30 seconds
        const interval = setInterval(fetchEvents, 30000);
        return () => clearInterval(interval);
    }, [dataSource]); // eslint-disable-line react-hooks/exhaustive-deps

    const getEventIcon = (topic: string) => {
        if (topic.includes('checkout')) return <ShoppingCart className="w-5 h-5" />;
        if (topic.includes('cart')) return <ShoppingCart className="w-5 h-5" />;
        if (topic.includes('order')) return <Package className="w-5 h-5" />;
        if (topic.includes('customer')) return <Users className="w-5 h-5" />;
        if (topic.includes('product')) return <Package className="w-5 h-5" />;
        return <Webhook className="w-5 h-5" />;
    };

    const getEventBadgeColor = (topic: string) => {
        if (topic.includes('abandoned')) return 'bg-red-100 text-red-800 border-red-200';
        if (topic.includes('checkout')) return 'bg-orange-100 text-orange-800 border-orange-200';
        if (topic.includes('cart')) return 'bg-purple-100 text-purple-800 border-purple-200';
        if (topic.includes('order')) return 'bg-green-100 text-green-800 border-green-200';
        if (topic.includes('customer')) return 'bg-blue-100 text-blue-800 border-blue-200';
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Filter events by type
    const abandonmentEvents = events.filter(e => e.topic.includes('abandoned'));
    const checkoutEvents = events.filter(e => e.topic.includes('checkout') && !e.topic.includes('abandoned'));

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Home
                            </Link>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link href="/login">
                                <Button variant="outline" className="border-gray-300 hover:bg-gray-50">
                                    Login
                                </Button>
                            </Link>
                            <Link href="/dashboard">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <BarChart3 className="w-4 h-4 mr-2" />
                                    View Dashboard
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Shopify Integration Features
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Complete Shopify data ingestion with real-time webhooks, cart abandonment tracking,
                        and comprehensive analytics. All features are live and working!
                    </p>
                </motion.div>

                {/* Feature Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="border-2 border-green-200 bg-green-50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                    <Badge className="bg-green-100 text-green-800">Live</Badge>
                                </div>
                                <CardTitle className="text-lg text-green-900">Products & Orders</CardTitle>
                                <CardDescription className="text-green-700">
                                    Real-time sync of products, customers, and orders
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 border-blue-200 bg-blue-50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Webhook className="w-8 h-8 text-blue-600" />
                                    <Badge className="bg-blue-100 text-blue-800">Live</Badge>
                                </div>
                                <CardTitle className="text-lg text-blue-900">Webhook System</CardTitle>
                                <CardDescription className="text-blue-700">
                                    Real-time event processing with verification
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-2 border-orange-200 bg-orange-50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <ShoppingCart className="w-8 h-8 text-orange-600" />
                                    <Badge className="bg-orange-100 text-orange-800">New</Badge>
                                </div>
                                <CardTitle className="text-lg text-orange-900">Cart Tracking</CardTitle>
                                <CardDescription className="text-orange-700">
                                    Monitor cart creation and updates
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card className="border-2 border-red-200 bg-red-50">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                    <Badge className="bg-red-100 text-red-800">New</Badge>
                                </div>
                                <CardTitle className="text-lg text-red-900">Abandonment</CardTitle>
                                <CardDescription className="text-red-700">
                                    Automated detection of abandoned checkouts
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content Tabs */}
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="events">Live Events</TabsTrigger>
                        <TabsTrigger value="abandonment">Abandonment</TabsTrigger>
                        <TabsTrigger value="technical">Technical</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <TrendingUp className="w-5 h-5 mr-2" />
                                        Event Statistics
                                    </CardTitle>
                                    <CardDescription>
                                        Real-time webhook events processed by the system
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(stats).map(([topic, count]) => (
                                            <div key={topic} className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="flex justify-center mb-2">
                                                    {getEventIcon(topic)}
                                                </div>
                                                <div className="text-2xl font-bold text-gray-900">{count}</div>
                                                <div className="text-sm text-gray-600 capitalize">
                                                    {topic.replace(/[/_]/g, ' ')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Database className="w-5 h-5 mr-2" />
                                        Integration Status
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Products Sync</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Customer Sync</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Order Sync</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Webhooks</span>
                                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Cart Tracking</span>
                                        <Badge className="bg-orange-100 text-orange-800">New</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Abandonment</span>
                                        <Badge className="bg-red-100 text-red-800">New</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="events" className="space-y-6">
                        {/* Data Source Controls */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Settings className="w-5 h-5 mr-2" />
                                        Event Data Source
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            onClick={fetchEvents}
                                            variant="outline"
                                            size="sm"
                                            disabled={loading}
                                        >
                                            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                            Refresh
                                        </Button>
                                        <select
                                            value={dataSource}
                                            onChange={(e) => setDataSource(e.target.value as 'hybrid' | 'db' | 'shopify')}
                                            className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="hybrid">🔄 Hybrid</option>
                                            <option value="db">🗄️ Webhooks</option>
                                            <option value="shopify">🌐 Shopify API</option>
                                        </select>
                                    </div>
                                </CardTitle>
                                <CardDescription>
                                    {dataSource === 'hybrid' && 'Combines real-time webhooks with Shopify API polling for complete coverage'}
                                    {dataSource === 'db' && 'Shows events received via real-time webhooks only'}
                                    {dataSource === 'shopify' && 'Fetches events directly from Shopify Events API (polling)'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${sourceInfo.source ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <span className="text-sm">Source: {sourceInfo.source || 'loading...'}</span>
                                    </div>
                                    {sourceInfo.webhook_events !== undefined && (
                                        <div className="flex items-center space-x-2">
                                            <Database className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm">Webhooks: {sourceInfo.webhook_events}</span>
                                        </div>
                                    )}
                                    {sourceInfo.shopify_events !== undefined && (
                                        <div className="flex items-center space-x-2">
                                            <Webhook className="w-4 h-4 text-emerald-600" />
                                            <span className="text-sm">Shopify API: {sourceInfo.shopify_events}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm">Last: {lastFetch || 'never'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            </div>
                        ) : error ? (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                        <p className="text-red-600 mb-2">{error}</p>
                                        <p className="text-sm text-gray-500">
                                            Try switching to a different data source or check your configuration
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Zap className="w-5 h-5 mr-2" />
                                        Events ({dataSource.toUpperCase()})
                                    </CardTitle>
                                    <CardDescription>
                                        Showing {events.length} events from {sourceInfo.source || dataSource} source
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3 max-h-96 overflow-y-auto">
                                        {events.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No events yet. Configure Shopify webhooks to see live data.
                                            </div>
                                        ) : (
                                            events.map((event) => (
                                                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        {getEventIcon(event.topic)}
                                                        <div>
                                                            <div className="font-medium text-gray-900">{event.topic}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {event.tenant.shopDomain} • {new Date(event.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Badge className={getEventBadgeColor(event.topic)}>
                                                        {event.topic.split('/')[1]}
                                                    </Badge>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="abandonment" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-red-900">
                                        <AlertTriangle className="w-5 h-5 mr-2" />
                                        Abandoned Checkouts
                                    </CardTitle>
                                    <CardDescription>
                                        Automatically detected abandoned shopping sessions
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {abandonmentEvents.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No abandoned checkouts detected yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {abandonmentEvents.slice(0, 5).map((event) => (
                                                <div key={event.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-red-900">
                                                                Checkout Abandoned
                                                            </div>
                                                            <div className="text-sm text-red-700">
                                                                {new Date(event.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-red-100 text-red-800">
                                                            {event.payload.minutesInactive || 0}m inactive
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-orange-900">
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Checkout Activity
                                    </CardTitle>
                                    <CardDescription>
                                        Recent checkout creation and updates
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {checkoutEvents.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No checkout events yet.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {checkoutEvents.slice(0, 5).map((event) => (
                                                <div key={event.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-orange-900 capitalize">
                                                                {event.topic.replace('/', ' ')}
                                                            </div>
                                                            <div className="text-sm text-orange-700">
                                                                {new Date(event.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <Badge className="bg-orange-100 text-orange-800">
                                                            Live
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>How Abandonment Detection Works</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                                        <h3 className="font-medium text-blue-900">Time-Based Detection</h3>
                                        <p className="text-sm text-blue-700">
                                            Tracks checkout inactivity over configurable thresholds
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <Database className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                                        <h3 className="font-medium text-purple-900">Event Correlation</h3>
                                        <p className="text-sm text-purple-700">
                                            Correlates cart/checkout events with completed orders
                                        </p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                        <h3 className="font-medium text-green-900">Automated Processing</h3>
                                        <p className="text-sm text-green-700">
                                            Runs periodically via cron to mark abandoned sessions
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="technical" className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>API Endpoints</CardTitle>
                                    <CardDescription>Available integration endpoints</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                        <span className="text-green-600">GET</span> /api/shopify/products
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                        <span className="text-blue-600">POST</span> /api/shopify/sync
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                        <span className="text-blue-600">POST</span> /api/shopify/webhooks
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                        <span className="text-blue-600">POST</span> /api/shopify/abandonment/sweep
                                    </div>
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded font-mono text-sm">
                                        <span className="text-green-600 font-semibold">GET</span> /api/webhooks/events
                                        <div className="text-xs text-emerald-600 mt-1">↳ Hybrid API (New)</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Usage Examples</CardTitle>
                                    <CardDescription>Different ways to fetch events</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Hybrid Mode (Default)</div>
                                        <div className="p-2 bg-blue-50 rounded font-mono text-xs">
                                            GET /api/webhooks/events?source=hybrid
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Webhooks Only</div>
                                        <div className="p-2 bg-green-50 rounded font-mono text-xs">
                                            GET /api/webhooks/events?source=db
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">Shopify API Only</div>
                                        <div className="p-2 bg-purple-50 rounded font-mono text-xs">
                                            GET /api/webhooks/events?source=shopify
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-700 mb-1">With Filters</div>
                                        <div className="p-2 bg-orange-50 rounded font-mono text-xs">
                                            GET /api/webhooks/events?topic=orders/create&limit=20
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Response Format</CardTitle>
                                <CardDescription>Example response from the hybrid API</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-4 bg-gray-900 rounded-lg text-green-400 font-mono text-sm overflow-x-auto">
                                    <pre>{`{
  "events": [...],
  "stats": {
    "orders/create": 5,
    "products/update": 3,
    "checkouts/abandoned": 2
  },
  "total": 10,
  "source": "hybrid",
  "webhook_events": 6,
  "shopify_events": 4,
  "timestamp": "2025-01-27T..."
}`}</pre>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            <Card>
                                <CardHeader>
                                    <CardTitle>Supported Webhooks</CardTitle>
                                    <CardDescription>Shopify webhook topics handled</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {[
                                        'orders/create', 'orders/updated', 'orders/paid',
                                        'products/create', 'products/update',
                                        'customers/create', 'customers/update',
                                        'checkouts/create', 'checkouts/update',
                                        'carts/create', 'carts/update'
                                    ].map(topic => (
                                        <div key={topic} className="p-2 bg-gray-50 rounded text-sm font-mono">
                                            {topic}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Configuration</CardTitle>
                                <CardDescription>Environment variables and setup</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Required Environment Variables:</h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                                SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                                CRON_ENABLED=true
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                                CRON_SECRET=your_cron_secret
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Optional Configuration:</h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                                ABANDON_THRESHOLD_MINUTES=60
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded font-mono text-sm">
                                                ABANDON_WINDOW_HOURS=48
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
