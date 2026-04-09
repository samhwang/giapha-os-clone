import { KeyRound, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { authClient } from "../../auth/client";
import { Button } from "../../ui/common/Button";
import { useAuthForm } from "../hooks/useAuthForm";

interface RegisterFormProps {
  onSuccess: () => void;
}

const Register = z
  .object({
    email: z.email(),
    password: z.string().min(1),
    confirmPassword: z.string().min(1),
  })
  .refine(
    (v) => {
      if (v.password !== v.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: "auth.passwordMismatch",
    },
  );
type Register = z.infer<typeof Register>;

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const form = useAuthForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies Register,
    validators: {
      onSubmit: Register,
    },
    onSubmit: async ({ value }) => {
      setError(null);
      setSuccessMessage(null);

      try {
        const { error } = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.email,
        });
        if (error) {
          setError(error.message || t("auth.registerFailed"));
          return;
        }
        setSuccessMessage(t("auth.registerSuccess"));
        onSuccess();
      } catch {
        setError(t("auth.unexpectedError"));
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.AppField name="email">
          {(field) => (
            <field.AuthField
              label={t("auth.emailLabel")}
              placeholder={t("auth.emailPlaceholder")}
              leftIcon={
                <Mail className="absolute left-3.5 size-5 text-stone-400 transition-colors group-focus-within:text-amber-500" />
              }
              type="email"
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.AuthField
              label={t("auth.passwordLabel")}
              placeholder={t("auth.passwordPlaceholder")}
              leftIcon={
                <KeyRound className="absolute left-3.5 size-5 text-stone-400 transition-colors group-focus-within:text-amber-500" />
              }
              type="password"
            />
          )}
        </form.AppField>

        <form.AppField name="confirmPassword">
          {(field) => (
            <field.AuthField
              label={t("auth.confirmPasswordLabel")}
              placeholder={t("auth.confirmPasswordPlaceholder")}
              leftIcon={
                <KeyRound className="absolute left-3.5 size-5 text-stone-400 transition-colors group-focus-within:text-amber-500" />
              }
              type="password"
            />
          )}
        </form.AppField>
      </div>

      {error && (
        <div className="animate-[fade-in-up_0.3s_ease-out_forwards] rounded-xl border border-red-100/50 bg-red-50 p-3 text-center text-sm-plus font-medium text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="animate-[fade-in-up_0.3s_ease-out_forwards] rounded-xl border border-teal-100/50 bg-teal-50 p-3 text-center text-sm-plus font-medium text-teal-700">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col gap-4 pt-4">
        <Button
          variant="dark"
          size="xl"
          type="submit"
          disabled={form.state.isSubmitting}
          className="w-full focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
        >
          {form.state.isSubmitting ? (
            <span className="flex items-center gap-2.5">
              <svg
                className="-ml-1 h-4 w-4 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
                role="img"
                aria-label="Loading"
              >
                <title>Loading</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t("common.processing")}
            </span>
          ) : (
            <>
              {t("auth.createAccountButton")}
              <UserPlus className="ml-1 size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
