import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Gender } from "../../members/types";
import { Button } from "../../ui/common/Button";
import { INPUT_BASE } from "../../ui/common/Input";
import { cn } from "../../ui/utils/cn";

interface BulkChild {
  name: string;
  gender: Gender;
  birthYear: string;
  birthOrder: string;
}

interface BulkAddChildrenFormProps {
  onSubmit: (data: {
    spouseId: string;
    children: Array<{ name: string; gender: string; birthYear: string; birthOrder: string }>;
  }) => Promise<void>;
  onCancel: () => void;
  processing: boolean;
  spouses: Array<{ id: string; fullName: string; note: string | null }>;
}

export default function BulkAddChildrenForm({
  onSubmit,
  onCancel,
  processing,
  spouses,
}: BulkAddChildrenFormProps) {
  const { t } = useTranslation();
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>("");
  const [bulkChildren, setBulkChildren] = useState<BulkChild[]>([
    { name: "", gender: Gender.enum.male, birthYear: "", birthOrder: "1" },
  ]);

  const handleSubmit = () => {
    void onSubmit({
      spouseId: selectedSpouseId,
      children: bulkChildren.map((c) => ({
        name: c.name,
        gender: c.gender,
        birthYear: c.birthYear,
        birthOrder: c.birthOrder,
      })),
    });
  };

  const handleCancel = () => {
    setBulkChildren([{ name: "", gender: Gender.enum.male, birthYear: "", birthOrder: "1" }]);
    setSelectedSpouseId("");
    onCancel();
  };

  return (
    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50/50 p-4 shadow-sm sm:p-5">
      <h4 className="mb-3 text-sm font-bold text-sky-800">{t("relationship.bulkAddChildren")}</h4>
      <div className="space-y-4">
        <div>
          <label htmlFor="bulkSpouse" className="mb-1 block text-xs font-medium text-stone-500">
            {t("relationship.selectOtherParent")}
          </label>
          <select
            id="bulkSpouse"
            value={selectedSpouseId}
            onChange={(e) => setSelectedSpouseId(e.target.value)}
            className={cn(
              INPUT_BASE,
              "flex-1 rounded-md p-2 text-sm focus:border-sky-500 focus:ring-sky-500 sm:rounded-lg sm:p-2.5",
            )}
          >
            <option value="unknown">{t("relationship.unknownParent")}</option>
            {spouses.map((spouse) => (
              <option key={spouse.id} value={spouse.id}>
                {spouse.fullName} {spouse.note ? `(${spouse.note})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <span className="mb-1 block text-xs font-medium text-stone-500">
            {t("relationship.childrenList")}
          </span>
          {bulkChildren.map((child, index) => (
            // oxlint-disable-next-line react/no-array-index-key -- dynamic form rows without stable IDs
            <div key={index} className="flex items-center gap-2">
              <span className="w-4 text-xs text-stone-400">{index + 1}.</span>
              <input
                type="text"
                placeholder={t("relationship.fullNamePlaceholder")}
                value={child.name}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].name = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(
                  INPUT_BASE,
                  "flex-2 rounded-md p-2 text-sm focus:border-sky-500 focus:ring-sky-500",
                )}
              />
              <select
                value={child.gender}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].gender = e.target.value as Gender;
                  setBulkChildren(newBulk);
                }}
                className={cn(
                  INPUT_BASE,
                  "flex-1 rounded-md p-2 text-sm focus:border-sky-500 focus:ring-sky-500",
                )}
              >
                <option value={Gender.enum.male}>{t("common.male")}</option>
                <option value={Gender.enum.female}>{t("common.female")}</option>
                <option value={Gender.enum.other}>{t("common.other")}</option>
              </select>
              <input
                type="number"
                placeholder={t("relationship.birthYearPlaceholder")}
                value={child.birthYear}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].birthYear = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(
                  INPUT_BASE,
                  "w-24 flex-1 rounded-md p-2 text-sm focus:border-sky-500 focus:ring-sky-500",
                )}
              />
              <input
                type="number"
                placeholder={t("relationship.birthOrderPlaceholder")}
                value={child.birthOrder}
                onChange={(e) => {
                  const newBulk = [...bulkChildren];
                  newBulk[index].birthOrder = e.target.value;
                  setBulkChildren(newBulk);
                }}
                className={cn(
                  INPUT_BASE,
                  "w-16 rounded-md p-2 text-sm focus:border-sky-500 focus:ring-sky-500",
                )}
              />
              <button
                type="button"
                onClick={() => {
                  const newBulk = bulkChildren.filter((_, i) => i !== index);
                  if (newBulk.length === 0) {
                    newBulk.push({
                      name: "",
                      gender: Gender.enum.male,
                      birthYear: "",
                      birthOrder: "1",
                    });
                  }
                  setBulkChildren(newBulk);
                }}
                className="p-2 text-stone-400 hover:text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const nextOrder = String(bulkChildren.length + 1);
              setBulkChildren([
                ...bulkChildren,
                { name: "", gender: Gender.enum.male, birthYear: "", birthOrder: nextOrder },
              ]);
            }}
            className="mt-2 px-6 text-xs font-semibold text-sky-600 hover:text-sky-800"
          >
            {t("relationship.addRow")}
          </button>
        </div>

        <div className="flex gap-2 border-t border-stone-200 pt-4">
          {/* custom: sky submit button matches the children form's sky-themed section */}
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={processing || bulkChildren.every((c) => c.name.trim() === "")}
            className="flex-1 rounded-md border-transparent bg-sky-600 text-white hover:bg-sky-700 sm:rounded-lg"
          >
            {processing ? t("common.saving") : t("relationship.saveAll")}
          </Button>
          <Button size="sm" onClick={handleCancel} className="rounded-md sm:rounded-lg">
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
