import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { ArrowLeft, MapPin, Package2, Phone, User } from 'lucide-react';
import { type ReactNode, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/lib/orpc/client';

export const Route = createFileRoute('/stall/$id')({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();

  const stallQueryOptions = orpc.admin.stall.get.queryOptions({ input: {} });
  const { data: stallsData, isLoading: isStallLoading } =
    useQuery(stallQueryOptions);

  const stall = useMemo(
    () => stallsData?.data?.find((item) => item.id === id),
    [stallsData?.data, id]
  );

  const stallProductQueryOptions =
    orpc.admin.stall.getStallProduct.queryOptions({
      input: { stallId: id },
    });

  const { data: stallProductData, isLoading: isProductLoading } = useQuery({
    ...stallProductQueryOptions,
    enabled: Boolean(id),
  });

  if (isStallLoading) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <p className="text-slate-600 text-sm">Loading stall detail...</p>
      </div>
    );
  }

  if (!stall) {
    return (
      <div className="container mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-2xl">Stall not found</h1>
            <p className="text-slate-600 text-sm">
              We could not find the requested stall.
            </p>
          </div>
          <Button asChild type="button" variant="outline">
            <Link to="/map">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to map
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl">Stall Detail</h1>
          <p className="text-slate-600">
            View stall information and the brands sold here.
          </p>
        </div>
        <Button asChild type="button" variant="outline">
          <Link to="/map">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to map
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5" />
              {stall.name}
            </CardTitle>
            <CardDescription>
              Detailed information about this stall.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Address" value={stall.address || '—'} />
            <DetailItem
              icon={<User className="h-4 w-4" />}
              label="Owner"
              value={stall.owner || '—'}
            />
            <DetailItem
              icon={<Phone className="h-4 w-4" />}
              label="Contact"
              value={stall.notelp || '—'}
            />
            <DetailItem label="Criteria" value={stall.criteria || '—'} />
            <DetailItem label="Province" value={stall.provinceName || '—'} />
            <DetailItem label="Regency" value={stall.regencyName || '—'} />
            <DetailItem
              label="Latitude"
              value={stall.latitude != null ? stall.latitude.toString() : '—'}
            />
            <DetailItem
              label="Longitude"
              value={stall.longitude != null ? stall.longitude.toString() : '—'}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Package2 className="h-5 w-5" /> Product brands
            </CardTitle>
            <CardDescription>
              Brands currently sold by this stall.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isProductLoading ? (
              <p className="text-slate-600 text-sm">
                Loading product brands...
              </p>
            ) : stallProductData?.data?.length === 0 ? (
              <p className="text-slate-600 text-sm">
                No product brands linked to this stall.
              </p>
            ) : (
              <div className="space-y-2">
                {stallProductData?.data?.map((brand) => (
                  <div
                    className="flex items-start justify-between rounded-lg border p-3"
                    key={brand.id}
                  >
                    <div>
                      <p className="font-medium">{brand.productBrandName}</p>
                      {brand.productBrandIndustry ? (
                        <p className="text-slate-600 text-xs">
                          {brand.productBrandIndustry}
                        </p>
                      ) : null}
                    </div>
                    {brand.description ? (
                      <Badge variant="secondary">{brand.description}</Badge>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="space-y-1 rounded-lg border p-3">
      <p className="text-slate-500 text-xs uppercase tracking-wide">{label}</p>
      <div className="flex items-center gap-2 text-slate-800 text-sm">
        {icon}
        <span>{value}</span>
      </div>
    </div>
  );
}
