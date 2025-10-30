import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { orpc } from "@/lib/orpc/client";
import { useAppForm } from "../-hooks/form";

export function EditProvinceForm({
  open,
  onOpenChange,
  provinceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provinceId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: provinces } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );
  const currentProvince = provinces?.data.find((p) => p.id === provinceId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.province.update.call>>,
    Error,
    Parameters<typeof orpc.admin.region.province.update.call>[0]
  >({
    mutationFn: (provinceData) => orpc.admin.region.province.update.call(provinceData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.province.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      // Use empty-string fallbacks so inputs remain controlled for the
      // lifetime of the component (avoids controlled -> uncontrolled warning)
      code: currentProvince?.code ?? '',
      name: currentProvince?.name ?? '',
      // area input is a text input; normalize to empty string when absent
      area: currentProvince?.area ?? '',
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
          id: currentProvince?.id as string,
          name: value.name,
          // Convert area string back to number, but keep undefined when empty
          area: value.area !== '' && value.area != null ? Number(value.area) : undefined,
        });
        toast.success("Province updated successfully!");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to update tag group: ${(error as Error).message}`);
      }
    },
  });

  useEffect(() => {
    if (open && currentProvince) {
      form.setFieldValue("code", currentProvince.code ?? '');
      form.setFieldValue("name", currentProvince.name ?? '');
      form.setFieldValue("area", currentProvince.area ?? '');
    }
  }, [open, currentProvince, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Update Province</DialogTitle>
        <DialogDescription>
          Update the province
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
                <field.readOnlyField
                  label="Province Code"
                  // Ensure value is always a string to keep input controlled
                  value={currentProvince?.code ?? ''}
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
                  if (!value) {
                    return "Area is required";
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
                <form.subscribeButton label="Update" />
              </form.AppForm>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
