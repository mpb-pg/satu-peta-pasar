import { createFormHook } from "@tanstack/react-form";

import {
  SubscribeButton as subscribeButton,
  TextField as textField,
} from "@/routes/admin/region/province/-components/form-components";
import {
  fieldContext,
  formContext,
} from "@/routes/admin/region/province/-hooks/form-context";

export const { useAppForm } = createFormHook({
  fieldComponents: {
    textField,
  },
  formComponents: {
    subscribeButton,
  },
  fieldContext,
  formContext,
});
