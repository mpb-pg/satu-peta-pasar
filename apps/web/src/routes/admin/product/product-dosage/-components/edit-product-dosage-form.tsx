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

export function EditProductDosageForm({
  open,
  onOpenChange,
  productDosageId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productDosageId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: productDosages } = useQuery(
    orpc.admin.product.product_dosage.get.queryOptions({ input: {} })
  );

  const current = productDosages?.data.find((d) => d.id === productDosageId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_dosage.update.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_dosage.update.call>[0]
  >({
    mutationFn: (payload) => orpc.admin.product.product_dosage.update.call(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_dosage.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      commodityTypeId: current?.commodityTypeId ?? '',
      productBrandId: current?.productBrandId ?? '',
      dosage: current?.dosage ?? 0,
      unit: current?.unit ?? '',
    },
    validators: { onBlur: () => ({ fields: {} } as any) },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: current?.id as string,
          dosage: Number(value.dosage),
          unit: value.unit,
        });
        toast.success('Product dosage updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update product dosage. Please try again.');
      }
    },
  });

  useEffect(() => {
    form.setFieldValue('commodityTypeId', current?.commodityTypeId ?? '');
    form.setFieldValue('productBrandId', current?.productBrandId ?? '');
    form.setFieldValue('dosage', current?.dosage ?? 0);
    form.setFieldValue('unit', current?.unit ?? '');
  }, [open, current, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Edit Product Dosage</DialogTitle>
        <DialogDescription>Edit the product dosage</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid-col-1 grid gap-4 md:grid-cols-2">
            <form.AppField name="commodityTypeId">
              {(field) => (
                <field.readOnlyField label="Commodity Type" value={current?.commodityTypeName || ''} />
              )}
            </form.AppField>

            <form.AppField name="productBrandId">
              {(field) => (
                <field.readOnlyField label="Product Brand" value={current?.productBrandName || ''} />
              )}
            </form.AppField>

            <form.AppField name="dosage">
              {(field) => <field.textField label="Dosage" placeholder="e.g. 50" />}
            </form.AppField>

            <form.AppField name="unit">
              {(field) => <field.textField label="Unit" placeholder="e.g. kg/ha" />}
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
