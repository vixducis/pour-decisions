import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    toolbarActions?: ReactNode;
}

export default ({ children, toolbarActions, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate toolbarActions={toolbarActions} {...props}>
        {children}
    </AppLayoutTemplate>
);
