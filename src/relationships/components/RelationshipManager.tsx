import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import type { Person } from "../../members/types";
import type { DescendantStats } from "../hooks/useRelationships";

import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import Avatar from "../../ui/common/Avatar";
import { useRelationships } from "../hooks/useRelationships";
import { RelationshipType } from "../types";
import AddRelationshipForm from "./AddRelationshipForm";
import BulkAddChildrenForm from "./BulkAddChildrenForm";
import QuickAddSpouseForm from "./QuickAddSpouseForm";

interface RelationshipManagerProps {
  person: Person;
  canEdit?: boolean;
  onStatsLoaded?: (stats: DescendantStats) => void;
}

export default function RelationshipManager({
  person,
  canEdit = false,
  onStatsLoaded,
}: RelationshipManagerProps) {
  const { t } = useTranslation();
  const { setMemberModalId } = useDashboardStore();

  const personId = person.id;
  const personGender = person.gender;

  const {
    loading,
    allPersons,
    processing,
    actionError,
    dismissError,
    activeForm,
    setActiveForm,
    handleAddRelationship,
    handleBulkAdd,
    handleQuickAddSpouse,
    handleDelete,
    groupByType,
  } = useRelationships({ person, onStatsLoaded });

  if (loading)
    return <div className="text-sm text-stone-500">{t("relationship.loadingFamily")}</div>;

  const spouses = groupByType("spouse").map((rel) => ({
    id: rel.targetPerson.id,
    fullName: rel.targetPerson.fullName,
    note: rel.note,
  }));

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
          <p>{actionError}</p>
          <button
            type="button"
            onClick={dismissError}
            className="shrink-0 font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {["parent", "spouse", "child", "child_in_law"].map((group) => {
        const items = groupByType(group);
        let title = "";
        if (group === "parent") title = t("relationship.parents");
        if (group === "spouse") title = t("relationship.spouse");
        if (group === "child") title = t("relationship.children");
        if (group === "child_in_law") title = t("relationship.inLawChildren");

        if (items.length === 0 && !canEdit) return null;

        return (
          <div key={group} className="border-b border-stone-100 pb-4 last:border-0">
            <h4 className="mb-3 flex items-center justify-between text-sm font-bold tracking-wide text-stone-700 uppercase">
              {title}
            </h4>
            {items.length > 0 ? (
              <ul className="space-y-3">
                {items.map((rel) => (
                  <li key={rel.id} className="group flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setMemberModalId(rel.targetPerson.id)}
                      className="-mx-2.5 flex flex-1 items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-fast hover:bg-stone-100"
                    >
                      <Avatar
                        gender={rel.targetPerson.gender}
                        avatarUrl={rel.targetPerson.avatarUrl}
                        fullName={rel.targetPerson.fullName}
                        className="h-8 w-8 text-xs"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-stone-900">
                          {rel.targetPerson.fullName}
                        </span>
                        {rel.note && (
                          <span className="mt-0.5 text-xs font-medium text-amber-600 italic">
                            ({rel.note})
                          </span>
                        )}
                        {rel.type === RelationshipType.enum.adopted_child && (
                          <span className="mt-0.5 text-xs text-stone-400 italic">
                            ({t("relationship.adopted")})
                          </span>
                        )}
                      </div>
                    </button>
                    {canEdit && rel.direction !== "child_in_law" && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.id)}
                        className="ml-2 flex items-center justify-center rounded-lg p-2 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500 sm:p-2.5"
                        title={t("relationship.deleteRelationship")}
                        aria-label={t("relationship.deleteRelationship")}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">{t("relationship.noInfo")}</p>
            )}
          </div>
        );
      })}

      {canEdit && activeForm === "none" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setActiveForm("bulk")}
            className="flex-1 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 py-3 text-sm font-medium text-stone-500 transition-all duration-fast hover:border-sky-400 hover:bg-stone-50 hover:text-sky-700 sm:rounded-2xl"
          >
            {t("relationship.addChild")}
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("spouse")}
            className="flex-1 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 py-3 text-sm font-medium text-stone-500 transition-all duration-fast hover:border-rose-400 hover:bg-stone-50 hover:text-rose-700 sm:rounded-2xl"
          >
            {t("relationship.addSpouse")}
          </button>
          <button
            type="button"
            onClick={() => setActiveForm("add")}
            className="flex-1 rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 py-3 text-sm font-medium text-stone-500 transition-all duration-fast hover:border-amber-400 hover:bg-stone-50 hover:text-amber-700 sm:rounded-2xl"
          >
            {t("relationship.addRelationship")}
          </button>
        </div>
      )}

      {canEdit && activeForm === "add" && (
        <AddRelationshipForm
          onSubmit={handleAddRelationship}
          onCancel={() => setActiveForm("none")}
          processing={processing}
          allPersons={allPersons}
          personId={personId}
        />
      )}

      {canEdit && activeForm === "bulk" && (
        <BulkAddChildrenForm
          onSubmit={handleBulkAdd}
          onCancel={() => setActiveForm("none")}
          processing={processing}
          spouses={spouses}
        />
      )}

      {canEdit && activeForm === "spouse" && (
        <QuickAddSpouseForm
          onSubmit={handleQuickAddSpouse}
          onCancel={() => setActiveForm("none")}
          processing={processing}
          personGender={personGender}
        />
      )}
    </div>
  );
}
