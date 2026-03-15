import { createFormHook, createFormHookContexts } from '@tanstack/react-form-start';
import CustomEventField from '../components/CustomEventField';

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm: useCustomEventForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    CustomEventField,
  },
  formComponents: {},
});
