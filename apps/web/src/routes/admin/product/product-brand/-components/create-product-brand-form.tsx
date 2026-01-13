import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useAppForm } from '../../-hooks/form';

export function CreateProductBrandForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: productTypes } = useQuery(
    orpc.admin.product.product_type.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_brand.create.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_brand.create.call>[0]
  >({
    mutationFn: (payload) => orpc.admin.product.product_brand.create.call(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_brand.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      productTypeId: '',
      name: '',
      industry: '',
      description: '',
    },
    validators: { onBlur: () => ({ fields: {} } as any) },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync({
          productTypeId: value.productTypeId,
          name: value.name,
          industry: value.industry,
          description: value.description,
        });
        toast.success('Product brand created successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to create product brand. Please try again.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Product Brand</DialogTitle>
        <DialogDescription>Add a new product brand</DialogDescription>

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
                <form.subscribeButton label="Create" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
