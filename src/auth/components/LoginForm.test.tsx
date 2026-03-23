import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { t } from '../../../test/i18n';

const mockSignIn = vi.fn();

vi.mock('../../auth/client', () => ({
  authClient: {
    signIn: { email: (...args: unknown[]) => mockSignIn(...args) },
  },
}));

let capturedOnSubmit: (opts: { value: { email: string; password: string } }) => Promise<void>;

vi.mock('../../auth/hooks/useAuthForm', () => ({
  useAuthForm: (opts: { onSubmit: typeof capturedOnSubmit }) => {
    capturedOnSubmit = opts.onSubmit;
    return {
      state: { isSubmitting: false },
      handleSubmit: () => capturedOnSubmit({ value: { email: 'test@example.com', password: 'password123' } }),
      AppField: ({ children, name }: { children: (field: unknown) => React.ReactNode; name: string }) => {
        const mockField = {
          AuthField: ({ label, type, placeholder }: { label: string; type: string; placeholder: string }) => (
            <div>
              <label htmlFor={name}>{label}</label>
              <input id={name} name={name} type={type} placeholder={placeholder} />
            </div>
          ),
        };
        return children(mockField);
      },
    };
  },
}));

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderLoginForm() {
    const { default: LoginForm } = await import('./LoginForm');
    return render(<LoginForm onSuccess={mockOnSuccess} />);
  }

  it('should render email and password fields', async () => {
    await renderLoginForm();

    expect(screen.getByLabelText(t('auth.emailLabel'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('auth.passwordLabel'))).toBeInTheDocument();
  });

  it('should render submit button', async () => {
    await renderLoginForm();

    expect(screen.getByRole('button', { name: t('auth.loginButton') })).toBeInTheDocument();
  });

  it('should call onSuccess on successful sign-in', async () => {
    mockSignIn.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    await renderLoginForm();

    await user.click(screen.getByRole('button', { name: t('auth.loginButton') }));

    expect(mockSignIn).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should display error on failed sign-in', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } });
    const user = userEvent.setup();

    await renderLoginForm();

    await user.click(screen.getByRole('button', { name: t('auth.loginButton') }));

    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should display generic error on network failure', async () => {
    mockSignIn.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    await renderLoginForm();

    await user.click(screen.getByRole('button', { name: t('auth.loginButton') }));

    expect(screen.getByText(t('auth.unexpectedError'))).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
