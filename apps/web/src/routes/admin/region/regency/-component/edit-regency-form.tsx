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

export function EditRegencyForm({
  open,
  onOpenChange,
  regencyId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regencyId: string | null;
}) {
  const queryClient = useQueryClient();

  const { data: provinces } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );

  const { data: regency } = useQuery(
    orpc.admin.region.regency.get.queryOptions({ input: {} })
  );
  const currentRegency = regency?.data.find((r) => r.id === regencyId);

  const updateMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.regency.update.call>>,
    Error,
    Parameters<typeof orpc.admin.region.regency.update.call>[0]
  >({
    mutationFn: (regencyData) => orpc.admin.region.regency.update.call(regencyData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.regency.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      // Use empty-string fallbacks so inputs remain controlled for the
      // lifetime of the component (avoids controlled -> uncontrolled warning)
      code: currentRegency?.code ?? '',
      name: currentRegency?.name ?? '',
      area: currentRegency?.area ?? '',
      provinceId: currentRegency?.provinceId ?? '',
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
          id: currentRegency?.id as string,
          name: value.name,
          // Convert area string back to number, but keep undefined when empty
          area: value.area !== '' && value.area != null ? Number(value.area) : undefined,
          provinceId: value.provinceId,
        });
        toast.success("Province updated successfully!");
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to update regency: ${(error as Error).message}`);
      }
    },
  });

  useEffect(() => {
    if (open && currentRegency) {
      form.setFieldValue("code", currentRegency.code ?? '');
      form.setFieldValue("name", currentRegency.name ?? '');
      form.setFieldValue("area", currentRegency.area ?? '');
      form.setFieldValue("provinceId", currentRegency.provinceId ?? '');
    }
  }, [open, currentRegency, form]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Update Regency</DialogTitle>
        <DialogDescription>
          Update the regency
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
                  label="Regency Code"
                  // Ensure value is always a string to keep input controlled
                  value={currentRegency?.code ?? ''}
                />
              )}
            </form.AppField>

            <form.AppField
              name="provinceId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Province is required";
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.selectField
                  label="Province"
                  placeholder="Select a province"
                  values={
                    provinces?.data.map((prov) => ({ 
                        value: prov.id, 
                        label: prov.name 
                      })) || []
                  }
                />
              )}
            </form.AppField>

            <form.AppField
              name="name"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return "Name is required (ex. Gresik)";
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField
                  label="Regency Name"
                  placeholder="ex. Gresik"
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

            <div />

            <div className="flex justify-end">
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
