import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/land/province-land/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/land/province-land/"!</div>
}
