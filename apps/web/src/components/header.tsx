import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from '@tanstack/react-router';
import LanguageSwitcher from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import authClient from '@/lib/auth/auth-client';
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

  return (
    <header className="flex justify-between gap-2 border-amber-950 border-b bg-white p-2 text-black shadow-md">
      <nav className="flex flex-row">
        <div className="px-2 font-bold">
          <Link to="/">
            <Trans>Home</Trans>
          </Link>
        </div>

        {user ? (
          <div className="px-2 font-bold">
            <Link to="/map">
              <Trans>Potential Maps</Trans>
            </Link>
          </div>
        ) : null}

        <div className="px-2 font-bold">
          {/* <Link to="/product-potential">Product Potential</Link> */}
        </div>

        <div className="px-2 font-bold">
          {/* <Link to="/sales-realization">Sales Realization</Link> */}
        </div>

        <div className="px-2 font-bold">
          {/* <Link to="/product-knowledge">Product Knowledge</Link> */}
        </div>
      </nav>

      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        {user ? (
          <>
            {/* {user.isAdmin && ( */}
            <Link to="/admin">
              <Button size="sm" variant="ghost">
                <Trans>Admin Panel</Trans>
              </Button>
            </Link>
            {/* )} */}
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
