import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { orpc } from "@/lib/orpc/client";

export function DeleteProvinceForm({
  open,
  onOpenChange,
  province,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  province: { id: string; code: string; name: string } | null;
  onDelete: (tagGroupId: string) => void;
}) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.province.delete.call>>,
    Error,
    Parameters<typeof orpc.admin.region.province.delete.call>[0]
  >({
    mutationFn: (provinceData) => orpc.admin.region.province.delete.call(provinceData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.province.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>
          Are you sure you want to delete this province?
        </DialogTitle>
        <DialogDescription>This action cannot be undone.</DialogDescription>

        <div className="mt-4">
          <p>
            <strong>Province Code:</strong> {province?.code}
          </p>
          <p>
            <strong>Province Name:</strong> {province?.name}
          </p>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button onClick={() => onOpenChange(false)} variant="secondary">
            Cancel
          </Button>

          <Button
            onClick={async () => {
              try {
                if (province) {
                  await deleteMutation.mutateAsync({ id: province.id });
                  toast.success("Province deleted successfully!");
                  onDelete(province.id);
                  onOpenChange(false);
                }
              } catch (error) {
                toast.error(
                  `Failed to delete province: ${(error as Error).message}`
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
