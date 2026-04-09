import { createFormHook, createFormHookContexts } from "@tanstack/react-form-start";

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm: useMemberForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
});
