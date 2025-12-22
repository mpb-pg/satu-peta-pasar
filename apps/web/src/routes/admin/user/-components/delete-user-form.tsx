import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';

type UserItem = {
  id: string;
  name: string | null;
  email: string;
};

export function DeleteUserForm({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => orpc.admin.user.delete.call({ id: userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.user.get.queryKey({ input: {} }),
      });
      toast.success('User deleted successfully!');
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${(error as Error).message}`);
    },
  });

  const handleDelete = () => {
    if (user?.id) {
      deleteMutation.mutate(user.id);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-md">
        <DialogTitle>Delete User</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete this user?
        </DialogDescription>

        <div className="space-y-2">
          <p className="text-sm">
            <strong>Name:</strong> {user?.name}
          </p>
          <p className="text-sm">
            <strong>Email:</strong> {user?.email}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            className="rounded-md border px-4 py-2 hover:bg-gray-100"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50"
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
            type="button"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
