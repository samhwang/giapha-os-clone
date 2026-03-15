import { ArrowLeftRight, BookOpen, GitMerge, Info, Search, Sparkles, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Gender, type PersonNode, type RelEdge } from '../../types';
import DefaultAvatar from '../../ui/icons/DefaultAvatar';
import { FemaleIcon, MaleIcon } from '../../ui/icons/GenderIcons';
import { cn } from '../../ui/utils/cn';
import { getAvatarBg, getGenderStyle } from '../../ui/utils/styles';
import { computeKinship } from '../utils/kinshipHelpers';

interface Props {
  persons: PersonNode[];
  relationships: RelEdge[];
}

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

  return (
    <div className="flex-1 min-w-0 relative">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all',
          selected ? 'bg-amber-50 border-amber-300 text-stone-800' : 'bg-white/80 border-stone-200 text-stone-400 hover:border-amber-200'
        )}
      >
        <div className="relative shrink-0">
          <div
            className={cn(
              'size-10 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden ring-2 ring-white shadow-sm',
              selected ? getAvatarBg(selected.gender) : 'bg-stone-100 text-stone-400'
            )}
          >
            {selected ? <DefaultAvatar gender={selected.gender} /> : '?'}
          </div>
          {selected && (
            <div
              className={cn(
                'absolute -bottom-1 -right-1 size-4 rounded-full ring-2 ring-white shadow-xs flex items-center justify-center',
                getGenderStyle(selected.gender)
              )}
            >
              {selected.gender === Gender.enum.male ? (
                <MaleIcon className="size-3" />
              ) : selected.gender === Gender.enum.female ? (
                <FemaleIcon className="size-3" />
              ) : null}
            </div>
          )}
        </div>

        <span className="font-semibold truncate">{selected ? selected.fullName : t('kinship.selectMember')}</span>
        {selected?.birthYear && <span className="text-xs text-stone-400 shrink-0">({selected.birthYear})</span>}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-stone-200/60 overflow-hidden animate-[scale-in_0.15s_ease-out_forwards]">
          <div className="p-3 border-b border-stone-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
              <input
                placeholder={t('kinship.searchName')}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:border-amber-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center py-6 text-sm text-stone-400">{t('kinship.notFound')}</p>
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left"
                >
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'size-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden ring-1 ring-white shadow-xs',
                        getAvatarBg(p.gender)
                      )}
                    >
                      <DefaultAvatar gender={p.gender} />
                    </div>
                    <div
                      className={cn(
                        'absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full ring-1 ring-white shadow-xs flex items-center justify-center',
                        getGenderStyle(p.gender)
                      )}
                    >
                      {p.gender === Gender.enum.male ? (
                        <MaleIcon className="size-2.5" />
                      ) : p.gender === Gender.enum.female ? (
                        <FemaleIcon className="size-2.5" />
                      ) : null}
                    </div>
                  </div>

                  <span className="text-sm font-medium text-stone-700 truncate">{p.fullName}</span>
                  {p.birthYear && <span className="text-xs text-stone-400 ml-auto shrink-0">{p.birthYear}</span>}
                  {p.generation != null && (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                      {t('kinship.generationShort', { gen: p.generation })}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
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
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-md border border-stone-200/60 rounded-2xl p-6 shadow-sm">
        <div className="flex items-end gap-3">
          <PersonSelector label={t('kinship.memberA')} selected={personA} onSelect={setPersonA} persons={persons} disabledId={personB?.id} />
          <button
            type="button"
            onClick={swap}
            title={t('kinship.swap')}
            className="size-10 shrink-0 mb-0.5 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-amber-100 hover:text-amber-600 text-stone-500 transition-all border border-stone-200"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <PersonSelector label={t('kinship.memberB')} selected={personB} onSelect={setPersonB} persons={persons} disabledId={personA?.id} />
        </div>
      </div>

      {!personA || !personB ? (
        <div className="text-center py-16 text-stone-400 animate-[fade-in_0.3s_ease-out_forwards]">
          <Users className="size-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">{t('kinship.selectTwo')}</p>
        </div>
      ) : result === null ? (
        <div className="text-center py-8 text-stone-400 animate-[fade-in_0.3s_ease-out_forwards]">{t('kinship.selectDifferent')}</div>
      ) : (
        <div className="space-y-4 animate-[fade-in-up_0.35s_ease-out_forwards]">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <Sparkles className="size-5 text-amber-500 shrink-0" />
            <p className="text-amber-800 font-semibold">{result.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="bg-white/90 border border-stone-200/60 rounded-2xl p-5 shadow-sm animate-[fade-in-up_0.35s_ease-out_forwards]"
              style={{ animationDelay: '0.1s', animationFillMode: 'backwards' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                {t('kinship.aCallsB', { personA: personA.fullName, personB: personB.fullName })}
              </p>
              <p className="text-4xl font-serif font-bold text-amber-600 capitalize">{result.aCallsB}</p>
            </div>

            <div
              className="bg-white/90 border border-stone-200/60 rounded-2xl p-5 shadow-sm animate-[fade-in-up_0.35s_ease-out_forwards]"
              style={{ animationDelay: '0.15s', animationFillMode: 'backwards' }}
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-3">
                {t('kinship.bCallsA', { personA: personA.fullName, personB: personB.fullName })}
              </p>
              <p className="text-4xl font-serif font-bold text-amber-600 capitalize">{result.bCallsA}</p>
            </div>
          </div>

          {result.pathLabels.length > 0 && (
            <div
              className="bg-stone-50 border border-stone-200/60 rounded-2xl px-6 py-5 animate-[fade-in-up_0.35s_ease-out_forwards]"
              style={{ animationDelay: '0.25s', animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <GitMerge className="size-4 text-stone-400" />
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{t('kinship.pathAnalysis')}</p>
              </div>
              <div className="space-y-4">
                {result.pathLabels.map((pathLabel, i) => (
                  <div key={pathLabel} className="flex items-start gap-4">
                    <div className="size-6 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <span className="text-2xs font-bold text-stone-400">{i + 1}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed pt-1">{pathLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.aCallsB.includes('/') || result.aCallsB.includes('họ hàng')) && (
            <p className="text-xs text-stone-400 italic px-1">{t('kinship.kinshipNote')}</p>
          )}
        </div>
      )}

      <div className="border-t border-stone-200/60 pt-6 space-y-4">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-amber-600 transition-colors"
        >
          <BookOpen className="size-4" />
          {showGuide ? t('kinship.hideGuide') : t('kinship.showGuide')}
        </button>

        {showGuide && (
          <div className="overflow-hidden animate-[fade-in_0.25s_ease-out_forwards]">
            <div className="space-y-5">
              <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
                <p className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                  <Info className="size-4" />
                  {t('kinship.howItWorks')}
                </p>
                <ol className="space-y-2 text-sm text-blue-800">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="font-bold shrink-0">{step}.</span>
                      <Trans i18nKey={`kinship.howStep${step}`} components={{ strong: <strong /> }} />
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-5">
                <p className="text-sm font-bold text-amber-700 flex items-center gap-2 mb-2">
                  <Info className="size-4" />
                  {t('kinship.dataRequirements')}
                </p>
                <ul className="space-y-1.5 text-sm text-amber-800">
                  {[1, 2, 3].map((req) => (
                    <li key={req} className="flex gap-2">
                      <span className="text-amber-400 shrink-0">•</span>
                      <Trans i18nKey={`kinship.dataReq${req}`} components={{ strong: <strong /> }} />
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white/80 border border-stone-200/60 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-stone-100 bg-stone-50/50">
                  <p className="text-sm font-bold text-stone-600">{t('kinship.referenceTable')}</p>
                </div>
                <div className="divide-y divide-stone-100">
                  {KINSHIP_TERMS.map((row) => (
                    <div key={row.relation} className="flex items-start gap-4 px-5 py-3">
                      <span className="text-sm font-bold text-amber-700 w-48 shrink-0">{row.relation}</span>
                      <div className="min-w-0">
                        <p className="text-sm text-stone-600">{row.desc}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{row.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
