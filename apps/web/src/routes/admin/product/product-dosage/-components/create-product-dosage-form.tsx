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

export function CreateProductDosageForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: commodityTypes } = useQuery(
    orpc.admin.commodity.commodity_type.get.queryOptions({ input: {} })
  );
  const { data: productBrands } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_dosage.create.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_dosage.create.call>[0]
  >({
    mutationFn: (payload) => orpc.admin.product.product_dosage.create.call(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_dosage.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      commodityTypeId: '',
      productBrandId: '',
      dosage: 0,
      unit: '',
    },
    validators: { onBlur: () => ({ fields: {} } as any) },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          commodityTypeId: value.commodityTypeId,
          productBrandId: value.productBrandId,
          dosage: Number(value.dosage),
          unit: value.unit,
        });
        toast.success('Product dosage created successfully!');
        onOpenChange(false);
      } catch (e) {
        toast.error('Failed to create product dosage. Please try again.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Product Dosage</DialogTitle>
        <DialogDescription>Add dosage for a product brand and commodity</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.AppField name="commodityTypeId">
              {(field) => (
                <field.selectField
                  label="Commodity Type"
                  placeholder="Select commodity type"
                  values={commodityTypes?.data.map((c) => ({ label: c.name, value: c.id })) || []}
                />
              )}
            </form.AppField>

            <form.AppField name="productBrandId">
              {(field) => (
                <field.selectField
                  label="Product Brand"
                  placeholder="Select product brand"
                  values={productBrands?.data.map((b) => ({ label: b.name, value: b.id })) || []}
                />
              )}
            </form.AppField>

            <form.AppField name="dosage">
              {(field) => (
                <field.textField label="Dosage" placeholder="e.g. 50" />
              )}
            </form.AppField>

            <form.AppField name="unit">
              {(field) => <field.textField label="Unit" placeholder="e.g. kg/ha" />}
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
