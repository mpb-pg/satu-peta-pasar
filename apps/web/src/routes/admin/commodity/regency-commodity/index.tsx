import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import z from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/lib/orpc/client';

export const Route = createFileRoute('/admin/commodity/regency-commodity/')({
  component: RouteComponent,
  validateSearch: z.object({
    q: z.string().optional(),
    create: z.string().optional(),
    edit: z.string().optional(),
    delete: z.string().optional(),
  }).parse,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const [searchTerm, setSearchTerm] = useState('');

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  const { data: commodityTypes, isLoading } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );
  const commodityTypesList =
    commodityTypes?.data.filter((commodityType) =>
      commodityType.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Regency Commodities</h1>
        <p className="text-slate-600">Create and manage regency commodities</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Commodity Type List</CardTitle>
            <CardDescription>
              Choose your commodity types
            </CardDescription>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative min-w-[150px] flex-1">
              <input
                className="w-full rounded-lg border py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateUrlParams({ q: e.target.value || undefined });
                }}
                placeholder="Search commodity types..."
                type="text"
                value={searchTerm}
              />
              <Search className="absolute top-2.5 left-3 h-4 w-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoading) {
              return <p>Loading commodity types...</p>;
            }
            if (commodityTypesList.length === 0) {
              return (
                <p className="text-center text-gray-500">
                  No commodity types found.
                </p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {commodityTypesList.map((commodityType) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={commodityType.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            <Link to={`./${commodityType.id}`}>
                              {commodityType.name}
                            </Link>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
