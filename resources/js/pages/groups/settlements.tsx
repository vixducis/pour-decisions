import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { useMoneyFormat } from '@/hooks/use-money-format';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ArrowRight, CheckCircle } from 'lucide-react';

interface UserBalance {
    id: number;
    nickname: string;
    email: string;
    paid: string;
    consumed: string;
    balance: string;
    balance_status: 'positive' | 'negative' | 'zero';
}

interface Settlement {
    from: {
        id: number;
        nickname: string;
    };
    to: {
        id: number;
        nickname: string;
    };
    amount: number;
}

interface Group {
    id: number;
    name: string;
    currency: string;
}

interface SettlementsProps {
    group: Group;
    userBalances: UserBalance[];
    settlements: Settlement[];
}

export default function GroupSettlements({ group, userBalances, settlements }: SettlementsProps) {
    const getInitials = useInitials();
    const formatMoney = useMoneyFormat(group.currency);

    return (
        <AppLayout backAction={{ type: 'link', href: route('groups.show', group.id) }}>
            <Head title={`Settlements - ${group.name}`} />

            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight">Group Settlements</h1>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* User Balances */}
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <CardTitle>Individual Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {userBalances.map((user) => (
                                    <div
                                        key={user.id}
                                        className={`flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 ${
                                            user.balance_status === 'zero'
                                                ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                : user.balance_status === 'positive'
                                                  ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                                                  : 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src="" alt={user.nickname} />
                                                <AvatarFallback userId={user.id}>{getInitials(user.nickname)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.nickname}</p>
                                                <p className="text-sm text-muted-foreground">Paid: {user.paid}</p>
                                                <p className="text-sm text-muted-foreground">Consumed: {user.consumed}</p>
                                            </div>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            {user.balance_status === 'zero' ? (
                                                <div className="flex items-center justify-end gap-2 text-green-600 dark:text-green-400">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="font-medium">Settled</span>
                                                </div>
                                            ) : user.balance_status === 'positive' ? (
                                                <div className="text-blue-600 dark:text-blue-400">
                                                    <div className="flex items-center justify-end gap-2 sm:block">
                                                        <p className="font-medium">Owed</p>
                                                        <p className="text-lg font-bold">{user.balance}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-orange-600 dark:text-orange-400">
                                                    <div className="flex items-center justify-end gap-2 sm:block">
                                                        <p className="font-medium">Owes</p>
                                                        <p className="text-lg font-bold">{user.balance}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Settlements */}
                    <Card className="border-white/20 bg-white/50 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <CardHeader>
                            <CardTitle>Suggested Settlements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {settlements.length === 0 ? (
                                <div className="py-8 text-center">
                                    <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
                                    <p className="text-lg font-medium">All settled!</p>
                                    <p className="text-sm text-muted-foreground">Everyone has paid their fair share.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settlements.map((settlement, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col gap-x-3 gap-y-1 rounded-lg border border-white/10 p-4 transition-colors hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="font-medium">{settlement.from.nickname}</span>
                                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{settlement.to.nickname}</span>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-lg font-bold">{formatMoney(settlement.amount)}</p>
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
