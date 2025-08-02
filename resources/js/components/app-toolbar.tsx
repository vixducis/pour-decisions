import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Settings } from 'lucide-react';

interface AppToolbarProps {
    className?: string;
    actions?: React.ReactNode;
}

export function AppToolbar({ className, actions }: AppToolbarProps) {
    return (
        <div className={cn('flex h-16 items-center justify-between border-b bg-white/90 dark:bg-black/40 backdrop-blur-sm border-white/20 px-4', className)}>
            <div className="flex items-center space-x-4">
                <Link href="/" className="text-lg font-semibold">Pour Decisions</Link>
            </div>

            <div className="flex items-center space-x-2">
                {actions}
                <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
