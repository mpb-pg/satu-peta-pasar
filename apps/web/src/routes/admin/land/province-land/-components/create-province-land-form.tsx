import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useAppForm } from '../-hooks/form';

export function CreateProvinceLandForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: provinces } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.land.province_land.create.call>>,
    Error,
    Parameters<typeof orpc.admin.land.province_land.create.call>[0]
  >({
    mutationFn: (provinceLandData) =>
      orpc.admin.land.province_land.create.call(provinceLandData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.land.province_land.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      provinceId: '',
      landTypeId: '',
      area: 0,
    },
    validators: {
      onBlur: () => {
        const errors = {
          fields: {},
        } as {
          fields: Record<string, string>;
        };

        return errors;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          ...value,
          area: Number(value.area),
        });
        toast.success('Province land created successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to create province land.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create Province Land</DialogTitle>
        <DialogDescription>Add a new province land</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid-col-1 grid gap-4 md:grid-cols-2">
            <form.AppField
              name="provinceId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Province is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Province"
                  placeholder="Select a province"
                  values={
                    provinces?.data?.map((prov) => ({
                      label: prov.name,
                      value: prov.id,
                    })) || []
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="landTypeId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Land type is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Land Type"
                  placeholder="Select a land type"
                  values={
                    landTypes?.data?.map((lt) => ({
                      label: lt.name,
                      value: lt.id,
                    })) || []
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="area"
              validators={{
                onBlur: ({ value }) => {
                  if (Number.isNaN(Number(value)) || Number(value) < 0) {
                    return 'Area must be a non-negative number';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Area (km²)"
                  placeholder="Enter area in square kilometers"
                />
              )}
            </form.AppField>

            <div className="flex justify-end">
              <form.AppForm>
                <form.subscribeButton label="Create" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
