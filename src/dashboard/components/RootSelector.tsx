import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css } from '../../../styled-system/css';
import type { Person } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { useDashboard } from './DashboardContext';

const getGenderStyle = (gender: string) => {
  if (gender === 'male') return { backgroundColor: 'sky.100', color: 'sky.600' };
  if (gender === 'female') return { backgroundColor: 'rose.100', color: 'rose.600' };
  return { backgroundColor: 'stone.100', color: 'stone.600' };
};

const getAvatarBg = (gender: string) => {
  if (gender === 'male') return { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)', color: 'white' };
  if (gender === 'female') return { background: 'linear-gradient(to bottom right, #fb7185, #be123c)', color: 'white' };
  return { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)', color: 'white' };
};

export default function RootSelector({ persons, currentRootId }: { persons: Person[]; currentRootId: string }) {
  const { setRootId } = useDashboard();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentRootPerson = persons.find((p) => p.id === currentRootId);

  const filteredPersons = persons.filter((p) => p.fullName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 20);

  const handleSelect = (personId: string) => {
    setRootId(personId);
    setIsOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={css({ position: 'relative', width: '100%', sm: { width: '72' } })} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={css(
          {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '3',
            backgroundColor: 'rgb(255 255 255 / 0.6)',
            backdropFilter: 'blur(12px)',
            borderRadius: 'xl',
            paddingX: '3',
            paddingY: '2',
            fontSize: 'sm',
            boxShadow: 'sm',
            transition: 'all 0.3s',
            outline: 'none',
          },
          isOpen
            ? { borderColor: 'amber.300', backgroundColor: 'white', boxShadow: 'md', borderWidth: '1px', borderStyle: 'solid' }
            : {
                borderColor: 'rgb(228 228 231 / 0.6)',
                borderWidth: '1px',
                borderStyle: 'solid',
                _hover: { borderColor: 'amber.300', backgroundColor: 'rgb(255 255 255 / 0.9)', boxShadow: 'md' },
              }
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
                ringWidth: '2px',
                ringColor: 'white',
                boxShadow: 'xs',
              },
              currentRootPerson ? getAvatarBg(currentRootPerson.gender) : { backgroundColor: 'stone.100', color: 'stone.400' }
            )}
          >
            {currentRootPerson ? (
              currentRootPerson.avatarUrl ? (
                <img
                  src={currentRootPerson.avatarUrl}
                  alt={currentRootPerson.fullName}
                  className={css({ height: '100%', width: '100%', objectFit: 'cover' })}
                />
              ) : (
                <DefaultAvatar gender={currentRootPerson.gender} />
              )
            ) : (
              '?'
            )}
          </div>
          {currentRootPerson && (
            <div
              className={css(
                {
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '3.5',
                  height: '3.5',
                  borderRadius: 'full',
                  ringWidth: '2px',
                  ringColor: 'white',
                  boxShadow: 'xs',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                getGenderStyle(currentRootPerson.gender)
              )}
            >
              {currentRootPerson.gender === 'male' ? (
                <MaleIcon className={css({ width: '2.5', height: '2.5' })} />
              ) : currentRootPerson.gender === 'female' ? (
                <FemaleIcon className={css({ width: '2.5', height: '2.5' })} />
              ) : null}
            </div>
          )}
        </div>

        <div className={css({ flex: '1', minWidth: 0, textAlign: 'left' })}>
          <p
            className={css({
              fontSize: '2xs',
              fontWeight: 'bold',
              color: 'stone.400',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              lineHeight: 'none',
              marginBottom: '0.5',
            })}
          >
            {t('nav.rootDisplay')}
          </p>
          <p
            className={css({
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              color: 'stone.800',
              fontWeight: 'semibold',
              userSelect: 'none',
              lineHeight: 'tight',
            })}
          >
            {currentRootPerson ? currentRootPerson.fullName : t('nav.selectPerson')}
          </p>
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }}>
          <ChevronDown
            className={css(
              { width: '4', height: '4', flexShrink: 0, transition: 'color 0.3s' },
              isOpen ? { color: 'amber.600' } : { color: 'stone.400', _hover: { color: 'stone.600' } }
            )}
          />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={css({
              position: 'absolute',
              zIndex: 50,
              width: '100%',
              marginTop: '2',
              backgroundColor: 'rgb(255 255 255 / 0.95)',
              backdropFilter: 'blur(24px)',
              borderRadius: 'xl',
              boxShadow: 'xl',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'rgb(228 228 231 / 0.8)',
              maxHeight: '20rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              ringWidth: '1px',
              ringColor: 'rgb(0 0 0 / 0.05)',
            })}
          >
            <div
              className={css({
                padding: '2',
                borderBottomWidth: '1px',
                borderColor: 'rgb(228 228 231 / 0.8)',
                backgroundColor: 'rgb(255 255 255 / 0.5)',
                backdropFilter: 'blur(4px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              })}
            >
              <div className={css({ position: 'relative' })}>
                <Search
                  className={css({ position: 'absolute', left: '3', top: '50%', transform: 'translateY(-50%)', width: '4', height: '4', color: 'stone.400' })}
                />
                <input
                  type="text"
                  className={css({
                    width: '100%',
                    color: 'stone.900',
                    _placeholder: { color: 'stone.400' },
                    backgroundColor: 'white',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: 'rgb(228 228 231 / 0.8)',
                    borderRadius: 'lg',
                    paddingLeft: '9',
                    paddingRight: '3',
                    paddingY: '2',
                    fontSize: 'sm',
                    outline: 'none',
                    boxShadow: 'sm',
                    transition: 'all 0.2s',
                  })}
                  placeholder={t('nav.searchMember')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  // biome-ignore lint/a11y/noAutofocus: focus search when dropdown opens
                  autoFocus
                />
              </div>
            </div>
            <div className={css({ overflowY: 'auto', flex: '1', padding: '1.5' })}>
              {filteredPersons.length > 0 ? (
                <div className={css({ gap: '0.5' })}>
                  {filteredPersons.map((person) => {
                    const isSelected = person.id === currentRootId;
                    return (
                      <button
                        type="button"
                        key={person.id}
                        onClick={() => handleSelect(person.id)}
                        className={css(
                          {
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3',
                            paddingX: '3',
                            paddingY: '2',
                            fontSize: 'sm',
                            borderRadius: 'lg',
                            transition: 'all 0.2s',
                          },
                          isSelected
                            ? {
                                backgroundColor: 'amber.50',
                                color: 'amber.900',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                borderColor: 'rgb(245 158 11 / 0.5)',
                                boxShadow: 'sm',
                              }
                            : { color: 'stone.700', _hover: { backgroundColor: 'rgb(228 228 231 / 0.8)' }, borderWidth: '0px' }
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
                                fontSize: '2xs',
                                fontWeight: 'bold',
                                color: 'white',
                                overflow: 'hidden',
                                ringWidth: '1px',
                                ringColor: 'white',
                                boxShadow: 'xs',
                              },
                              getAvatarBg(person.gender)
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
                              getGenderStyle(person.gender)
                            )}
                          >
                            {person.gender === 'male' ? (
                              <MaleIcon className={css({ width: '2.5', height: '2.5' })} />
                            ) : person.gender === 'female' ? (
                              <FemaleIcon className={css({ width: '2.5', height: '2.5' })} />
                            ) : null}
                          </div>
                        </div>

                        <div className={css({ flex: '1', minWidth: 0, textAlign: 'left' })}>
                          <p
                            className={css(
                              { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                              isSelected ? { fontWeight: 'bold' } : { fontWeight: 'medium', _hover: { color: 'stone.900' } }
                            )}
                          >
                            {person.fullName}
                          </p>
                          {person.generation != null && (
                            <p className={css({ fontSize: '2xs', color: 'stone.400', fontWeight: 'medium' })}>
                              {t('nav.generationN', { gen: person.generation })}
                            </p>
                          )}
                        </div>

                        {isSelected && <Check className={css({ width: '4', height: '4', color: 'amber.600', flexShrink: 0 })} />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div
                  className={css({
                    paddingX: '4',
                    paddingY: '8',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2',
                  })}
                >
                  <div
                    className={css({
                      width: '10',
                      height: '10',
                      borderRadius: 'full',
                      backgroundColor: 'stone.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1',
                    })}
                  >
                    <Search className={css({ width: '5', height: '5', color: 'stone.300' })} />
                  </div>
                  <div className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'stone.600' })}>{t('nav.noSearchResults')}</div>
                  <div className={css({ fontSize: 'xs', color: 'stone.400' })}>{t('nav.tryDifferentSearch')}</div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
