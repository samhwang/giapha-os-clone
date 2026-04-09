import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { t } from '../../../test/i18n';

const mockSignUp = vi.fn();

vi.mock('../../auth/client', () => ({
  authClient: {
    signUp: { email: (...args: unknown[]) => mockSignUp(...args) },
  },
}));

let capturedOnSubmit: (opts: { value: { email: string; password: string; confirmPassword: string } }) => Promise<void>;

vi.mock('../hooks/useAuthForm', () => ({
  useAuthForm: (opts: { onSubmit: typeof capturedOnSubmit }) => {
    capturedOnSubmit = opts.onSubmit;
    return {
      state: { isSubmitting: false },
      handleSubmit: () =>
        capturedOnSubmit({
          value: {
            email: 'new@example.com',
            password: 'password123',
            confirmPassword: 'password123',
          },
        }),
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

describe('RegisterForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  async function renderRegisterForm() {
    const { default: RegisterForm } = await import('./RegisterForm');
    return render(<RegisterForm onSuccess={mockOnSuccess} />);
  }

  it('should render email, password, and confirm password fields', async () => {
    await renderRegisterForm();

    expect(screen.getByLabelText(t('auth.emailLabel'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('auth.passwordLabel'))).toBeInTheDocument();
    expect(screen.getByLabelText(t('auth.confirmPasswordLabel'))).toBeInTheDocument();
  });

  it('should render submit button', async () => {
    await renderRegisterForm();

    expect(screen.getByRole('button', { name: new RegExp(t('auth.createAccountButton'), 'i') })).toBeInTheDocument();
  });

  it('should call onSuccess and show success message on registration', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const user = userEvent.setup();

    await renderRegisterForm();

    await user.click(screen.getByRole('button', { name: new RegExp(t('auth.createAccountButton'), 'i') }));

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'password123',
      name: 'new@example.com',
    });
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should display error on failed registration', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already taken' } });
    const user = userEvent.setup();

    await renderRegisterForm();

    await user.click(screen.getByRole('button', { name: new RegExp(t('auth.createAccountButton'), 'i') }));

    expect(screen.getByText('Email already taken')).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  it('should display generic error on network failure', async () => {
    mockSignUp.mockRejectedValue(new Error('Network error'));
    const user = userEvent.setup();

    await renderRegisterForm();

    await user.click(screen.getByRole('button', { name: new RegExp(t('auth.createAccountButton'), 'i') }));

    expect(screen.getByText(t('auth.unexpectedError'))).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
