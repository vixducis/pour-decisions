import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { BackAction } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    toolbarActions?: ReactNode;
    backAction?: BackAction;
}

export default ({ children, toolbarActions, backAction, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate toolbarActions={toolbarActions} backAction={backAction} {...props}>
        {children}
    </AppLayoutTemplate>
);
