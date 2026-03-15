import { KeyRound, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';
import { authClient } from '../../auth/client';
import { useAuthForm } from '../../auth/hooks/useAuthForm';

interface LoginFormProps {
  onSuccess: () => void;
}

const Login = z.object({
  email: z.email(),
  password: z.string().min(1),
});
type Login = z.infer<typeof Login>;

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const form = useAuthForm({
    defaultValues: {
      email: '',
      password: '',
    } satisfies Login,
    validators: {
      onSubmit: Login,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setError(null);

      try {
        const { error } = await authClient.signIn.email({ email: value.email, password: value.password });
        if (error) {
          setError(error.message || t('auth.loginFailed'));
          return;
        }
        onSuccess();
      } catch {
        setError(t('auth.unexpectedError'));
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-4">
        <form.AppField name="email">
          {(field) => (
            <field.AuthField
              label={t('auth.emailLabel')}
              placeholder={t('auth.emailPlaceholder')}
              leftIcon={<Mail className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />}
              type="email"
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => (
            <field.AuthField
              label={t('auth.passwordLabel')}
              placeholder={t('auth.passwordPlaceholder')}
              leftIcon={<KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />}
              type="password"
            />
          )}
        </form.AppField>
      </div>

      {error && (
        <div className="text-red-700 text-sm-plus text-center bg-red-50 p-3 rounded-xl border border-red-100/50 font-medium animate-[fade-in-up_0.3s_ease-out_forwards]">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-base-plus font-bold rounded-xl text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 disabled:cursor-wait transition-all duration-300 shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/20 hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center gap-2.5">
              <svg className="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" role="img" aria-label="Loading">
                <title>Loading</title>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('common.processing')}
            </span>
          ) : (
            t('auth.loginButton')
          )}
        </button>
      </div>
    </form>
  );
}
