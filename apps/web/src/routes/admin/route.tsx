import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import { AdminLayout } from "./-components/admin-layout";
import { currentUserAtom } from "./-libs/admin-atoms";
import { db } from "@/lib/db";
import { access_role } from "@/lib/db/schema/access_role";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ context }) => {
    // Protect admin routes - require authentication
    if (!context.user) {
      throw redirect({
        to: "/auth/login",
        search: (prev) => ({
          ...prev,
          redirect: "/admin",
        }),
      });
    }

    // make problem on maps
    // const rows = await db
    //   .select({ role: access_role.role })
    //   .from(access_role)
    //   .where(eq(access_role.userId, context.user.id))
    //   .limit(1);

    // const isAdmin = rows[0]?.role === "admin";
    // if (!isAdmin) {
    //   throw redirect({
    //     to: "/",
    //   });
    // }
  },
  component: AdminLayoutRoute,
});

function AdminLayoutRoute() {
  const { user } = Route.useRouteContext();
  const setCurrentUser = useSetAtom(currentUserAtom);

  // Sync user to atom for use in components
  useEffect(() => {
    if (user) {
      setCurrentUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: "admin",
        avatar: user.image ?? undefined,
      });
    }
  }, [user, setCurrentUser]);

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
