import { cn } from '@/lib/utils';
import * as React from 'react';

export function AppContent({ children, className, ...props }: React.ComponentProps<'main'>) {
    return (
        <main className={cn("mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl p-6", className)} {...props}>
            {children}
        </main>
    );
}
