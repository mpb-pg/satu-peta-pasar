import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stall/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/stall/"!</div>;
}
