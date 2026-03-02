import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';

interface FooterProps {
  className?: string;
  showDisclaimer?: boolean;
}

export default function Footer({ className = '', showDisclaimer = false }: FooterProps) {
  const { t } = useTranslation();

  return (
    <footer
      className={css({ paddingY: '8', textAlign: 'center', fontSize: 'sm', color: 'stone.500', backdropFilter: 'blur(8px)' }, className ? { className } : {})}
    >
      <div className={css({ maxWidth: '7xl', marginX: 'auto', paddingX: '4' })}>
        {showDisclaimer && (
          <p
            className={css({
              marginBottom: '4',
              fontSize: 'xs',
              letterSpacing: '0.025em',
              backgroundColor: 'amber.50',
              display: 'inline-block',
              paddingX: '3',
              paddingY: '1',
              borderRadius: 'full',
              color: 'amber.800',
              border: '1px solid rgb(245 158 11 / 0.5)',
            })}
          >
            {t('footer.disclaimer')}
          </p>
        )}
        <p
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2',
            opacity: 0.8,
            transition: 'opacity 0.2s',
            _hover: { opacity: 1 },
          })}
        >
          <a
            href="https://github.com/homielab/giapha-os"
            target="_blank"
            rel="noopener noreferrer"
            className={css(
              {
                fontWeight: 'semibold',
                color: 'stone.600',
                transition: 'colors 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.5',
              },
              { _hover: { color: 'amber.700' } }
            )}
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="GitHub"
            >
              <title>GitHub</title>
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
            Gia Phả OS
          </a>
          by
          <a
            href="https://homielab.com"
            target="_blank"
            rel="noopener noreferrer"
            className={css(
              {
                fontWeight: 'semibold',
                color: 'green.600',
                transition: 'colors 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '1.5',
              },
              { _hover: { color: 'amber.700' } }
            )}
          >
            HomieLab
          </a>
        </p>
      </div>
    </footer>
  );
}
