import { KeyRound, Mail, UserPlus } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authClient } from '../../auth/client';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (password !== confirmPassword) {
        setError(t('auth.passwordMismatch'));
        setLoading(false);
        return;
      }

      const { error } = await authClient.signUp.email({ email, password, name: email });
      if (error) {
        setError(error.message || t('auth.registerFailed'));
        return;
      }
      setSuccessMessage(t('auth.registerSuccess'));
      onSuccess();
    } catch {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div className="relative">
          <label htmlFor="email-address" className="block text-sm-plus font-semibold text-stone-600 mb-1.5 ml-1">
            {t('auth.emailLabel')}
          </label>
          <div className="relative flex items-center group">
            <Mail className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm-plus font-semibold text-stone-600 mb-1.5 ml-1">
            {t('auth.passwordLabel')}
          </label>
          <div className="relative flex items-center group">
            <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="relative overflow-hidden animate-[fade-in_0.3s_ease-out_forwards]">
          <label htmlFor="confirmPassword" className="block text-sm-plus font-semibold text-stone-600 mb-1.5 ml-1">
            {t('auth.confirmPasswordLabel')}
          </label>
          <div className="relative flex items-center group">
            <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-700 text-sm-plus text-center bg-red-50 p-3 rounded-xl border border-red-100/50 font-medium animate-[fade-in-up_0.3s_ease-out_forwards]">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="text-teal-700 text-sm-plus text-center bg-teal-50 p-3 rounded-xl border border-teal-100/50 font-medium animate-[fade-in-up_0.3s_ease-out_forwards]">
          {successMessage}
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
            <>
              {t('auth.createAccountButton')}
              <UserPlus className="size-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
