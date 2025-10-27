import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { orpc } from "@/lib/orpc/client";
import { useAppForm } from "../-hooks/form";

export function CreateProvinceForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.province.create.call>>,
    Error,
    Parameters<typeof orpc.admin.region.province.create.call>[0]
  >({
    mutationFn: (provinceData) => orpc.admin.region.province.create.call(provinceData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.province.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      code: "",
      name: "",
      area: "",
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
        const payload = {
          ...value,
          area: Number(value.area),
        };

        await createMutation.mutateAsync(payload);
        toast.success("Province created successfully!");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to create province: ${(error as Error).message}`);
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Province</DialogTitle>
        <DialogDescription>
          Add a new province
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
              name="code"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Code is required";
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Province Code"
                  placeholder="ex. 99"
                />
              )}
            </form.AppField>

            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Name is required (ex. East Java)";
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Province Name"
                  placeholder="ex. East Java"
                />
              )}
            </form.AppField>

            <form.AppField
              name="area"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || isNaN(Number(value)) || Number(value) <= 0) {
                    return "Area is required and must be greater than 0";
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField 
                  label="Area"
                  placeholder="ex. 100000"
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
  );
}
