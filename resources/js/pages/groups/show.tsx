import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface GroupUser {
    id: number;
    name: string;
    email: string;
    nickname: string;
    avatar?: string;
    joined_at: string;
}

interface Order {
    id: number;
    title: string;
    total_amount: number;
    status: 'pending' | 'active' | 'completed';
    created_at: string;
    items_count: number;
}

interface GroupDetails {
    id: number;
    name: string;
    currency: string;
    public_id: string;
    created_at: string;
    updated_at: string;
    users: GroupUser[];
    orders: Order[];
    total_expenses: number;
}

interface GroupShowProps {
    group: GroupDetails;
}

export default function GroupShow({ group }: GroupShowProps) {
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
            case 'active':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
            case 'completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
        }
    };

    const getInitials = (name: string | null) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppLayout>
            <Head title={`${group.name} - Group Details`} />
            <h1 className="text-2xl font-bold tracking-tight">{group.name}</h1>
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Add Order Card */}
                    <Card className="cursor-pointer flex items-center justify-center border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl lg:col-span-1 col-span-full">
                        <div className="py-8 text-center">
                            <Plus className="mx-auto mb-3 h-8 w-8" />
                            <h3 className="text-lg font-semibold">Add New Order</h3>
                            <p className="mt-1 text-sm opacity-90">Create a new order for this group</p>
                        </div>
                    </Card>

                    {/* Members */}
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Members</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {group.users.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{user.nickname}</p>
                                        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Orders */}
                    <div className="lg:col-span-2">
                        <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {group.orders.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="mb-4 text-muted-foreground">No orders yet</p>
                                        <Button variant="gradient">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create First Order
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {group.orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 p-4 transition-colors hover:bg-white/5"
                                            >
                                                <div className="flex-1">
                                                    <div className="mb-2 flex items-center gap-3">
                                                        <h3 className="font-medium">{order.title}</h3>
                                                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">
                                                        {order.items_count} {order.items_count === 1 ? 'item' : 'items'} • Created{' '}
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">
                                                        {group.currency} {order.total_amount.toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
