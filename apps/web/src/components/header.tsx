import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import authClient from '@/lib/auth/auth-client';
import { orpc } from '@/lib/orpc/client';
import { Route } from '@/routes/__root';

export default function Header() {
  const { user } = Route.useRouteContext();
  const { t } = useLingui();

  const handleSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  };

  const [hasViewerAccess, setHasViewerAccess] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!user) {
      setHasAdminAccess(false);
      setHasViewerAccess(false);
      return;
    }

    (async () => {
      try {
        const res = await orpc.admin.user.getById.call({
          userId: user.id,
        });

        type UserRes = {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at: Date;
        };
        const data =
          (res as unknown as { data?: UserRes[] })?.data ??
          (res as unknown as { value?: { data?: UserRes[] } })?.value?.data;

        if (!mounted) return;

        setHasAdminAccess(!!data?.some((r) => r.role === 'admin'));
        setHasViewerAccess(!!data?.some((r) => r.role === 'viewer'));
      } catch {
        // ignore
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user]);

  return (
    <header className="flex justify-between gap-2 border-amber-950 border-b bg-white p-2 text-black shadow-md">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">
            <Trans>Home</Trans>
          </Link>
        </div>

        {user && (hasAdminAccess || hasViewerAccess) ? (
          <>
            <div className="px-2 font-bold">
              <Link to="/map">
                <Trans>Potential Maps</Trans>
              </Link>
            </div>

            <div className="px-2 font-bold">
              {/* <Link to="/product-potential">Product Potential</Link> */}
            </div>

            <div className="px-2 font-bold">
              {/* <Link to="/sales-realization">Sales Realization</Link> */}
            </div>

            <div className="px-2 font-bold">
              {/* <Link to="/product-knowledge">Product Knowledge</Link> */}
            </div>
          </>
        ) : null}
      </nav>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {user ? (
          <>
            {hasAdminAccess && (
              <Link to="/admin">
                <Button size="sm" variant="ghost">
                  <Trans>Admin Panel</Trans>
                </Button>
              </Link>
            )}
            <span className="text-sm">{t`Welcome, ${user.name}!`}</span>
            <Button onClick={handleSignOut} size="sm" variant="outline">
              <Trans>Sign Out</Trans>
            </Button>
          </>
        ) : (
          <>
            <Link to="/auth/login">
              <Button size="sm" variant="outline">
                <Trans>Sign In</Trans>
              </Button>
            </Link>
            <Link to="/auth/signup">
              <Button size="sm">
                <Trans>Sign Up</Trans>
              </Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
