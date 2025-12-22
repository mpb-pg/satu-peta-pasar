import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export function CreateUserForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: (userData: { name: string; email: string; role: string }) =>
      orpc.admin.user.update.call({
        name: userData.name,
        email: userData.email,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.user.get.queryKey({ input: {} }),
      });
    },
  });

  const form = useUserForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'guest',
    },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
        toast.success('User created successfully!');
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to create user: ${(error as Error).message}`);
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>Add a new user to the system</DialogDescription>

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
                <field.textField
                  label="Email"
                  placeholder="user@example.com"
                  type="email"
                />
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
                    { label: 'Guest', value: 'guest' },
                    { label: 'Viewer', value: 'viewer' },
                    { label: 'Admin', value: 'admin' },
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
                  Create User
                </button>
              </div>
            )}
          </form.Subscribe>
        </form>
      </DialogContent>
    </Dialog>
  );
}
