import { createFileRoute, Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, Mail, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css } from '../../styled-system/css';
import Footer from '../ui/layout/Footer';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});

function AboutPage() {
  const { t } = useTranslation();

  return (
    <div
      className={css({ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafaf9', position: 'relative', overflow: 'hidden' })}
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

      <Link
        to="/"
        className={css({
          position: 'absolute',
          top: '6',
          left: '6',
          zIndex: '20',
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
        <ArrowLeft className={css({ width: '4', height: '4' })} />
        {t('common.homepage')}
      </Link>

      <main
        className={css({
          flex: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingX: '4',
          paddingY: '20',
          position: 'relative',
          zIndex: '10',
        })}
      >
        <motion.div
          className={css({ maxWidth: '2xl', width: '100%', display: 'flex', flexDirection: 'column', gap: '8' })}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div
            className={css({
              backgroundColor: 'rgb(255 255 255 / 0.7)',
              backdropFilter: 'blur(24px)',
              padding: '8',
              sm: { padding: '10' },
              borderRadius: '3xl',
              boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)',
              border: '1px solid rgb(255 255 255 / 0.8)',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', marginBottom: '6' })}>
              <div className={css({ padding: '3', backgroundColor: 'white', borderRadius: '2xl', boxShadow: 'sm', border: '1px solid stone.100' })}>
                <Info className={css({ width: '6', height: '6', color: 'amber.600' })} />
              </div>
              <h1 className={css({ fontSize: { base: '2xl', sm: '3xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.900' })}>
                {t('aboutPage.title')}
              </h1>
            </div>
            <p className={css({ color: 'stone.600', lineHeight: 'relaxed' })}>{t('aboutPage.description')}</p>
          </div>

          <div
            className={css({
              backgroundColor: 'rgb(255 255 255 / 0.7)',
              backdropFilter: 'blur(24px)',
              padding: '8',
              sm: { padding: '10' },
              borderRadius: '3xl',
              boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)',
              border: '1px solid rgb(255 255 255 / 0.8)',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', marginBottom: '6' })}>
              <div className={css({ padding: '3', backgroundColor: 'white', borderRadius: '2xl', boxShadow: 'sm', border: '1px solid stone.100' })}>
                <ShieldAlert className={css({ width: '6', height: '6', color: 'amber.600' })} />
              </div>
              <h2 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.900' })}>
                {t('aboutPage.securityTitle')}
              </h2>
            </div>
            <p className={css({ color: 'stone.600', lineHeight: 'relaxed' })}>{t('aboutPage.securityDesc')}</p>
          </div>

          <div
            className={css({
              backgroundColor: 'rgb(255 255 255 / 0.7)',
              backdropFilter: 'blur(24px)',
              padding: '8',
              sm: { padding: '10' },
              borderRadius: '3xl',
              boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)',
              border: '1px solid rgb(255 255 255 / 0.8)',
            })}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3', marginBottom: '6' })}>
              <div className={css({ padding: '3', backgroundColor: 'white', borderRadius: '2xl', boxShadow: 'sm', border: '1px solid stone.100' })}>
                <Mail className={css({ width: '6', height: '6', color: 'amber.600' })} />
              </div>
              <h2 className={css({ fontSize: { base: 'xl', sm: '2xl' }, fontFamily: 'serif', fontWeight: 'bold', color: 'stone.900' })}>
                {t('aboutPage.contactTitle')}
              </h2>
            </div>
            <p className={css({ color: 'stone.600', lineHeight: 'relaxed' })}>
              {t('aboutPage.contactText')}{' '}
              <a
                href="https://github.com/homielab/giapha-os"
                target="_blank"
                rel="noopener noreferrer"
                className={css({
                  color: 'amber.700',
                  _hover: { color: 'amber.900' },
                  fontWeight: 'medium',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2',
                })}
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </motion.div>
      </main>

      <Footer className={css({ backgroundColor: 'transparent', position: 'relative', zIndex: '10', border: 'none' })} />
    </div>
  );
}
