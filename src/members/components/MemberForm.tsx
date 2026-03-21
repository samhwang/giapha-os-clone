import { useStore } from '@tanstack/react-form';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { AlertCircle, Briefcase, Image as ImageIcon, Loader2, Lock, MapPin, Phone, Settings2, Trash2, User } from 'lucide-react';
import { Lunar, Solar } from 'lunar-javascript';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { logger } from '../../lib/logger';
import Checkbox from '../../ui/common/Checkbox';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg } from '../../ui/utils/styles';
import { useAvatarUpload } from '../hooks/useAvatarUpload';
import { useMemberForm } from '../hooks/useMemberForm';
import { createPerson, updatePerson, uploadPersonAvatar } from '../server/member';
import { Gender, type Person } from '../types';

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^0-9a-z\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

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

interface IsValidDateInput {
  day: number | '';
  month: number | '';
  year: number | '';
}

const isValidDate = ({ day, month, year }: IsValidDateInput): boolean => {
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

export default function MemberForm({ initialData, isEditing = false, isAdmin = false, onSuccess, onCancel }: MemberFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { avatarFile, avatarPreview, selectFile, clear: clearAvatar, toBase64 } = useAvatarUpload({ initialUrl: initialData?.avatarUrl });

  const form = useMemberForm({
    defaultValues: {
      fullName: initialData?.fullName || '',
      otherNames: initialData?.otherNames || '',
      gender: initialData?.gender || Gender.enum.male,
      note: initialData?.note || '',
      birthYear: initialData?.birthYear || ('' as number | ''),
      birthMonth: initialData?.birthMonth || ('' as number | ''),
      birthDay: initialData?.birthDay || ('' as number | ''),
      deathYear: initialData?.deathYear || ('' as number | ''),
      deathMonth: initialData?.deathMonth || ('' as number | ''),
      deathDay: initialData?.deathDay || ('' as number | ''),
      deathLunarYear: initialData?.deathLunarYear || ('' as number | ''),
      deathLunarMonth: initialData?.deathLunarMonth || ('' as number | ''),
      deathLunarDay: initialData?.deathLunarDay || ('' as number | ''),
      isDeceased: initialData?.isDeceased || false,
      isInLaw: initialData?.isInLaw || false,
      birthOrder: initialData?.birthOrder || ('' as number | ''),
      generation: initialData?.generation || ('' as number | ''),
      avatarUrl: initialData?.avatarUrl || '',
      phoneNumber: initialData?.phoneNumber || '',
      occupation: initialData?.occupation || '',
      currentResidence: initialData?.currentResidence || '',
    },
    validators: {
      onSubmit: ({ value }) => {
        if (!isValidDate({ day: value.birthDay, month: value.birthMonth, year: value.birthYear })) {
          return t('member.invalidBirthDate');
        }
        if (value.isDeceased && !isValidDate({ day: value.deathDay, month: value.deathMonth, year: value.deathYear })) {
          return t('member.invalidDeathDate');
        }
        if (value.isDeceased && value.birthYear !== '' && value.deathYear !== '' && value.deathYear < value.birthYear) {
          return t('member.deathBeforeBirth');
        }
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const personData = {
          fullName: value.fullName,
          gender: value.gender,
          birthYear: value.birthYear === '' ? null : Number(value.birthYear),
          birthMonth: value.birthMonth === '' ? null : Number(value.birthMonth),
          birthDay: value.birthDay === '' ? null : Number(value.birthDay),
          deathYear: value.isDeceased && value.deathYear !== '' ? Number(value.deathYear) : null,
          deathMonth: value.isDeceased && value.deathMonth !== '' ? Number(value.deathMonth) : null,
          deathDay: value.isDeceased && value.deathDay !== '' ? Number(value.deathDay) : null,
          deathLunarYear: value.isDeceased && value.deathLunarYear !== '' ? Number(value.deathLunarYear) : null,
          deathLunarMonth: value.isDeceased && value.deathLunarMonth !== '' ? Number(value.deathLunarMonth) : null,
          deathLunarDay: value.isDeceased && value.deathLunarDay !== '' ? Number(value.deathLunarDay) : null,
          isDeceased: value.isDeceased,
          isInLaw: value.isInLaw,
          birthOrder: value.birthOrder === '' ? null : Number(value.birthOrder),
          generation: value.generation === '' ? null : Number(value.generation),
          otherNames: value.otherNames || null,
          avatarUrl: value.avatarUrl || null,
          note: value.note || null,
          phoneNumber: isAdmin ? value.phoneNumber || null : undefined,
          occupation: isAdmin ? value.occupation || null : undefined,
          currentResidence: isAdmin ? value.currentResidence || null : undefined,
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
          const base64 = await toBase64();
          const ext = avatarFile.name.split('.').pop() || 'jpg';
          const slugName = slugify(form.getFieldValue('fullName') || 'avatar');
          const filename = `${personId}_${slugName}.${ext}`;
          await uploadPersonAvatar({
            data: {
              personId,
              filename,
              base64,
              contentType: avatarFile.type,
            },
          });
        }

        if (!personId) throw new Error(t('member.noIdAfterSave'));

        if (onSuccess) return onSuccess(personId);
        await router.invalidate();
        navigate({ to: '/dashboard/members/$id', params: { id: personId } });
      } catch (err) {
        logger.error('Error saving member:', err);
        setError(err instanceof Error ? err.message : t('member.saveError'));
      }
    },
  });

  const isDeceased = useStore(form.store, (s) => s.values.isDeceased);
  const isSubmitting = useStore(form.store, (s) => s.isSubmitting);
  const fullName = useStore(form.store, (s) => s.values.fullName);
  const gender = useStore(form.store, (s) => s.values.gender);

  const handleSolarDeathChange = (changedField: 'day' | 'month' | 'year', val: string) => {
    const num = val ? Number(val) : '';
    const d = changedField === 'day' ? num : form.getFieldValue('deathDay');
    const m = changedField === 'month' ? num : form.getFieldValue('deathMonth');
    const y = changedField === 'year' ? num : form.getFieldValue('deathYear');

    if (d !== '' && m !== '' && y !== '' && y > 100) {
      try {
        const solar = Solar.fromYmd(y, m, d);
        const lunar = solar.getLunar();
        form.setFieldValue('deathLunarDay', lunar.getDay());
        form.setFieldValue('deathLunarMonth', Math.abs(lunar.getMonth()));
        form.setFieldValue('deathLunarYear', lunar.getYear());
      } catch {
        // Ignore invalid dates
      }
    }
  };

  const handleLunarDeathChange = (changedField: 'day' | 'month' | 'year', val: string) => {
    const num = val ? Number(val) : '';
    const d = changedField === 'day' ? num : form.getFieldValue('deathLunarDay');
    const m = changedField === 'month' ? num : form.getFieldValue('deathLunarMonth');
    const y = changedField === 'year' ? num : form.getFieldValue('deathLunarYear');

    if (d !== '' && m !== '' && y !== '' && y > 100) {
      try {
        const lunar = Lunar.fromYmd(y, m, d);
        const solar = lunar.getSolar();
        form.setFieldValue('deathDay', solar.getDay());
        form.setFieldValue('deathMonth', solar.getMonth());
        form.setFieldValue('deathYear', solar.getYear());
      } catch {
        // Ignore invalid dates
      }
    }
  };

  const inputClasses = cn(
    'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-all outline-none'
  );

  return (
    <form
      className="space-y-6 sm:space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="bg-white/80 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-sm border border-stone-200/80 animate-[fade-in-up_0.3s_ease-out_forwards]">
        <h3 className="text-lg sm:text-xl font-serif font-bold text-stone-800 mb-6 border-b border-stone-100 pb-4 flex items-center gap-2">
          <User className="size-5 text-amber-600" />
          {t('member.generalInfo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.fullName')} <span className="text-red-500">*</span>
            </label>
            <form.AppField name="fullName">
              {(field) => (
                <input
                  id="fullName"
                  type="text"
                  required
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClasses}
                  placeholder={t('member.fullNamePlaceholder')}
                />
              )}
            </form.AppField>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="otherNames" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.otherNames')}
            </label>
            <form.AppField name="otherNames">
              {(field) => (
                <input
                  id="otherNames"
                  type="text"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClasses}
                  placeholder={t('member.otherNamesPlaceholder')}
                />
              )}
            </form.AppField>
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.gender')} <span className="text-red-500">*</span>
            </label>
            <form.AppField name="gender">
              {(field) => (
                <div className="relative">
                  <select
                    id="gender"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as Gender)}
                    className={cn(inputClasses, 'appearance-none')}
                  >
                    <option value={Gender.enum.male}>{t('common.male')}</option>
                    <option value={Gender.enum.female}>{t('common.female')}</option>
                    <option value={Gender.enum.other}>{t('common.other')}</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                    <Settings2 className="size-4" />
                  </div>
                </div>
              )}
            </form.AppField>
          </div>

          <div className="flex items-center sm:mt-7 mt-2">
            <form.AppField name="isInLaw">
              {(field) => <Checkbox checked={field.state.value} onChange={(val) => field.handleChange(val)} label={t('member.isInLaw')} />}
            </form.AppField>
          </div>

          <div>
            <label htmlFor="birthOrder" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.birthOrder')}
            </label>
            <form.AppField name="birthOrder">
              {(field) => (
                <input
                  id="birthOrder"
                  type="number"
                  min="1"
                  placeholder={t('member.birthOrderPlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : '')}
                  className={inputClasses}
                />
              )}
            </form.AppField>
            <p className="mt-1.5 text-xs text-stone-400 flex items-center gap-1">
              <span>💡</span> {t('member.birthOrderHint')}
            </p>
          </div>

          <div>
            <label htmlFor="generation" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.generation')}
            </label>
            <form.AppField name="generation">
              {(field) => (
                <input
                  id="generation"
                  type="number"
                  min="1"
                  placeholder={t('member.generationPlaceholder')}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : '')}
                  className={inputClasses}
                />
              )}
            </form.AppField>
            <p className="mt-1.5 text-xs text-stone-400 flex items-center gap-1">
              <span>💡</span> {t('member.generationHint')}
            </p>
          </div>

          <div className="md:col-span-2 mt-2">
            <label htmlFor="avatarFile" className="block text-sm font-semibold text-stone-700 mb-2.5">
              {t('member.avatar')}
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-stone-50/50 p-4 rounded-xl border border-stone-100">
              <div
                className={cn(
                  'w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0 shadow-md border-4 border-white',
                  !avatarPreview && getAvatarBg(gender)
                )}
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="opacity-90">{fullName ? fullName.charAt(0).toUpperCase() : '?'}</span>
                )}
              </div>
              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      id="avatarFile"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          selectFile(file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0"
                    />
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200/50 hover:bg-amber-100 hover:border-amber-300 transition-colors rounded-lg"
                    >
                      <ImageIcon className="size-4" />
                      {t('member.choosePhoto')}
                    </button>
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        form.setFieldValue('avatarUrl', '');
                        clearAvatar();
                      }}
                      className="flex items-center gap-2 text-sm text-rose-600 hover:text-rose-700 font-medium px-4 py-2 border border-rose-200 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="size-4" />
                      {t('member.removePhoto')}
                    </button>
                  )}
                </div>
                <p className="mt-2.5 text-xs text-stone-500 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-stone-400" />
                  {t('member.photoHint')}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="birthDay" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.solarBirthDate')}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <form.AppField name="birthDay">
                {(field) => (
                  <input
                    id="birthDay"
                    type="number"
                    placeholder={t('common.day')}
                    min="1"
                    max="31"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : '')}
                    className={inputClasses}
                  />
                )}
              </form.AppField>
              <form.AppField name="birthMonth">
                {(field) => (
                  <input
                    type="number"
                    placeholder={t('common.month')}
                    min="1"
                    max="12"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : '')}
                    className={inputClasses}
                  />
                )}
              </form.AppField>
              <form.AppField name="birthYear">
                {(field) => (
                  <input
                    type="number"
                    placeholder={t('common.year')}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value ? Number(e.target.value) : '')}
                    className={inputClasses}
                  />
                )}
              </form.AppField>
            </div>
          </div>

          <div className="md:col-span-2 bg-stone-50/50 p-5 rounded-2xl border border-stone-200/60 shadow-xs">
            <div className="flex flex-col gap-4">
              <form.AppField name="isDeceased">
                {(field) => (
                  <Checkbox
                    checked={field.state.value}
                    onChange={(val) => {
                      field.handleChange(val);
                      if (!val) {
                        form.setFieldValue('deathYear', '');
                        form.setFieldValue('deathMonth', '');
                        form.setFieldValue('deathDay', '');
                        form.setFieldValue('deathLunarYear', '');
                        form.setFieldValue('deathLunarMonth', '');
                        form.setFieldValue('deathLunarDay', '');
                      }
                    }}
                    label={t('member.isDeceased')}
                    colorClass="bg-stone-600 border-stone-600"
                    hoverClass="group-hover:text-stone-900"
                  />
                )}
              </form.AppField>
            </div>

            {isDeceased && (
              <div className="overflow-hidden animate-[fade-in_0.3s_ease-out_forwards]">
                <p className="text-sm-plus text-stone-500 mb-4 italic">{t('member.deathDateHint')}</p>

                <div>
                  <label htmlFor="deathLunarDay" className="block text-sm font-semibold text-stone-700 mb-2">
                    {t('member.deathDateLunar')}
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <form.AppField name="deathLunarDay">
                      {(field) => (
                        <input
                          id="deathLunarDay"
                          type="number"
                          placeholder={t('common.day')}
                          min="1"
                          max="31"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleLunarDeathChange('day', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="deathLunarMonth">
                      {(field) => (
                        <input
                          type="number"
                          placeholder={t('common.month')}
                          min="1"
                          max="12"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleLunarDeathChange('month', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="deathLunarYear">
                      {(field) => (
                        <input
                          type="number"
                          placeholder={t('common.year')}
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleLunarDeathChange('year', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>

                <div>
                  <label htmlFor="deathSolarDay" className="block text-sm font-semibold text-stone-700 mb-2">
                    {t('member.deathDateSolar')}
                  </label>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <form.AppField name="deathDay">
                      {(field) => (
                        <input
                          id="deathSolarDay"
                          type="number"
                          placeholder={t('common.day')}
                          min="1"
                          max="31"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleSolarDeathChange('day', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="deathMonth">
                      {(field) => (
                        <input
                          type="number"
                          placeholder={t('common.month')}
                          min="1"
                          max="12"
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleSolarDeathChange('month', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="deathYear">
                      {(field) => (
                        <input
                          type="number"
                          placeholder={t('common.year')}
                          value={field.state.value}
                          onChange={(e) => {
                            field.handleChange(e.target.value ? Number(e.target.value) : '');
                            handleSolarDeathChange('year', e.target.value);
                          }}
                          className={inputClasses}
                        />
                      )}
                    </form.AppField>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="note" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('common.note')}
            </label>
            <form.AppField name="note">
              {(field) => (
                <textarea
                  id="note"
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t('member.notePlaceholder')}
                  className={cn(inputClasses, 'resize-none')}
                />
              )}
            </form.AppField>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div
          className="bg-linear-to-br from-amber-50/80 to-stone-50/80 backdrop-blur-md p-5 sm:p-8 rounded-2xl border border-amber-200/50 shadow-sm relative overflow-hidden animate-[fade-in-up_0.3s_ease-out_forwards]"
          style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
        >
          <Lock className="absolute -right-6 -bottom-6 w-32 h-32 text-amber-500/5 rotate-12" />
          <h3 className="text-lg sm:text-xl font-serif font-bold text-amber-900 mb-6 border-b border-amber-200/50 pb-4 flex items-center gap-2 relative z-10">
            <span className="p-1.5 bg-amber-100/80 text-amber-700 rounded-lg shadow-xs">
              <Lock className="size-4" />
            </span>
            <span>{t('member.privateInfo')}</span>
            <span className="text-2xs ml-auto sm:ml-2 font-bold bg-amber-200/80 text-amber-800 uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs border border-amber-300/60">
              {t('member.adminOnly')}
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div>
              <label htmlFor="phoneNumber" className="flex items-center gap-1.5 text-sm font-semibold text-amber-900/80 mb-1.5">
                <Phone className="size-4" /> {t('member.phone')}
              </label>
              <form.AppField name="phoneNumber">
                {(field) => (
                  <input
                    id="phoneNumber"
                    type="tel"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    disabled={isDeceased}
                    placeholder={t('member.phonePlaceholder')}
                    className={cn(inputClasses, 'disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed')}
                  />
                )}
              </form.AppField>
              {isDeceased && (
                <p className="text-xs-plus font-medium text-rose-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="size-3" />
                  {t('member.phoneDeceasedError')}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="occupation" className="flex items-center gap-1.5 text-sm font-semibold text-amber-900/80 mb-1.5">
                <Briefcase className="size-4" /> {t('member.occupation')}
              </label>
              <form.AppField name="occupation">
                {(field) => (
                  <input
                    id="occupation"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('member.occupationPlaceholder')}
                    className={inputClasses}
                  />
                )}
              </form.AppField>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="currentResidence" className="flex items-center gap-1.5 text-sm font-semibold text-amber-900/80 mb-1.5">
                <MapPin className="size-4" /> {t('member.currentResidence')}
              </label>
              <form.AppField name="currentResidence">
                {(field) => (
                  <input
                    id="currentResidence"
                    type="text"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t('member.residencePlaceholder')}
                    className={inputClasses}
                  />
                )}
              </form.AppField>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-rose-700 text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-[fade-in-up_0.3s_ease-out_forwards]">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <form.Subscribe selector={(state) => state.errors}>
        {(errors) =>
          errors.length > 0 && (
            <div className="text-rose-700 text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-[fade-in-up_0.3s_ease-out_forwards]">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <p>{errors.join(', ')}</p>
            </div>
          )
        }
      </form.Subscribe>

      <div
        className="flex justify-end gap-3 sm:gap-4 pt-6 animate-[fade-in-up_0.3s_ease-out_forwards]"
        style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
      >
        <button type="button" onClick={() => (onCancel ? onCancel() : window.history.back())} className="btn">
          {t('member.cancelButton')}
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? t('common.saving') : isEditing ? t('member.saveChanges') : t('member.addMember')}
        </button>
      </div>
    </form>
  );
}
