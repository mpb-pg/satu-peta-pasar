import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc/client';
import { MapLayout } from './-components/map-layout';

export const Route = createFileRoute('/map')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/auth/login',
        search: (prev) => ({
          ...prev,
          redirect: '/map',
        }),
      });
    }

    try {
      const res = await orpc.admin.user.getById.call({
        userId: context.user.id,
      });

      const hasAccess = res.data?.some(
        (r) => r.role === 'admin' || r.role === 'viewer'
      );
      if (!hasAccess) {
        throw redirect({ to: '/' });
      }
    } catch {
      throw redirect({
        to: '/',
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <MapLayout>
      <Outlet />
    </MapLayout>
  );
}
