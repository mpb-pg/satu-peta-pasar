import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/product-potential/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/product-potential/"!</div>;
}
