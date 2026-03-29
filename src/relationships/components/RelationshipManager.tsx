import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../dashboard/store/dashboardStore';
import type { Person } from '../../members/types';
import Avatar from '../../ui/common/Avatar';
import type { DescendantStats } from '../hooks/useRelationships';
import { useRelationships } from '../hooks/useRelationships';
import { RelationshipType } from '../types';
import AddRelationshipForm from './AddRelationshipForm';
import BulkAddChildrenForm from './BulkAddChildrenForm';
import QuickAddSpouseForm from './QuickAddSpouseForm';

interface RelationshipManagerProps {
  person: Person;
  canEdit?: boolean;
  onStatsLoaded?: (stats: DescendantStats) => void;
}

export default function RelationshipManager({ person, canEdit = false, onStatsLoaded }: RelationshipManagerProps) {
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

  if (loading) return <div className="text-stone-500 text-sm">{t('relationship.loadingFamily')}</div>;

  const spouses = groupByType('spouse').map((rel) => ({
    id: rel.targetPerson.id,
    fullName: rel.targetPerson.fullName,
    note: rel.note,
  }));

  return (
    <div className="space-y-6">
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl p-3 flex items-center justify-between gap-2">
          <p>{actionError}</p>
          <button type="button" onClick={dismissError} className="text-red-500 hover:text-red-700 font-bold shrink-0">
            ×
          </button>
        </div>
      )}

      {['parent', 'spouse', 'child', 'child_in_law'].map((group) => {
        const items = groupByType(group);
        let title = '';
        if (group === 'parent') title = t('relationship.parents');
        if (group === 'spouse') title = t('relationship.spouse');
        if (group === 'child') title = t('relationship.children');
        if (group === 'child_in_law') title = t('relationship.inLawChildren');

        if (items.length === 0 && !canEdit) return null;

        return (
          <div key={group} className="border-b border-stone-100 pb-4 last:border-0">
            <h4 className="font-bold text-stone-700 mb-3 flex justify-between items-center text-sm uppercase tracking-wide">{title}</h4>
            {items.length > 0 ? (
              <ul className="space-y-3">
                {items.map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between group">
                    <button
                      type="button"
                      onClick={() => setMemberModalId(rel.targetPerson.id)}
                      className="flex items-center gap-3 hover:bg-stone-100 p-2.5 -mx-2.5 rounded-xl transition-all duration-fast flex-1 text-left"
                    >
                      <Avatar
                        gender={rel.targetPerson.gender}
                        avatarUrl={rel.targetPerson.avatarUrl}
                        fullName={rel.targetPerson.fullName}
                        className="h-8 w-8 text-xs"
                      />
                      <div className="flex flex-col">
                        <span className="text-stone-900 font-medium text-sm">{rel.targetPerson.fullName}</span>
                        {rel.note && <span className="text-xs text-amber-600 font-medium italic mt-0.5">({rel.note})</span>}
                        {rel.type === RelationshipType.enum.adopted_child && (
                          <span className="text-xs text-stone-400 italic mt-0.5">({t('relationship.adopted')})</span>
                        )}
                      </div>
                    </button>
                    {canEdit && rel.direction !== 'child_in_law' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.id)}
                        className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 sm:p-2.5 rounded-lg transition-colors flex items-center justify-center ml-2"
                        title={t('relationship.deleteRelationship')}
                        aria-label={t('relationship.deleteRelationship')}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">{t('relationship.noInfo')}</p>
            )}
          </div>
        );
      })}

      {canEdit && activeForm === 'none' && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="button"
            onClick={() => setActiveForm('bulk')}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-sky-400 hover:text-sky-700 transition-all duration-fast"
          >
            {t('relationship.addChild')}
          </button>
          <button
            type="button"
            onClick={() => setActiveForm('spouse')}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-rose-400 hover:text-rose-700 transition-all duration-fast"
          >
            {t('relationship.addSpouse')}
          </button>
          <button
            type="button"
            onClick={() => setActiveForm('add')}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-amber-400 hover:text-amber-700 transition-all duration-fast"
          >
            {t('relationship.addRelationship')}
          </button>
        </div>
      )}

      {canEdit && activeForm === 'add' && (
        <AddRelationshipForm
          onSubmit={handleAddRelationship}
          onCancel={() => setActiveForm('none')}
          processing={processing}
          allPersons={allPersons}
          personId={personId}
        />
      )}

      {canEdit && activeForm === 'bulk' && (
        <BulkAddChildrenForm onSubmit={handleBulkAdd} onCancel={() => setActiveForm('none')} processing={processing} spouses={spouses} />
      )}

      {canEdit && activeForm === 'spouse' && (
        <QuickAddSpouseForm onSubmit={handleQuickAddSpouse} onCancel={() => setActiveForm('none')} processing={processing} personGender={personGender} />
      )}
    </div>
  );
}
