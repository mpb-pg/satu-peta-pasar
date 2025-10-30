import { createFormHook } from "@tanstack/react-form";

import {
  SubscribeButton as subscribeButton,
  TextField as textField,
  SelectForm as selectField,
} from "@/routes/admin/-components/form-components";
import {
  fieldContext,
  formContext,
} from "@/routes/admin/-hooks/form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    textField,
    selectField,
  },
  formComponents: {
    subscribeButton,
  },
  fieldContext,
  formContext,
});
