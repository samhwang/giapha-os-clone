import { Link } from '@tanstack/react-router';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Network, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

interface LandingHeroProps {
  siteName: string;
}

export default function LandingHero({ siteName }: LandingHeroProps) {
  const { t } = useTranslation();

  return (
    <motion.div
      className={css({ maxWidth: '5xl', textAlign: 'center', width: '100%', position: 'relative', zIndex: 10 })}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div className={css({ gap: '12', paddingY: '6', display: 'flex', flexDirection: 'column', alignItems: 'center' })} variants={fadeIn}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2',
            paddingX: '4',
            paddingY: '2',
            fontSize: 'sm',
            fontWeight: 'semibold',
            color: 'amber.800',
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'full',
            boxShadow: '0 2px 10px -3px rgb(0 0 0 / 0.1)',
            border: '1px solid rgb(245 158 11 / 0.5)',
            position: 'relative',
            overflow: 'hidden',
          })}
        >
          <Sparkles className={css({ width: '4', height: '4', color: 'amber.500' })} />
          {t('landing.tagline')}
          <div
            className={css({
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, transparent, rgb(255 255 255 / 0.5), transparent)',
              transform: 'translateX(-100%)',
            })}
          />
        </motion.div>

        <h1
          className={css({
            fontSize: { base: '5xl', sm: '6xl', md: '7xl', lg: '5rem' },
            fontFamily: 'serif',
            fontWeight: 'bold',
            color: 'stone.900',
            letterSpacing: '-0.025em',
            lineHeight: '1.1',
            maxWidth: '4xl',
          })}
        >
          <span className={css({ display: 'block' })}>{siteName}</span>
        </h1>

        <p
          className={css({
            fontSize: { base: 'lg', sm: 'xl', md: '2xl' },
            color: 'stone.600',
            maxWidth: '2xl',
            marginX: 'auto',
            lineHeight: '1.625',
            fontWeight: '300',
          })}
        >
          {t('landing.subtitle')}
        </p>
      </motion.div>

      <motion.div
        className={css({
          paddingTop: '6',
          display: 'flex',
          flexDirection: { base: 'column', sm: 'row' },
          gap: '4',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          paddingX: { base: '4', sm: '0' },
          position: 'relative',
        })}
        variants={fadeIn}
      >
        <div
          className={css({
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '48',
            height: '16',
            backgroundColor: 'rgb(245 158 11 / 0.3)',
            blur: '2xl',
            borderRadius: 'full',
            zIndex: 0,
            display: { base: 'none', sm: 'block' },
          })}
        />

        <Link
          to="/login"
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2',
            paddingX: { base: '8', sm: '10' },
            paddingY: '4',
            fontSize: { base: 'base', sm: 'lg' },
            fontWeight: 'bold',
            color: 'white',
            backgroundColor: 'stone.900',
            border: '1px solid stone.800',
            borderRadius: '2xl',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
            transition: 'all 0.3s',
            overflow: 'hidden',
            position: 'relative',
            width: { base: '100%', sm: 'auto' },
          })}
        >
          <span className={css({ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '3' })}>
            {t('auth.loginToView')}
            <ArrowRight className={css({ width: '5', height: '5', transition: 'transform 0.2s' })} />
          </span>
        </Link>
      </motion.div>

      <motion.div
        className={css({
          marginTop: '24',
          display: 'grid',
          gridTemplateColumns: { base: '1', md: '3' },
          gap: { base: '6', sm: '8' },
          textAlign: 'left',
          borderTop: '1px solid rgb(28 25 23 / 0.05)',
          position: 'relative',
        })}
        variants={staggerContainer}
      >
        {[
          {
            icon: <Users className={css({ width: '6', height: '6', color: 'amber.700' })} />,
            title: t('landing.featureMembersTitle'),
            desc: t('landing.featureMembersDesc'),
          },
          {
            icon: <Network className={css({ width: '6', height: '6', color: 'amber.700' })} />,
            title: t('landing.featureTreeTitle'),
            desc: t('landing.featureTreeDesc'),
          },
          {
            icon: <ShieldCheck className={css({ width: '6', height: '6', color: 'amber.700' })} />,
            title: t('landing.featureSecurityTitle'),
            desc: t('landing.featureSecurityDesc'),
          },
        ].map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeIn}
            whileHover={{ y: -5 }}
            className={css({
              backgroundColor: 'rgb(255 255 255 / 0.7)',
              backdropFilter: 'blur(24px)',
              padding: '8',
              borderRadius: '3xl',
              border: '1px solid rgb(255 255 255 / 0.8)',
              boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)',
              transition: 'all 0.5s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
            })}
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
                opacity: 0,
                transition: 'opacity 0.5s',
              })}
            />

            <div
              className={css({
                padding: '3.5',
                backgroundColor: 'white',
                borderRadius: '2xl',
                marginBottom: '6',
                boxShadow: 'sm',
                border: '1px solid stone.100',
                transition: 'all 0.3s',
                position: 'relative',
                zIndex: 10,
              })}
            >
              {feature.icon}
            </div>
            <h3
              className={css({
                fontSize: { base: 'xl', sm: '2xl' },
                fontWeight: 'bold',
                color: 'stone.800',
                marginBottom: '3',
                fontFamily: 'serif',
                position: 'relative',
                zIndex: 10,
              })}
            >
              {feature.title}
            </h3>
            <p className={css({ color: 'stone.600', fontSize: 'base', lineHeight: '1.625', position: 'relative', zIndex: 10 })}>{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
