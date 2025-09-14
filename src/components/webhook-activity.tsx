"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WebhookEvent {
    id: string;
    topic: string;
    createdAt: string;
    tenant: {
        name: string;
        shopDomain: string;
    };
    payload: Record<string, unknown>;
}

interface WebhookStats {
    [topic: string]: number;
}

export function WebhookActivity() {
    const [events, setEvents] = useState<WebhookEvent[]>([]);
    const [stats, setStats] = useState<WebhookStats>({});
    const [loading, setLoading] = useState(true);

    const fetchWebhookEvents = async () => {
        try {
            const response = await fetch('/api/webhooks/events?limit=10');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data && typeof data === 'object') {
                setEvents(Array.isArray(data.events) ? data.events : []);
                setStats(data.stats && typeof data.stats === 'object' ? data.stats : {});
            } else {
                setEvents([]);
                setStats({});
            }
        } catch (error) {
            console.error('Error fetching webhook events:', error);
            setEvents([]);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWebhookEvents();

        // Refresh every 30 seconds
        const interval = setInterval(fetchWebhookEvents, 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTopic = (topic: string) => {
        return topic.split('/').map(part =>
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join(' ');
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const getTopicColor = (topic: string) => {
        const colors: Record<string, string> = {
            'orders/create': 'bg-green-100 text-green-800',
            'orders/paid': 'bg-blue-100 text-blue-800',
            'products/create': 'bg-purple-100 text-purple-800',
            'products/update': 'bg-orange-100 text-orange-800',
            'customers/create': 'bg-pink-100 text-pink-800',
        };
        return colors[topic] || 'bg-gray-100 text-gray-800';
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Webhook Activity</CardTitle>
                    <CardDescription>Loading recent webhook events...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-2">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Webhook Activity</CardTitle>
                <CardDescription>
                    Real-time Shopify webhook events ({events.length} recent events)
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {Object.entries(stats).map(([topic, count]) => (
                        <div key={topic} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{count}</div>
                            <div className="text-sm text-gray-600">{formatTopic(topic)}</div>
                        </div>
                    ))}
                </div>

                {/* Recent Events */}
                <div className="space-y-3">
                    {events.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No webhook events received yet
                        </div>
                    ) : (
                        events.map((event) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTopicColor(event.topic)}`}>
                                        {formatTopic(event.topic)}
                                    </span>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {event.tenant.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {event.tenant.shopDomain}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-gray-500">
                                        {formatTimestamp(event.createdAt)}
                                    </div>
                                    {event.payload && typeof event.payload === 'object' && 'id' in event.payload && (
                                        <div className="text-xs text-gray-400">
                                            ID: {String(event.payload.id).slice(0, 8)}...
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Refresh Info */}
                <div className="mt-4 text-center text-xs text-gray-500">
                    Auto-refreshes every 30 seconds
                </div>
            </CardContent>
        </Card>
    );
}
