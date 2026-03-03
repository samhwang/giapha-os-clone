import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronRight, Share2 } from 'lucide-react';
import { useState } from 'react';
import { css } from '../../../styled-system/css';
import { useDashboard } from '../../dashboard/components/DashboardContext';
import { formatDisplayDate } from '../../events/utils/dateHelpers';
import type { Person, Relationship } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';

interface MindmapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function MindmapTree({ personsMap, relationships, roots }: MindmapTreeProps) {
  const { showAvatar, setMemberModalId } = useDashboard();

  const getTreeData = (personId: string) => {
    const spousesList = relationships
      .filter((r) => r.type === 'marriage' && (r.personAId === personId || r.personBId === personId))
      .map((r) => {
        const spouseId = r.personAId === personId ? r.personBId : r.personAId;
        return { person: personsMap.get(spouseId) as Person, note: r.note };
      })
      .filter((s) => s.person);

    const childRels = relationships.filter((r) => (r.type === 'biological_child' || r.type === 'adopted_child') && r.personAId === personId);

    const childrenList = childRels.map((r) => personsMap.get(r.personBId)).filter(Boolean) as Person[];

    return { person: personsMap.get(personId) as Person, spouses: spousesList, children: childrenList };
  };

  function MindmapNode({ personId, level = 0, isLast = false }: { personId: string; level?: number; isLast?: boolean }) {
    const data = getTreeData(personId);
    const [isExpanded, setIsExpanded] = useState(level < 2);

    if (!data.person) return null;

    const hasChildren = data.children.length > 0;

    const avatarBg =
      data.person.gender === 'male'
        ? { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' }
        : data.person.gender === 'female'
          ? { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' }
          : { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' };

    const spouseAvatarBg =
      data.person.gender === 'male'
        ? { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' }
        : data.person.gender === 'female'
          ? { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' }
          : { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' };

    const inLawBadgeStyles =
      data.person.gender === 'male'
        ? { backgroundColor: 'rgb(224 242 254 / 0.5)', color: 'sky.700', borderColor: 'rgb(186 230 253 / 0.6)' }
        : data.person.gender === 'female'
          ? { backgroundColor: 'rgb(255 241 242 / 0.5)', color: 'rose.700', borderColor: 'rgb(253 202 202 / 0.6)' }
          : { backgroundColor: 'rgb(244 244 245 / 0.5)', color: 'stone.700', borderColor: 'rgb(228 228 231 / 0.6)' };

    return (
      <div className={css({ position: 'relative', paddingLeft: '6', paddingY: '1.5' })}>
        {level > 0 && (
          <>
            <div
              className={css({ position: 'absolute', borderLeftWidth: '1.5px', borderColor: 'stone.300' })}
              style={{
                left: '0',
                top: isLast ? '-16px' : '-16px',
                bottom: isLast ? 'auto' : '-16px',
                height: isLast ? '40px' : '100%',
              }}
            />
            <div
              className={css({
                position: 'absolute',
                borderLeftWidth: '1.5px',
                borderBottomWidth: '1.5px',
                borderColor: 'stone.300',
                borderBottomLeftRadius: 'xl',
              })}
              style={{ left: '0', top: '24px', width: '24px', height: '24px' }}
            />
          </>
        )}

        <div className={css({ display: 'flex', alignItems: 'center', gap: '2', position: 'relative', zIndex: 10 })}>
          <div
            className={css({
              width: '5',
              height: '5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              zIndex: 10,
              backgroundColor: 'transparent',
            })}
          >
            {hasChildren ? (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={css({
                  width: '5',
                  height: '5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'white',
                  borderWidth: '1px',
                  borderColor: 'stone.200',
                  borderRadius: 'sm',
                  boxShadow: 'sm',
                  color: 'stone.500',
                  _hover: { backgroundColor: 'amber.50', color: 'amber.600' },
                  outline: 'none',
                  transition: 'colors 0.2s',
                })}
                aria-label={isExpanded ? 'Thu gọn' : 'Mở rộng'}
              >
                {isExpanded ? (
                  <ChevronDown strokeWidth={2.5} className={css({ width: '3.5', height: '3.5' })} />
                ) : (
                  <ChevronRight strokeWidth={2.5} className={css({ width: '3.5', height: '3.5' })} />
                )}
              </button>
            ) : (
              <div
                className={css({ width: '1.5', height: '1.5', borderRadius: 'full', backgroundColor: 'stone.300', boxShadow: '2px', boxShadowColor: 'white' })}
              />
            )}
          </div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className={css(
              {
                position: 'relative',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '2',
                backgroundColor: 'rgb(255 255 255 / 0.6)',
                backdropFilter: 'blur(12px)',
                borderRadius: '2xl',
                borderWidth: '1px',
                borderColor: 'rgb(228 228 231 / 0.6)',
                padding: '2',
                sm: { padding: '2.5' },
                boxShadow: 'sm',
                _hover: { borderColor: 'amber.300', boxShadow: 'md', backgroundColor: 'rgb(255 255 255 / 0.9)' },
                transition: 'all 0.3s',
                overflow: 'hidden',
                cursor: 'pointer',
              },
              data.person.isDeceased ? { opacity: 0.8, filter: 'grayscale(0.3)' } : {}
            )}
            onClick={() => setMemberModalId(data.person.id)}
          >
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2.5', position: 'relative', zIndex: 10, width: '100%' })}>
              <div className={css({ display: 'flex', flex: 1, alignItems: 'center', gap: '2.5', minWidth: 0 })}>
                {showAvatar && (
                  <div className={css({ position: 'relative', flexShrink: 0 })}>
                    <div
                      className={css(
                        {
                          width: '10',
                          height: '10',
                          borderRadius: 'full',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          boxShadow: 'md',
                          ringWidth: '2px',
                          ringColor: 'white',
                          transition: 'transform 0.3s',
                        },
                        avatarBg
                      )}
                    >
                      {data.person.avatarUrl ? (
                        <img src={data.person.avatarUrl} alt={data.person.fullName} className={css({ height: '100%', width: '100%', objectFit: 'cover' })} />
                      ) : (
                        <DefaultAvatar gender={data.person.gender} />
                      )}
                    </div>
                  </div>
                )}
                <div className={css({ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 })}>
                  <span
                    className={css(
                      {
                        fontWeight: 'bold',
                        fontSize: 'sm',
                        color: 'stone.900',
                        lineHeight: 'tight',
                        marginBottom: '0.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        transition: 'colors 0.2s',
                      },
                      { _groupHover: { color: 'amber.700' } }
                    )}
                  >
                    {data.person.fullName}
                  </span>
                  <span
                    className={css({
                      fontSize: 'xs-plus',
                      color: 'stone.500',
                      fontWeight: 'medium',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1',
                    })}
                  >
                    <svg
                      className={css({ width: '3', height: '3', color: 'stone.400', flexShrink: 0 })}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      role="img"
                      aria-label="Ngày"
                    >
                      <title>Ngày</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className={css({ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
                      {formatDisplayDate(data.person.birthYear, data.person.birthMonth, data.person.birthDay)}
                      {data.person.isDeceased && ` → ${formatDisplayDate(data.person.deathYear, data.person.deathMonth, data.person.deathDay)}`}
                    </span>
                  </span>
                  {data.person.isInLaw && (
                    <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1', marginTop: '1.5', flexShrink: 0 })}>
                      <span
                        className={css(
                          {
                            display: 'inlineFlex',
                            alignItems: 'center',
                            paddingX: '1.5',
                            paddingY: '0.5',
                            borderRadius: 'sm',
                            fontSize: '3xs',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: 'widest',
                            boxShadow: 'xs',
                            borderWidth: '1px',
                          },
                          inLawBadgeStyles
                        )}
                      >
                        {data.person.gender === 'male' ? 'Rể' : data.person.gender === 'female' ? 'Dâu' : 'Khách'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {data.spouses.length > 0 && (
                <div
                  className={css(
                    { display: 'flex', flexWrap: 'wrap', gap: '1.5', marginLeft: '1', paddingLeft: '2', position: 'relative' },
                    {
                      _before: {
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1px',
                        height: '70%',
                        backgroundColor: 'rgb(228 228 231 / 0.8)',
                      },
                    }
                  )}
                >
                  {data.spouses.map((spouseData) => (
                    <button
                      type="button"
                      key={spouseData.person.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMemberModalId(spouseData.person.id);
                      }}
                      className={css(
                        {
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '1',
                          backgroundColor: 'rgb(255 255 255 / 0.5)',
                          borderRadius: 'xl',
                          padding: '1.5',
                          borderWidth: '1px',
                          borderColor: 'rgb(228 228 231 / 0.6)',
                          transition: 'all 0.2s',
                          boxShadow: 'sm',
                          cursor: 'pointer',
                          _hover: { backgroundColor: 'white', borderColor: 'amber.300', boxShadow: 'md' },
                        },
                        spouseData.person.isDeceased ? { opacity: 0.8, filter: 'grayscale(0.3)' } : {}
                      )}
                      title={spouseData.note || (spouseData.person.gender === 'male' ? 'Chồng' : 'Vợ')}
                    >
                      {showAvatar && (
                        <div
                          className={css(
                            {
                              width: '8',
                              height: '8',
                              borderRadius: 'full',
                              overflow: 'hidden',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '2xs',
                              fontWeight: 'bold',
                              boxShadow: 'sm',
                              ringWidth: '2px',
                              ringColor: 'white',
                              transition: 'transform 0.3s',
                            },
                            spouseAvatarBg
                          )}
                        >
                          {spouseData.person.avatarUrl ? (
                            <img
                              src={spouseData.person.avatarUrl}
                              alt={spouseData.person.fullName}
                              className={css({ height: '100%', width: '100%', objectFit: 'cover' })}
                            />
                          ) : (
                            <DefaultAvatar gender={spouseData.person.gender} />
                          )}
                        </div>
                      )}
                      <span
                        className={css({
                          fontSize: '2xs',
                          fontWeight: 'bold',
                          color: 'stone.600',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '3rem',
                          textAlign: 'center',
                        })}
                      >
                        {spouseData.person.fullName.split(' ').pop()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <AnimatePresence initial={false}>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className={css({ transformOrigin: 'top', position: 'relative', zIndex: 0, marginTop: '-4', paddingTop: '4', overflow: 'hidden' })}
            >
              <div className={css({ paddingBottom: '1' })}>
                {data.children.map((child, index) => (
                  <MindmapNode key={child.id} personId={child.id} level={level + 1} isLast={index === data.children.length - 1} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (roots.length === 0) {
    return (
      <div className={css({ padding: '12', textAlign: 'center' })}>
        <div
          className={css({
            display: 'inlineFlex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '16',
            height: '16',
            borderRadius: 'full',
            backgroundColor: 'stone.100',
            marginBottom: '4',
          })}
        >
          <Share2 className={css({ width: '8', height: '8', color: 'stone.300' })} />
        </div>
        <p className={css({ color: 'stone.500', fontWeight: 'medium', letterSpacing: 'wide' })}>Gia phả trống</p>
      </div>
    );
  }

  return (
    <div
      className={css({
        width: '100%',
        height: '100%',
        position: 'relative',
        padding: '4',
        sm: { padding: '6' },
        lg: { padding: '8', justifyContent: 'center' },
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        justifyContent: 'start',
        overflowX: 'auto',
      })}
    >
      <div id="export-container" className={css({ fontFamily: 'sans', minWidth: 'max-content', paddingBottom: '20', padding: '8' })}>
        {roots.map((root, index) => (
          <MindmapNode key={root.id} personId={root.id} level={0} isLast={index === roots.length - 1} />
        ))}
      </div>
    </div>
  );
}
