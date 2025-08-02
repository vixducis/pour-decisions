import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Group {
    id: number;
    name: string;
    public_id: string;
    users_count: number;
}

interface JoinGroupProps {
    group: Group;
}

type JoinForm = {
    nickname: string;
};

export default function JoinGroup({ group }: JoinGroupProps) {
    const { data, setData, post, processing, errors } = useForm<JoinForm>({
        nickname: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('groups.join', group.public_id));
    };

    return (
        <AppLayout>
            <Head title={`Join ${group.name}`} />

            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                        <Users className="h-8 w-8 text-white" />
                    </div>
                    
                    <h1 className="text-2xl font-semibold mb-2">Join Group</h1>
                    <p className="text-muted-foreground mb-8">
                        You've been invited to join <strong>{group.name}</strong>
                    </p>

                    <form onSubmit={submit} className="space-y-6 text-left">
                        <div>
                            <Label htmlFor="nickname">Your Nickname in this Group</Label>
                            <Input
                                id="nickname"
                                value={data.nickname}
                                onChange={(e) => setData('nickname', e.target.value)}
                                placeholder="Enter your preferred nickname"
                                aria-invalid={errors.nickname ? 'true' : 'false'}
                                className="mt-1"
                            />
                            {errors.nickname && (
                                <p className="mt-1 text-sm text-destructive">{errors.nickname}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                                This is how other group members will see you
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            variant="gradient"
                            className="w-full"
                        >
                            {processing ? 'Joining...' : `Join ${group.name}`}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}