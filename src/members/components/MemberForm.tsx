import { useNavigate, useRouter } from '@tanstack/react-router';
import { AlertCircle, Briefcase, Image as ImageIcon, Loader2, Lock, MapPin, Phone, Settings2, Trash2, User } from 'lucide-react';
import { Lunar, Solar } from 'lunar-javascript';
import { type SubmitEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Gender, type Person } from '../../types';
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || Gender.enum.male);
  const [birthYear, setBirthYear] = useState<number | ''>(initialData?.birthYear || '');
  const [birthMonth, setBirthMonth] = useState<number | ''>(initialData?.birthMonth || '');
  const [birthDay, setBirthDay] = useState<number | ''>(initialData?.birthDay || '');
  const [deathYear, setDeathYear] = useState<number | ''>(initialData?.deathYear || '');
  const [deathMonth, setDeathMonth] = useState<number | ''>(initialData?.deathMonth || '');
  const [deathDay, setDeathDay] = useState<number | ''>(initialData?.deathDay || '');
  const [deathLunarYear, setDeathLunarYear] = useState<number | ''>(initialData?.deathLunarYear || '');
  const [deathLunarMonth, setDeathLunarMonth] = useState<number | ''>(initialData?.deathLunarMonth || '');
  const [deathLunarDay, setDeathLunarDay] = useState<number | ''>(initialData?.deathLunarDay || '');
  const [isDeceased, setIsDeceased] = useState<boolean>(initialData?.isDeceased || false);
  const [isInLaw, setIsInLaw] = useState<boolean>(initialData?.isInLaw || false);
  const [birthOrder, setBirthOrder] = useState<number | ''>(initialData?.birthOrder || '');
  const [generation, setGeneration] = useState<number | ''>(initialData?.generation || '');
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
  const [otherNames, setOtherNames] = useState(initialData?.otherNames || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [phoneNumber, setPhoneNumber] = useState(initialData?.phoneNumber || '');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [currentResidence, setCurrentResidence] = useState(initialData?.currentResidence || '');

  const handleSolarDeathChange = (field: 'day' | 'month' | 'year', val: string) => {
    const num = val ? Number(val) : '';
    let d = deathDay;
    let m = deathMonth;
    let y = deathYear;

    if (field === 'day') d = num;
    else if (field === 'month') m = num;
    else if (field === 'year') y = num;

    setDeathDay(d);
    setDeathMonth(m);
    setDeathYear(y);

    if (d !== '' && m !== '' && y !== '' && y > 100) {
      try {
        const solar = Solar.fromYmd(y, m, d);
        const lunar = solar.getLunar();
        setDeathLunarDay(lunar.getDay());
        setDeathLunarMonth(Math.abs(lunar.getMonth()));
        setDeathLunarYear(lunar.getYear());
      } catch {
        // Ignore invalid dates
      }
    }
  };

  const handleLunarDeathChange = (field: 'day' | 'month' | 'year', val: string) => {
    const num = val ? Number(val) : '';
    let d = deathLunarDay;
    let m = deathLunarMonth;
    let y = deathLunarYear;

    if (field === 'day') d = num;
    else if (field === 'month') m = num;
    else if (field === 'year') y = num;

    setDeathLunarDay(d);
    setDeathLunarMonth(m);
    setDeathLunarYear(y);

    if (d !== '' && m !== '' && y !== '' && y > 100) {
      try {
        const lunar = Lunar.fromYmd(y, m, d);
        const solar = lunar.getSolar();
        setDeathDay(solar.getDay());
        setDeathMonth(solar.getMonth());
        setDeathYear(solar.getYear());
      } catch {
        // Ignore invalid dates
      }
    }
  };

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
        deathLunarYear: isDeceased && deathLunarYear !== '' ? Number(deathLunarYear) : null,
        deathLunarMonth: isDeceased && deathLunarMonth !== '' ? Number(deathLunarMonth) : null,
        deathLunarDay: isDeceased && deathLunarDay !== '' ? Number(deathLunarDay) : null,
        isDeceased,
        isInLaw,
        birthOrder: birthOrder === '' ? null : Number(birthOrder),
        generation: generation === '' ? null : Number(generation),
        otherNames: otherNames || null,
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
      await router.invalidate();
      navigate({ to: '/dashboard/members/$id', params: { id: personId } });
    } catch (err) {
      console.error('Error saving member:', err);
      setError(err instanceof Error ? err.message : t('member.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-all outline-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
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

          <div className="md:col-span-2">
            <label htmlFor="otherNames" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.otherNames')}
            </label>
            <input
              id="otherNames"
              type="text"
              value={otherNames}
              onChange={(e) => setOtherNames(e.target.value)}
              className={inputClasses}
              placeholder={t('member.otherNamesPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.gender')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)} className={`${inputClasses} appearance-none`}>
                <option value={Gender.enum.male}>{t('common.male')}</option>
                <option value={Gender.enum.female}>{t('common.female')}</option>
                <option value={Gender.enum.other}>{t('common.other')}</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-500">
                <Settings2 className="size-4" />
              </div>
            </div>
          </div>

          <div className="flex items-center sm:mt-7 mt-2">
            <label className="flex items-center gap-3 group">
              <div className="relative flex items-center">
                <input type="checkbox" checked={isInLaw} onChange={(e) => setIsInLaw(e.target.checked)} className="peer sr-only" />
                <div
                  className={`size-5 border-2 border-stone-300 rounded transition-colors flex items-center justify-center ${isInLaw ? 'bg-amber-500 border-amber-500' : ''}`}
                >
                  {isInLaw && (
                    <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-sm font-semibold text-stone-700 group-hover:text-amber-700 transition-colors">{t('member.isInLaw')}</span>
            </label>
          </div>

          <div>
            <label htmlFor="birthOrder" className="block text-sm font-semibold text-stone-700 mb-1.5">
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
            <p className="mt-1.5 text-xs text-stone-400 flex items-center gap-1">
              <span>💡</span> {t('member.birthOrderHint')}
            </p>
          </div>

          <div>
            <label htmlFor="generation" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('member.generation')}
            </label>
            <input
              id="generation"
              type="number"
              min="1"
              placeholder={t('member.generationPlaceholder')}
              value={generation}
              onChange={(e) => setGeneration(e.target.value ? Number(e.target.value) : '')}
              className={inputClasses}
            />
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
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-xl font-bold text-white overflow-hidden shrink-0 shadow-md border-4 border-white
                  ${!avatarPreview ? (gender === Gender.enum.male ? 'bg-linear-to-br from-sky-400 to-sky-700' : gender === Gender.enum.female ? 'bg-linear-to-br from-rose-400 to-rose-700' : 'bg-linear-to-br from-stone-400 to-stone-600') : ''}`}
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
                          setAvatarFile(file);
                          setAvatarPreview(URL.createObjectURL(file));
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
                        setAvatarUrl('');
                        setAvatarFile(null);
                        setAvatarPreview(null);
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

          <div className="md:col-span-2 bg-stone-50/50 p-5 rounded-2xl border border-stone-200/60 shadow-xs">
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-3 group">
                <div className="relative flex items-center">
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
                    className="peer sr-only"
                  />
                  <div
                    className={`size-5 border-2 border-stone-300 rounded transition-colors flex items-center justify-center ${isDeceased ? 'bg-stone-600 border-stone-600' : ''}`}
                  >
                    {isDeceased && (
                      <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-stone-700 group-hover:text-stone-900 transition-colors">{t('member.isDeceased')}</span>
              </label>
            </div>

            {isDeceased && (
              <div className="overflow-hidden animate-[fade-in_0.3s_ease-out_forwards]">
                <p className="text-sm-plus text-stone-500 mb-4 italic">
                  * Nhập Ngày Dương lịch hoặc Ngày Âm lịch. Hệ thống sẽ tự động tính toán và điền phần còn lại.
                </p>

                <div>
                  <label htmlFor="deathLunarDay" className="block text-sm font-semibold text-stone-700 mb-2">
                    Ngày mất (Âm lịch)
                  </label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <input
                      id="deathLunarDay"
                      type="number"
                      placeholder="Ngày"
                      min="1"
                      max="31"
                      value={deathLunarDay}
                      onChange={(e) => handleLunarDeathChange('day', e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder="Tháng"
                      min="1"
                      max="12"
                      value={deathLunarMonth}
                      onChange={(e) => handleLunarDeathChange('month', e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder="Năm"
                      value={deathLunarYear}
                      onChange={(e) => handleLunarDeathChange('year', e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="deathSolarDay" className="block text-sm font-semibold text-stone-700 mb-2">
                    Ngày mất (Dương lịch)
                  </label>
                  <div className="grid grid-cols-3 gap-3 pt-1">
                    <input
                      id="deathSolarDay"
                      type="number"
                      placeholder={t('common.day')}
                      min="1"
                      max="31"
                      value={deathDay}
                      onChange={(e) => handleSolarDeathChange('day', e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder={t('common.month')}
                      min="1"
                      max="12"
                      value={deathMonth}
                      onChange={(e) => handleSolarDeathChange('month', e.target.value)}
                      className={inputClasses}
                    />
                    <input
                      type="number"
                      placeholder={t('common.year')}
                      value={deathYear}
                      onChange={(e) => handleSolarDeathChange('year', e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label htmlFor="note" className="block text-sm font-semibold text-stone-700 mb-1.5">
              {t('common.note')}
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('member.notePlaceholder')}
              className={`${inputClasses} resize-none`}
            />
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
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isDeceased}
                placeholder={t('member.phonePlaceholder')}
                className={`${inputClasses} disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed`}
              />
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
              <input
                id="occupation"
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder={t('member.occupationPlaceholder')}
                className={inputClasses}
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="currentResidence" className="flex items-center gap-1.5 text-sm font-semibold text-amber-900/80 mb-1.5">
                <MapPin className="size-4" /> {t('member.currentResidence')}
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
        </div>
      )}

      {error && (
        <div className="text-rose-700 text-sm font-medium bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 shadow-sm animate-[fade-in-up_0.3s_ease-out_forwards]">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <div
        className="flex justify-end gap-3 sm:gap-4 pt-6 animate-[fade-in-up_0.3s_ease-out_forwards]"
        style={{ animationDelay: '0.2s', animationFillMode: 'backwards' }}
      >
        <button type="button" onClick={() => (onCancel ? onCancel() : window.history.back())} className="btn">
          {t('member.cancelButton')}
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading && <Loader2 className="size-4 animate-spin" />}
          {loading ? t('common.saving') : isEditing ? t('member.saveChanges') : t('member.addMember')}
        </button>
      </div>
    </form>
  );
}
