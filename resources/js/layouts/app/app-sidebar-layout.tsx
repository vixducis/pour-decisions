import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppToolbar } from '@/components/app-toolbar';
import { BackAction } from '@/types';
import { type PropsWithChildren } from 'react';

interface AppSidebarLayoutProps extends PropsWithChildren {
    toolbarActions?: React.ReactNode;
    backAction?: BackAction;
}

export default function AppSidebarLayout({ children, toolbarActions, backAction }: AppSidebarLayoutProps) {
    return (
        <AppShell>
            <div className="flex h-full flex-col">
                <AppToolbar actions={toolbarActions} backAction={backAction} />
                <AppContent className="flex-1 overflow-x-hidden">{children}</AppContent>
            </div>
        </AppShell>
    );
}
