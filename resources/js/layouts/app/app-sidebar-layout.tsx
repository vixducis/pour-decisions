import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppToolbar } from '@/components/app-toolbar';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps extends PropsWithChildren {
    toolbarActions?: React.ReactNode;
    backHref?: string;
}

export default function AppSidebarLayout({ children, toolbarActions, backHref }: AppSidebarLayoutProps) {
    return (
        <AppShell>
            <div className="flex flex-col h-full">
                <AppToolbar actions={toolbarActions} backHref={backHref} />
                <AppContent className="overflow-x-hidden flex-1">
                    {children}
                </AppContent>
            </div>
        </AppShell>
    );
}
