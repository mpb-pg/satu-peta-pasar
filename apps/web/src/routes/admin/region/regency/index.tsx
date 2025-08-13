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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { orpc } from '@/lib/orpc/client';
import { CreateRegencyForm } from './-components/create-regency-form';
import { DeleteRegencyForm } from './-components/delete-regency-form';
import { EditRegencyForm } from './-components/edit-regency-form';

type RegencyListItem = {
  id: string;
  code: string;
  name: string;
  provinceId: string | null;
  area: number | null;
};

export const Route = createFileRoute('/admin/region/regency/')({
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
  const [currentDeleteRegency, setCurrentDeleteRegency] =
    useState<RegencyListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string>('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

  const { data: regencies, isLoading } = useQuery(
    orpc.admin.region.regency.get.queryOptions({ input: {} })
  );

  const { data: provinces } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );
  const getProvinceNameById = (id: string) => {
    const province = provinces?.data.find((p) => p.id === id);
    return province ? province.name || province.code : 'Unknown Province';
  };

  let regenciesList =
    regencies?.data.filter((regency) =>
      regency.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];
  if (selectedProvince) {
    regenciesList = regenciesList.filter(
      (regency) => regency.provinceId === selectedProvince
    );
  }

  useEffect(() => {
    if (deleteParam && regencies) {
      const regency = regencies?.data?.find((r) => r.id === deleteParam);
      if (regency) {
        setCurrentDeleteRegency(regency);
      }
    }
  }, [deleteParam, regencies]);

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

  const handleEdit = (regency: RegencyListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        edit: regency.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (regency: RegencyListItem) => {
    navigate({
      to: '.',
      search: (prev) => ({
        ...prev,
        delete: regency.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Regency</h1>
        <p className="text-slate-600">Create and manage regencies</p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Regency List</CardTitle>
            <CardDescription>
              Manage and organize your regencies
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
                placeholder="Search provinces..."
                type="text"
                value={searchTerm}
              />
              <Search className="absolute top-2.5 left-3 h-4 w-4" />
            </div>

            <Select
              onValueChange={(value) => {
                setSelectedProvince(value);
                updateUrlParams({ province: value || undefined });
              }}
              value={selectedProvince}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                {provinces?.data?.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="min-w-[100px]" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoading) {
              return <p>Loading regencies...</p>;
            }
            if (regenciesList.length === 0) {
              return (
                <p className="text-center text-gray-500">No regencies found.</p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {regenciesList.map((regency) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={regency.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {regency.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Area: {regency.area?.toFixed(2) || 'No area'} km²
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <span className="mr-2 text-gray-500">Province:</span>
                          <span className="font-mono text-xs">
                            {getProvinceNameById(regency.provinceId)}
                          </span>
                        </div>
                      </div>
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(regency)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(regency)}
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

      <CreateRegencyForm
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

      <EditRegencyForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: '.',
              search: (prev) => ({ ...prev, edit: undefined }),
            });
          }
        }}
        open={Boolean(edit)}
        regencyId={edit ?? null}
      />

      <DeleteRegencyForm
        onDelete={() => {
          navigate({
            to: '.',
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteRegency(null);
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
        regency={currentDeleteRegency}
      />
    </div>
  );
}
