import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    toolbarActions?: ReactNode;
    backHref?: string;
}

export default ({ children, toolbarActions, backHref, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate toolbarActions={toolbarActions} backHref={backHref} {...props}>
        {children}
    </AppLayoutTemplate>
);
