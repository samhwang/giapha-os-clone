import { createFormHook, createFormHookContexts } from '@tanstack/react-form-start';
import AuthField from '../components/AuthField';

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm: useAuthForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    AuthField,
  },
  formComponents: {},
});
