import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/sale/sale-daily/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/sale/sale-daily/"!</div>;
}
