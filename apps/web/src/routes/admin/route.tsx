import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { orpc } from '@/lib/orpc/client';
import { AdminLayout } from './-components/admin-layout';
import { currentUserAtom } from './-libs/admin-atoms';

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ context }) => {
    // Protect admin routes - require authentication
    if (!context.user) {
      throw redirect({
        to: '/auth/login',
        search: (prev) => ({
          ...prev,
          redirect: '/admin',
        }),
      });
    }
    try {
      const res = await orpc.admin.user.getById.call({
        userId: context.user.id,
      });

      const isAdmin = res.data?.some((r) => r.role === 'admin');
      if (!isAdmin) {
        throw redirect({ to: '/' });
      }
    } catch {
      throw redirect({
        to: '/',
      });
    }
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user } = Route.useRouteContext();
  const setCurrentUser = useSetAtom(currentUserAtom);

  // Sync user to atom for use in components
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
        avatar: user.image ?? undefined,
      });
    }
  }, [user, setCurrentUser]);

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
