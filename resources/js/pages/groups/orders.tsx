import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface OrderItem {
    id: number;
    name: string;
    price: string;
    user_nickname: string | null;
}

interface Order {
    id: number;
    total_amount: string;
    created_at: string;
    items_count: number;
    created_by?: {
        nickname: string;
    };
    items: OrderItem[];
}

interface Group {
    id: number;
    name: string;
}

interface OrdersProps {
    group: Group;
    orders: Order[];
}

export default function GroupOrders({ group, orders }: OrdersProps) {
    return (
        <AppLayout backAction={{ type: 'link', href: route('groups.show', group.id) }}>
            <Head title={`Orders - ${group.name}`} />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>

                {orders.length === 0 ? (
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardContent className="py-16 text-center">
                            <p className="mb-4 text-muted-foreground">No orders yet</p>
                            <Link href={route('orders.create', group.id)}>
                                <Button variant="gradient">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create First Order
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="gap-4 border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="text-sm text-muted-foreground">
                                                <p>By {order.created_by?.nickname || 'Unknown'}</p>
                                                <p>{new Date(order.created_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl leading-none font-bold">{order.total_amount}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    {order.items.length > 0 && (
                                        <div className="">
                                            <h3 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Items</h3>
                                            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {order.items.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between py-2">
                                                        <span className="font-medium">
                                                            {item.user_nickname || 'Unknown'} → {item.name}
                                                        </span>
                                                        <span className="font-semibold">{item.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
