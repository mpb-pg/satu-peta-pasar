import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';

export function DeleteProductTypeForm({
  open,
  onOpenChange,
  productType,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productType: { id: string; name: string } | null;
  onDelete: (productTypeId: string) => void;
}) {
  const queryClient = useQueryClient();

  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_type.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_type.delete.call>[0]
  >({
    mutationFn: (productTypeData) =>
      orpc.admin.product.product_type.delete.call(productTypeData),
    onError: () => {
      toast.error('Failed to delete product type. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_type.get.queryKey({ input: {} }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this product type?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Product Type Name:</strong> {productType?.name}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (productType) {
                  await deleteMutation.mutateAsync({ id: productType.id });
                  toast.success('Product type deleted successfully!');
                  onDelete(productType.id);
                  onOpenChange(false);
                }
              } catch (_error) {
                toast.error('Failed to delete product type. Please try again.');
              }
            }}
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
