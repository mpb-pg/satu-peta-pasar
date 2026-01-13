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

export function DeleteProductDosageForm({
  open,
  onOpenChange,
  productDosage,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productDosage: { id: string; productBrandName?: string } | null;
  onDelete: (id: string) => void;
}) {
  const queryClient = useQueryClient();

  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.product.product_dosage.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.product.product_dosage.delete.call>[0]
  >({
    mutationFn: (payload) => orpc.admin.product.product_dosage.delete.call(payload),
    onError: () => {
      toast.error('Failed to delete product dosage. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.product.product_dosage.get.queryKey({ input: {} }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Are you sure you want to delete this product dosage?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Product Brand:</strong> {productDosage?.productBrandName}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (productDosage) {
                  await deleteMutation.mutateAsync({ id: productDosage.id });
                  toast.success('Product dosage deleted successfully!');
                  onDelete(productDosage.id);
                  onOpenChange(false);
                }
              } catch (_error) {
                toast.error('Failed to delete product dosage. Please try again.');
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
