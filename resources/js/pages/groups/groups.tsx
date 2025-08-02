import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface Group {
    id: number;
    name: string;
    currency: string;
    public_id: string;
    created_at: string;
    updated_at: string;
    users_count: number;
}

interface GroupsProps {
    groups: Group[];
}

type GroupForm = {
    name: string;
    nickname: string;
};

export default function Groups({ groups }: GroupsProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<GroupForm>({
        name: '',
        nickname: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('groups.store'), {
            onSuccess: () => {
                reset();
                setDialogOpen(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Groups" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Groups</h1>
                    </div>

                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="gradient">
                                <Plus className="mr-2 h-4 w-4" />
                                New Group
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Group</DialogTitle>
                                <DialogDescription>Create a new group to track expenses with others.</DialogDescription>
                            </DialogHeader>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Group Name</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter group name"
                                        aria-invalid={errors.name ? 'true' : 'false'}
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="nickname">Your Nickname</Label>
                                    <Input
                                        id="nickname"
                                        value={data.nickname}
                                        onChange={(e) => setData('nickname', e.target.value)}
                                        placeholder="Enter your nickname in this group"
                                        aria-invalid={errors.nickname ? 'true' : 'false'}
                                    />
                                    {errors.nickname && <p className="mt-1 text-sm text-destructive">{errors.nickname}</p>}
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing} variant="gradient">
                                        {processing ? 'Creating...' : 'Create Group'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {groups.length === 0 ? (
                    <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-lg">
                        <CardContent className="flex flex-col items-center justify-center py-8">
                            <div className="mb-4 text-6xl">🎉</div>
                            <p className="mb-4 text-lg font-medium text-gray-700 dark:text-gray-300">No groups yet</p>
                            <p className="mb-6 text-center text-sm text-muted-foreground max-w-md">
                                Create your first group to start tracking expenses with others and make managing shared costs fun!
                            </p>
                            <Button onClick={() => setDialogOpen(true)} variant="gradient">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Group
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-0 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <Card key={group.id} className="cursor-pointer transition-all duration-200 hover:shadow-xl md:hover:-translate-y-1 bg-white/50 dark:bg-white/5 backdrop-blur-sm border-white/20 dark:border-white/10 rounded-none first:rounded-t-lg last:rounded-b-lg md:rounded-lg border-b-0 last:border-b md:border-b">
                                <Link href={`/groups/${group.id}`} className="block">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
                                        <CardDescription>
                                            {group.users_count} {group.users_count === 1 ? 'member' : 'members'}
                                        </CardDescription>
                                    </CardHeader>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
