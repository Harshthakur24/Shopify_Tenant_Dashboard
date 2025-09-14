'use client'
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Users,
    Mail,
    Phone,
    MapPin,
    Calendar,
    DollarSign,
    ShoppingBag,
    Loader2,
    Search,
    Eye
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

type ShopifyCustomer = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    verified_email: boolean;
    accepts_marketing: boolean;
    created_at: string;
    updated_at: string;
    orders_count: number;
    state: string;
    total_spent: string;
    note?: string;
    tags: string;
    default_address?: {
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

export default function CustomersList() {
    const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState<ShopifyCustomer | null>(null);
    const [page, setPage] = useState(1);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [tenantInfo, setTenantInfo] = useState<{ name: string, shopDomain: string } | null>(null);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/shopify/customers?page=${page}&limit=20`);
                const data = await response.json();

                if (data.success) {
                    setCustomers(data.data || []);
                    setTotalCustomers(data.pagination?.total || 0);
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
                        setError(data.error || 'Failed to fetch customers');
                    }
                }
            } catch (err) {
                setError('Failed to fetch customers');
                console.error('Error fetching customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, [page]);

    const filteredCustomers = customers.filter(customer =>
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        customer.phone?.includes(search)
    );

    const totalSpent = customers.reduce((sum, customer) => sum + parseFloat(customer.total_spent || '0'), 0);
    const totalOrders = customers.reduce((sum, customer) => sum + customer.orders_count, 0);
    const verifiedCustomers = customers.filter(customer => customer.verified_email).length;

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
                                    <p className="text-blue-100 text-sm font-medium">Total Customers</p>
                                    <p className="text-2xl font-bold">
                                        <CountUp end={totalCustomers} duration={2} />
                                    </p>
                                </div>
                                <Users className="h-8 w-8 text-blue-200" />
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
                                    <p className="text-green-100 text-sm font-medium">Total Spent</p>
                                    <p className="text-2xl font-bold">
                                        ₹<CountUp end={Math.round(totalSpent)} duration={2} separator="," />
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
                                    <p className="text-purple-100 text-sm font-medium">Total Orders</p>
                                    <p className="text-2xl font-bold">
                                        <CountUp end={totalOrders} duration={2} />
                                    </p>
                                </div>
                                <ShoppingBag className="h-8 w-8 text-purple-200" />
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
                                    <p className="text-orange-100 text-sm font-medium">Verified</p>
                                    <p className="text-2xl font-bold">
                                        <CountUp end={verifiedCustomers} duration={2} />
                                    </p>
                                </div>
                                <Mail className="h-8 w-8 text-orange-200" />
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
                                <Users className="h-5 w-5" />
                                Customers
                                {tenantInfo && (
                                    <Badge variant="outline" className="ml-2">
                                        {tenantInfo.name}
                                    </Badge>
                                )}
                            </CardTitle>
                            <CardDescription>
                                Manage and view your customer base
                                {tenantInfo && ` • Connected to ${tenantInfo.shopDomain}`}
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search customers..."
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Customers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCustomers.map((customer) => (
                            <motion.div
                                key={customer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group"
                            >
                                <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                    onClick={() => setSelectedCustomer(customer)}>
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-12 w-12">
                                                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                                        {customer.first_name?.[0]}{customer.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {customer.first_name} {customer.last_name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">{customer.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                {customer.verified_email && (
                                                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                                                )}
                                                {customer.accepts_marketing && (
                                                    <Badge variant="outline" className="text-xs">Marketing</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {customer.phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone className="h-4 w-4" />
                                                    <span>{customer.phone}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Calendar className="h-4 w-4" />
                                                <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <ShoppingBag className="h-4 w-4" />
                                                    <span>{customer.orders_count} orders</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                                    <DollarSign className="h-4 w-4" />
                                                    <span>₹{parseFloat(customer.total_spent || '0').toLocaleString()}</span>
                                                </div>
                                            </div>

                                            {customer.default_address && (
                                                <div className="flex items-start gap-2 text-gray-600 pt-2 border-t">
                                                    <MapPin className="h-4 w-4 mt-0.5" />
                                                    <div className="text-xs">
                                                        <p>{customer.default_address.city}, {customer.default_address.province}</p>
                                                        <p>{customer.default_address.country}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-3 pt-3 border-t">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full group-hover:bg-blue-50 group-hover:border-blue-200"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCustomer(customer);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {filteredCustomers.length === 0 && (
                        <div className="text-center py-8">
                            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
                            <p className="text-gray-500">Try adjusting your search criteria</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalCustomers > 20 && (
                        <div className="flex items-center justify-between mt-6 pt-4 border-t">
                            <p className="text-sm text-gray-500">
                                Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, totalCustomers)} of {totalCustomers} customers
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
                                    disabled={page * 20 >= totalCustomers}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Customer Detail Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedCustomer(null)}
                                >
                                    ×
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* Customer Info */}
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-semibold">
                                            {selectedCustomer.first_name?.[0]}{selectedCustomer.last_name?.[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            {selectedCustomer.first_name} {selectedCustomer.last_name}
                                        </h3>
                                        <p className="text-gray-600">{selectedCustomer.email}</p>
                                        <div className="flex gap-2 mt-2">
                                            {selectedCustomer.verified_email && (
                                                <Badge variant="secondary">Verified Email</Badge>
                                            )}
                                            {selectedCustomer.accepts_marketing && (
                                                <Badge variant="outline">Accepts Marketing</Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">{selectedCustomer.orders_count}</p>
                                        <p className="text-sm text-gray-600">Orders</p>
                                    </div>
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            ₹{parseFloat(selectedCustomer.total_spent || '0').toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-600">Total Spent</p>
                                    </div>
                                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {selectedCustomer.orders_count > 0
                                                ? Math.round(parseFloat(selectedCustomer.total_spent || '0') / selectedCustomer.orders_count)
                                                : 0
                                            }
                                        </p>
                                        <p className="text-sm text-gray-600">Avg Order</p>
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <span>{selectedCustomer.email}</span>
                                        </div>
                                        {selectedCustomer.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <span>{selectedCustomer.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-400" />
                                            <span>Joined {new Date(selectedCustomer.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                {selectedCustomer.default_address && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Default Address</h4>
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <p className="font-medium">
                                                {selectedCustomer.default_address.first_name} {selectedCustomer.default_address.last_name}
                                            </p>
                                            {selectedCustomer.default_address.company && (
                                                <p>{selectedCustomer.default_address.company}</p>
                                            )}
                                            <p>{selectedCustomer.default_address.address1}</p>
                                            {selectedCustomer.default_address.address2 && (
                                                <p>{selectedCustomer.default_address.address2}</p>
                                            )}
                                            <p>
                                                {selectedCustomer.default_address.city}, {selectedCustomer.default_address.province} {selectedCustomer.default_address.zip}
                                            </p>
                                            <p>{selectedCustomer.default_address.country}</p>
                                            {selectedCustomer.default_address.phone && (
                                                <p className="mt-2">{selectedCustomer.default_address.phone}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {selectedCustomer.tags && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCustomer.tags.split(',').map((tag, index) => (
                                                <Badge key={index} variant="outline">{tag.trim()}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Note */}
                                {selectedCustomer.note && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Note</h4>
                                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedCustomer.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
