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

export const Route = createFileRoute('/admin/product/product-dosage/')({
  component: RouteComponent,
  validateSearch: z.object({
    q: z.string().optional(),
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

  const { data: productBrands, isLoading } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );
  const productBrandsList =
    productBrands?.data.filter((pb) =>
      pb.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Product Dosages</h1>
        <p className="text-slate-600">Select a brand to manage dosages</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Product Brand List</CardTitle>
            <CardDescription>Choose your product brands</CardDescription>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative min-w-[150px] flex-1">
              <input
                className="w-full rounded-lg border py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateUrlParams({ q: e.target.value || undefined });
                }}
                placeholder="Search product brands..."
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
              return <p>Loading product brands...</p>;
            }
            if (productBrandsList.length === 0) {
              return (
                <p className="text-center text-gray-500">No product brands found.</p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productBrandsList.map((pb) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={pb.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            <Link to={`./${pb.id}`}>{pb.name}</Link>
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
