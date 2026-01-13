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
import { useAppForm } from '../../-hooks/form';

export function EditProductBrandForm({
  open,
  onOpenChange,
  productBrandId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productBrandId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: productBrands } = useQuery(
    orpc.admin.product.product_brand.get.queryOptions({ input: {} })
  );
  const { data: productTypes } = useQuery(
    orpc.admin.product.product_type.get.queryOptions({ input: {} })
  );

  const current = productBrands?.data.find((b) => b.id === productBrandId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_brand.update.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_brand.update.call>[0]
  >({
    mutationFn: (payload) => orpc.admin.product.product_brand.update.call(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_brand.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      productTypeId: current?.productTypeId ?? '',
      name: current?.name ?? '',
      industry: current?.industry ?? '',
      description: current?.description ?? '',
    },
    validators: { onBlur: () => ({ fields: {} } as any) },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: current?.id as string,
          name: value.name,
          industry: value.industry,
          description: value.description,
        });
        toast.success('Product brand updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update product brand. Please try again.');
      }
    },
  });

  useEffect(() => {
    form.setFieldValue('productTypeId', current?.productTypeId ?? '');
    form.setFieldValue('name', current?.name ?? '');
    form.setFieldValue('industry', current?.industry ?? '');
    form.setFieldValue('description', current?.description ?? '');
  }, [open, current, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Edit Product Brand</DialogTitle>
        <DialogDescription>Edit the product brand</DialogDescription>

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
              name="productTypeId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) return 'Product type is required';
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Product Type"
                  placeholder="Select a product type"
                  values={
                    productTypes?.data.map((pt) => ({ label: pt.name, value: pt.id })) || []
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) return 'Name is required';
                },
              }}
            >
              {(field) => <field.textField label="Brand Name" placeholder="ex. Urea Co" />}
            </form.AppField>

            <form.AppField name="industry">
              {(field) => <field.textField label="Industry" placeholder="ex. Fertilizer" />}
            </form.AppField>

            <form.AppField name="description">
              {(field) => <field.textArea label="Description" placeholder="Optional description" />}
            </form.AppField>

            <div></div>
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
