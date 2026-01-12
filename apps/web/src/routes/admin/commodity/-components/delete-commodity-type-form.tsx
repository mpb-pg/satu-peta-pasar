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

export function DeleteCommodityTypeForm({
  open,
  onOpenChange,
  commodityType,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commodityType: { id: string; name: string } | null;
  onDelete: (commodityTypeId: string) => void;
}) {
  const queryClient = useQueryClient();

  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.commodity.commodity_type.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.commodity.commodity_type.delete.call>[0]
  >({
    mutationFn: (commodityTypeData) =>
      orpc.admin.commodity.commodity_type.delete.call(commodityTypeData),
    onError: () => {
      toast.error('Failed to delete commodity type. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.commodity_type.get.queryKey({ input: {} }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this commodity type?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Commodity Type Name:</strong> {commodityType?.name}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (commodityType) {
                  await deleteMutation.mutateAsync({ id: commodityType.id });
                  toast.success('Commodity type deleted successfully!');
                  onDelete(commodityType.id);
                  onOpenChange(false);
                }
              } catch (_error) {
                toast.error('Failed to delete commodity type. Please try again.');
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
