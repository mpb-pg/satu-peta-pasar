import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useUserForm } from '../-hooks/form';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EditUserForm({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: users } = useQuery(
    orpc.admin.user.get.queryOptions({ input: {} })
  );
  const currentUser = users?.data.find((u) => u.id === userId);

  const currentRole = currentUser?.role ?? 'guest';

  const updateUserMutation = useMutation({
    mutationFn: (userData: {
      id: string;
      name?: string;
      email?: string;
      role?: 'admin' | 'viewer' | 'guest';
    }) => orpc.admin.user.update.call(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.user.get.queryKey({ input: {} }),
      });
    },
  });

  const form = useUserForm({
    defaultValues: {
      name: currentUser?.name ?? '',
      email: currentUser?.email ?? '',
      role: currentRole,
    },
    onSubmit: async ({ value }) => {
      if (!currentUser?.id) {
        return;
      }

      try {
        await updateUserMutation.mutateAsync({
          id: currentUser.id,
          name: value.name,
          email: value.email,
          role: value.role as 'admin' | 'viewer' | 'guest',
        });

        toast.success('User updated successfully!');
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to update user: ${(error as Error).message}`);
      }
    },
  });

  useEffect(() => {
    if (open && currentUser && currentRole) {
      form.setFieldValue('name', currentUser.name ?? '');
      form.setFieldValue('email', currentUser.email ?? '');
      form.setFieldValue('role', currentRole);
    }
  }, [open, currentUser, currentRole, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Update User</DialogTitle>
        <DialogDescription>Update user information and role</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-4">
            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Name is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField label="Name" placeholder="Enter user name" />
              )}
            </form.AppField>

            <form.AppField
              name="email"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Email is required';
                  }
                  if (!EMAIL_REGEX.test(value)) {
                    return 'Invalid email format';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField label="Email" placeholder="user@example.com" />
              )}
            </form.AppField>

            <form.AppField
              name="role"
              validators={{
                onBlur: ({ value }) => {
                  if (!value) {
                    return 'Role is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Role"
                  values={[
                    { value: 'guest', label: 'Guest' },
                    { value: 'viewer', label: 'Viewer' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                />
              )}
            </form.AppField>
          </div>

          <form.Subscribe selector={(state) => [state.canSubmit]}>
            {([canSubmit]) => (
              <div className="flex justify-end gap-2">
                <button
                  className="rounded-md border px-4 py-2 hover:bg-gray-100"
                  onClick={() => onOpenChange(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={!canSubmit}
                  type="submit"
                >
                  Update User
                </button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
