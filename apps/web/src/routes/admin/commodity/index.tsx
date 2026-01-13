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
import { CreateCommodityTypeForm } from './-components/create-commodity-type-form';
import { DeleteCommodityTypeForm } from './-components/delete-commodity-type-form';
import { EditCommodityTypeForm } from './-components/edit-commodity-type-form';

type CommodityListItem = {
  id: string;
  name: string;
};

export const Route = createFileRoute('/admin/commodity/')({
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
  const [currentDeleteCommodityType, setCurrentDeleteCommodityType] =
    useState<CommodityListItem | null>(null);

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

  useEffect(() => {
    if (deleteParam && commodityTypes) {
      const commodityType = commodityTypes?.data?.find(
        (ct) => ct.id === deleteParam
      );
      if (commodityType) {
        setCurrentDeleteCommodityType(commodityType);
      }
    }
  }, [deleteParam, commodityTypes]);

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

  const handleEdit = (commodityType: CommodityListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: commodityType.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (commodityType: CommodityListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: commodityType.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Commodity Types</h1>
        <p className="text-slate-600">Create and manage commodity types</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Commodity Type List</CardTitle>
            <CardDescription>
              Manage and organize your commodity types
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

            <Button className="min-w-[100px]" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
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
                            {commodityType.name}
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(commodityType)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(commodityType)}
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

      <CreateCommodityTypeForm
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

      <EditCommodityTypeForm
        commodityTypeId={edit ?? null}
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

      <DeleteCommodityTypeForm
        commodityType={currentDeleteCommodityType}
        onDelete={() => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteCommodityType(null);
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
      />
    </div>
  );
}
