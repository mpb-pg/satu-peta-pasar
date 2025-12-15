'use client';

import { useLingui } from '@lingui/react/macro';
import { Menu } from 'lucide-react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminSidebar } from './admin-sidebar';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const { t } = useLingui();
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="relative flex min-h-screen w-full">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <SidebarInset>
          <header className="sticky top-0 z-40 border-b bg-background">
            {/* Mobile Header */}
            <div className="flex h-16 shrink-0 items-center gap-2 px-4 lg:hidden">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t`Toggle sidebar`}</span>
              </SidebarTrigger>
              <div className="flex-1">
                <h1 className="font-semibold">{t`Marketing Map Admin`}</h1>
              </div>
            </div>

            {/* Desktop Header - minimal */}
            <div className="hidden h-16 shrink-0 items-center gap-2 px-4 lg:flex">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t`Toggle sidebar`}</span>
              </SidebarTrigger>
            </div>
          </header>

          {/* Page content with proper overflow handling */}
          <div className="flex flex-1 flex-col">
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
