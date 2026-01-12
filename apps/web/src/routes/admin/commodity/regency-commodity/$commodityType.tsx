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
import { CreateRegencyCommodityForm } from './-components/create-regency-commodity-form';
import { DeleteRegencyCommodityForm } from './-components/delete-regency-commodity-form';
import { EditRegencyCommodityForm } from './-components/edit-regency-commodity-form';

type RegencyCommodityListItem = {
  id: string;
  regencyId: string;
  commodityTypeId: string;
  area: number | null;
  year: string;
};

export const Route = createFileRoute('/admin/commodity/regency-commodity/$commodityType')({
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
  const commodityTypeIdSlug = params.commodityType as string | undefined;

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );
  const { data: regencyCommodities, isLoading } = useQuery(
    orpc.admin.commodity.regency_commodity.get.queryOptions({ input: {} })
  );
  const filteredRegencyCommodities = regencyCommodities?.data.filter(
    (rc) => rc.commodityTypeId === commodityTypeIdSlug
  );
  const commodityTypeName =
    commodityTypes?.data.find((ct) => ct.id === commodityTypeIdSlug)?.name || 'Unknown';

  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const { create, edit, delete: deleteParam } = search;
  const [currentDeleteRegencyCommodity, setCurrentDeleteRegencyCommodity] =
    useState<RegencyCommodityListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  useEffect(() => {
    if (deleteParam && regencyCommodities) {
      const rc = regencyCommodities.data.find((rc) => rc.id === deleteParam);
      if (rc) {
        setCurrentDeleteRegencyCommodity(rc);
      }
    }
  }, [deleteParam, regencyCommodities]);

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

  const handleEdit = (regencyCommodity: RegencyCommodityListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: regencyCommodity.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (regencyCommodity: RegencyCommodityListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: regencyCommodity.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4 text-left">
        <h1 className="font-bold text-3xl">{commodityTypeName} area by Regency</h1>
        <p className="text-slate-600">
          Overview of regencies and their {commodityTypeName} areas
        </p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Regency Commodity Area</CardTitle>
            <CardDescription>
              Regencies and {commodityTypeName} areas
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
                placeholder="Search regencies..."
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
              return <p>Loading regency commodities...</p>;
            }
            if (filteredRegencyCommodities?.length === 0) {
              return (
                <p className="text-center text-gray-500">
                  No regency commodities found.
                </p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredRegencyCommodities?.map((regencyCommodity) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={regencyCommodity.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {regencyCommodity.regencyName}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Area: {regencyCommodity.area?.toFixed(2) || 'No area'}{' '}
                            hectares
                          </CardDescription>
                          <CardDescription className="text-xs">
                            Year: {regencyCommodity.year}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(regencyCommodity)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(regencyCommodity)}
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

      <CreateRegencyCommodityForm
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

      <EditRegencyCommodityForm
        regencyCommodityId={edit ?? null}
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

      <DeleteRegencyCommodityForm
        onDelete={() => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteRegencyCommodity(null);
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
        regencyCommodity={currentDeleteRegencyCommodity}
      />
    </div>
  );
}
