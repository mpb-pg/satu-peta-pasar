import { useToast } from "@/hooks/use-toast";
import { orpc } from "@/lib/orpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppForm } from "../-hooks/form";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function CreateLandTypeForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
  Awaited<ReturnType<typeof orpc.admin.land.land_type.create.call>>,
  Error,
  Parameters<typeof orpc.admin.land.land_type.create.call>[0]
>({
    mutationFn: (landTypeData) => orpc.admin.land.land_type.create.call(landTypeData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.land.land_type.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      name: "",
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
        await createMutation.mutateAsync(value);
        toast.success("Land type created successfully!");
        onOpenChange(false);
      } catch (error) {
        toast.error("Failed to create land type. Please try again.");
      }
    }
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Land Type</DialogTitle>
        <DialogDescription>
          Add a new land type
        </DialogDescription>

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
                    return "Name is required (ex. Hortikultura)";
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

            <div className="flex justify-end mt-7">
              <form.AppForm>
                <form.subscribeButton label="Create" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}