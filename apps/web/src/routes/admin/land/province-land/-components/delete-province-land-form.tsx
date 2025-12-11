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

export function DeleteProvinceLandForm({
  open,
  onOpenChange,
  provinceLand,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinceLand: { id: string; provinceId: string; landTypeId: string } | null;
  onDelete: (provinceLandId: string) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.land.province_land.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.land.province_land.delete.call>[0]
  >({
    mutationFn: (provinceLandData) =>
      orpc.admin.land.province_land.delete.call(provinceLandData),
    onError: (error) => {
      toast.error(
        `Failed to delete province land. Please try again. ${error.message}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.land.province_land.get.queryKey({ input: {} }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this province land?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>
        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              try {
                if (provinceLand) {
                  await deleteMutation.mutateAsync({ id: provinceLand.id });
                  toast.success('Province land deleted successfully!');
                  onDelete(provinceLand.id);
                  onOpenChange(false);
                }
              } catch (error) {
                toast.error(
                  `Failed to delete province land: ${(error as Error).message}`
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
