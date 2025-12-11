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

export function DeleteLandTypeForm({
  open,
  onOpenChange,
  landType,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landType: { id: string; name: string } | null;
  onDelete: (landTypeId: string) => void;
}) {
  const queryClient = useQueryClient();

  const toast = useToast();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.land.land_type.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.land.land_type.delete.call>[0]
  >({
    mutationFn: (landTypeData) =>
      orpc.admin.land.land_type.delete.call(landTypeData),
    onError: () => {
      toast.error('Failed to delete land type. Please try again.');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.land.land_type.get.queryKey({ input: {} }),
      });
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this land type?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Land Type Name:</strong> {landType?.name}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                if (landType) {
                  await deleteMutation.mutateAsync({ id: landType.id });
                  toast.success('Land type deleted successfully!');
                  onDelete(landType.id);
                  onOpenChange(false);
                }
              } catch (_error) {
                toast.error('Failed to delete land type. Please try again.');
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
