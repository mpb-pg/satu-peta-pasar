import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { orpc } from '@/lib/orpc/client';
import { CreateProductBrandForm } from './-components/create-product-brand-form';
import { DeleteProductBrandForm } from './-components/delete-product-brand-form';
import { EditProductBrandForm } from './-components/edit-product-brand-form';

type ProductBrandListItem = {
  id: string;
  name: string;
};

export const Route = createFileRoute('/admin/product/product-brand/')({
  component: RouteComponent,
  validateSearch: z
    .object({
      q: z.string().optional(),
      create: z.string().optional(),
      edit: z.string().optional(),
      delete: z.string().optional(),
    })
    .parse,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { create, edit, delete: deleteParam } = search;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDeleteProductBrand, setCurrentDeleteProductBrand] =
    useState<ProductBrandListItem | null>(null);

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

  useEffect(() => {
    if (deleteParam && productBrands) {
      const pb = productBrands?.data?.find((p) => p.id === deleteParam);
      if (pb) setCurrentDeleteProductBrand(pb);
    }
  }, [deleteParam, productBrands]);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

  const handleCreate = () => {
    navigate({ to: '.', search: (prev) => ({ ...prev, create: 'true', edit: undefined, delete: undefined }) });
  };

  const handleEdit = (productBrand: ProductBrandListItem) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, edit: productBrand.id, create: undefined, delete: undefined }) });
  };

  const handleDelete = (productBrand: ProductBrandListItem) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, delete: productBrand.id, create: undefined, edit: undefined }) });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Product Brands</h1>
        <p className="text-slate-600">Create and manage product brands</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Product Brand List</CardTitle>
            <CardDescription>Manage and organize your product brands</CardDescription>
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

            <Button className="min-w-[100px]" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {(() => {
            if (isLoading) return <p>Loading product brands...</p>;
            if (productBrandsList.length === 0) return <p className="text-center text-gray-500">No product brands found.</p>;

            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productBrandsList.map((pb) => (
                  <Card className="group relative flex flex-col overflow-hidden" key={pb.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{pb.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div>
                        {pb.industry && (
                          <p className="text-sm text-slate-600">
                            <strong>Industry:</strong> {pb.industry}
                          </p>
                        )}
                        {pb.description && (
                          <p className="mt-1 text-sm text-gray-500">{pb.description}</p>
                        )}
                      </div>

                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button onClick={() => handleEdit(pb)} size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(pb)} size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>

      <CreateProductBrandForm
        open={Boolean(create)}
        onOpenChange={(open) => {
          if (!open) navigate({ to: '.', search: (prev) => ({ ...prev, create: undefined }) });
        }}
      />

      <EditProductBrandForm
        productBrandId={edit ?? null}
        open={Boolean(edit)}
        onOpenChange={(open) => {
          if (!open) navigate({ to: '.', search: (prev) => ({ ...prev, edit: undefined }) });
        }}
      />

      <DeleteProductBrandForm
        productBrand={currentDeleteProductBrand}
        open={Boolean(deleteParam)}
        onOpenChange={(open) => {
          if (!open) navigate({ to: '.', search: (prev) => ({ ...prev, delete: undefined }) });
        }}
        onDelete={() => {
          navigate({ to: '.', search: (prev) => ({ ...prev, delete: undefined }) });
          setCurrentDeleteProductBrand(null);
        }}
      />
    </div>
  );
}
