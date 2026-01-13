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
import { CreateProductTypeForm } from './-components/create-product-type-form';
import { DeleteProductTypeForm } from './-components/delete-product-type-form';
import { EditProductTypeForm } from './-components/edit-product-type-form';

type ProductTypeListItem = {
  id: string;
  name: string;
};

export const Route = createFileRoute('/admin/product/')({
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

  const { create, edit, delete: deleteParam } = search;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDeleteProductType, setCurrentDeleteProductType] =
    useState<ProductTypeListItem | null>(null);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  const { data: productTypes, isLoading } = useQuery(
    orpc.admin.product.product_type.get.queryOptions({ input: {} })
  );
  const productTypesList =
    productTypes?.data.filter((pt) =>
      pt.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  useEffect(() => {
    if (deleteParam && productTypes) {
      const productType = productTypes?.data?.find(
        (pt) => pt.id === deleteParam
      );
      if (productType) {
        setCurrentDeleteProductType(productType);
      }
    }
  }, [deleteParam, productTypes]);

  const handleCreate = () => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        create: 'true',
        edit: undefined,
        delete: undefined,
      }),
    });
  };

  const handleEdit = (productType: ProductTypeListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: productType.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (productType: ProductTypeListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: productType.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Product Types</h1>
        <p className="text-slate-600">Create and manage product types</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Product Type List</CardTitle>
            <CardDescription>
              Manage and organize your product types
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
                placeholder="Search product types..."
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
            if (isLoading) {
              return <p>Loading product types...</p>;
            }
            if (productTypesList.length === 0) {
              return (
                <p className="text-center text-gray-500">
                  No product types found.
                </p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {productTypesList.map((productType) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={productType.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {productType.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(productType)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(productType)}
                          size="sm"
                          variant="destructive"
                        >
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

      <CreateProductTypeForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, create: undefined }),
            });
          }
        }}
        open={Boolean(create)}
      />

      <EditProductTypeForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, edit: undefined }),
            });
          }
        }}
        open={Boolean(edit)}
        productTypeId={edit ?? null}
      />

      <DeleteProductTypeForm
        onDelete={() => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteProductType(null);
        }}
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, delete: undefined }),
            });
          }
        }}
        open={Boolean(deleteParam)}
        productType={currentDeleteProductType}
      />
    </div>
  );
}
