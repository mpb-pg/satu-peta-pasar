import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { orpc } from '@/lib/orpc/client'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { Edit, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import { CreateProvinceForm } from './-component/create-province-form'
import { EditProvinceForm } from './-component/edit-province-form'
import { DeleteProvinceForm } from './-component/delete-province-form'

type ProvinceListItem = {
  id: string
  code: string
  name: string
  area: number | null
}

export const Route = createFileRoute('/admin/region/province/')({
  component: RouteComponent,
  validateSearch: (
    z.object({
      q: z.string().optional(),
      create: z.string().optional(),
      edit: z.string().optional(),
      delete: z.string().optional(),
    })
  ).parse,
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const { create, edit, delete: deleteParam } = search;
  const [currentDeleteProvince, setCurrentDeleteProvince] = useState<ProvinceListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

  const { data: provinces, isLoading } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  )
  const provincesList = (
    provinces?.data.filter((province) =>
      province.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []
  )

    useEffect(() => {
    if (deleteParam && provinces) {
      const province = provinces?.data?.find((p) => p.id === deleteParam);
      if (province) {
        setCurrentDeleteProvince(province);
      }
    }
  }, [deleteParam, provinces]);

  const handleCreate = () => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        create: "true",
        edit: undefined,
        delete: undefined,
      }),
    });
  };

  const handleEdit = (province: ProvinceListItem) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        edit: province.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (province: ProvinceListItem) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        delete: province.id,
        create: undefined,
        edit: undefined,
      }),
    });
  };

  // return <div>Hello "/admin/province/"!</div>
  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div className="text-left">
        <h1 className="font-bold text-3xl">Manage Provinces</h1>
        <p className="text-slate-600">
          Create and manage provinces
        </p>
      </div>
      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <CardTitle>Province List</CardTitle>
            <CardDescription>
              Manage and organize your provinces
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

            <Button className="min-w-[100px]" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(() => {
            if (isLoading) {
              return <p>Loading provinces...</p>;
            }
            if (provincesList.length === 0) {
              return (
                <p className="text-center text-gray-500">
                  No provinces found.
                </p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {provincesList.map((province) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={province.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {province.name}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Area: {province.area?.toFixed(2) || "No area"} km²
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(province)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(province)}
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


      <CreateProvinceForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, create: undefined }),
            });
          }
        }}
        open={Boolean(create)}
      />

      <EditProvinceForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, edit: undefined }),
            });
          }
        }}
        open={Boolean(edit)}
        provinceId={edit ?? null}
      />

      <DeleteProvinceForm
        onDelete={() => {
          navigate({
            to: ".",
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteProvince(null);
        }}
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, delete: undefined }),
            });
          }
        }}
        open={Boolean(deleteParam)}
        province={currentDeleteProvince}
      />
    </div>
  );
}
