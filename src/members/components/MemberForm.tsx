import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { AlertCircle, Briefcase, Image as ImageIcon, Loader2, Lock, MapPin, Phone, Settings2, Trash2, User } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { css, cx } from '../../../styled-system/css';
import { button } from '../../../styled-system/recipes';
import type { Gender, Person } from '../../types';
import { createPerson, updatePerson, uploadPersonAvatar } from '../server/member';

interface MemberFormData extends Person {
  phoneNumber?: string | null;
  occupation?: string | null;
  currentResidence?: string | null;
}

interface MemberFormProps {
  initialData?: MemberFormData;
  isEditing?: boolean;
  isAdmin?: boolean;
  onSuccess?: (personId: string) => void;
  onCancel?: () => void;
}

export default function MemberForm({ initialData, isEditing = false, isAdmin = false, onSuccess, onCancel }: MemberFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'male');
  const [birthYear, setBirthYear] = useState<number | ''>(initialData?.birthYear || '');
  const [birthMonth, setBirthMonth] = useState<number | ''>(initialData?.birthMonth || '');
  const [birthDay, setBirthDay] = useState<number | ''>(initialData?.birthDay || '');
  const [deathYear, setDeathYear] = useState<number | ''>(initialData?.deathYear || '');
  const [deathMonth, setDeathMonth] = useState<number | ''>(initialData?.deathMonth || '');
  const [deathDay, setDeathDay] = useState<number | ''>(initialData?.deathDay || '');
  const [isDeceased, setIsDeceased] = useState<boolean>(initialData?.isDeceased || false);
  const [isInLaw, setIsInLaw] = useState<boolean>(initialData?.isInLaw || false);
  const [birthOrder, setBirthOrder] = useState<number | ''>(initialData?.birthOrder || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [note, setNote] = useState(initialData?.note || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [currentResidence, setCurrentResidence] = useState(initialData?.currentResidence || '');

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const isValidDate = (day: number | '', month: number | '', year: number | '') => {
      if (day !== '' && (day < 1 || day > 31)) return false;
      if (month !== '' && (month < 1 || month > 12)) return false;
      if (year !== '' && year < 1) return false;
      if (day !== '' && month !== '') {
        const currentYear = year !== '' ? year : 2000;
        const daysInMonth = new Date(currentYear, month, 0).getDate();
        if (day > daysInMonth) return false;
      }
      return true;
    };

    if (!isValidDate(birthDay, birthMonth, birthYear)) {
      setError(t('member.invalidBirthDate'));
      setLoading(false);
      return;
    }

    if (isDeceased && !isValidDate(deathDay, deathMonth, deathYear)) {
      setError(t('member.invalidDeathDate'));
      setLoading(false);
      return;
    }

    if (isDeceased && birthYear !== '' && deathYear !== '' && deathYear < birthYear) {
      setError(t('member.deathBeforeBirth'));
      setLoading(false);
      return;
    }

    try {
      const finalAvatarUrl = avatarUrl;

      const personData = {
        fullName,
        gender,
        birthYear: birthYear === '' ? null : Number(birthYear),
        birthMonth: birthMonth === '' ? null : Number(birthMonth),
        birthDay: birthDay === '' ? null : Number(birthDay),
        deathYear: isDeceased && deathYear !== '' ? Number(deathYear) : null,
        deathMonth: isDeceased && deathMonth !== '' ? Number(deathMonth) : null,
        deathDay: isDeceased && deathDay !== '' ? Number(deathDay) : null,
        isDeceased,
        isInLaw,
        birthOrder: birthOrder === '' ? null : Number(birthOrder),
        avatarUrl: finalAvatarUrl || null,
        note: note || null,
        phoneNumber: isAdmin ? phoneNumber || null : undefined,
        occupation: isAdmin ? occupation || null : undefined,
        currentResidence: isAdmin ? currentResidence || null : undefined,
      };

      let personId = initialData?.id;

      if (isEditing && personId) {
        await updatePerson({ data: { id: personId, ...personData } });
      } else {
        const result = await createPerson({ data: personData });
        personId = result.id;
      }

      const shouldUploadAvatar = avatarFile && personId;
      if (shouldUploadAvatar) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(avatarFile);
        });
        await uploadPersonAvatar({
          data: {
            personId,
            filename: avatarFile.name,
            base64: base64,
            contentType: avatarFile.type,
          },
        });
      }

      if (!personId) throw new Error(t('member.noIdAfterSave'));

      if (onSuccess) return onSuccess(personId);
      navigate({ to: '/dashboard/members/$id', params: { id: personId } });
    } catch (err) {
      console.error('Error saving member:', err);
      setError(err instanceof Error ? err.message : t('member.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const formSectionVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  const inputClasses = css({
    backgroundColor: 'white',
    color: 'stone.900',
    _placeholder: { color: 'stone.500' },
    display: 'block',
    width: '100%',
    borderRadius: 'xl',
    borderWidth: '1px',
    borderColor: 'stone.300',
    boxShadow: 'sm',
    _focus: { borderColor: 'amber.500', boxShadow: '0 0 0 2px rgb(217 119 6 / 0.2)', backgroundColor: 'white' },
    paddingX: '4',
    paddingY: '3',
    transition: 'all',
    outline: 'none',
    fontSize: 'sm',
  });

  return (
    <form onSubmit={handleSubmit} className={css({ display: 'flex', flexDirection: 'column', gap: { base: '6', sm: '8' } })}>
      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="show"
        className={css({
          backgroundColor: 'rgb(255 255 255 / 0.8)',
          backdropFilter: 'blur(12px)',
          padding: { base: '5', sm: '8' },
          borderRadius: '2xl',
          boxShadow: 'sm',
          borderWidth: '1px',
          borderColor: 'rgb(228 228 231 / 0.8)',
        })}
      >
        <h3
          className={css({
            fontSize: { base: 'lg', sm: 'xl' },
            fontFamily: 'serif',
            fontWeight: 'bold',
            color: 'stone.800',
            marginBottom: '6',
            borderBottomWidth: '1px',
            borderColor: 'stone.100',
            paddingBottom: '4',
            display: 'flex',
            alignItems: 'center',
            gap: '2',
          })}
        >
          <User className={css({ width: '5', height: '5', color: 'amber.600' })} />
          {t('member.generalInfo')}
        </h3>
        <div className={css({ display: 'grid', gridTemplateColumns: { base: '1', md: '2' }, gap: '6' })}>
          <div className={css({ gridColumn: { base: '1', md: 'span 2' } })}>
            <label htmlFor="fullName" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}>
              {t('member.fullName')} <span className={css({ color: 'red.500' })}>*</span>
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClasses}
              placeholder={t('member.fullNamePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="gender" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}>
              {t('member.gender')} <span className={css({ color: 'red.500' })}>*</span>
            </label>
            <div className={css({ position: 'relative' })}>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className={cx(inputClasses, css({ appearance: 'none' }))}
              >
                <option value="male">{t('common.male')}</option>
                <option value="female">{t('common.female')}</option>
                <option value="other">{t('common.other')}</option>
              </select>
              <div
                className={css({
                  position: 'absolute',
                  pointerEvents: 'none',
                  insetY: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  paddingRight: '4',
                  color: 'stone.500',
                })}
              >
                <Settings2 className={css({ width: '4', height: '4' })} />
              </div>
            </div>
          </div>

          <div className={css({ display: 'flex', alignItems: 'center', marginTop: { base: '2', sm: '7' } })}>
            <label className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <div className={css({ position: 'relative', display: 'flex', alignItems: 'center' })}>
                <input
                  type="checkbox"
                  checked={isInLaw}
                  onChange={(e) => setIsInLaw(e.target.checked)}
                  className={css({ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' })}
                />
                <div
                  className={css({
                    width: '5',
                    height: '5',
                    borderWidth: '2',
                    borderRadius: 'sm',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'colors 0.2s',
                    backgroundColor: isInLaw ? 'amber.500' : 'transparent',
                    borderColor: isInLaw ? 'amber.500' : 'stone.300',
                  })}
                >
                  <motion.svg
                    initial={false}
                    animate={{ opacity: isInLaw ? 1 : 0, scale: isInLaw ? 1 : 0.5 }}
                    className={css({ width: '3', height: '3', color: 'white', pointerEvents: 'none' })}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              </div>
              <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700' })}>{t('member.isInLaw')}</span>
            </label>
          </div>

          <div>
            <label htmlFor="birthOrder" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}>
              {t('member.birthOrder')}
            </label>
            <input
              id="birthOrder"
              type="number"
              min="1"
              placeholder={t('member.birthOrderPlaceholder')}
              value={birthOrder}
              onChange={(e) => setBirthOrder(e.target.value ? Number(e.target.value) : '')}
              className={inputClasses}
            />
            <p className={css({ marginTop: '1.5', fontSize: 'xs', color: 'stone.400', display: 'flex', alignItems: 'center', gap: '1' })}>
              <span>💡</span> {t('member.birthOrderHint')}
            </p>
          </div>

          <div className={css({ gridColumn: { base: '1', md: 'span 2' }, marginTop: '2' })}>
            <label htmlFor="avatarFile" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '2.5' })}>
              {t('member.avatar')}
            </label>
            <div
              className={css({
                display: 'flex',
                flexDirection: { base: 'column', sm: 'row' },
                alignItems: { base: 'start', sm: 'center' },
                gap: '5',
                backgroundColor: 'rgb(255 255 255 / 0.5)',
                padding: '4',
                borderRadius: 'xl',
                borderWidth: '1px',
                borderColor: 'stone.100',
              })}
            >
              <div
                className={css(
                  {
                    width: { base: '20', sm: '24' },
                    height: { base: '20', sm: '24' },
                    borderRadius: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                    color: 'white',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'md',
                    borderWidth: '4',
                    borderColor: 'white',
                  },
                  !avatarPreview
                    ? gender === 'male'
                      ? { background: 'linear-gradient(to bottom right, #38bdf8, #0369a1)' }
                      : gender === 'female'
                        ? { background: 'linear-gradient(to bottom right, #fb7185, #be123c)' }
                        : { background: 'linear-gradient(to bottom right, #a8a29e, #57534e)' }
                    : {}
                )}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className={css({ width: '100%', height: '100%', objectFit: 'cover' })} />
                ) : (
                  <span className={css({ opacity: 0.9 })}>{fullName ? fullName.charAt(0).toUpperCase() : '?'}</span>
                )}
              </div>
              <div className={css({ flex: 1, width: '100%' })}>
                <div className={css({ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3' })}>
                  <div className={css({ position: 'relative' })}>
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
                        }
                      }}
                      className={css({ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' })}
                    />
                    <button
                      type="button"
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        paddingX: '4',
                        paddingY: '2',
                        backgroundColor: 'amber.50',
                        color: 'amber.700',
                        borderWidth: '1px',
                        borderColor: 'rgb(245 158 11 / 0.5)',
                        borderRadius: 'lg',
                        transition: 'colors 0.2s',
                      })}
                    >
                      <ImageIcon className={css({ width: '4', height: '4' })} />
                      {t('member.choosePhoto')}
                    </button>
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarUrl('');
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'sm',
                        color: 'rose.600',
                        fontWeight: 'medium',
                        paddingX: '4',
                        paddingY: '2',
                        borderWidth: '1px',
                        borderColor: 'rose.200',
                        borderRadius: 'lg',
                        backgroundColor: 'rose.50',
                        transition: 'colors 0.2s',
                      })}
                    >
                      <Trash2 className={css({ width: '4', height: '4' })} />
                      {t('member.removePhoto')}
                    </button>
                  )}
                </div>
                <p className={css({ marginTop: '2.5', fontSize: 'xs', color: 'stone.500', display: 'flex', alignItems: 'center', gap: '1.5' })}>
                  <AlertCircle className={css({ width: '3.5', height: '3.5', color: 'stone.400' })} />
                  {t('member.photoHint')}
                </p>
              </div>
            </div>
          </div>

          <div className={css({ gridColumn: { base: '1', md: 'span 2' } })}>
            <label htmlFor="birthDay" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}>
              {t('member.solarBirthDate')}
            </label>
            <div className={css({ display: 'grid', gridTemplateColumns: '3', gap: '3' })}>
              <input
                id="birthDay"
                type="number"
                placeholder={t('common.day')}
                min="1"
                max="31"
                value={birthDay}
                onChange={(e) => setBirthDay(e.target.value ? Number(e.target.value) : '')}
                className={inputClasses}
              />
              <input
                type="number"
                placeholder={t('common.month')}
                min="1"
                max="12"
                value={birthMonth}
                onChange={(e) => setBirthMonth(e.target.value ? Number(e.target.value) : '')}
                className={inputClasses}
              />
              <input
                type="number"
                placeholder={t('common.year')}
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : '')}
                className={inputClasses}
              />
            </div>
          </div>

          <div
            className={css({
              gridColumn: { base: '1', md: 'span 2' },
              backgroundColor: 'rgb(255 255 255 / 0.5)',
              padding: '5',
              borderRadius: '2xl',
              borderWidth: '1px',
              borderColor: 'rgb(228 228 231 / 0.6)',
              boxShadow: 'xs',
            })}
          >
            <div className={css({ display: 'flex', flexDirection: 'column', gap: '4' })}>
              <label className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                <div className={css({ position: 'relative', display: 'flex', alignItems: 'center' })}>
                  <input
                    type="checkbox"
                    checked={isDeceased}
                    onChange={(e) => {
                      setIsDeceased(e.target.checked);
                      if (!e.target.checked) {
                        setDeathYear('');
                        setDeathMonth('');
                        setDeathDay('');
                      }
                    }}
                    className={css({ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' })}
                  />
                  <div
                    className={css({
                      width: '5',
                      height: '5',
                      borderWidth: '2',
                      borderRadius: 'sm',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'colors 0.2s',
                      backgroundColor: isDeceased ? 'stone.600' : 'transparent',
                      borderColor: isDeceased ? 'stone.600' : 'stone.300',
                    })}
                  >
                    <motion.svg
                      initial={false}
                      animate={{ opacity: isDeceased ? 1 : 0, scale: isDeceased ? 1 : 0.5 }}
                      className={css({ width: '3', height: '3', color: 'white', pointerEvents: 'none' })}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={4}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </div>
                </div>
                <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700' })}>{t('member.isDeceased')}</span>
              </label>
            </div>

            <AnimatePresence>
              {isDeceased && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '5' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className={css({ overflow: 'hidden' })}
                >
                  <label
                    htmlFor="deathDay"
                    className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}
                  >
                    {t('member.deathDate')}
                  </label>
                  <div className={css({ display: 'grid', gridTemplateColumns: '3', gap: '3', paddingTop: '1' })}>
                    <input
                      id="deathDay"
                      type="number"
                      placeholder={t('common.day')}
                      min="1"
                      max="31"
                      value={deathDay}
                      onChange={(e) => setDeathDay(e.target.value ? Number(e.target.value) : '')}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder={t('common.month')}
                      min="1"
                      max="12"
                      value={deathMonth}
                      onChange={(e) => setDeathMonth(e.target.value ? Number(e.target.value) : '')}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder={t('common.year')}
                      value={deathYear}
                      onChange={(e) => setDeathYear(e.target.value ? Number(e.target.value) : '')}
                      className={inputClasses}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={css({ gridColumn: { base: '1', md: 'span 2' } })}>
            <label htmlFor="note" className={css({ display: 'block', fontSize: 'sm', fontWeight: 'semibold', color: 'stone.700', marginBottom: '1.5' })}>
              {t('common.note')}
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('member.notePlaceholder')}
              className={cx(inputClasses, css({ resize: 'none' }))}
            />
          </div>
        </div>
      </motion.div>

      {isAdmin && (
        <motion.div
          variants={formSectionVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
          className={css({
            background: 'linear-gradient(to bottom right, rgb(254 243 199 / 0.8), rgb(250 250 249 / 0.8))',
            backdropFilter: 'blur(12px)',
            padding: { base: '5', sm: '8' },
            borderRadius: '2xl',
            borderWidth: '1px',
            borderColor: 'rgb(245 158 11 / 0.5)',
            boxShadow: 'sm',
            position: 'relative',
            overflow: 'hidden',
          })}
        >
          <Lock
            className={css({
              position: 'absolute',
              right: '-6',
              bottom: '-6',
              width: '32',
              height: '32',
              color: 'rgb(245 158 11 / 0.1)',
              transform: 'rotate(12deg)',
            })}
          />
          <h3
            className={css({
              fontSize: { base: 'lg', sm: 'xl' },
              fontFamily: 'serif',
              fontWeight: 'bold',
              color: 'amber.900',
              marginBottom: '6',
              borderBottomWidth: '1px',
              borderColor: 'rgb(245 158 11 / 0.5)',
              paddingBottom: '4',
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              position: 'relative',
              zIndex: 10,
            })}
          >
            <span className={css({ padding: '1.5', backgroundColor: 'rgb(254 243 199 / 0.8)', color: 'amber.700', borderRadius: 'lg', boxShadow: 'xs' })}>
              <Lock className={css({ width: '4', height: '4' })} />
            </span>
            <span>{t('member.privateInfo')}</span>
            <span
              className={css({
                fontSize: '2xs',
                marginLeft: 'auto',
                fontWeight: 'bold',
                backgroundColor: 'rgb(254 243 199 / 0.8)',
                color: 'amber.800',
                textTransform: 'uppercase',
                letterSpacing: 'wider',
                paddingX: '2.5',
                paddingY: '1',
                borderRadius: 'md',
                boxShadow: 'xs',
                borderWidth: '1px',
                borderColor: 'rgb(245 158 11 / 0.6)',
              })}
            >
              {t('member.adminOnly')}
            </span>
          </h3>
          <div className={css({ display: 'grid', gridTemplateColumns: { base: '1', md: '2' }, gap: '6', position: 'relative', zIndex: 10 })}>
            <div>
              <label
                htmlFor="phoneNumber"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'amber.900',
                  marginBottom: '1.5',
                  opacity: 0.8,
                })}
              >
                <Phone className={css({ width: '4', height: '4' })} /> {t('member.phone')}
              </label>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isDeceased}
                placeholder={t('member.phonePlaceholder')}
                className={cx(inputClasses, isDeceased ? css({ backgroundColor: 'stone.100', color: 'stone.400', cursor: 'not-allowed' }) : '')}
              />
              {isDeceased && (
                <p
                  className={css({
                    fontSize: 'xs',
                    fontWeight: 'medium',
                    color: 'rose.500',
                    marginTop: '1.5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1',
                  })}
                >
                  <AlertCircle className={css({ width: '3', height: '3' })} />
                  {t('member.phoneDeceasedError')}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="occupation"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'amber.900',
                  marginBottom: '1.5',
                  opacity: 0.8,
                })}
              >
                <Briefcase className={css({ width: '4', height: '4' })} /> {t('member.occupation')}
              </label>
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder={t('member.occupationPlaceholder')}
                className={inputClasses}
              />
            </div>
            <div className={css({ gridColumn: { base: '1', md: 'span 2' } })}>
              <label
                htmlFor="currentResidence"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5',
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'amber.900',
                  marginBottom: '1.5',
                  opacity: 0.8,
                })}
              >
                <MapPin className={css({ width: '4', height: '4' })} /> {t('member.currentResidence')}
              </label>
              <input
                id="currentResidence"
                type="text"
                value={currentResidence}
                onChange={(e) => setCurrentResidence(e.target.value)}
                placeholder={t('member.residencePlaceholder')}
                className={inputClasses}
              />
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={css({
              color: 'rose.700',
              fontSize: 'sm',
              fontWeight: 'medium',
              backgroundColor: 'rose.50',
              borderWidth: '1px',
              borderColor: 'rose.200',
              padding: '4',
              borderRadius: 'xl',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '3',
              boxShadow: 'sm',
            })}
          >
            <AlertCircle className={css({ width: '5', height: '5', flexShrink: 0, marginTop: '0.5' })} />
            <p>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        variants={formSectionVariants}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.2 }}
        className={css({ display: 'flex', justifyContent: 'flex-end', gap: { base: '3', sm: '4' }, paddingTop: '6' })}
      >
        <button type="button" onClick={() => (onCancel ? onCancel() : navigate({ to: '/dashboard' }))} className={button({ visual: 'outline' })}>
          {t('member.cancelButton')}
        </button>
        <button type="submit" disabled={loading} className={button({ visual: 'primary' })}>
          {loading && <Loader2 className={css({ width: '4', height: '4', animation: 'spin 1s linear infinite' })} />}
          {loading ? t('common.saving') : isEditing ? t('member.saveChanges') : t('member.addMember')}
        </button>
      </motion.div>
    </form>
  );
}
