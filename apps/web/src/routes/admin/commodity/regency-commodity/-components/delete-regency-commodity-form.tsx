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

export function DeleteRegencyCommodityForm({
  open,
  onOpenChange,
  regencyCommodity,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regencyCommodity: {
    id: string;
    regencyId: string;
    commodityTypeId: string;
  } | null;
  onDelete: (regencyCommodityId: string) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<
      ReturnType<typeof orpc.admin.commodity.regency_commodity.delete.call>
    >,
    Error,
    Parameters<typeof orpc.admin.commodity.regency_commodity.delete.call>[0]
  >({
    mutationFn: (regencyCommodityData) =>
      orpc.admin.commodity.regency_commodity.delete.call(regencyCommodityData),
    onError: (error) => {
      toast.error(
        `Failed to delete regency commodity. Please try again. ${error.message}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.commodity.regency_commodity.get.queryKey({
          input: {},
        }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this regency commodity?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              try {
                if (regencyCommodity) {
                  await deleteMutation.mutateAsync({ id: regencyCommodity.id });
                  toast.success('Regency commodity deleted successfully!');
                  onDelete(regencyCommodity.id);
                  onOpenChange(false);
                }
              } catch (error) {
                toast.error(
                  `Failed to delete regency commodity: ${(error as Error).message}`
                );
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
