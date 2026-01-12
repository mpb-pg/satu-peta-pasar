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

export function CreateCommodityTypeForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.commodity.commodity_type.create.call>>,
    Error,
    Parameters<typeof orpc.admin.commodity.commodity_type.create.call>[0]
  >({
    mutationFn: (commodityTypeData) =>
      orpc.admin.commodity.commodity_type.create.call(commodityTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.commodity_type.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: '',
      landTypeId: '',
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
          name: value.name,
          landTypeId: value.landTypeId,
          year: value.year,
        });
        toast.success('Commodity type created successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to create commodity type. Please try again.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Commodity Type</DialogTitle>
        <DialogDescription>Add a new commodity type</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Name is required (ex. Padi)';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Commodity Type Name"
                  placeholder="ex. Padi"
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
                  options={
                    landTypes?.data.map((lt) => ({
                      label: lt.name,
                      value: lt.id,
                    })) || []
                  }
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
