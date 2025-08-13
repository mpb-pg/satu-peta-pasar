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

export function CreateRegencyForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: provinces } = useQuery(
    orpc.admin.region.province.get.queryOptions({ input: {} })
  );

  const createMutation = useMutation<
    Awaited<ReturnType<typeof orpc.admin.region.regency.create.call>>,
    Error,
    Parameters<typeof orpc.admin.region.regency.create.call>[0]
  >({
    mutationFn: (regencyData) =>
      orpc.admin.region.regency.create.call(regencyData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.admin.region.regency.get.queryKey({ input: {} }),
      });
    },
  });

  const toast = useToast();
  const form = useAppForm({
    defaultValues: {
      code: '',
      name: '',
      area: '',
      provinceId: '',
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
        toast.success('Regency created successfully!');
        onOpenChange(false);
        form.reset();
      } catch (error) {
        toast.error(`Failed to create regency: ${(error as Error).message}`);
      }
    },
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogTitle>Create New Regency</DialogTitle>
        <DialogDescription>Add a new regency</DialogDescription>

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
                    return 'Code is required';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField label="Regency Code" placeholder="ex. 99.99" />
              )}
            </form.AppField>

            <form.AppField
              name="provinceId"
              validators={{
                onBlur: ({ value }) => {
                  if (!value || value.trim().length === 0) {
                    return 'Province is required';
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
                    provinces?.data?.map((prov) => ({
                      label: prov.name,
                      value: prov.id,
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
                    return 'Name is required (ex. Gresik)';
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
                  if (
                    !value ||
                    Number.isNaN(Number(value)) ||
                    Number(value) <= 0
                  ) {
                    return 'Area is required and must be greater than 0';
                  }
                  return;
                },
              }}
            >
              {(field) => (
                <field.textField label="Area" placeholder="ex. 100000" />
              )}
            </form.AppField>

            <div />

            <div className="flex justify-end">
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
