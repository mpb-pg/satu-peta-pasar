import { createFormHook } from '@tanstack/react-form';

import {
  SelectForm as selectField,
  SubscribeButton as subscribeButton,
  TextField as textField,
} from '@/routes/admin/-components/form-components';
import { fieldContext, formContext } from '@/routes/admin/-hooks/form-context';

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
