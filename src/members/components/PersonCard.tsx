import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import type { Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';

interface PersonCardProps {
  person: Person;
}

export default function PersonCard({ person }: PersonCardProps) {
  const { t } = useTranslation();
  const { setMemberModalId } = useDashboard();

  const getGenderStyle = (gender: string) => {
    if (gender === 'male') return { backgroundColor: 'sky.100', color: 'sky.600' };
    if (gender === 'female') return { backgroundColor: 'rose.100', color: 'rose.600' };
    return { backgroundColor: 'stone.100', color: 'stone.600' };
  };

  return (
    <button
      type="button"
      onClick={() => setMemberModalId(person.id)}
      className={css(
        {
          position: 'relative',
          display: 'block',
          backgroundColor: 'rgb(255 255 255 / 0.6)',
          backdropFilter: 'blur(12px)',
          padding: { base: '2', sm: '4' },
          borderRadius: '2xl',
          boxShadow: 'sm',
          border: '1px solid rgb(28 25 23 / 0.06)',
          overflow: 'hidden',
          textAlign: 'left',
          width: '100%',
          transition: 'all 0.3s',
        },
        { _hover: { borderColor: 'amber.300', boxShadow: 'md', backgroundColor: 'rgb(255 255 255 / 0.9)' } },
        person.isDeceased ? css({ opacity: 0.8, filter: 'grayscale(0.3)' }) : {}
      )}
    >
      <div className={css({ display: 'flex', alignItems: 'center', gap: '4', position: 'relative', zIndex: 10 })}>
        <div className={css({ position: 'relative' })}>
          <div
            className={css(
              {
                height: { base: '14', sm: '16' },
                width: { base: '14', sm: '16' },
                borderRadius: 'full',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'xl',
                fontWeight: 'bold',
                color: 'white',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 'lg',
                ringWidth: '2px',
                ringColor: 'white',
                transition: 'transform 0.3s',
              },
              { _groupHover: { scale: '1.05' } },
              person.gender === 'male'
                ? { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' }
                : person.gender === 'female'
                  ? { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' }
                  : { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' }
            )}
          >
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.fullName} className={css({ height: '100%', width: '100%', objectFit: 'cover' })} />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
          <div
            className={css(
              {
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '5',
                height: '5',
                borderRadius: 'full',
                ringWidth: '2px',
                ringColor: 'white',
                boxShadow: 'sm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
              getGenderStyle(person.gender)
            )}
          >
            {person.gender === 'male' ? (
              <MaleIcon className={css({ width: '5', height: '5' })} />
            ) : person.gender === 'female' ? (
              <FemaleIcon className={css({ width: '5', height: '5' })} />
            ) : null}
          </div>
        </div>

        <div className={css({ flex: 1, minWidth: 0 })}>
          <h3
            className={css(
              {
                fontSize: { base: 'base', sm: 'lg' },
                textAlign: 'left',
                fontWeight: 'bold',
                color: 'stone.900',
                marginBottom: '1.5',
                transition: 'color 0.2s',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              },
              { _groupHover: { color: 'amber.700' } }
            )}
          >
            {person.fullName}
          </h3>
          <p
            className={css({
              fontSize: 'sm',
              fontWeight: '500',
              color: 'stone.500',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5',
            })}
          >
            <svg
              className={css({ width: '4', height: '4', flexShrink: 0, color: 'stone.400' })}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              role="img"
              aria-label={t('common.day')}
            >
              <title>{t('common.day')}</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
              {formatDisplayDate(person.birthYear, person.birthMonth, person.birthDay, t('common.unknown'))}
              {person.isDeceased && ` → ${formatDisplayDate(person.deathYear, person.deathMonth, person.deathDay, t('common.unknown'))}`}
            </span>
          </p>
          {(person.isDeceased || person.isInLaw || person.birthOrder != null || person.generation != null) && (
            <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.5', flexShrink: 0, marginTop: '2' })}>
              {person.isDeceased && (
                <span
                  className={css({
                    display: 'inlineFlex',
                    alignItems: 'center',
                    paddingX: '2',
                    paddingY: '0.5',
                    borderRadius: 'md',
                    fontSize: { base: '2xs', sm: 'xs' },
                    fontWeight: 'bold',
                    backgroundColor: 'stone.100',
                    color: 'stone.500',
                    textTransform: 'uppercase',
                    letterSpacing: 'widest',
                    border: '1px solid rgb(28 25 23 / 0.06)',
                    boxShadow: 'xs',
                  })}
                >
                  {t('member.filterDeceased')}
                </span>
              )}
              {person.isInLaw && (
                <span
                  className={css(
                    {
                      display: 'inlineFlex',
                      alignItems: 'center',
                      paddingX: '2',
                      paddingY: '0.5',
                      borderRadius: 'md',
                      fontSize: { base: '2xs', sm: 'xs' },
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: 'widest',
                      boxShadow: 'xs',
                      borderWidth: '1px',
                    },
                    person.gender === 'male'
                      ? { backgroundColor: 'sky.50', color: 'sky.700', borderColor: 'rgb(14 165 233 / 0.4)' }
                      : person.gender === 'female'
                        ? { backgroundColor: 'rose.50', color: 'rose.700', borderColor: 'rgb(244 63 94 / 0.4)' }
                        : { backgroundColor: 'stone.50', color: 'stone.700', borderColor: 'rgb(28 25 23 / 0.1)' }
                  )}
                >
                  {person.gender === 'male' ? t('member.filterInLawMale') : person.gender === 'female' ? t('member.filterInLawFemale') : t('member.inLawOther')}
                </span>
              )}
              {person.birthOrder != null && (
                <span
                  className={css({
                    display: 'inlineFlex',
                    alignItems: 'center',
                    paddingX: '2',
                    paddingY: '0.5',
                    borderRadius: 'md',
                    fontSize: { base: '2xs', sm: 'xs' },
                    fontWeight: 'bold',
                    backgroundColor: 'amber.50',
                    color: 'amber.700',
                    border: '1px solid rgb(245 158 11 / 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 'widest',
                    boxShadow: 'xs',
                  })}
                >
                  {person.birthOrder === 1 ? t('member.birthOrderFirst') : t('member.birthOrderN', { order: person.birthOrder })}
                </span>
              )}
              {person.generation != null && (
                <span
                  className={css({
                    display: 'inlineFlex',
                    alignItems: 'center',
                    paddingX: '2',
                    paddingY: '0.5',
                    borderRadius: 'md',
                    fontSize: { base: '2xs', sm: 'xs' },
                    fontWeight: 'bold',
                    backgroundColor: 'emerald.50',
                    color: 'emerald.700',
                    border: '1px solid rgb(16 185 129 / 0.4)',
                    textTransform: 'uppercase',
                    letterSpacing: 'widest',
                    boxShadow: 'xs',
                  })}
                >
                  {t('stats.generationLabel', { gen: person.generation })}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
