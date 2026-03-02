import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Info, KeyRound, Mail, Shield, UserPlus } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../styled-system/css';
import { authClient } from '../lib/auth-client';
import LanguageSwitcher from '../ui/common/LanguageSwitcher';
import Footer from '../ui/layout/Footer';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { error } = await authClient.signIn.email({ email, password });
        if (error) {
          setError(error.message || t('auth.loginFailed'));
          return;
        }
        navigate({ to: '/dashboard' });
        return;
      }

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
      setIsLogin(true);
      setConfirmPassword('');
      setPassword('');
    } catch {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={css({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fafaf9',
        userSelect: 'none',
        position: 'relative',
        overflow: 'hidden',
      })}
    >
      <div
        className={css({
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        })}
      />
      <div
        className={css({
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle 800px at 50% -30%, #fef3c7, transparent)',
          pointerEvents: 'none',
        })}
      />

      <div
        className={css({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          overflow: 'hidden',
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
        })}
      >
        <div
          className={css({
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: '50vw',
            height: '50vw',
            maxWidth: '600px',
            maxHeight: '600px',
            backgroundColor: 'rgb(217 213 75 / 0.2)',
            borderRadius: 'full',
            filter: 'blur(100px)',
            mixBlendMode: 'multiply',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            bottom: '0%',
            left: '-10%',
            width: '60vw',
            height: '60vw',
            maxWidth: '800px',
            maxHeight: '800px',
            backgroundColor: 'rgb(244 63 94 / 0.2)',
            borderRadius: 'full',
            filter: 'blur(120px)',
            mixBlendMode: 'multiply',
          })}
        />
      </div>

      <div
        className={css({
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingX: '4',
          paddingY: '12',
          position: 'relative',
          zIndex: 10,
          width: '100%',
        })}
      >
        <motion.div
          className={css({
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: 'rgb(255 255 255 / 0.7)',
            backdropFilter: 'blur(24px)',
            padding: '8',
            sm: { padding: '10' },
            borderRadius: '3xl',
            boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)',
            border: '1px solid rgb(255 255 255 / 0.8)',
            position: 'relative',
            overflow: 'hidden',
          })}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className={css({
              position: 'absolute',
              top: 0,
              right: 0,
              width: '32',
              height: '32',
              background: 'linear-gradient(to bottom right, rgb(254 243 199 / 0.5), transparent)',
              borderBottomLeftRadius: '100px',
              pointerEvents: 'none',
            })}
          />

          <div className={css({ textAlign: 'center', marginBottom: '8', position: 'relative', zIndex: 10 })}>
            <Link
              to="/"
              className={css({
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3.5',
                backgroundColor: 'white',
                borderRadius: '2xl',
                marginBottom: '5',
                boxShadow: 'sm',
                border: '1px solid rgb(28 25 23 / 0.05)',
                transition: 'all 0.3s',
              })}
            >
              <Shield className={css({ width: '8', height: '8', color: 'amber.600' })} />
            </Link>
            <h2
              className={css({
                fontSize: { base: '3xl', sm: '4xl' },
                fontFamily: 'serif',
                fontWeight: 'bold',
                color: 'stone.900',
                letterSpacing: '-0.025em',
              })}
            >
              {isLogin ? t('auth.login') : t('auth.register')}
            </h2>
            <p
              className={css({
                marginTop: '3',
                fontSize: 'sm',
                color: 'stone.500',
                fontWeight: '500',
                letterSpacing: '0.025em',
              })}
            >
              {isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
            </p>
          </div>

          <form className={css({ display: 'flex', flexDirection: 'column', gap: '5', position: 'relative', zIndex: 10 })} onSubmit={handleSubmit}>
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              <div className={css({ position: 'relative' })}>
                <label
                  htmlFor="email-address"
                  className={css({ display: 'block', fontSize: '13px', fontWeight: 'semibold', color: 'stone.600', marginBottom: '1.5', marginLeft: '1' })}
                >
                  {t('auth.emailLabel')}
                </label>
                <div className={css({ position: 'relative', display: 'flex', alignItems: 'center', _groupFocusWithin: { color: 'amber.500' } })}>
                  <Mail className={css({ position: 'absolute', left: '3.5', width: '5', height: '5', color: 'stone.400', transition: 'colors 0.2s' })} />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={css({
                      backgroundColor: 'rgb(255 255 255 / 0.5)',
                      color: 'stone.900',
                      _placeholder: { color: 'stone.400' },
                      display: 'block',
                      width: '100%',
                      borderRadius: 'xl',
                      border: '1px solid rgb(28 25 23 / 0.1)',
                      boxShadow: '0 2px 10px -3px rgb(0 0 0 / 0.05)',
                      paddingLeft: '11',
                      paddingRight: '4',
                      paddingY: '3.5',
                      transition: 'all 0.2s',
                      outline: 'none',
                    })}
                    placeholder={t('auth.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className={css({ position: 'relative' })}>
                <label
                  htmlFor="password"
                  className={css({ display: 'block', fontSize: '13px', fontWeight: 'semibold', color: 'stone.600', marginBottom: '1.5', marginLeft: '1' })}
                >
                  {t('auth.passwordLabel')}
                </label>
                <div className={css({ position: 'relative', display: 'flex', alignItems: 'center' })}>
                  <KeyRound className={css({ position: 'absolute', left: '3.5', width: '5', height: '5', color: 'stone.400', transition: 'colors 0.2s' })} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    required
                    className={css({
                      backgroundColor: 'rgb(255 255 255 / 0.5)',
                      color: 'stone.900',
                      _placeholder: { color: 'stone.400' },
                      display: 'block',
                      width: '100%',
                      borderRadius: 'xl',
                      border: '1px solid rgb(28 25 23 / 0.1)',
                      boxShadow: '0 2px 10px -3px rgb(0 0 0 / 0.05)',
                      paddingLeft: '11',
                      paddingRight: '4',
                      paddingY: '3.5',
                      transition: 'all 0.2s',
                      outline: 'none',
                    })}
                    placeholder={t('auth.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '4' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className={css({ position: 'relative', overflow: 'hidden' })}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className={css({ display: 'block', fontSize: '13px', fontWeight: 'semibold', color: 'stone.600', marginBottom: '1.5', marginLeft: '1' })}
                    >
                      {t('auth.confirmPasswordLabel')}
                    </label>
                    <div className={css({ position: 'relative', display: 'flex', alignItems: 'center' })}>
                      <KeyRound
                        className={css({ position: 'absolute', left: '3.5', width: '5', height: '5', color: 'stone.400', transition: 'colors 0.2s' })}
                      />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required={!isLogin}
                        className={css({
                          backgroundColor: 'rgb(255 255 255 / 0.5)',
                          color: 'stone.900',
                          _placeholder: { color: 'stone.400' },
                          display: 'block',
                          width: '100%',
                          borderRadius: 'xl',
                          border: '1px solid rgb(28 25 23 / 0.1)',
                          boxShadow: '0 2px 10px -3px rgb(0 0 0 / 0.05)',
                          paddingLeft: '11',
                          paddingRight: '4',
                          paddingY: '3.5',
                          transition: 'all 0.2s',
                          outline: 'none',
                        })}
                        placeholder={t('auth.confirmPasswordPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={css({
                    color: 'red.700',
                    fontSize: '13px',
                    textAlign: 'center',
                    backgroundColor: 'red.50',
                    padding: '3',
                    borderRadius: 'xl',
                    border: '1px solid rgb(254 202 202 / 0.5)',
                    fontWeight: '500',
                  })}
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className={css({
                    color: 'teal.700',
                    fontSize: '13px',
                    textAlign: 'center',
                    backgroundColor: 'teal.50',
                    padding: '3',
                    borderRadius: 'xl',
                    border: '1px solid rgb(204 251 241 / 0.5)',
                    fontWeight: '500',
                  })}
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '4', paddingTop: '4' })}>
              <button
                type="submit"
                disabled={loading}
                className={css({
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '2',
                  paddingY: '4',
                  paddingX: '4',
                  fontSize: 'base',
                  fontWeight: 'bold',
                  borderRadius: 'xl',
                  color: 'white',
                  backgroundColor: 'stone.900',
                  border: '1px solid stone.800',
                  transition: 'all 0.3s',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                })}
              >
                {loading ? (
                  <span className={css({ display: 'flex', alignItems: 'center', gap: '2.5' })}>
                    <svg
                      className={css({ marginLeft: '-1', width: '4', height: '4', animation: 'spin 1s linear infinite', color: 'white' })}
                      fill="none"
                      viewBox="0 0 24 24"
                      role="img"
                      aria-label="Loading"
                    >
                      <title>Loading</title>
                      <circle className={css({ opacity: 0.25 })} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className={css({ opacity: 0.75 })}
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {t('common.processing')}
                  </span>
                ) : (
                  <span className={css({ display: 'flex', alignItems: 'center' })}>
                    {isLogin ? t('auth.loginButton') : t('auth.createAccountButton')}
                    {!isLogin && <UserPlus className={css({ width: '4', height: '4', marginLeft: '1' })} />}
                  </span>
                )}
              </button>

              <div className={css({ position: 'relative', display: 'flex', alignItems: 'center', paddingY: '2', opacity: 0.6 })}>
                <div className={css({ flexGrow: '1', borderTop: '1px solid stone.200' })} />
                <span
                  className={css({
                    flexShrink: 0,
                    marginX: '4',
                    color: 'stone.400',
                    fontSize: 'xs',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 'bold',
                  })}
                >
                  {t('common.or')}
                </span>
                <div className={css({ flexGrow: '1', borderTop: '1px solid stone.200' })} />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={css({
                  width: '100%',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'stone.600',
                  backgroundColor: 'white',
                  border: '1px solid rgb(28 25 23 / 0.1)',
                  paddingY: '3.5',
                  borderRadius: 'xl',
                  boxShadow: '0 2px 8px -3px rgb(0 0 0 / 0.05)',
                  transition: 'all 0.2s',
                })}
              >
                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Link
        to="/"
        className={css({
          position: 'absolute',
          top: '6',
          left: '6',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '2',
          color: 'stone.500',
          fontWeight: 'semibold',
          fontSize: 'sm',
          transition: 'all 0.3s',
          backgroundColor: 'rgb(255 255 255 / 0.6)',
          paddingX: '5',
          paddingY: '2.5',
          borderRadius: 'full',
          backdropFilter: 'blur(12px)',
          boxShadow: 'sm',
          border: '1px solid stone.200',
        })}
      >
        <ArrowLeft className={css({ width: '4', height: '4', transition: 'transform 0.2s' })} />
        {t('common.homepage')}
      </Link>

      <div className={css({ position: 'absolute', top: '6', right: '6', zIndex: 20, display: 'flex', alignItems: 'center', gap: '3' })}>
        <LanguageSwitcher
          className={css({
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            paddingX: '4',
            paddingY: '2.5',
            borderRadius: 'full',
            backdropFilter: 'blur(12px)',
            boxShadow: 'sm',
            border: '1px solid stone.200',
          })}
        />
        <Link
          to="/about"
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '2',
            color: 'stone.500',
            fontWeight: 'semibold',
            fontSize: 'sm',
            transition: 'all 0.3s',
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            paddingX: '5',
            paddingY: '2.5',
            borderRadius: 'full',
            backdropFilter: 'blur(12px)',
            boxShadow: 'sm',
            border: '1px solid stone.200',
          })}
        >
          <Info className={css({ width: '4', height: '4', transition: 'transform 0.2s' })} />
          {t('common.about')}
        </Link>
      </div>

      <Footer className={css({ backgroundColor: 'transparent', position: 'relative', zIndex: 10, border: 'none', marginTop: 'auto' })} />
    </div>
  );
}
