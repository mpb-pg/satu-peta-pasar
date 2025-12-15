import { createFormHook } from '@tanstack/react-form';

import {
  ReadOnlyField as readOnlyField,
  SelectForm as selectField,
  SubscribeButton as subscribeButton,
  Switch as switchField,
  TextArea as textArea,
  TextField as textField,
} from '@/routes/admin/-components/form-components';
import { fieldContext, formContext } from '@/routes/admin/-hooks/form-context';

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
