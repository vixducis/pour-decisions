import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { BackAction } from '@/types';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, LogOut, Settings } from 'lucide-react';
import { FC } from 'react';

interface AppToolbarProps {
    className?: string;
    actions?: React.ReactNode;
    backAction?: BackAction;
}

export function AppToolbar({ className, actions, backAction }: AppToolbarProps) {
    return (
        <div
            className={cn(
                'flex h-16 items-center justify-between border-b border-white/20 bg-white/90 px-4 backdrop-blur-sm dark:bg-black/40',
                className,
            )}
        >
            <div className="flex items-center space-x-4">
                {backAction !== undefined && <BackButton action={backAction} />}
                <Link href="/" className="text-xl font-extrabold tracking-tight transition-opacity hover:opacity-80">
                    Pour Decisions
                </Link>
            </div>

            <div className="flex items-center space-x-2">
                {actions}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.post(route('logout'))}
                            className="cursor-pointer"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

const BackButton: FC<{ action: BackAction }> = ({ action }) => {
    if (action.type === 'link') {
        return (
            <Link href={action.href}>
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            </Link>
        );
    }

    return (
        <Button variant="ghost" size="sm" onClick={action.action}>
            <ArrowLeft className="h-4 w-4" />
        </Button>
    );
};
