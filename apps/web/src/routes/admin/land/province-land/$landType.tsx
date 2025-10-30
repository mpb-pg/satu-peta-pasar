import { createFileRoute } from '@tanstack/react-router'
import { orpc } from '@/lib/orpc/client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { Edit, Plus, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import z from 'zod'
import { CreateProvinceLandForm } from './-components/create-province-land-form'
import { EditProvinceLandForm } from './-components/edit-province-land-form'
import { DeleteProvinceLandForm } from './-components/delete-province-land-form'

type ProvinceLandListItem = {
  id: string
  provinceId: string
  landTypeId: string
  area: number | null
}

export const Route = createFileRoute('/admin/land/province-land/$landType')({
  component: RouteComponent,
  validateSearch: (
    z.object({
      q: z.string().optional(),
      create: z.string().optional(),
      edit: z.string().optional(),
      delete: z.string().optional(),
    })
  )
})

function RouteComponent() {
  const params = Route.useParams()
  const landTypeIdSlug = params.landType as string | undefined

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  )

  const { data: provinces, isLoading } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  )

  const { data: provinceLands } = useQuery(
    orpc.admin.land.province_land.get.queryOptions({ input: {} })
  )
  const filteredProvinceLands = provinceLands?.data.filter(
    (pl) => pl.landTypeId === landTypeIdSlug
  );
  const landTypeName = landTypes?.data.find((lt) => lt.id === landTypeIdSlug)?.name || 'Unknown';

  const navigate = Route.useNavigate()
  const search = Route.useSearch()

  const { create, edit, delete: deleteParam } = search;
  const [currentDeleteProvinceLand, setCurrentDeleteProvinceLand] = useState<ProvinceLandListItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setSearchTerm(search.q || '');
  }, [search]);

  useEffect(() => {
    if (deleteParam  && provinceLands) {
      const pl = provinceLands.data.find((pl) => pl.id === deleteParam);
      if (pl) {
          setCurrentDeleteProvinceLand(pl);
      }
    }
  }, [deleteParam, provinceLands]);

  const updateUrlParams = (params: Record<string, string | undefined>) => {
    navigate({ to: '.', search: (prev) => ({ ...prev, ...params }) });
  };

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

  const handleEdit = (provinceLand: ProvinceLandListItem) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        edit: provinceLand.id,
        create: undefined,
        delete: undefined,
      }),
    });
  };

  const handleDelete = (provinceLand: ProvinceLandListItem) => {
    navigate({
      to: ".",
      search: (prev) => ({
        ...prev,
        delete: provinceLand.id,
        create: undefined,
        edit: undefined,
      }),
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-left mb-4">
        <h1 className="font-bold text-3xl">{landTypeName} area by Province</h1>
        <p className="text-slate-600">Overview of provinces and their {landTypeName} areas</p>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Province Land Area</CardTitle>
            <CardDescription>Provinces and {landTypeName} areas</CardDescription>
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
              return <p>Loading province lands...</p>;
            }
            if (filteredProvinceLands?.length === 0) {
              return (
                <p className="text-center text-gray-500">
                  No province lands found.
                </p>
              );
            }
            return (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProvinceLands?.map((provinceLand) => (
                  <Card
                    className="group relative flex flex-col overflow-hidden"
                    key={provinceLand.id}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {provinceLand.provinceName}
                          </CardTitle>
                          <CardDescription className="mt-1 text-xs">
                            Area: {provinceLand.area?.toFixed(2) || "No area"} km²
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1">
                      <div className="absolute right-4 bottom-4 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button
                          onClick={() => handleEdit(provinceLand)}
                          size="sm"
                          variant="outline"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(provinceLand)}
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

      <CreateProvinceLandForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, create: undefined}),
            });
          }
        }}
        open={Boolean(create)}
      />

      <EditProvinceLandForm
        onOpenChange={(open) => {
          if (!open) {
            navigate({
              to: ".",
              search: (prev) => ({ ...prev, edit: undefined }),
            });
          }
        }}
        open={Boolean(edit)}
        landTypeId={edit ?? null}
      />

      <DeleteProvinceLandForm
        onDelete={() => {
          navigate({
            to: ".",
            search: (prev) => ({ ...prev, delete: undefined }),
          });
          setCurrentDeleteProvinceLand(null);
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
        provinceLand={currentDeleteProvinceLand}
      />
    </div>
  );
}
