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
import { CreateProductDosageForm } from './-components/create-product-dosage-form';
import { DeleteProductDosageForm } from './-components/delete-product-dosage-form';
import { EditProductDosageForm } from './-components/edit-product-dosage-form';

type ProductDosageListItem = {
  id: string;
  commodityTypeId?: string;
  commodityTypeName?: string;
  productBrandId?: string;
  productBrandName?: string;
  dosage?: number;
  unit?: string;
};

export const Route = createFileRoute('/admin/product/product-dosage/$productBrand')({
  component: RouteComponent,
  validateSearch: z.object({
    q: z.string().optional(),
    create: z.string().optional(),
    edit: z.string().optional(),
    delete: z.string().optional(),
  }),
});

function RouteComponent() {
  const params = Route.useParams();
  const productBrandIdSlug = params.productBrand as string | undefined;

  const { data: productBrands } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );
  const { data: productDosages, isLoading } = useQuery(
    orpc.admin.product.product_dosage.get.queryOptions({ input: {} })
  );

  const filtered = productDosages?.data.filter(
    (d) => d.productBrandId === productBrandIdSlug
  );

  const productBrandName =
    productBrands?.data.find((pb) => pb.id === productBrandIdSlug)?.name ||
    'Unknown';

  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { create, edit, delete: deleteParam } = search;
  const [currentDeleteDosage, setCurrentDeleteDosage] =
    useState<ProductDosageListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  useEffect(() => {
    if (deleteParam && productDosages) {
      const item = productDosages.data.find((d) => d.id === deleteParam);
      if (item) {
        setCurrentDeleteDosage(item);
      }
    }
  }, [deleteParam, productDosages]);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

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

  const handleEdit = (item: ProductDosageListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: item.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (item: ProductDosageListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: item.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 text-left">
        <h1 className="font-bold text-3xl">{productBrandName} dosages</h1>
        <p className="text-slate-600">Overview of dosages for {productBrandName}</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Product Dosages</CardTitle>
            <CardDescription>Dosages and units for this brand</CardDescription>
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <div className="relative min-w-[150px] flex-1">
              <input
                className="w-full rounded-lg border py-2 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  updateUrlParams({ q: e.target.value || undefined });
                }}
                placeholder="Search dosages..."
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
            if (isLoading) return <p>Loading product dosages...</p>;
            if (filtered?.length === 0) {
              return (
                <p className="text-center text-gray-500">No product dosages found.</p>
              );
            }
            const filteredList = filtered.filter((d) =>
              ((d.productBrandName || d.commodityTypeName) || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredList.map((d) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={d.id}
                  >
                            <CardHeader className="pb-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <CardTitle className="text-lg">{d.commodityTypeName ?? '—'}</CardTitle>
                                  <CardDescription className="mt-1 text-xs">
                                    Dosage: {d.dosage ?? '—'} {d.unit ?? ''}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="flex-1">
                              <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <Button onClick={() => handleEdit(d)} size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button onClick={() => handleDelete(d)} size="sm" variant="destructive">
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

      <CreateProductDosageForm
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

      <EditProductDosageForm
        productDosageId={edit ?? null}
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, edit: undefined }),
            });
          }
        }}
        open={Boolean(edit)}
      />

      <DeleteProductDosageForm
        productDosage={currentDeleteDosage}
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, delete: undefined }),
            });
          }
        }}
        onDelete={() => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteDosage(null);
        }}
        open={Boolean(deleteParam)}
      />
    </div>
  );
}
