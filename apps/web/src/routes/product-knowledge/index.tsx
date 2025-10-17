import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/product-knowledge/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/product-knowledge/"!</div>
}
