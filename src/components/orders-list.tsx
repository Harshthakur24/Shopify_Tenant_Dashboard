'use client'
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShoppingBag,
    DollarSign,
    Calendar,
    User,
    MapPin,
    Package,
    Loader2,
    Search,
    Eye,
    Truck,
    CreditCard,
    CheckCircle,
    XCircle,
    Clock
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

type ShopifyOrder = {
    id: number;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
    processed_at: string;
    cancelled_at?: string;
    cancel_reason?: string;
    financial_status: string;
    fulfillment_status: string;
    total_price: string;
    subtotal_price: string;
    total_tax: string;
    total_shipping_price: string;
    total_discounts: string;
    currency: string;
    order_number: number;
    confirmed: boolean;
    tags: string;
    note?: string;
    phone?: string;
    referring_site?: string;
    source_name?: string;
    customer?: {
        id: number;
        email: string;
        first_name: string;
        last_name: string;
        phone?: string;
    };
    line_items: Array<{
        id: number;
        title: string;
        quantity: number;
        price: string;
        vendor?: string;
        variant_title?: string;
        product_id: number;
        variant_id: number;
    }>;
    shipping_address?: {
        first_name: string;
        last_name: string;
        company?: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
        country: string;
        zip: string;
        phone?: string;
    };
    billing_address?: {
        first_name: string;
        last_name: string;
        company?: string;
        address1: string;
        address2?: string;
        city: string;
        province: string;
        country: string;
        zip: string;
        phone?: string;
    };
};

export default function OrdersList() {
    const [orders, setOrders] = useState<ShopifyOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<ShopifyOrder | null>(null);
    const [page, setPage] = useState(1);
    const [totalOrders, setTotalOrders] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [financialStatusFilter, setFinancialStatusFilter] = useState("all");
    const [tenantInfo, setTenantInfo] = useState<{ name: string, shopDomain: string } | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                let url = `/api/shopify/orders?page=${page}&limit=20`;
                if (statusFilter !== "all") url += `&status=${statusFilter}`;
                if (financialStatusFilter !== "all") url += `&financial_status=${financialStatusFilter}`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.success) {
                    setOrders(data.data || []);
                    setTotalOrders(data.pagination?.total || 0);
                    setTenantInfo(data.tenant || null);
                } else {
                    if (response.status === 401) {
                        setError('Authentication required. Please log in again.');
                        // Redirect to login after a short delay
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 2000);
                    } else if (response.status === 400) {
                        setError('Shopify credentials not configured. Please contact your administrator.');
                    } else {
                        setError(data.error || 'Failed to fetch orders');
                    }
                }
            } catch (err) {
                setError('Failed to fetch orders');
                console.error('Error fetching orders:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [page, statusFilter, financialStatusFilter]);

    const filteredOrders = orders.filter(order =>
        order.name.toLowerCase().includes(search.toLowerCase()) ||
        order.email.toLowerCase().includes(search.toLowerCase()) ||
        order.customer?.first_name?.toLowerCase().includes(search.toLowerCase()) ||
        order.customer?.last_name?.toLowerCase().includes(search.toLowerCase())
    );

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price || '0'), 0);
    const totalTax = orders.reduce((sum, order) => sum + parseFloat(order.total_tax || '0'), 0);
    const totalShipping = orders.reduce((sum, order) => sum + parseFloat(order.total_shipping_price || '0'), 0);
    const totalDiscounts = orders.reduce((sum, order) => sum + parseFloat(order.total_discounts || '0'), 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'authorized': return 'bg-blue-100 text-blue-800';
            case 'partially_paid': return 'bg-orange-100 text-orange-800';
            case 'refunded': return 'bg-red-100 text-red-800';
            case 'voided': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getFulfillmentColor = (status: string) => {
        switch (status) {
            case 'fulfilled': return 'bg-green-100 text-green-800';
            case 'partial': return 'bg-yellow-100 text-yellow-800';
            case 'unfulfilled': return 'bg-red-100 text-red-800';
            case 'restocked': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="h-4 w-4" />;
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'refunded': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="text-center text-red-600">
                    <p>{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Orders</p>
                                    <p className="text-2xl font-bold">
                                        <CountUp end={totalOrders} duration={2} />
                                    </p>
                                </div>
                                <ShoppingBag className="h-8 w-8 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                                    <p className="text-2xl font-bold">
                                        ₹<CountUp end={Math.round(totalRevenue)} duration={2} separator="," />
                                    </p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Total Tax</p>
                                    <p className="text-2xl font-bold">
                                        ₹<CountUp end={Math.round(totalTax)} duration={2} separator="," />
                                    </p>
                                </div>
                                <CreditCard className="h-8 w-8 text-purple-200" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Total Shipping</p>
                                    <p className="text-2xl font-bold">
                                        ₹<CountUp end={Math.round(totalShipping)} duration={2} separator="," />
                                    </p>
                                </div>
                                <Truck className="h-8 w-8 text-orange-200" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Search and Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Orders
                                {tenantInfo && (
                                    <Badge variant="outline" className="ml-2">
                                        {tenantInfo.name}
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Manage and track your orders
                                {tenantInfo && ` • Connected to ${tenantInfo.shopDomain}`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="unfulfilled">Unfulfilled</option>
                                <option value="fulfilled">Fulfilled</option>
                                <option value="partial">Partial</option>
                                <option value="restocked">Restocked</option>
                            </select>
                            <select
                                value={financialStatusFilter}
                                onChange={(e) => setFinancialStatusFilter(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Financial Status</option>
                                <option value="pending">Pending</option>
                                <option value="authorized">Authorized</option>
                                <option value="partially_paid">Partially Paid</option>
                                <option value="paid">Paid</option>
                                <option value="partially_refunded">Partially Refunded</option>
                                <option value="refunded">Refunded</option>
                                <option value="voided">Voided</option>
                            </select>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search orders..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Orders List */}
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => setSelectedOrder(order)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-gray-900 text-lg">
                                                        {order.name}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        #{order.order_number}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1">
                                                        <User className="h-4 w-4" />
                                                        <span>
                                                            {order.customer ?
                                                                `${order.customer.first_name} ${order.customer.last_name}` :
                                                                order.email
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Package className="h-4 w-4" />
                                                        <span>{order.line_items.length} items</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-gray-900 mb-2">
                                                    ₹{parseFloat(order.total_price).toLocaleString()}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Badge className={`${getStatusColor(order.financial_status)} flex items-center gap-1`}>
                                                        {getStatusIcon(order.financial_status)}
                                                        {order.financial_status.replace('_', ' ')}
                                                    </Badge>
                                                    <Badge className={`${getFulfillmentColor(order.fulfillment_status)} flex items-center gap-1`}>
                                                        <Truck className="h-3 w-3" />
                                                        {order.fulfillment_status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Order Items Preview */}
                                        <div className="border-t pt-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="text-sm text-gray-600 mb-1">Items:</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.line_items.slice(0, 3).map((item, index) => (
                                                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {item.title} (×{item.quantity})
                                                            </span>
                                                        ))}
                                                        {order.line_items.length > 3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +{order.line_items.length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="group-hover:bg-blue-50 group-hover:border-blue-200"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedOrder(order);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalOrders > 20 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalOrders)} of {totalOrders} orders
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * 20 >= totalOrders}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedOrder(null)}
                                >
                                    ×
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Order Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {selectedOrder.name}
                                        </h3>
                                        <p className="text-gray-600">Order #{selectedOrder.order_number}</p>
                                        <p className="text-sm text-gray-500">
                                            Created {new Date(selectedOrder.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-900 mb-2">
                                            ₹{parseFloat(selectedOrder.total_price).toLocaleString()}
                                        </div>
                                        <div className="flex gap-2">
                                            <Badge className={`${getStatusColor(selectedOrder.financial_status)} flex items-center gap-1`}>
                                                {getStatusIcon(selectedOrder.financial_status)}
                                                {selectedOrder.financial_status.replace('_', ' ')}
                                            </Badge>
                                            <Badge className={`${getFulfillmentColor(selectedOrder.fulfillment_status)} flex items-center gap-1`}>
                                                <Truck className="h-3 w-3" />
                                                {selectedOrder.fulfillment_status}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Info */}
                                {selectedOrder.customer && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="font-medium">
                                                {selectedOrder.customer.first_name} {selectedOrder.customer.last_name}
                                            </p>
                                            <p className="text-gray-600">{selectedOrder.customer.email}</p>
                                            {selectedOrder.customer.phone && (
                                                <p className="text-gray-600">{selectedOrder.customer.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                    <div className="space-y-2">
                                        {selectedOrder.line_items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-medium">{item.title}</p>
                                                    {item.variant_title && (
                                                        <p className="text-sm text-gray-600">{item.variant_title}</p>
                                                    )}
                                                    {item.vendor && (
                                                        <p className="text-xs text-gray-500">Vendor: {item.vendor}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">×{item.quantity}</p>
                                                    <p className="text-gray-600">₹{parseFloat(item.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span>₹{parseFloat(selectedOrder.subtotal_price).toLocaleString()}</span>
                                        </div>
                                        {parseFloat(selectedOrder.total_tax) > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tax:</span>
                                                <span>₹{parseFloat(selectedOrder.total_tax).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {parseFloat(selectedOrder.total_shipping_price) > 0 && (
                                            <div className="flex justify-between">
                                                <span>Shipping:</span>
                                                <span>₹{parseFloat(selectedOrder.total_shipping_price).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {parseFloat(selectedOrder.total_discounts) > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discounts:</span>
                                                <span>-₹{parseFloat(selectedOrder.total_discounts).toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                                            <span>Total:</span>
                                            <span>₹{parseFloat(selectedOrder.total_price).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Shipping Address */}
                                {selectedOrder.shipping_address && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="font-medium">
                                                {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}
                                            </p>
                                            {selectedOrder.shipping_address.company && (
                                                <p>{selectedOrder.shipping_address.company}</p>
                                            )}
                                            <p>{selectedOrder.shipping_address.address1}</p>
                                            {selectedOrder.shipping_address.address2 && (
                                                <p>{selectedOrder.shipping_address.address2}</p>
                                            )}
                                            <p>
                                                {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.province} {selectedOrder.shipping_address.zip}
                                            </p>
                                            <p>{selectedOrder.shipping_address.country}</p>
                                            {selectedOrder.shipping_address.phone && (
                                                <p className="mt-2">{selectedOrder.shipping_address.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Billing Address */}
                                {selectedOrder.billing_address && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Billing Address</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="font-medium">
                                                {selectedOrder.billing_address.first_name} {selectedOrder.billing_address.last_name}
                                            </p>
                                            {selectedOrder.billing_address.company && (
                                                <p>{selectedOrder.billing_address.company}</p>
                                            )}
                                            <p>{selectedOrder.billing_address.address1}</p>
                                            {selectedOrder.billing_address.address2 && (
                                                <p>{selectedOrder.billing_address.address2}</p>
                                            )}
                                            <p>
                                                {selectedOrder.billing_address.city}, {selectedOrder.billing_address.province} {selectedOrder.billing_address.zip}
                                            </p>
                                            <p>{selectedOrder.billing_address.country}</p>
                                            {selectedOrder.billing_address.phone && (
                                                <p className="mt-2">{selectedOrder.billing_address.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Additional Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedOrder.source_name && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Source</h4>
                                            <p className="text-gray-600">{selectedOrder.source_name}</p>
                                        </div>
                                    )}
                                    {selectedOrder.referring_site && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Referring Site</h4>
                                            <p className="text-gray-600">{selectedOrder.referring_site}</p>
                                        </div>
                                    )}
                                    {selectedOrder.tags && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedOrder.tags.split(',').map((tag, index) => (
                                                    <Badge key={index} variant="outline">{tag.trim()}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {selectedOrder.note && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2">Note</h4>
                                            <p className="text-gray-600">{selectedOrder.note}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
