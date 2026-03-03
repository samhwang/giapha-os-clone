import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftRight, BookOpen, GitMerge, Info, Search, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import type { PersonNode, RelEdge } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { computeKinship } from '../utils/kinshipHelpers';

interface Props {
  persons: PersonNode[];
  relationships: RelEdge[];
}

const getGenderStyle = (gender: string) => {
  if (gender === 'male') return { backgroundColor: 'sky.100', color: 'sky.600' };
  if (gender === 'female') return { backgroundColor: 'rose.100', color: 'rose.600' };
  return { backgroundColor: 'stone.100', color: 'stone.600' };
};

const getAvatarBg = (gender: string) => {
  if (gender === 'male') return { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' };
  if (gender === 'female') return { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' };
  return { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' };
};

function PersonSelector({
  label,
  selected,
  onSelect,
  persons,
  disabledId,
}: {
  label: string;
  selected: PersonNode | null;
  onSelect: (p: PersonNode) => void;
  persons: PersonNode[];
  disabledId?: string;
}) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => persons.filter((p) => p.id !== disabledId && p.fullName.toLowerCase().includes(search.toLowerCase())).slice(0, 20),
    [persons, disabledId, search]
  );

  const isSelected = !!selected;

  return (
    <div className={css({ flex: 1, minWidth: 0, position: 'relative' })}>
      <p className={css({ fontSize: 'xs', fontWeight: 'semibold', color: 'stone.400', textTransform: 'uppercase', letterSpacing: 'wider', marginBottom: '2' })}>
        {label}
      </p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={css(
          {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            paddingX: '4',
            paddingY: '3',
            borderRadius: '2xl',
            textAlign: 'left',
            transition: 'all 0.2s',
          },
          isSelected
            ? { backgroundColor: 'amber.50', borderWidth: '1px', borderColor: 'amber.300', color: 'stone.800' }
            : {
                backgroundColor: 'rgb(255 255 255 / 0.8)',
                borderWidth: '1px',
                borderColor: 'stone.200',
                color: 'stone.400',
                _hover: { borderColor: 'amber.200' },
              }
        )}
      >
        <div className={css({ position: 'relative', flexShrink: 0 })}>
          <div
            className={css(
              {
                width: '10',
                height: '10',
                borderRadius: 'full',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'sm',
                fontWeight: 'bold',
                color: 'white',
                overflow: 'hidden',
                ringWidth: '2px',
                ringColor: 'white',
                boxShadow: 'sm',
              },
              isSelected ? getAvatarBg(selected.gender) : { backgroundColor: 'stone.100', color: 'stone.400' }
            )}
          >
            {selected ? <DefaultAvatar gender={selected.gender} /> : '?'}
          </div>
          {selected && (
            <div
              className={css(
                {
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '4',
                  height: '4',
                  borderRadius: 'full',
                  ringWidth: '2px',
                  ringColor: 'white',
                  boxShadow: 'xs',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                getGenderStyle(selected.gender)
              )}
            >
              {selected.gender === 'male' ? (
                <MaleIcon className={css({ width: '3', height: '3' })} />
              ) : selected.gender === 'female' ? (
                <FemaleIcon className={css({ width: '3', height: '3' })} />
              ) : null}
            </div>
          )}
        </div>

        <span className={css({ fontWeight: 'semibold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' })}>
          {selected ? selected.fullName : t('kinship.selectMember')}
        </span>
        {selected?.birthYear && <span className={css({ fontSize: 'xs', color: 'stone.400', flexShrink: 0 })}>({selected.birthYear})</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={css({
              position: 'absolute',
              top: '100%',
              marginTop: '2',
              left: 0,
              right: 0,
              zIndex: 50,
              backgroundColor: 'white',
              borderRadius: '2xl',
              boxShadow: 'xl',
              borderWidth: '1px',
              borderColor: 'rgb(228 228 231 / 0.6)',
              overflow: 'hidden',
            })}
          >
            <div className={css({ padding: '3', borderBottomWidth: '1px', borderColor: 'stone.100' })}>
              <div className={css({ position: 'relative' })}>
                <Search
                  className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', width: '4', height: '4', color: 'stone.400' })}
                />
                <input
                  placeholder={t('kinship.searchName')}
                  className={css({
                    width: '100%',
                    paddingLeft: '9',
                    paddingRight: '4',
                    paddingY: '2',
                    fontSize: 'sm',
                    borderRadius: 'xl',
                    borderWidth: '1px',
                    borderColor: 'stone.200',
                    outline: 'none',
                    _focus: { borderColor: 'amber.400' },
                  })}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className={css({ maxHeight: '52', overflowY: 'auto' })}>
              {filtered.length === 0 ? (
                <p className={css({ textAlign: 'center', paddingY: '6', fontSize: 'sm', color: 'stone.400' })}>{t('kinship.notFound')}</p>
              ) : (
                filtered.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      onSelect(p);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={css(
                      {
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3',
                        paddingX: '4',
                        paddingY: '2.5',
                        transition: 'colors 0.2s',
                        textAlign: 'left',
                      },
                      { _hover: { backgroundColor: 'amber.50' } }
                    )}
                  >
                    <div className={css({ position: 'relative', flexShrink: 0 })}>
                      <div
                        className={css(
                          {
                            width: '8',
                            height: '8',
                            borderRadius: 'full',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 'xs',
                            fontWeight: 'bold',
                            color: 'white',
                            overflow: 'hidden',
                            ringWidth: '1px',
                            ringColor: 'white',
                            boxShadow: 'xs',
                          },
                          getAvatarBg(p.gender)
                        )}
                      >
                        <DefaultAvatar gender={p.gender} />
                      </div>
                      <div
                        className={css(
                          {
                            position: 'absolute',
                            bottom: '-2px',
                            right: '-2px',
                            width: '3.5',
                            height: '3.5',
                            borderRadius: 'full',
                            ringWidth: '1px',
                            ringColor: 'white',
                            boxShadow: 'xs',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                          getGenderStyle(p.gender)
                        )}
                      >
                        {p.gender === 'male' ? (
                          <MaleIcon className={css({ width: '2.5', height: '2.5' })} />
                        ) : p.gender === 'female' ? (
                          <FemaleIcon className={css({ width: '2.5', height: '2.5' })} />
                        ) : null}
                      </div>
                    </div>

                    <span
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'stone.700',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {p.fullName}
                    </span>
                    {p.birthYear && <span className={css({ fontSize: 'xs', color: 'stone.400', marginLeft: 'auto', flexShrink: 0 })}>{p.birthYear}</span>}
                    {p.generation != null && (
                      <span
                        className={css({
                          fontSize: 'xs',
                          color: 'emerald.600',
                          backgroundColor: 'emerald.50',
                          paddingX: '1.5',
                          paddingY: '0.5',
                          borderRadius: 'md',
                          flexShrink: 0,
                        })}
                      >
                        {t('kinship.generationShort', { gen: p.generation })}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const KINSHIP_TERMS = [
  { relation: 'Cha / Mẹ', desc: '1 bậc trên (dòng trực hệ)', example: 'Bố, ba, má...' },
  { relation: 'Ông / Bà', desc: '2 bậc trên (dòng trực hệ)', example: 'Ông nội, bà ngoại...' },
  { relation: 'Cụ / Kỵ / Sơ...', desc: '3 bậc trên trở lên', example: 'Cụ cố, cụ kỵ...' },
  { relation: 'Con / Cháu / Chắt...', desc: 'Các bậc dưới trực hệ', example: 'Con, cháu, chắt, chít...' },
  { relation: 'Anh / Chị / Em họ', desc: 'Cùng thế hệ, khác nhánh', example: 'Dựa vào thứ bậc của nhánh cha/mẹ' },
  { relation: 'Bác / Chú / Cô', desc: 'Anh/chị/em của cha (Bên Nội)', example: 'Bác (anh), Chú (em trai), Cô (chị em gái)' },
  { relation: 'Cậu / Dì', desc: 'Anh/chị/em của mẹ (Bên Ngoại)', example: 'Cậu (anh em trai), Dì (chị em gái)' },
  { relation: 'Thím / Mợ / Dượng', desc: 'Vợ/chồng của chú, cậu, cô, dì', example: 'Thím (vợ chú), Mợ (vợ cậu), Dượng (chồng cô/dì)' },
];

export default function KinshipFinder({ persons, relationships }: Props) {
  const { t } = useTranslation();
  const [personA, setPersonA] = useState<PersonNode | null>(null);
  const [personB, setPersonB] = useState<PersonNode | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const result = useMemo(() => {
    if (!personA || !personB) return null;
    return computeKinship(personA, personB, persons, relationships);
  }, [personA, personB, persons, relationships]);

  const swap = () => {
    setPersonA(personB);
    setPersonB(personA);
  };

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      <div
        className={css({
          backgroundColor: 'rgb(255 255 255 / 0.8)',
          backdropFilter: 'blur(12px)',
          borderWidth: '1px',
          borderColor: 'rgb(228 228 231 / 0.6)',
          borderRadius: '2xl',
          padding: '6',
          boxShadow: 'sm',
        })}
      >
        <div className={css({ display: 'flex', alignItems: 'flex-end', gap: '3' })}>
          <PersonSelector label={t('kinship.memberA')} selected={personA} onSelect={setPersonA} persons={persons} disabledId={personB?.id} />
          <button
            type="button"
            onClick={swap}
            title={t('kinship.swap')}
            className={css(
              {
                width: '10',
                height: '10',
                flexShrink: 0,
                marginBottom: '0.5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'xl',
                backgroundColor: 'stone.100',
                color: 'stone.500',
                transition: 'all 0.2s',
                borderWidth: '1px',
                borderColor: 'stone.200',
              },
              { _hover: { backgroundColor: 'amber.100', color: 'amber.600' } }
            )}
          >
            <ArrowLeftRight className={css({ width: '4', height: '4' })} />
          </button>
          <PersonSelector label={t('kinship.memberB')} selected={personB} onSelect={setPersonB} persons={persons} disabledId={personA?.id} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!personA || !personB ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={css({ textAlign: 'center', paddingY: '16', color: 'stone.400' })}
          >
            <Users className={css({ width: '12', height: '12', marginX: 'auto', marginBottom: '3', opacity: 0.3 })} />
            <p className={css({ fontWeight: 'medium' })}>{t('kinship.selectTwo')}</p>
          </motion.div>
        ) : result === null ? (
          <motion.div key="same" className={css({ textAlign: 'center', paddingY: '8', color: 'stone.400' })}>
            {t('kinship.selectDifferent')}
          </motion.div>
        ) : (
          <motion.div
            key={`${personA.id}-${personB.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}
          >
            <div
              className={css({
                backgroundColor: 'amber.50',
                borderWidth: '1px',
                borderColor: 'amber.200',
                borderRadius: '2xl',
                paddingX: '5',
                paddingY: '4',
                display: 'flex',
                alignItems: 'center',
                gap: '3',
              })}
            >
              <Sparkles className={css({ width: '5', height: '5', color: 'amber.500', flexShrink: 0 })} />
              <p className={css({ color: 'amber.800', fontWeight: 'semibold' })}>{result.description}</p>
            </div>

            <div className={css({ display: 'grid', gridTemplateColumns: { base: '1', sm: '2' }, gap: '4' })}>
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.9)',
                  borderWidth: '1px',
                  borderColor: 'rgb(228 228 231 / 0.6)',
                  borderRadius: '2xl',
                  padding: '5',
                  boxShadow: 'sm',
                })}
              >
                <p
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'semibold',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                    color: 'stone.400',
                    marginBottom: '3',
                  })}
                >
                  {t('kinship.aCallsB', { personA: personA.fullName, personB: personB.fullName })}
                </p>
                <p className={css({ fontSize: '4xl', fontFamily: 'serif', fontWeight: 'bold', color: 'amber.600', textTransform: 'capitalize' })}>
                  {result.aCallsB}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={css({
                  backgroundColor: 'rgb(255 255 255 / 0.9)',
                  borderWidth: '1px',
                  borderColor: 'rgb(228 228 231 / 0.6)',
                  borderRadius: '2xl',
                  padding: '5',
                  boxShadow: 'sm',
                })}
              >
                <p
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'semibold',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                    color: 'stone.400',
                    marginBottom: '3',
                  })}
                >
                  {t('kinship.bCallsA', { personA: personA.fullName, personB: personB.fullName })}
                </p>
                <p className={css({ fontSize: '4xl', fontFamily: 'serif', fontWeight: 'bold', color: 'amber.600', textTransform: 'capitalize' })}>
                  {result.bCallsA}
                </p>
              </motion.div>
            </div>

            {result.pathLabels.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className={css({
                  backgroundColor: 'stone.50',
                  borderWidth: '1px',
                  borderColor: 'rgb(228 228 231 / 0.6)',
                  borderRadius: '2xl',
                  paddingX: '6',
                  paddingY: '5',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2', marginBottom: '4' })}>
                  <GitMerge className={css({ width: '4', height: '4', color: 'stone.400' })} />
                  <p className={css({ fontSize: 'xs', fontWeight: 'semibold', textTransform: 'uppercase', letterSpacing: 'wider', color: 'stone.400' })}>
                    {t('kinship.pathAnalysis')}
                  </p>
                </div>
                <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
                  {result.pathLabels.map((pathLabel, i) => (
                    <div key={pathLabel} className={css({ display: 'flex', alignItems: 'flex-start', gap: '4' })}>
                      <div
                        className={css({
                          width: '6',
                          height: '6',
                          borderRadius: 'full',
                          backgroundColor: 'white',
                          borderWidth: '1px',
                          borderColor: 'stone.200',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '0.5',
                          boxShadow: 'sm',
                          flexShrink: 0,
                        })}
                      >
                        <span className={css({ fontSize: '2xs', fontWeight: 'bold', color: 'stone.400' })}>{i + 1}</span>
                      </div>
                      <p className={css({ fontSize: 'sm', color: 'stone.600', lineHeight: 'relaxed', paddingTop: '1' })}>{pathLabel}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {(result.aCallsB.includes('/') || result.aCallsB.includes('họ hàng')) && (
              <p className={css({ fontSize: 'xs', color: 'stone.400', fontStyle: 'italic', paddingX: '1' })}>{t('kinship.kinshipNote')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={css({ borderTopWidth: '1px', borderColor: 'rgb(228 228 231 / 0.6)', paddingTop: '6', display: 'flex', flexDirection: 'column', gap: '4' })}
      >
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className={css(
            { display: 'flex', alignItems: 'center', gap: '2', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.500', transition: 'colors 0.2s' },
            { _hover: { color: 'amber.600' } }
          )}
        >
          <BookOpen className={css({ width: '4', height: '4' })} />
          {showGuide ? t('kinship.hideGuide') : t('kinship.showGuide')}
        </button>

        <AnimatePresence>
          {showGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className={css({ overflow: 'hidden' })}
            >
              <div className={css({ display: 'flex', flexDirection: 'column', gap: '5' })}>
                <div
                  className={css({
                    backgroundColor: 'rgb(59 130 246 / 0.1)',
                    borderWidth: '1px',
                    borderColor: 'rgb(59 130 246 / 0.2)',
                    borderRadius: '2xl',
                    padding: '5',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'blue.700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      marginBottom: '3',
                    })}
                  >
                    <Info className={css({ width: '4', height: '4' })} />
                    {t('kinship.howItWorks')}
                  </p>
                  <ol className={css({ display: 'flex', flexDirection: 'column', gap: '2', fontSize: 'sm', color: 'blue.800' })}>
                    {[1, 2, 3, 4, 5].map((step) => (
                      <li key={step} className={css({ display: 'flex', gap: '2' })}>
                        <span className={css({ fontWeight: 'bold', flexShrink: 0 })}>{step}.</span>
                        <Trans i18nKey={`kinship.howStep${step}`} components={{ strong: <strong /> }} />
                      </li>
                    ))}
                  </ol>
                </div>

                <div
                  className={css({
                    backgroundColor: 'rgb(245 158 11 / 0.1)',
                    borderWidth: '1px',
                    borderColor: 'rgb(245 158 11 / 0.2)',
                    borderRadius: '2xl',
                    padding: '5',
                  })}
                >
                  <p
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'amber.700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      marginBottom: '2',
                    })}
                  >
                    <Info className={css({ width: '4', height: '4' })} />
                    {t('kinship.dataRequirements')}
                  </p>
                  <ul className={css({ display: 'flex', flexDirection: 'column', gap: '1.5', fontSize: 'sm', color: 'amber.800' })}>
                    {[1, 2, 3].map((req) => (
                      <li key={req} className={css({ display: 'flex', gap: '2' })}>
                        <span className={css({ color: 'amber.400', flexShrink: 0 })}>•</span>
                        <Trans i18nKey={`kinship.dataReq${req}`} components={{ strong: <strong /> }} />
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={css({
                    backgroundColor: 'rgb(255 255 255 / 0.8)',
                    borderWidth: '1px',
                    borderColor: 'rgb(228 228 231 / 0.6)',
                    borderRadius: '2xl',
                    overflow: 'hidden',
                  })}
                >
                  <div
                    className={css({
                      paddingX: '5',
                      paddingY: '3',
                      borderBottomWidth: '1px',
                      borderColor: 'stone.100',
                      backgroundColor: 'rgb(250 250 250 / 0.5)',
                    })}
                  >
                    <p className={css({ fontSize: 'sm', fontWeight: 'bold', color: 'stone.600' })}>{t('kinship.referenceTable')}</p>
                  </div>
                  <div className={css({ borderBottomWidth: '1px', borderColor: 'stone.100' })}>
                    {KINSHIP_TERMS.map((row) => (
                      <div key={row.relation} className={css({ display: 'flex', alignItems: 'flex-start', gap: '4', paddingX: '5', paddingY: '3' })}>
                        <span className={css({ fontSize: 'sm', fontWeight: 'bold', color: 'amber.700', width: '12', flexShrink: 0 })}>{row.relation}</span>
                        <div className={css({ minWidth: 0 })}>
                          <p className={css({ fontSize: 'sm', color: 'stone.600' })}>{row.desc}</p>
                          <p className={css({ fontSize: 'xs', color: 'stone.400', marginTop: '0.5' })}>{row.example}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
