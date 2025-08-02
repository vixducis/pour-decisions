import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useState } from 'react';

interface GroupUser {
    id: number;
    email: string;
    nickname: string;
    avatar?: string;
}

interface Item {
    id: number;
    name: string;
    price: string;
    one_off: boolean;
}

interface GroupDetails {
    id: number;
    name: string;
    currency: string;
    users: GroupUser[];
    items: Item[];
}

interface OrderCreateProps {
    group: GroupDetails;
}

interface SelectedItem {
    itemId: number;
    userId: number;
    itemName: string;
    itemPrice: string;
    userNickname: string;
}

export default function OrderCreate({ group }: OrderCreateProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedItems, setSelectedItems] = useState<Map<number, SelectedItem>>(new Map());

    const getInitials = (name: string | null) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map((word) => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleItemSelect = (userId: number, item: Item, user: GroupUser) => {
        const newSelectedItems = new Map(selectedItems);

        // If the same item is already selected for this user, deselect it
        const currentSelection = newSelectedItems.get(userId);
        if (currentSelection && currentSelection.itemId === item.id) {
            newSelectedItems.delete(userId);
        } else {
            // Select this item for the user (replacing any previous selection)
            newSelectedItems.set(userId, {
                itemId: item.id,
                userId: userId,
                itemName: item.name,
                itemPrice: item.price,
                userNickname: user.nickname,
            });
        }

        setSelectedItems(newSelectedItems);
    };

    const isItemSelected = (userId: number, itemId: number) => {
        const userSelection = selectedItems.get(userId);
        return userSelection?.itemId === itemId;
    };

    const calculateTotal = () => {
        return Array.from(selectedItems.values()).reduce((total, item) => total + parseFloat(item.itemPrice), 0);
    };

    const getItemSummary = () => {
        const itemCounts = new Map<string, { count: number; price: number; name: string }>();

        Array.from(selectedItems.values()).forEach((item) => {
            const key = item.itemName;
            if (itemCounts.has(key)) {
                const existing = itemCounts.get(key)!;
                itemCounts.set(key, {
                    ...existing,
                    count: existing.count + 1,
                });
            } else {
                itemCounts.set(key, {
                    count: 1,
                    price: parseFloat(item.itemPrice),
                    name: item.itemName,
                });
            }
        });

        return Array.from(itemCounts.values());
    };

    const handleFinishOrder = () => {
        const orderData = {
            group_id: group.id,
            items: Array.from(selectedItems.values()).map((item) => ({
                item_id: item.itemId,
                user_id: item.userId,
            })),
        };

        router.post(route('orders.store'), orderData, {
            onSuccess: () => {
                router.visit(route('groups.show', group.id));
            },
        });
    };

    const canProceedToStep2 = selectedItems.size > 0;

    return (
        <AppLayout>
            <Head title={`Create Order - ${group.name}`} />

            <div className="space-y-6">
                {currentStep === 1 && (
                    <>
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
                        </div>
                        <div className="space-y-6">
                            <div className="grid gap-6 lg:grid-cols-2">
                                {group.users.map((user) => (
                                    <Card key={user.id} className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                                        <CardHeader>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={user.avatar} alt={user.nickname} />
                                                    <AvatarFallback userId={user.id}>{getInitials(user.nickname)}</AvatarFallback>
                                                </Avatar>
                                                <div className="leading-tight">
                                                    <CardTitle className="text-lg leading-none">{user.nickname}</CardTitle>
                                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {group.items.length === 0 ? (
                                                <p className="text-sm text-muted-foreground">No items available</p>
                                            ) : (
                                                group.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleItemSelect(user.id, item, user)}
                                                        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
                                                            isItemSelected(user.id, item.id)
                                                                ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20'
                                                                : 'border-white/10 hover:bg-white/5'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`h-4 w-4 rounded-full border-2 transition-colors ${
                                                                    isItemSelected(user.id, item.id)
                                                                        ? 'border-purple-500 bg-purple-500'
                                                                        : 'border-gray-300 dark:border-gray-600'
                                                                }`}
                                                            >
                                                                {isItemSelected(user.id, item.id) && (
                                                                    <div
                                                                        className="h-full w-full rounded-full bg-white"
                                                                        style={{ transform: 'scale(0.5)' }}
                                                                    />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{item.name}</p>
                                                                {item.one_off && (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        One-off
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="font-semibold">
                                                            {group.currency} {item.price}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={() => setCurrentStep(2)} disabled={!canProceedToStep2} variant="gradient">
                                    Next Step
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold tracking-tight">Summary</h1>
                            <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Selection
                            </Button>
                        </div>

                        <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                            <CardContent>
                                {selectedItems.size === 0 ? (
                                    <p className="text-muted-foreground">No items selected</p>
                                ) : (
                                    <div className="space-y-3">
                                        {getItemSummary().map((item, index) => (
                                            <div key={index} className="flex items-center justify-between py-2">
                                                <p className="font-medium">
                                                    {item.count}x {item.name}
                                                </p>
                                                <p className="font-semibold">
                                                    {group.currency} {(item.count * item.price).toFixed(2)}
                                                </p>
                                            </div>
                                        ))}

                                        <div className="border-t border-white/10 pt-3">
                                            <div className="flex items-center justify-between text-lg font-bold">
                                                <p>Total</p>
                                                <p>
                                                    {group.currency} {calculateTotal().toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="flex justify-end">
                            <Button onClick={handleFinishOrder} disabled={selectedItems.size === 0} variant="gradient">
                                <Check className="mr-2 h-4 w-4" />
                                Create Order
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
