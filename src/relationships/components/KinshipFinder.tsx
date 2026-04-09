import { ArrowLeftRight, BookOpen, GitMerge, Info, Search, Sparkles, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import type { PersonNode, RelEdge } from "../types";

import { Gender } from "../../members/types";
import Avatar from "../../ui/common/Avatar";
import { Badge } from "../../ui/common/Badge";
import { Card } from "../../ui/common/Card";
import { EmptyState } from "../../ui/common/EmptyState";
import { FemaleIcon, MaleIcon } from "../../ui/icons/GenderIcons";
import { cn } from "../../ui/utils/cn";
import { getGenderStyle } from "../../ui/utils/styles";
import { COLLATERAL, DESCENDANTS, DIRECT, IN_LAW, UNCLE_AUNT } from "../utils/kinship-dictionary";
import { computeKinship } from "../utils/kinshipHelpers";

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
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () =>
      persons
        .filter(
          (p) => p.id !== disabledId && p.fullName.toLowerCase().includes(search.toLowerCase()),
        )
        .slice(0, 20),
    [persons, disabledId, search],
  );

  return (
    <div className="relative min-w-0 flex-1">
      <p className="mb-2 text-xs font-semibold tracking-wider text-stone-400 uppercase">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all",
          selected
            ? "border-amber-300 bg-amber-50 text-stone-800"
            : "border-stone-200 bg-surface-elevated text-stone-400 hover:border-amber-200",
        )}
      >
        <div className="relative shrink-0">
          {selected ? (
            <Avatar
              gender={selected.gender}
              fullName={selected.fullName}
              className="size-10 text-sm font-bold shadow-sm ring-2 ring-white"
            />
          ) : (
            <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-stone-100 text-sm font-bold text-stone-400 shadow-sm ring-2 ring-white">
              ?
            </div>
          )}
          {selected && (
            <div
              className={cn(
                "absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full shadow-xs ring-2 ring-white",
                getGenderStyle(selected.gender),
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

        <span className="truncate font-semibold">
          {selected ? selected.fullName : t("kinship.selectMember")}
        </span>
        {selected?.birthYear && (
          <span className="shrink-0 text-xs text-stone-400">({selected.birthYear})</span>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 animate-[scale-in_0.15s_ease-out_forwards] overflow-hidden rounded-2xl border border-border-default bg-white shadow-xl">
          <div className="border-b border-stone-100 p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-stone-400" />
              <input
                placeholder={t("kinship.searchName")}
                className="w-full rounded-xl border border-stone-200 py-2 pr-4 pl-9 text-sm focus:border-amber-400 focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-stone-400">{t("kinship.notFound")}</p>
            ) : (
              filtered.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    onSelect(p);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-amber-50"
                >
                  <div className="relative shrink-0">
                    <Avatar
                      gender={p.gender}
                      fullName={p.fullName}
                      className="size-8 text-xs font-bold shadow-xs ring-1 ring-white"
                    />
                    <div
                      className={cn(
                        "absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full shadow-xs ring-1 ring-white",
                        getGenderStyle(p.gender),
                      )}
                    >
                      {p.gender === Gender.enum.male ? (
                        <MaleIcon className="size-2.5" />
                      ) : p.gender === Gender.enum.female ? (
                        <FemaleIcon className="size-2.5" />
                      ) : null}
                    </div>
                  </div>

                  <span className="truncate text-sm font-medium text-stone-700">{p.fullName}</span>
                  {p.birthYear && (
                    <span className="ml-auto shrink-0 text-xs text-stone-400">{p.birthYear}</span>
                  )}
                  {p.generation != null && (
                    <Badge color="emerald" size="sm" className="shrink-0">
                      {t("kinship.generationShort", { gen: p.generation })}
                    </Badge>
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
  {
    relation: `${DIRECT.FATHER} / ${DIRECT.MOTHER}`,
    desc: "1 bậc trên (dòng trực hệ)",
    example: "Bố, ba, má...",
  },
  {
    relation: `${DIRECT.GRANDFATHER} / ${DIRECT.GRANDMOTHER}`,
    desc: "2 bậc trên (dòng trực hệ)",
    example: "Ông nội, bà ngoại...",
  },
  { relation: "Cụ / Kỵ / Sơ...", desc: "3 bậc trên trở lên", example: "Cụ cố, cụ kỵ..." },
  {
    relation: `${DESCENDANTS[1]} / ${DESCENDANTS[2]} / ${DESCENDANTS[3]}...`,
    desc: "Các bậc dưới trực hệ",
    example: "Con, cháu, chắt, chít...",
  },
  {
    relation: `${COLLATERAL.OLDER_BROTHER} / ${COLLATERAL.OLDER_SISTER} / ${COLLATERAL.YOUNGER}`,
    desc: "Cùng thế hệ, khác nhánh",
    example: "Dựa vào thứ bậc của nhánh cha/mẹ",
  },
  {
    relation: `${UNCLE_AUNT.BAC} / ${UNCLE_AUNT.CHU} / ${UNCLE_AUNT.CO}`,
    desc: "Anh/chị/em của cha (Bên Nội)",
    example: `${UNCLE_AUNT.BAC} (anh), ${UNCLE_AUNT.CHU} (em trai), ${UNCLE_AUNT.CO} (chị em gái)`,
  },
  {
    relation: `${UNCLE_AUNT.CAU} / ${UNCLE_AUNT.DI}`,
    desc: "Anh/chị/em của mẹ (Bên Ngoại)",
    example: `${UNCLE_AUNT.CAU} (anh em trai), ${UNCLE_AUNT.DI} (chị em gái)`,
  },
  {
    relation: `${IN_LAW.THIM} / ${IN_LAW.MO} / ${IN_LAW.DUONG}`,
    desc: "Vợ/chồng của chú, cậu, cô, dì",
    example: `${IN_LAW.THIM} (vợ chú), ${IN_LAW.MO} (vợ cậu), ${IN_LAW.DUONG} (chồng cô/dì)`,
  },
];

export default function KinshipFinder({ persons, relationships }: Props) {
  const { t } = useTranslation();
  const [personA, setPersonA] = useState<PersonNode | null>(null);
  const [personB, setPersonB] = useState<PersonNode | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const result = useMemo(() => {
    if (!personA || !personB) return null;
    return computeKinship({ personA, personB, persons, relationships });
  }, [personA, personB, persons, relationships]);

  const swap = () => {
    setPersonA(personB);
    setPersonB(personA);
  };

  return (
    <div className="space-y-6">
      <Card variant="elevated" className="relative z-10 p-6">
        <div className="flex items-end gap-3">
          <PersonSelector
            label={t("kinship.memberA")}
            selected={personA}
            onSelect={setPersonA}
            persons={persons}
            disabledId={personB?.id}
          />
          <button
            type="button"
            onClick={swap}
            title={t("kinship.swap")}
            className="mb-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-500 transition-all hover:bg-amber-100 hover:text-amber-600"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <PersonSelector
            label={t("kinship.memberB")}
            selected={personB}
            onSelect={setPersonB}
            persons={persons}
            disabledId={personA?.id}
          />
        </div>
      </Card>

      {!personA || !personB ? (
        <EmptyState
          icon={<Users className="size-12 opacity-30" />}
          title={t("kinship.selectTwo")}
        />
      ) : result === null ? (
        <EmptyState title={t("kinship.selectDifferent")} className="py-8" />
      ) : (
        <div className="animate-[fade-in-up_0.35s_ease-out_forwards] space-y-4">
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <Sparkles className="size-5 shrink-0 text-amber-500" />
            <p className="font-semibold text-amber-800">
              {result.distance === -1 ? t(result.description) : result.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card
              variant="elevated"
              className="animate-[fade-in-up_0.35s_ease-out_forwards] p-5"
              style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
            >
              <p className="mb-3 text-xs font-semibold tracking-wider text-stone-400 uppercase">
                {t("kinship.aCallsB", { personA: personA.fullName, personB: personB.fullName })}
              </p>
              <p className="font-serif text-4xl font-bold text-amber-600 capitalize">
                {result.aCallsB}
              </p>
            </Card>

            <Card
              variant="elevated"
              className="animate-[fade-in-up_0.35s_ease-out_forwards] p-5"
              style={{ animationDelay: "0.15s", animationFillMode: "backwards" }}
            >
              <p className="mb-3 text-xs font-semibold tracking-wider text-stone-400 uppercase">
                {t("kinship.bCallsA", { personA: personA.fullName, personB: personB.fullName })}
              </p>
              <p className="font-serif text-4xl font-bold text-amber-600 capitalize">
                {result.bCallsA}
              </p>
            </Card>
          </div>

          {result.pathLabels.length > 0 && (
            <div
              className="animate-[fade-in-up_0.35s_ease-out_forwards] rounded-2xl border border-border-default bg-stone-50 px-6 py-5"
              style={{ animationDelay: "0.25s", animationFillMode: "backwards" }}
            >
              <div className="mb-4 flex items-center gap-2">
                <GitMerge className="size-4 text-stone-400" />
                <p className="text-xs font-semibold tracking-wider text-stone-400 uppercase">
                  {t("kinship.pathAnalysis")}
                </p>
              </div>
              <div className="space-y-4">
                {result.pathLabels.map((pathLabel, i) => (
                  <div key={pathLabel} className="flex items-start gap-4">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm">
                      <span className="text-2xs font-bold text-stone-400">{i + 1}</span>
                    </div>
                    <p className="pt-1 text-sm leading-relaxed text-stone-600">{pathLabel}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(result.aCallsB.includes("/") || result.aCallsB.includes("họ hàng")) && (
            <p className="px-1 text-xs text-stone-400 italic">{t("kinship.kinshipNote")}</p>
          )}
        </div>
      )}

      <div className="space-y-4 border-t border-border-default pt-6">
        <button
          type="button"
          onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-stone-500 transition-colors hover:text-amber-600"
        >
          <BookOpen className="size-4" />
          {showGuide ? t("kinship.hideGuide") : t("kinship.showGuide")}
        </button>

        {showGuide && (
          <div className="animate-[fade-in_0.25s_ease-out_forwards] overflow-hidden">
            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
                  <Info className="size-4" />
                  {t("kinship.howItWorks")}
                </p>
                <ol className="space-y-2 text-sm text-blue-800">
                  {[1, 2, 3, 4, 5].map((step) => (
                    <li key={step} className="flex gap-2">
                      <span className="shrink-0 font-bold">{step}.</span>
                      <Trans
                        i18nKey={`kinship.howStep${step}`}
                        components={{ strong: <strong /> }}
                      />
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5">
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-700">
                  <Info className="size-4" />
                  {t("kinship.dataRequirements")}
                </p>
                <ul className="space-y-1.5 text-sm text-amber-800">
                  {[1, 2, 3].map((req) => (
                    <li key={req} className="flex gap-2">
                      <span className="shrink-0 text-amber-400">•</span>
                      <Trans
                        i18nKey={`kinship.dataReq${req}`}
                        components={{ strong: <strong /> }}
                      />
                    </li>
                  ))}
                </ul>
              </div>

              <Card variant="elevated" className="overflow-hidden">
                <div className="border-b border-stone-100 bg-stone-50/50 px-5 py-3">
                  <p className="text-sm font-bold text-stone-600">{t("kinship.referenceTable")}</p>
                </div>
                <div className="divide-y divide-stone-100">
                  {KINSHIP_TERMS.map((row) => (
                    <div key={row.relation} className="flex items-start gap-4 px-5 py-3">
                      <span className="w-48 shrink-0 text-sm font-bold text-amber-700">
                        {row.relation}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-stone-600">{row.desc}</p>
                        <p className="mt-0.5 text-xs text-stone-400">{row.example}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
