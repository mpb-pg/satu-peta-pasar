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

export function EditProductTypeForm({
  open,
  onOpenChange,
  productTypeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productTypeId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: productTypes } = useQuery(
    orpc.admin.product.product_type.get.queryOptions({ input: {} })
  );
  const current = productTypes?.data.find((p) => p.id === productTypeId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_type.update.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_type.update.call>[0]
  >({
    mutationFn: (productTypeData) =>
      orpc.admin.product.product_type.update.call(productTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_type.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: current?.name ?? '',
      description: current?.description ?? '',
    },
    validators: {
      onBlur: () => {
        const errors = { fields: {} } as { fields: Record<string, string> };
        return errors;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: current?.id as string,
          name: value.name,
          description: value.description,
        });
        toast.success('Product type updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update product type. Please try again.');
      }
    },
  });

  useEffect(() => {
    form.setFieldValue('name', current?.name ?? '');
    form.setFieldValue('description', current?.description ?? '');
  }, [open, current, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Edit Product Type</DialogTitle>
        <DialogDescription>Edit the product type</DialogDescription>

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
                    return 'Name is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Product Type Name"
                  placeholder="ex. Fertilizer"
                />
              )}
            </form.AppField>

            <form.AppField name="description">
              {(field) => (
                <field.textArea
                  label="Description"
                  placeholder="Optional description"
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
