import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useAppForm } from '../-hooks/form';

export function EditCommodityTypeForm({
  open,
  onOpenChange,
  commodityTypeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commodityTypeId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );
  const currentCommodityType = commodityTypes?.data.find(
    (ct) => ct.id === commodityTypeId
  );

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.commodity.commodity_type.update.call>>,
    Error,
    Parameters<typeof orpc.admin.commodity.commodity_type.update.call>[0]
  >({
    mutationFn: (commodityTypeData) =>
      orpc.admin.commodity.commodity_type.update.call(commodityTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.commodity_type.get.queryKey({
          input: {},
        }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: currentCommodityType?.name ?? '',
      landTypeId: currentCommodityType?.landTypeId ?? '',
      year: currentCommodityType?.year ?? '',
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
        await updateMutation.mutateAsync({
          id: currentCommodityType?.id as string,
          name: value.name,
          landTypeId: value.landTypeId,
          year: value.year,
        });
        toast.success('Commodity type updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update commodity type. Please try again.');
      }
    },
  });

  useEffect(() => {
    form.setFieldValue('name', currentCommodityType?.name ?? '');
    form.setFieldValue('landTypeId', currentCommodityType?.landTypeId ?? '');
    form.setFieldValue('year', currentCommodityType?.year ?? '');
  }, [open, currentCommodityType, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Edit Commodity Type</DialogTitle>
        <DialogDescription>Edit the commodity type</DialogDescription>

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
                  values={
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
                <field.textField label="Year" placeholder="ex. 2024" />
              )}
            </form.AppField>

            <div className="mt-7 flex justify-end">
              <form.AppForm>
                <form.subscribeButton label="Update" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
