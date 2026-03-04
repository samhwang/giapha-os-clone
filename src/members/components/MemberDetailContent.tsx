import { motion, type Variants } from 'framer-motion';
import { Briefcase, Info, Leaf, MapPin, Phone, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import { calculateAge, formatDisplayDate, getLunarDateString } from '../../events/utils/dateHelpers';
import RelationshipManager from '../../relationships/components/RelationshipManager';
import type { Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';

interface MemberDetailContentProps {
  person: Person;
  privateData: { phoneNumber?: string | null; occupation?: string | null; currentResidence?: string | null } | null;
  isAdmin: boolean;
}

export default function MemberDetailContent({ person, privateData, isAdmin }: MemberDetailContentProps) {
  const { t } = useTranslation();
  const isDeceased = person.isDeceased;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className={css({ backgroundColor: 'rgb(254 250 244 / 0.5)' })}>
      {/* Header / Cover */}
      <div
        className={css({
          height: '28',
          position: 'relative',
          flexShrink: 0,
          background: 'linear-gradient(to right, rgb(214 211 209), rgb(231 229 228), rgb(214 211 209))',
          sm: { height: '36' },
        })}
      >
        <div
          className={css(
            { position: 'absolute', right: '0', top: '-80', width: '64', height: '64', borderRadius: 'full', filter: 'blur(40px)', opacity: '0.4' },
            person.gender === 'male'
              ? { backgroundColor: 'rgb(125 211 252)' }
              : person.gender === 'female'
                ? { backgroundColor: 'rgb(251 207 232)' }
                : { backgroundColor: 'rgb(212 212 212)' }
          )}
        />
        <div
          className={css({
            position: 'absolute',
            left: '-80',
            bottom: '-80',
            width: '64',
            height: '64',
            borderRadius: 'full',
            filter: 'blur(40px)',
            opacity: 0.2,
            backgroundColor: 'rgb(251 191 36)',
          })}
        />

        <motion.div variants={itemVariants} className={css({ position: 'absolute', bottom: '-12', left: '6', zIndex: '10', sm: { bottom: '-16', left: '8' } })}>
          <div
            className={css(
              {
                height: '24',
                width: '24',
                borderRadius: 'full',
                borderWidth: '4',
                borderStyle: 'solid',
                borderColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3xl',
                fontWeight: 'bold',
                color: 'white',
                overflow: 'hidden',
                boxShadow: 'xl',
                flexShrink: 0,
                sm: { height: '32', width: '32', borderWidth: '4', fontSize: '4xl' },
              },
              person.gender === 'male'
                ? { background: 'linear-gradient(to bottom right, rgb(56 189 248), rgb(29 78 216))' }
                : person.gender === 'female'
                  ? { background: 'linear-gradient(to bottom right, rgb(244 114 182), rgb(190 24 93))' }
                  : { background: 'linear-gradient(to bottom right, rgb(161 161 170), rgb(82 82 91))' }
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
                bottom: '1',
                right: '1',
                width: '6',
                height: '6',
                borderRadius: 'full',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'md',
                sm: { bottom: '2', right: '2', width: '8', height: '8' },
              },
              person.gender === 'male'
                ? { backgroundColor: 'rgb(224 242 254)', color: 'rgb(2 132 199)', ringWidth: '2', ringColor: 'white' }
                : person.gender === 'female'
                  ? { backgroundColor: 'rgb(255 241 242)', color: 'rgb(225 29 72)', ringWidth: '2', ringColor: 'white' }
                  : { backgroundColor: 'rgb(244 244 245)', color: 'rgb(82 82 91)', ringWidth: '2', ringColor: 'white' }
            )}
          >
            {person.gender === 'male' ? (
              <MaleIcon className={css({ width: '4', height: '4', sm: { width: '5', height: '5' } })} />
            ) : person.gender === 'female' ? (
              <FemaleIcon className={css({ width: '4', height: '4', sm: { width: '5', height: '5' } })} />
            ) : null}
          </div>
        </motion.div>
      </div>

      <div
        className={css({ paddingTop: '16', paddingX: '6', paddingBottom: '8', position: 'relative', zIndex: '10', sm: { paddingTop: '20', paddingX: '8' } })}
      >
        <motion.div
          variants={itemVariants}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'start',
            gap: '4',
            sm: { flexDirection: 'row', alignItems: 'center' },
          })}
        >
          <div>
            <h1
              className={css({
                fontSize: '2xl',
                fontFamily: 'serif',
                fontWeight: 'bold',
                color: 'stone.900',
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                flexWrap: 'wrap',
                sm: { fontSize: '3xl', gap: '3' },
              })}
            >
              {person.fullName}
              {isDeceased && (
                <span
                  className={css({
                    fontSize: '2xs',
                    fontFamily: 'sans',
                    fontWeight: 'bold',
                    color: 'stone.500',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.8)',
                    backgroundColor: 'rgb(161 161 169 / 0.5)',
                    borderRadius: 'md',
                    paddingX: '2',
                    paddingY: '0.5',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                    boxShadow: 'xs',
                    sm: { fontSize: 'xs' },
                  })}
                >
                  {t('member.filterDeceased')}
                </span>
              )}
              {person.isInLaw && (
                <span
                  className={css(
                    {
                      fontSize: '2xs',
                      fontFamily: 'sans',
                      fontWeight: 'bold',
                      borderRadius: 'md',
                      paddingX: '2',
                      paddingY: '0.5',
                      whiteSpace: 'nowrap',
                      boxShadow: 'xs',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      textTransform: 'uppercase',
                      letterSpacing: 'wider',
                      sm: { fontSize: 'xs' },
                    },
                    person.gender === 'female'
                      ? { color: 'rose.700', backgroundColor: 'rgb(255 241 242 / 0.5)', borderColor: 'rgb(244 63 94 / 0.6)' }
                      : person.gender === 'male'
                        ? { color: 'sky.700', backgroundColor: 'rgb(224 242 254 / 0.5)', borderColor: 'rgb(14 165 233 / 0.6)' }
                        : { color: 'stone.700', backgroundColor: 'rgb(254 244 243 / 0.5)', borderColor: 'rgb(228 228 231 / 0.6)' }
                  )}
                >
                  {person.gender === 'female' ? t('member.filterInLawFemale') : person.gender === 'male' ? t('member.filterInLawMale') : t('member.inLawOther')}
                </span>
              )}
              {person.birthOrder != null && (
                <span
                  className={css({
                    fontSize: '2xs',
                    fontFamily: 'sans',
                    fontWeight: 'bold',
                    borderRadius: 'md',
                    paddingX: '2',
                    paddingY: '0.5',
                    whiteSpace: 'nowrap',
                    boxShadow: 'xs',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                    color: 'amber.700',
                    backgroundColor: 'rgb(254 243 199 / 0.6)',
                    borderColor: 'rgb(251 191 36 / 0.6)',
                    sm: { fontSize: 'xs' },
                  })}
                >
                  {person.birthOrder === 1 ? t('member.birthOrderFirst') : t('member.birthOrderN', { order: person.birthOrder })}
                </span>
              )}
              {person.generation != null && (
                <span
                  className={css({
                    fontSize: '2xs',
                    fontFamily: 'sans',
                    fontWeight: 'bold',
                    borderRadius: 'md',
                    paddingX: '2',
                    paddingY: '0.5',
                    whiteSpace: 'nowrap',
                    boxShadow: 'xs',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                    color: 'emerald.700',
                    backgroundColor: 'rgb(209 250 229 / 0.6)',
                    borderColor: 'rgb(16 185 129 / 0.6)',
                    sm: { fontSize: 'xs' },
                  })}
                >
                  {t('stats.generationLabel', { gen: person.generation })}
                </span>
              )}
            </h1>

            <div
              className={css({
                marginTop: '6',
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '3',
                sm: { gridTemplateColumns: 'repeat(2, 1fr)', gap: '4' },
                md: { gridTemplateColumns: 'repeat(3, 1fr)' },
              })}
            >
              {/* Birth Card */}
              <motion.div
                variants={itemVariants}
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '2xl',
                  padding: '4',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(214 211 209 / 0.6)',
                  boxShadow: 'sm',
                  transition: 'all 0.2s',
                  _hover: { shadow: 'md', borderColor: 'rgb(252 211 77 / 0.6)' },
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', marginBottom: '2' })}>
                  <span
                    className={css({
                      width: '2',
                      height: '2',
                      borderRadius: 'full',
                      backgroundColor: 'emerald.400',
                      boxShadow: '0 0 8px rgba(52,211,153,0.5)',
                    })}
                  />
                  <h3 className={css({ fontSize: 'xs', fontWeight: 'bold', color: 'stone.400', textTransform: 'uppercase', letterSpacing: 'widest' })}>
                    {t('member.birth')}
                  </h3>
                </div>
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5',
                    paddingLeft: '4',
                    borderLeftWidth: '2px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: 'stone.100',
                  })}
                >
                  <p className={css({ color: 'stone.800', fontWeight: 'semibold', fontSize: 'sm', sm: { fontSize: 'base' } })}>
                    {formatDisplayDate(person.birthYear, person.birthMonth, person.birthDay, t('common.unknown'))}
                  </p>
                  {(person.birthYear || person.birthMonth || person.birthDay) && (
                    <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'stone.500', display: 'flex', alignItems: 'center', gap: '1.5' })}>
                      <span
                        className={css({
                          fontSize: '2xs',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'rgb(214 211 209 / 0.6)',
                          backgroundColor: 'rgb(254 244 243 / 0.8)',
                          borderRadius: 'px',
                          paddingX: '1.5',
                          paddingY: '0.5',
                        })}
                      >
                        {t('member.lunarCalendar')}
                      </span>
                      {getLunarDateString(person.birthYear, person.birthMonth, person.birthDay) || t('common.unknown')}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Death Card */}
              {isDeceased && (
                <motion.div
                  variants={itemVariants}
                  className={css({
                    backgroundColor: 'rgb(255 255 255 / 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '2xl',
                    padding: '4',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(214 211 209 / 0.6)',
                    boxShadow: 'sm',
                    transition: 'all 0.2s',
                    _hover: { shadow: 'md', borderColor: 'rgb(252 211 77 / 0.6)' },
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2', marginBottom: '2' })}>
                    <span
                      className={css({
                        width: '2',
                        height: '2',
                        borderRadius: 'full',
                        backgroundColor: 'stone.400',
                        boxShadow: '0 0 8px rgba(156,163,175,0.5)',
                      })}
                    />
                    <h3 className={css({ fontSize: 'xs', fontWeight: 'bold', color: 'stone.400', textTransform: 'uppercase', letterSpacing: 'widest' })}>
                      {t('member.death')}
                    </h3>
                  </div>
                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5',
                      paddingLeft: '4',
                      borderLeftWidth: '2px',
                      borderLeftStyle: 'solid',
                      borderLeftColor: 'stone.100',
                    })}
                  >
                    <p className={css({ color: 'stone.800', fontWeight: 'semibold', fontSize: 'sm', sm: { fontSize: 'base' } })}>
                      {formatDisplayDate(person.deathYear, person.deathMonth, person.deathDay, t('common.unknown'))}
                    </p>
                    {(person.deathYear || person.deathMonth || person.deathDay) && (
                      <p className={css({ fontSize: 'xs', fontWeight: 'medium', color: 'stone.500', display: 'flex', alignItems: 'center', gap: '1.5' })}>
                        <span
                          className={css({
                            fontSize: '2xs',
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: 'rgb(214 211 209 / 0.6)',
                            backgroundColor: 'rgb(254 244 243 / 0.8)',
                            borderRadius: 'px',
                            paddingX: '1.5',
                            paddingY: '0.5',
                          })}
                        >
                          {t('member.lunarCalendar')}
                        </span>
                        {getLunarDateString(person.deathYear, person.deathMonth, person.deathDay) || t('common.unknown')}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Age Card */}
              {(() => {
                const ageData = calculateAge(person.birthYear, person.deathYear);
                if (!ageData) return null;
                return (
                  <motion.div
                    variants={itemVariants}
                    className={css({
                      background: 'linear-gradient(to bottom right, rgb(254 243 199), rgb(255 237 213 / 0.4))',
                      borderRadius: '2xl',
                      padding: '4',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      borderColor: 'rgb(252 211 77 / 0.5)',
                      boxShadow: 'sm',
                      transition: 'all 0.2s',
                      _hover: { shadow: 'md' },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    })}
                  >
                    <Leaf
                      className={css({
                        position: 'absolute',
                        bottom: '-16',
                        right: '-16',
                        width: '20',
                        height: '20',
                        color: 'rgb(245 158 11 / 0.1)',
                        transform: 'rotate(12deg)',
                      })}
                    />
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2', marginBottom: '1.5', position: 'relative', zIndex: '10' })}>
                      <span
                        className={css(
                          { width: '2', height: '2', borderRadius: 'full' },
                          ageData.isDeceased
                            ? { backgroundColor: 'amber.400', boxShadow: '0 0 8px rgba(251,191,36,0.6)' }
                            : { backgroundColor: 'emerald.400', boxShadow: '0 0 8px rgba(52,211,153,0.6)' }
                        )}
                      />
                      <p
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          color: 'rgb(120 53 15 / 0.6)',
                          textTransform: 'uppercase',
                          letterSpacing: 'widest',
                        })}
                      >
                        {ageData.isDeceased ? (ageData.age >= 60 ? t('member.longevity') : t('member.lifespan')) : t('member.age')}
                      </p>
                    </div>
                    <div className={css({ paddingLeft: '4', position: 'relative', zIndex: '10' })}>
                      <p
                        className={css({
                          fontSize: '3xl',
                          fontWeight: 'black',
                          color: 'transparent',
                          background: 'linear-gradient(to bottom right, rgb(180 83 9), rgb(120 53 15))',
                          backgroundClip: 'text',
                          letterSpacing: 'tight',
                          sm: { fontSize: '4xl' },
                        })}
                      >
                        {ageData.age}
                        <span
                          className={css({
                            fontSize: 'xs',
                            fontWeight: 'bold',
                            color: 'rgb(180 83 9 / 0.6)',
                            marginLeft: '1.5',
                            textTransform: 'uppercase',
                            letterSpacing: 'wider',
                            sm: { fontSize: 'sm' },
                          })}
                        >
                          {t('member.ageSuffix')}
                        </span>
                      </p>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </motion.div>

        <div
          className={css({
            marginTop: '8',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '6',
            lg: { gridTemplateColumns: 'repeat(3, 1fr)' },
            sm: { gap: '8' },
          })}
        >
          {/* Main Info */}
          <div className={css({ lg: { gridColumn: 'span 2' }, display: 'flex', flexDirection: 'column', gap: '8' })}>
            <motion.section variants={itemVariants}>
              <h2
                className={css({
                  fontSize: 'base',
                  fontWeight: 'bold',
                  color: 'stone.800',
                  marginBottom: '4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  sm: { fontSize: 'lg' },
                })}
              >
                <Info className={css({ width: '5', height: '5', color: 'amber.600' })} />
                {t('common.note')}
              </h2>
              <div
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  backdropFilter: 'blur(8px)',
                  padding: '5',
                  borderRadius: '2xl',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(214 211 209 / 0.6)',
                  boxShadow: 'sm',
                  sm: { padding: '6' },
                })}
              >
                <p className={css({ color: 'stone.600', whiteSpace: 'pre-wrap', fontSize: 'sm', lineHeight: 'relaxed', sm: { fontSize: 'base' } })}>
                  {person.note || <span className={css({ color: 'stone.400', fontStyle: 'italic' })}>{t('member.noNote')}</span>}
                </p>
              </div>
            </motion.section>

            <motion.section variants={itemVariants}>
              <h2
                className={css({
                  fontSize: 'base',
                  fontWeight: 'bold',
                  color: 'stone.800',
                  marginBottom: '4',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  sm: { fontSize: 'lg' },
                })}
              >
                <Users className={css({ width: '5', height: '5', color: 'amber.600' })} />
                {t('member.family')}
              </h2>
              <div
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.8)',
                  backdropFilter: 'blur(8px)',
                  padding: '4',
                  borderRadius: '2xl',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'rgb(214 211 209 / 0.6)',
                  boxShadow: 'sm',
                  position: 'relative',
                  zIndex: '0',
                  sm: { padding: '6' },
                })}
              >
                <RelationshipManager personId={person.id} isAdmin={isAdmin} personGender={person.gender} />
              </div>
            </motion.section>
          </div>

          {/* Sidebar / Private Info */}
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
            <motion.div variants={itemVariants}>
              {isAdmin ? (
                <div
                  className={css({
                    backgroundColor: 'stone.50',
                    padding: '5',
                    borderRadius: '2xl',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.8)',
                    boxShadow: 'sm',
                    sm: { padding: '6' },
                  })}
                >
                  <h3
                    className={css({
                      fontWeight: 'bold',
                      color: 'stone.900',
                      marginBottom: '4',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: 'sm',
                      borderBottomWidth: '1px',
                      borderBottomStyle: 'solid',
                      borderBottomColor: 'rgb(228 228 231 / 0.6)',
                      paddingBottom: '3',
                      sm: { fontSize: 'base' },
                    })}
                  >
                    <span
                      className={css({
                        backgroundColor: 'rgb(254 243 199 / 0.8)',
                        color: 'amber.700',
                        padding: '1.5',
                        borderRadius: 'lg',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderColor: 'rgb(252 211 77 / 0.5)',
                      })}
                    >
                      🔒
                    </span>
                    {t('member.contactInfo')}
                  </h3>
                  <dl className={css({ display: 'flex', flexDirection: 'column', gap: '4', fontSize: 'sm', sm: { fontSize: 'base' } })}>
                    <div>
                      <dt
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          color: 'stone.500',
                          textTransform: 'uppercase',
                          letterSpacing: 'wider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5',
                          marginBottom: '1',
                        })}
                      >
                        <Phone className={css({ width: '3.5', height: '3.5' })} /> {t('member.phone')}
                      </dt>
                      <dd
                        className={css({
                          color: 'stone.900',
                          fontWeight: 'medium',
                          backgroundColor: 'white',
                          paddingX: '3',
                          paddingY: '2',
                          borderRadius: 'lg',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'rgb(214 211 209 / 0.6)',
                          boxShadow: 'xs',
                        })}
                      >
                        {privateData?.phoneNumber || <span className={css({ color: 'stone.400', fontWeight: 'normal' })}>{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          color: 'stone.500',
                          textTransform: 'uppercase',
                          letterSpacing: 'wider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5',
                          marginBottom: '1',
                        })}
                      >
                        <Briefcase className={css({ width: '3.5', height: '3.5' })} /> {t('member.occupation')}
                      </dt>
                      <dd
                        className={css({
                          color: 'stone.900',
                          fontWeight: 'medium',
                          backgroundColor: 'white',
                          paddingX: '3',
                          paddingY: '2',
                          borderRadius: 'lg',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'rgb(214 211 209 / 0.6)',
                          boxShadow: 'xs',
                        })}
                      >
                        {privateData?.occupation || <span className={css({ color: 'stone.400', fontWeight: 'normal' })}>{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                    <div>
                      <dt
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'bold',
                          color: 'stone.500',
                          textTransform: 'uppercase',
                          letterSpacing: 'wider',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1.5',
                          marginBottom: '1',
                        })}
                      >
                        <MapPin className={css({ width: '3.5', height: '3.5' })} /> {t('member.currentResidence')}
                      </dt>
                      <dd
                        className={css({
                          color: 'stone.900',
                          fontWeight: 'medium',
                          backgroundColor: 'white',
                          paddingX: '3',
                          paddingY: '2',
                          borderRadius: 'lg',
                          borderWidth: '1px',
                          borderStyle: 'solid',
                          borderColor: 'rgb(214 211 209 / 0.6)',
                          boxShadow: 'xs',
                        })}
                      >
                        {privateData?.currentResidence || <span className={css({ color: 'stone.400', fontWeight: 'normal' })}>{t('member.notUpdated')}</span>}
                      </dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div
                  className={css({
                    backgroundColor: 'rgb(254 244 243 / 0.5)',
                    padding: '5',
                    borderRadius: '2xl',
                    borderWidth: '1px',
                    borderStyle: 'dashed',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: '2',
                  })}
                >
                  <span className={css({ fontSize: '2xl', opacity: 0.5 })}>🔒</span>
                  <p className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'stone.500' })}>{t('member.contactAdminOnly')}</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
