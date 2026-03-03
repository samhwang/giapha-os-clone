import { createFileRoute } from '@tanstack/react-router';
import { css } from '../../styled-system/css';
import config from '../lib/config';
import Footer from '../ui/layout/Footer';
import LandingHero from '../ui/layout/LandingHero';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className={css({ minHeight: '100vh', position: 'relative' })}>
      <div className={css({ position: 'fixed', inset: 0, zIndex: -10 })}>
        <div
          className={css({
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)',
            backgroundSize: '4rem 4rem',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '600px',
            height: '600px',
            backgroundColor: 'rgb(253 224 71 / 0.2)',
            borderRadius: 'full',
            filter: 'blur(128px)',
            transform: 'translate(-50%, -50%)',
          })}
        />
        <div
          className={css({
            position: 'absolute',
            top: '33.333%',
            right: 0,
            width: '500px',
            height: '500px',
            backgroundColor: 'rgb(231 229 228 / 0.2)',
            borderRadius: 'full',
            filter: 'blur(128px)',
            transform: 'translate(50%, 0)',
          })}
        />
      </div>

      <main
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          paddingX: '4',
          paddingY: '12',
          sm: { paddingY: '20' },
          position: 'relative',
          zIndex: 10,
        })}
      >
        <LandingHero siteName={config.siteName} />
      </main>

      <Footer className={css({ backgroundColor: 'transparent', position: 'relative', zIndex: 10, border: 'none' })} />
    </div>
  );
}
