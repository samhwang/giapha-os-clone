import { Minus, Plus } from 'lucide-react';
import type { MouseEvent } from 'react';
import { css } from '../../../styled-system/css';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import type { Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';

interface FamilyNodeCardProps {
  person: Person;
  role?: string;
  note?: string | null;
  isMainNode?: boolean;
  onClickCard?: () => void;
  onClickName?: (e: MouseEvent) => void;
  isExpandable?: boolean;
  isExpanded?: boolean;
  isRingVisible?: boolean;
  isPlusVisible?: boolean;
}

export default function FamilyNodeCard({
  person,
  isMainNode = false,
  onClickCard,
  onClickName,
  isExpandable = false,
  isExpanded = false,
  isRingVisible = false,
  isPlusVisible = false,
}: FamilyNodeCardProps) {
  const { showAvatar, setMemberModalId } = useDashboard();

  const cardStyles = css(
    {
      paddingY: '2',
      paddingX: '1',
      width: '5rem',
      sm: { width: '6rem' },
      md: { width: '7rem' },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      transition: 'all 0.3s',
      position: 'relative',
      backgroundColor: 'rgb(255 255 255 / 0.7)',
      backdropFilter: 'blur(12px)',
      borderRadius: '2xl',
    },
    isMainNode && person.isDeceased ? { filter: 'grayscale(0.4)', opacity: 0.8 } : {},
    { _hover: { translateY: '-4px', boxShadow: 'xl' } }
  );

  const avatarBg =
    person.gender === 'male'
      ? { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' }
      : person.gender === 'female'
        ? { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' }
        : { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' };

  const content = (
    <button type="button" onClick={onClickCard} className={cardStyles}>
      {isRingVisible && (
        <div
          className={css({
            position: 'absolute',
            top: '3/12',
            left: { base: '-2.5', sm: '-4' },
            width: { base: '5', sm: '6' },
            height: { base: '5', sm: '6' },
            borderRadius: 'full',
            boxShadow: 'sm',
            backgroundColor: 'white',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { base: '2xs', sm: 'xs' },
          })}
        >
          💍
        </div>
      )}
      {isPlusVisible && (
        <div
          className={css({
            position: 'absolute',
            top: '3/12',
            left: { base: '-2.5', sm: '-4' },
            width: { base: '5', sm: '6' },
            height: { base: '5', sm: '6' },
            borderRadius: 'full',
            boxShadow: 'sm',
            backgroundColor: 'white',
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { base: '2xs', sm: 'xs' },
          })}
        >
          +
        </div>
      )}

      {isExpandable && (
        <div
          className={css(
            {
              position: 'absolute',
              bottom: '-12px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              border: '1px solid rgb(228 228 231 / 0.8)',
              borderRadius: 'full',
              width: '6',
              height: '6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'md',
              zIndex: 20,
              color: 'stone.500',
              transition: 'colors 0.2s',
            },
            { _hover: { color: 'amber.600' } }
          )}
        >
          {isExpanded ? <Minus className={css({ width: '3.5', height: '3.5' })} /> : <Plus className={css({ width: '3.5', height: '3.5' })} />}
        </div>
      )}

      {showAvatar && (
        <div className={css({ position: 'relative', zIndex: 10, marginBottom: { base: '1.5', sm: '2' } })}>
          <div
            className={css(
              {
                height: { base: '10', sm: '12', md: '14' },
                width: { base: '10', sm: '12', md: '14' },
                borderRadius: 'full',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: { base: '2xs', sm: 'xs', md: 'xs' },
                color: 'white',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 'lg',
                ringWidth: '2px',
                ringColor: 'white',
                transition: 'transform 0.3s',
              },
              avatarBg,
              { _groupHover: { scale: '1.05' } }
            )}
          >
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt={person.fullName} className={css({ width: '100%', height: '100%', objectFit: 'cover' })} />
            ) : (
              <DefaultAvatar gender={person.gender} />
            )}
          </div>
        </div>
      )}

      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1',
          width: '100%',
          paddingX: { base: '0.5', sm: '1' },
          position: 'relative',
          zIndex: 10,
        })}
      >
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: parent button handles a11y */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: parent button handles a11y */}
        <span
          className={css(
            {
              fontSize: { base: '2xs', sm: 'xs-plus', md: 'xs' },
              fontWeight: 'bold',
              textAlign: 'center',
              lineHeight: 'tight',
              color: 'stone.800',
              transition: 'colors 0.2s',
              cursor: 'pointer',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
            {
              _hover: onClickName ? { color: 'amber.700', textDecoration: 'underline' } : {},
            }
          )}
          title={person.fullName}
          onClick={(e) => {
            if (onClickName) {
              e.stopPropagation();
              e.preventDefault();
              onClickName(e);
            }
          }}
        >
          {person.fullName}
        </span>
      </div>
    </button>
  );

  if (onClickCard || onClickName) {
    return content;
  }

  return (
    <button type="button" onClick={() => setMemberModalId(person.id)} className={css({ width: 'fit-content' })}>
      {content}
    </button>
  );
}
