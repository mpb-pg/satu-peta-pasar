import { useLingui } from '@lingui/react/macro';
import { createFileRoute } from '@tanstack/react-router';
import { Activity } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = Route.useRouteContext();
  const { t } = useLingui();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">{t`Dashboard`}</h1>
        <p className="text-muted-foreground text-sm">
          {t`Welcome back, ${user?.name}`}{' '}
          {t`Here's an overview of marketing maps`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t`Number of Provinces`}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">1</div>
            <p className="text-muted-foreground text-xs">+1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t`Number of Regencies`}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">1</div>
            <p className="text-muted-foreground text-xs">+1</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t`Number of Land Type`}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">3</div>
            <p className="text-muted-foreground text-xs">
              TanPang, Horti, Perkebunan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">
              {t`Number of Commodities`}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">17</div>
            <p className="text-muted-foreground text-xs">+1</p>
          </CardContent>
        </Card>
      </div>

      {/*  */}
      <Card>
        <CardHeader>
          <CardTitle>New and Development Product</CardTitle>
          <CardDescription>
            Products of concern to the New Product Management Unit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-destructive" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Petrofish</p>
                <p className="text-muted-foreground text-xs">
                  New Probiotic Innovations Petrofish grows natural food and
                  contains beneficial microbes!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">NPK Phonska Cair</p>
                <p className="text-muted-foreground text-xs">
                  Foliar fertilizer with NPK 10-8-3 content enriched with
                  complete micronutrients and ZPT!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100/10">
                <Activity className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium text-sm">Phonska OCA Plus</p>
                <p className="text-muted-foreground text-xs">
                  Liquid organic fertilizer containing organic carbon, macro and
                  micro nutrients and functional microbes!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
