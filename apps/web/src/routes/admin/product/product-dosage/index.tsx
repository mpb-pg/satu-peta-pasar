import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/admin/product/product-dosage/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/product/product-dosage/"!</div>;
}
