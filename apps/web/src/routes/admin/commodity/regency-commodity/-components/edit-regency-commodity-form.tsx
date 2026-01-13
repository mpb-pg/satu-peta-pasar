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
import { useEffect } from 'react';

export function EditRegencyCommodityForm({
  open,
  onOpenChange,
  regencyCommodityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regencyCommodityId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: regencies } = useQuery(
    orpc.admin.region.regency.get.queryOptions({ input: {} })
  );

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );

  const { data: regencyCommodities } = useQuery(
    orpc.admin.commodity.regency_commodity.get.queryOptions({ input: {} })
  );
  const currentRegencyCommodity = regencyCommodities?.data.find(
    (rc) => rc.id === regencyCommodityId
  );

  const updateMutation = useMutation<
    Awaited<
      ReturnType<typeof orpc.admin.commodity.regency_commodity.update.call>
    >,
    Error,
    Parameters<typeof orpc.admin.commodity.regency_commodity.update.call>[0]
  >({
    mutationFn: (regencyCommodityData) =>
      orpc.admin.commodity.regency_commodity.update.call(regencyCommodityData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.regency_commodity.get.queryKey({
          input: {},
        }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      regencyId: currentRegencyCommodity?.regencyId ?? '',
      commodityTypeId: currentRegencyCommodity?.commodityTypeId ?? '',
      area: currentRegencyCommodity?.area ?? 0,
      year: currentRegencyCommodity?.year ?? '',
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
          id: currentRegencyCommodity?.id as string,
          regencyId: value.regencyId,
          commodityTypeId: value.commodityTypeId,
          area: Number(value.area),
          year: value.year,
        });
        toast.success('Regency commodity updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update regency commodity.');
      }
    },
  });

  useEffect(() => {
    form.setFieldValue('regencyId', currentRegencyCommodity?.regencyId ?? '');
    form.setFieldValue(
      'commodityTypeId',
      currentRegencyCommodity?.commodityTypeId ?? ''
    );
    form.setFieldValue('area', currentRegencyCommodity?.area ?? 0);
    form.setFieldValue('year', currentRegencyCommodity?.year ?? '');
  }, [open, currentRegencyCommodity, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Update Regency Commodity</DialogTitle>
        <DialogDescription>
          Update the regency commodity details
        </DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid-col-1 grid gap-4 md:grid-cols-2">
            <form.AppField name="regencyId">
              {(field) => (
                <field.readOnlyField
                  label="Regency"
                  value={
                    regencies?.data?.find(
                      (reg) => reg.id === currentRegencyCommodity?.regencyId
                    )?.name || ''
                  }
                />
              )}
            </form.AppField>

            <form.AppField name="commodityTypeId">
              {(field) => (
                <field.readOnlyField
                  label="Commodity Type"
                  value={
                    commodityTypes?.data?.find(
                      (ct) => ct.id === currentRegencyCommodity?.commodityTypeId
                    )?.name || ''
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

            <form.AppField name="year">
              {(field) => (
                <field.readOnlyField
                  label="Year"
                  value={currentRegencyCommodity?.year || ''}
                />
              )}
            </form.AppField>

            <div />
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
