'use client';

import { Link } from '@tanstack/react-router';
import { useAtomValue } from 'jotai';
import { Sprout } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  globalNavigationItems,
  marketingMapNavigationItems,
  saleNavigationItems,
  stallNavigationItems,
} from '../-domain/navigation-items';
import { currentUserAtom } from '../-libs/admin-atoms';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';

export function AdminSidebar({
  className,
  ...props
}: { className?: string } & React.ComponentProps<typeof Sidebar>) {
  const user = useAtomValue(currentUserAtom);

  return (
    <Sidebar
      className={className}
      collapsible="icon"
      variant="inset"
      {...props}
    >
      {/* Header with Branding */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Sprout className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Marketing Map</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent>
        {/* Back to Home from Admin */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
                <svg
                  aria-label="Back to Home"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="font-medium">Back to Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <NavMain items={globalNavigationItems} label="Overview" />

        <NavMain items={marketingMapNavigationItems} label="Marketing Map" />

        <NavMain items={saleNavigationItems} label="Sale" />

        <NavMain items={stallNavigationItems} label="Stall" />
      </SidebarContent>

      {/* Footer with User Profile */}
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
