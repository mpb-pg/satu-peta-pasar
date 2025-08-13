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

export function DeleteRegencyForm({
  open,
  onOpenChange,
  regency,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regency: { id: string; code: string; name: string } | null;
  onDelete: (tagGroupId: string) => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.regency.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.region.regency.delete.call>[0]
  >({
    mutationFn: (regencyData) =>
      orpc.admin.region.regency.delete.call(regencyData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.regency.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Are you sure you want to delete this regency?</DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Regency Code:</strong> {regency?.code}
          </p>
          <p>
            <strong>Regency Name:</strong> {regency?.name}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              try {
                if (regency) {
                  await deleteMutation.mutateAsync({ id: regency.id });
                  toast.success('Regency deleted successfully!');
                  onDelete(regency.id);
                  onOpenChange(false);
                }
              } catch (error) {
                toast.error(
                  `Failed to delete regency: ${(error as Error).message}`
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
