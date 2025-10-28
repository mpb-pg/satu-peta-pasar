import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/sale/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/sale/"!</div>
}
