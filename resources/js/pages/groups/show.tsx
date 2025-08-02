import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Check, Copy, Package, Plus, Trash2, UserPlus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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
    created_by?: {
        nickname: string;
    };
}

interface Item {
    id: number;
    name: string;
    price: string;
    one_off: boolean;
    created_at: string;
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
    items: Item[];
    total_expenses: number;
}

interface GroupShowProps {
    group: GroupDetails;
}

type ItemForm = {
    name: string;
    price: string;
};

export default function GroupShow({ group }: GroupShowProps) {
    const [copied, setCopied] = useState(false);
    const [itemDialogOpen, setItemDialogOpen] = useState(false);
    const inviteUrl = `${window.location.origin}/join/${group.public_id}`;

    const {
        data: itemData,
        setData: setItemData,
        post: postItem,
        processing: itemProcessing,
        errors: itemErrors,
        reset: resetItem,
    } = useForm<ItemForm>({
        name: '',
        price: '',
    });

    const copyInviteLink = async () => {
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const submitItem: FormEventHandler = (e) => {
        e.preventDefault();
        postItem(route('groups.items.store', group.id), {
            onSuccess: () => {
                resetItem();
                setItemDialogOpen(false);
            },
        });
    };

    const deleteItem = (itemId: number) => {
        if (confirm('Are you sure you want to delete this item?')) {
            router.delete(route('groups.items.destroy', [group.id, itemId]));
        }
    };

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
                <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {/* Add Order Card */}
                    <Link href={route('orders.create', group.id)} className="col-span-full lg:col-span-1">
                        <Card className="flex h-full cursor-pointer items-center justify-center border-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transition-all duration-200 hover:from-purple-600 hover:to-pink-600 hover:shadow-xl">
                            <div className="py-8 text-center">
                                <Plus className="mx-auto mb-3 h-8 w-8" />
                                <h3 className="text-lg font-semibold">Add New Order</h3>
                                <p className="mt-1 text-sm opacity-90">Create a new order for this group</p>
                            </div>
                        </Card>
                    </Link>

                    {/* Recent Orders */}
                    <div className="lg:col-span-full xl:col-span-2">
                        <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Recent Orders</CardTitle>
                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="lg:max-h-64 lg:overflow-y-auto">
                                {group.orders.length === 0 ? (
                                    <div className="py-8 text-center">
                                        <p className="text-muted-foreground">No orders yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {group.orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="group flex cursor-pointer items-center justify-between py-2 transition-colors hover:bg-white/5"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-medium">{order.title}</h3>
                                                        <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                                                    </div>
                                                    <p className="text-sm">
                                                        {order.created_by?.nickname || 'Unknown'} • <span className='text-muted-foreground'>{order.items_count} {order.items_count === 1 ? 'item' : 'items'}</span>
                                                        
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
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

                    {/* Members */}
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Members</CardTitle>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Invite
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite People to {group.name}</DialogTitle>
                                            <DialogDescription>Share this link with people you want to invite to the group</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="invite-link">Invite Link</Label>
                                                <div className="mt-1 flex gap-2">
                                                    <Input id="invite-link" value={inviteUrl} readOnly className="flex-1" />
                                                    <Button
                                                        onClick={copyInviteLink}
                                                        variant={copied ? 'default' : 'outline'}
                                                        size="sm"
                                                        className={copied ? 'bg-green-600 hover:bg-green-700' : ''}
                                                    >
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 lg:max-h-64 lg:overflow-y-auto">
                            {group.users.map((user) => (
                                <div key={user.id} className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={user.avatar} alt={user.name} />
                                        <AvatarFallback userId={user.id}>{getInitials(user.nickname)}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{user.nickname}</p>
                                        <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Items */}
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Items</CardTitle>
                                <Dialog open={itemDialogOpen} onOpenChange={setItemDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <Package className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Item</DialogTitle>
                                            <DialogDescription>Add a new item to the {group.name} group</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={submitItem} className="space-y-4">
                                            <div>
                                                <Label htmlFor="item-name">Item Name</Label>
                                                <Input
                                                    id="item-name"
                                                    value={itemData.name}
                                                    onChange={(e) => setItemData('name', e.target.value)}
                                                    placeholder="Enter item name"
                                                    aria-invalid={itemErrors.name ? 'true' : 'false'}
                                                    className="mt-1"
                                                />
                                                {itemErrors.name && <p className="mt-1 text-sm text-destructive">{itemErrors.name}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="item-price">Price</Label>
                                                <Input
                                                    id="item-price"
                                                    type="number"
                                                    step="0.01"
                                                    value={itemData.price}
                                                    onChange={(e) => setItemData('price', e.target.value)}
                                                    placeholder="0.00"
                                                    aria-invalid={itemErrors.price ? 'true' : 'false'}
                                                    className="mt-1"
                                                />
                                                {itemErrors.price && <p className="mt-1 text-sm text-destructive">{itemErrors.price}</p>}
                                            </div>

                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={itemProcessing} variant="gradient">
                                                    {itemProcessing ? 'Adding...' : 'Add Item'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="lg:max-h-64 lg:overflow-y-auto">
                            {group.items.length === 0 ? (
                                <div className="py-8 text-center">
                                    <p className="text-muted-foreground">No items added yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {group.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="group flex items-center justify-between py-2 transition-colors hover:bg-white/5"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{item.name}</h3>
                                                    {item.one_off && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            One-off
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold">
                                                    {group.currency} {item.price}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteItem(item.id)}
                                                    className="h-8 w-8 p-0 text-red-500 dark:text-red-700 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
