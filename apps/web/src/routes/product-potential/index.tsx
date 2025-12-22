import { createFileRoute, redirect } from '@tanstack/react-router';
import { orpc } from '@/lib/orpc/client';

export const Route = createFileRoute('/product-potential/')({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      throw redirect({
        to: '/auth/login',
        search: (prev) => ({
          ...prev,
          redirect: '/product-potential',
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
  return <div>Hello "/product-potential/"!</div>;
}
