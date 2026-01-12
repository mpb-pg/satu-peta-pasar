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

export function CreateRegencyCommodityForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: regencies } = useQuery(
    orpc.admin.region.regency.get.queryOptions({ input: {} })
  );

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.commodity.regency_commodity.create.call>>,
    Error,
    Parameters<typeof orpc.admin.commodity.regency_commodity.create.call>[0]
  >({
    mutationFn: (regencyCommodityData) =>
      orpc.admin.commodity.regency_commodity.create.call(regencyCommodityData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.regency_commodity.get.queryKey({ input: {} }),
      });
    },
    onError: (error) => {
      console.error('Error creating regency commodity:', error);
    }
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      regencyId: '',
      commodityTypeId: '',
      area: 0,
      year: new Date().getFullYear().toString(),
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
          regencyId: value.regencyId,
          commodityTypeId: value.commodityTypeId,
          area: Number(value.area),
          year: value.year,
        });
        toast.success('Regency commodity created successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to create regency commodity.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create Regency Commodity</DialogTitle>
        <DialogDescription>Add a new regency commodity</DialogDescription>

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
              name="regencyId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Regency is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Regency"
                  placeholder="Select a regency"
                  values={
                    regencies?.data?.map((reg) => ({
                      label: reg.name,
                      value: reg.id,
                    })) || []
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="commodityTypeId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Commodity type is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Commodity Type"
                  placeholder="Select a commodity type"
                  values={
                    commodityTypes?.data?.map((ct) => ({
                      label: ct.name,
                      value: ct.id,
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
                  label="Area (hectares)"
                  placeholder="Enter area"
                />
              )}
            </form.AppField>

            <form.AppField
              name="year"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Year is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Year"
                  placeholder="ex. 2024"
                />
              )}
            </form.AppField>

            <div></div>
            <div className="mt-7 flex justify-end">
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
