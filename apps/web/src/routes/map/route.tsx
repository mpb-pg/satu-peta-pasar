import { createFileRoute, Outlet } from '@tanstack/react-router'
import { MapLayout } from './-components/map-layout'

export const Route = createFileRoute('/map')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <MapLayout>
      <Outlet />
    </MapLayout>
  )
}
