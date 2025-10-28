import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/land/regency-land/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/land/regency-land/"!</div>
}
