import { createFormHook } from "@tanstack/react-form";

import {
  SubscribeButton as subscribeButton,
  TextField as textField,
  SelectForm as selectField,
  TextArea as textArea,
  Switch as switchField,
  ReadOnlyField as readOnlyField,
} from "@/routes/admin/land/regency-land/-components/form-components";
import {
  fieldContext,
  formContext,
} from "@/routes/admin/land/regency-land/-hooks/form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    textField,
    selectField,
    textArea,
    switchField,
    readOnlyField,
  },
  formComponents: {
    subscribeButton,
  },
  fieldContext,
  formContext,
});
