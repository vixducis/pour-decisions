import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { useMoneyFormat } from '@/hooks/use-money-format';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, Check } from 'lucide-react';
import { FC, useMemo, useReducer, useState } from 'react';

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

interface DuplicateOrderItem {
    itemId: number;
    userId: number;
    itemName: string;
    itemPrice: string;
}

interface DuplicateOrder {
    id: number;
    items: DuplicateOrderItem[];
}

interface OrderCreateProps {
    group: GroupDetails;
    duplicateOrder: DuplicateOrder | null;
}

interface SelectedItem {
    itemId: number;
    userId: number;
    itemName: string;
    itemPrice: string;
}

interface ActionProps {
    item: Item;
    user: GroupUser;
}

type SelectionMap = Map<number, SelectedItem>;

function selectedItemsReducer(state: SelectionMap, action: ActionProps): SelectionMap {
    const { item, user } = action;
    const newState = new Map(state);

    // If the same item is already selected for this user, deselect it
    const currentSelection = newState.get(user.id);
    if (currentSelection && currentSelection.itemId === item.id) {
        newState.delete(user.id);
    } else {
        // Select this item for the user (replacing any previous selection)
        newState.set(user.id, {
            itemId: item.id,
            userId: user.id,
            itemName: item.name,
            itemPrice: item.price,
        });
    }

    return newState;
}

export default function OrderCreate({ group, duplicateOrder }: OrderCreateProps) {
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    const getInitialSelectedItems = (() => {
        const map = new Map<number, SelectedItem>();
        if (duplicateOrder !== null) {
            duplicateOrder.items.forEach((item) => {
                map.set(item.userId, item);
            });
        }

        return map;
    })();

    const [selectedItems, dispatch] = useReducer(selectedItemsReducer, getInitialSelectedItems);
    const formatMoney = useMoneyFormat(group.currency);

    return (
        <AppLayout
            backAction={currentStep === 1 ? { type: 'link', href: `/groups/${group.id}` } : { type: 'callback', action: () => setCurrentStep(1) }}
        >
            <Head title={`Create Order - ${group.name}`} />

            <div className="space-y-6">
                {currentStep === 1 && (
                    <ItemSelection
                        users={group.users}
                        items={group.items}
                        onSubmit={() => setCurrentStep(2)}
                        handleSelect={dispatch}
                        formatMoney={formatMoney}
                        selection={selectedItems}
                    />
                )}

                {currentStep === 2 && <Summary groupId={group.id} selection={selectedItems} formatMoney={formatMoney} />}
            </div>
        </AppLayout>
    );
}

const ItemSelection: FC<{
    users: GroupUser[];
    items: Item[];
    handleSelect: (props: ActionProps) => void;
    onSubmit: () => void;
    formatMoney: (input: number) => string;
    selection: SelectionMap;
}> = ({ users, items, handleSelect, onSubmit, formatMoney, selection }) => {
    const getInitials = useInitials();

    return (
        <>
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
            </div>
            <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {users.map((user) => (
                        <User
                            handleSelect={(item) => handleSelect({ user, item })}
                            initials={getInitials(user.nickname)}
                            key={user.id}
                            user={user}
                            items={items}
                            formatMoney={formatMoney}
                            selectedItem={selection.get(user.id)}
                        />
                    ))}
                </div>

                <div className="flex justify-end">
                    <Button onClick={onSubmit} disabled={selection.size <= 0} variant="gradient">
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        </>
    );
};

const User: FC<{
    user: GroupUser;
    initials: string;
    items: Item[];
    formatMoney: (input: number) => string;
    handleSelect: (item: Item) => void;
    selectedItem: SelectedItem | undefined;
}> = ({ user, initials, items, formatMoney, handleSelect, selectedItem }) => (
    <Card key={user.id} className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <CardHeader>
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} alt={user.nickname} />
                    <AvatarFallback userId={user.id}>{initials}</AvatarFallback>
                </Avatar>
                <div className="leading-tight">
                    <CardTitle className="text-lg leading-none">{user.nickname}</CardTitle>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="space-y-3">
            {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">No items available</p>
            ) : (
                items.map((item) => (
                    <Item
                        item={item}
                        key={item.id}
                        formatMoney={formatMoney}
                        onClick={() => handleSelect(item)}
                        isSelected={selectedItem?.itemId === item.id}
                    />
                ))
            )}
        </CardContent>
    </Card>
);

const Item: FC<{
    item: Item;
    isSelected: boolean;
    onClick: () => void;
    formatMoney: (input: number) => string;
}> = ({ item, isSelected, onClick, formatMoney }) => (
    <div
        onClick={onClick}
        className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all ${
            isSelected ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/20' : 'border-white/10 hover:bg-white/5'
        }`}
    >
        <div className="flex items-center gap-3">
            <div
                className={`h-4 w-4 rounded-full border-2 transition-colors ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 dark:border-gray-600'
                }`}
            >
                {isSelected && <div className="h-full w-full rounded-full bg-white" style={{ transform: 'scale(0.5)' }} />}
            </div>
            <div>
                <p className="font-medium">{item.name}</p>
            </div>
        </div>
        <p className="font-semibold">{formatMoney(Number(item.price))}</p>
    </div>
);

const Summary: FC<{
    groupId: number;
    selection: SelectionMap;
    formatMoney: (input: number) => string;
}> = ({ groupId, selection, formatMoney }) => {
    const summary = useMemo(() => {
        const selectionValues = Array.from(selection.values());
        const itemCounts = new Map<string, { count: number; price: number; name: string }>();

        selectionValues.forEach((item) => {
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

        return {
            items: Array.from(itemCounts.values()),
            total: selectionValues.reduce((total, item) => total + parseFloat(item.itemPrice), 0),
        };
    }, [selection]);

    const handleFinishOrder = () => {
        const orderData = {
            group_id: groupId,
            items: Array.from(selection.values()).map((item) => ({
                item_id: item.itemId,
                user_id: item.userId,
            })),
        };

        router.post(route('orders.store'), orderData, {
            onSuccess: () => {
                router.visit(route('groups.show', groupId));
            },
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Summary</h1>

            <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                <CardContent>
                    {selection.size === 0 ? (
                        <p className="text-muted-foreground">No items selected</p>
                    ) : (
                        <div className="space-y-3">
                            {summary.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between py-2">
                                    <p className="font-medium">
                                        {item.count}x {item.name}
                                    </p>
                                    <p className="font-semibold">{formatMoney(item.price)}</p>
                                </div>
                            ))}

                            <div className="border-t border-white/10 pt-3">
                                <div className="flex items-center justify-between text-lg font-bold">
                                    <p>Total</p>
                                    <p>{formatMoney(summary.total)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleFinishOrder} disabled={selection.size === 0} variant="gradient">
                    <Check className="mr-2 h-4 w-4" />
                    Create Order
                </Button>
            </div>
        </div>
    );
};
