import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { orpc } from '@/lib/orpc/client';
import { useAppForm } from '../-hooks/form';

export function EditLandTypeForm({
  open,
  onOpenChange,
  landTypeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landTypeId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: landTypes } = useQuery(
    orpc.admin.land.land_type.get.queryOptions({ input: {} })
  );
  const currentLandType = landTypes?.data.find((lt) => lt.id === landTypeId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.land.land_type.update.call>>,
    Error,
    Parameters<typeof orpc.admin.land.land_type.update.call>[0]
  >({
    mutationFn: (landTypeData) =>
      orpc.admin.land.land_type.update.call(landTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.land.land_type.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: currentLandType?.name ?? '',
    },
    validators: {
      onBlur: () => {
        const errors = {
          fields: {},
        } as {
          fields: Record<string, string>;
        };

        return errors;
      },
    },
    onSubmit: async ({ value }) => {
      try {
        await updateMutation.mutateAsync({
          id: currentLandType?.id as string,
          name: value.name,
        });
        toast.success('Land type updated successfully!');
        onOpenChange(false);
      } catch (_error) {
        toast.error('Failed to update land type. Please try again.');
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Edit Land Type</DialogTitle>
        <DialogDescription>Edit the land type</DialogDescription>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Name is required (ex. Hortikultura)';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Land Type Name"
                  placeholder="ex. Hortikultura"
                />
              )}
            </form.AppField>

            <div className="mt-7 flex justify-end">
              <form.AppForm>
                <form.subscribeButton label="Create" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
