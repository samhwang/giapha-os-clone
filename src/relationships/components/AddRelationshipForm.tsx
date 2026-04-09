import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatDisplayDate } from "../../events/utils/dateHelpers";
import { Gender, type Person } from "../../members/types";
import { Button } from "../../ui/common/Button";
import { INPUT_BASE } from "../../ui/common/Input";
import { cn } from "../../ui/utils/cn";
import { RelationshipType } from "../types";

interface AddRelationshipFormProps {
  onSubmit: (data: {
    direction: string;
    type: string;
    note: string;
    targetId: string;
  }) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
  allPersons: Person[];
  personId: string;
}

const COMPACT_INPUT = cn(INPUT_BASE, "rounded-md p-2 text-sm sm:rounded-lg sm:p-2.5");

export default function AddRelationshipForm({
  onSubmit,
  onCancel,
  processing,
  allPersons,
  personId,
}: AddRelationshipFormProps) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<"parent" | "child" | "spouse">("parent");
  const [type, setType] = useState<RelationshipType>(RelationshipType.enum.biological_child);
  const [note, setNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const results = allPersons
        .filter((p) => p.id !== personId && p.fullName.toLowerCase().includes(term))
        .slice(0, 5);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, personId, allPersons]);

  const handleSubmit = () => {
    if (!selectedTargetId) return;
    void onSubmit({ direction, type, note, targetId: selectedTargetId });
  };

  const handleCancel = () => {
    setSelectedTargetId(null);
    setSearchTerm("");
    setNote("");
    onCancel();
  };

  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50/50 p-4 shadow-sm sm:p-5">
      <h4 className="mb-3 text-sm font-bold text-stone-800">
        {t("relationship.addNewRelationship")}
      </h4>
      <div className="space-y-3">
        <div>
          <label htmlFor="relNote" className="mb-1 block text-xs font-medium text-stone-500">
            {t("relationship.noteLabel")}
          </label>
          <input
            id="relNote"
            type="text"
            placeholder={t("relationship.notePlaceholder")}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className={cn(COMPACT_INPUT, "mb-3")}
          />
        </div>
        <div>
          <label htmlFor="relDirection" className="mb-1 block text-xs font-medium text-stone-500">
            {t("relationship.typeLabel")}
          </label>
          <select
            id="relDirection"
            value={direction}
            onChange={(e) => setDirection(e.target.value as "parent" | "child" | "spouse")}
            className={COMPACT_INPUT}
          >
            <option value="parent">{t("relationship.typeChild")}</option>
            <option value="spouse">{t("relationship.typeSpouse")}</option>
            <option value="child">{t("relationship.typeParent")}</option>
          </select>
        </div>

        {(direction === "child" || direction === "parent") && (
          <div>
            <label htmlFor="relType" className="mb-1 block text-xs font-medium text-stone-500">
              {t("relationship.detailLabel")}
            </label>
            <select
              id="relType"
              value={type}
              onChange={(e) => setType(e.target.value as RelationshipType)}
              className={COMPACT_INPUT}
            >
              <option value="biological_child">{t("relationship.biological")}</option>
              <option value="adopted_child">{t("relationship.adopted")}</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="relSearch" className="mb-1 block text-xs font-medium text-stone-500">
            {t("relationship.searchPerson")}
          </label>
          <input
            id="relSearch"
            type="text"
            placeholder={t("relationship.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={COMPACT_INPUT}
          />
          {searchResults.length > 0 && (
            <div className="mt-2 max-h-62.5 overflow-y-auto rounded-md border border-stone-200 bg-white shadow-lg">
              <div className="sticky top-0 z-10 border-b border-stone-200 bg-stone-100 px-3 py-1.5 text-2xs font-bold tracking-wide text-stone-500 uppercase">
                {t("relationship.searchResults")}
              </div>
              {searchResults.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => {
                    setSelectedTargetId(p.id);
                    setSearchTerm(p.fullName);
                    setSearchResults([]);
                  }}
                  className="flex w-full items-center justify-between border-b border-stone-100 px-3 py-2 text-sm last:border-0 hover:bg-amber-50"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-3 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white",
                        p.gender === Gender.enum.male && "bg-sky-500",
                        p.gender === Gender.enum.female && "bg-rose-500",
                        p.gender === Gender.enum.other && "bg-stone-400",
                      )}
                    >
                      {p.gender === Gender.enum.male
                        ? "♂"
                        : p.gender === Gender.enum.female
                          ? "♀"
                          : "?"}
                    </span>
                    <span className="font-medium text-stone-800">{p.fullName}</span>
                  </div>
                  <span className="text-2xs text-stone-400">
                    {formatDisplayDate({
                      year: p.birthYear,
                      month: p.birthMonth,
                      day: p.birthDay,
                      unknownLabel: t("common.unknown"),
                    })}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selectedTargetId && (
            <p className="mt-1 text-xs text-green-600">
              {t("relationship.selected", { name: searchTerm })}
            </p>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!selectedTargetId || processing}
            className="flex-1 rounded-md sm:rounded-lg"
          >
            {processing ? t("common.saving") : t("common.save")}
          </Button>
          <Button size="sm" onClick={handleCancel} className="rounded-md sm:rounded-lg">
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
