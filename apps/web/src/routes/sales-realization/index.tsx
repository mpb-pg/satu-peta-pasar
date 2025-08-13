import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sales-realization/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/sales-realization/"!</div>;
}
