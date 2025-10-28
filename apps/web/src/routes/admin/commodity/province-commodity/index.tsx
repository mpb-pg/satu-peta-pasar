import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/commodity/province-commodity/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/commodity/province-commodity/"!</div>
}
