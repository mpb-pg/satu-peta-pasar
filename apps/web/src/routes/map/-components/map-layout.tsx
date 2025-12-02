import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReactNode, isValidElement, cloneElement, ReactElement } from "react";
import { MapSidebar } from "./map-sidebar";
import { Menu } from "lucide-react";
import { MapProvider, useMapParams } from "./map-context";

type MapLayoutProps = {
  children: ReactNode;
}

export function MapLayout({ children }: MapLayoutProps) {
  const isMobile = useIsMobile();
  return (
    <MapProvider>
      <SidebarProvider defaultOpen={!isMobile}>
        <MapLayoutContent isMobile={isMobile}>{children}</MapLayoutContent>
      </SidebarProvider>
    </MapProvider>
  );
}

function MapLayoutContent({ children, isMobile }: { children: ReactNode; isMobile: boolean }) {
  const { params } = useMapParams();
  const injectedFilters = params?.filters as any | undefined;

  return (
    <div className="relative flex min-h-screen w-full">
      {/* Sidebar */}
      <MapSidebar className="relative" />

      {/* Main content area */}
      <SidebarInset>
        <header className="relative top-0 z-40 border-b bg-background">
          {/* Mobile Header */}
          <div className="flex h-16 shrink-0 items-center gap-2 px-4 lg:hidden">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </SidebarTrigger>
            <div className="flex-1">
              <h1 className="font-semibold">Marketing Map Admin</h1>
            </div>
          </div>

          {/* Desktop Header - minimal */}
          <div className="hidden h-16 shrink-0 items-center gap-2 px-4 lg:flex">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </SidebarTrigger>
            <div className="flex-1">
              <h1 className="font-semibold">Marketing Map</h1>
            </div>
          </div>
        </header>

        {/* Page content with proper overflow handling */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {isValidElement(children)
              ? cloneElement(children as ReactElement, {
                  ...(children as any).props,
                  filters: injectedFilters ?? (children as any).props?.filters,
                })
              : children}
          </main>
        </div>
      </SidebarInset>
    </div>
  );
}