import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/stall/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/stall/"!</div>
}
