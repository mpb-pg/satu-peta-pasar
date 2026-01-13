import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useAppForm } from '../-hooks/form';

export function CreateProductTypeForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_type.create.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_type.create.call>[0]
  >({
    mutationFn: (productTypeData) =>
      orpc.admin.product.product_type.create.call(productTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_type.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: '',
      description: '',
    },
    validators: {
      onBlur: () => {
        const errors = { fields: {} } as { fields: Record<string, string> };
        return errors;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          name: value.name,
          description: value.description,
        });
        toast.success('Product type created successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to create product type. Please try again.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Product Type</DialogTitle>
        <DialogDescription>Add a new product type</DialogDescription>

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
                <form.subscribeButton label="Create" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
