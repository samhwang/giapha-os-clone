import { useNavigate } from '@tanstack/react-router';
import { Trash2 } from 'lucide-react';
import { useCallback, useContext, useEffect, useState } from 'react';
import { createPerson, getPersons } from '@/server/functions/member';
import { createRelationship, deleteRelationship, getRelationshipsForPerson } from '@/server/functions/relationship';
import type { Person, RelationshipType } from '@/types';
import { formatDisplayDate } from '@/utils/dateHelpers';
import { DashboardContext, useDashboard } from './DashboardContext';
import DefaultAvatar from './DefaultAvatar';

interface RelationshipManagerProps {
  personId: string;
  isAdmin: boolean;
  personGender: string;
}

interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: 'parent' | 'child' | 'spouse' | 'child_in_law';
  targetPerson: Person;
  note: string | null;
}

export default function RelationshipManager({ personId, isAdmin, personGender }: RelationshipManagerProps) {
  const dashboardContext = useContext(DashboardContext);
  const { setMemberModalId } = useDashboard();
  const navigate = useNavigate();

  const handlePersonClick = (id: string) => {
    if (dashboardContext !== undefined) {
      setMemberModalId(id);
    } else {
      navigate({ to: '/dashboard/members/$id', params: { id } });
    }
  };

  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Relationship State
  const [isAdding, setIsAdding] = useState(false);
  const [newRelType, setNewRelType] = useState<RelationshipType>('biological_child');
  const [newRelDirection, setNewRelDirection] = useState<'parent' | 'child' | 'spouse'>('parent');
  const [newRelNote, setNewRelNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Person[]>([]);
  const [allPersons, setAllPersons] = useState<Person[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Bulk Add State
  const [isAddingBulk, setIsAddingBulk] = useState(false);
  const [selectedSpouseId, setSelectedSpouseId] = useState<string>('');
  const [bulkChildren, setBulkChildren] = useState<{ name: string; gender: 'male' | 'female' | 'other'; birthYear: string; isProcessing: boolean }[]>([
    { name: '', gender: 'male', birthYear: '', isProcessing: false },
  ]);

  // Quick Add Spouse State
  const [isAddingSpouse, setIsAddingSpouse] = useState(false);
  const [newSpouseName, setNewSpouseName] = useState('');
  const [newSpouseBirthYear, setNewSpouseBirthYear] = useState('');
  const [newSpouseNote, setNewSpouseNote] = useState('');

  const fetchRelationships = useCallback(async () => {
    try {
      const rels = await getRelationshipsForPerson({ data: { personId } });
      const persons = await getPersons();
      setAllPersons(persons);

      const personsMap = new Map(persons.map((p) => [p.id, p]));
      const formattedRels: EnrichedRelationship[] = [];

      for (const r of rels) {
        const isA = r.personAId === personId;
        const targetId = isA ? r.personBId : r.personAId;
        const target = personsMap.get(targetId);
        if (!target) continue;

        let direction: 'parent' | 'child' | 'spouse' = 'spouse';
        if (r.type === 'marriage') {
          direction = 'spouse';
        } else if (isA) {
          direction = 'child'; // I am A (Parent), B is Child
        } else {
          direction = 'parent'; // I am B (Child), A is Parent
        }

        formattedRels.push({
          id: r.id,
          type: r.type as RelationshipType,
          direction,
          targetPerson: target,
          note: r.note,
        });
      }

      // Fetch in-laws (spouses of children)
      const childrenIds = formattedRels.filter((r) => r.direction === 'child').map((r) => r.targetPerson.id);

      if (childrenIds.length > 0) {
        for (const childId of childrenIds) {
          const childRels = await getRelationshipsForPerson({ data: { personId: childId } });
          const childPerson = personsMap.get(childId);
          if (!childPerson) continue;

          for (const m of childRels) {
            if (m.type !== 'marriage') continue;
            const spouseId = m.personAId === childId ? m.personBId : m.personAId;
            const spousePerson = personsMap.get(spouseId);
            if (!spousePerson) continue;

            const spouseGender = spousePerson.gender;
            let noteLabel =
              spouseGender === 'female'
                ? `Con dâu (vợ của ${childPerson.fullName})`
                : spouseGender === 'male'
                  ? `Con rể (chồng của ${childPerson.fullName})`
                  : `Vợ/chồng của ${childPerson.fullName}`;

            if (m.note) noteLabel += ` - ${m.note}`;

            formattedRels.push({
              id: `${m.id}_inlaw`,
              type: 'marriage',
              direction: 'child_in_law',
              targetPerson: spousePerson,
              note: noteLabel,
            });
          }
        }
      }

      setRelationships(formattedRels);
    } catch (err) {
      console.error('Error fetching relationships:', err);
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    fetchRelationships();
  }, [fetchRelationships]);

  // Search for people
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      const term = searchTerm.toLowerCase();
      const results = allPersons.filter((p) => p.id !== personId && p.fullName.toLowerCase().includes(term)).slice(0, 5);
      setSearchResults(results);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, personId, allPersons]);

  const handleAddRelationship = async () => {
    if (!selectedTargetId) return;
    setProcessing(true);

    try {
      let personAId = personId;
      let personBId = selectedTargetId;

      if (newRelDirection === 'parent') {
        personAId = selectedTargetId;
        personBId = personId;
      }

      let type: RelationshipType = 'biological_child';
      if (newRelDirection === 'spouse') type = 'marriage';
      else if (newRelType === 'adopted_child') type = 'adopted_child';

      await createRelationship({
        data: {
          personAId,
          personBId,
          type,
          note: newRelNote || null,
        },
      });

      setIsAdding(false);
      setSearchTerm('');
      setSelectedTargetId(null);
      setNewRelNote('');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkAdd = async () => {
    const validChildren = bulkChildren.filter((c) => c.name.trim() !== '');
    if (validChildren.length === 0) {
      alert('Vui lòng nhập ít nhất tên của 1 người con.');
      return;
    }

    setProcessing(true);
    let successCount = 0;

    try {
      for (const child of validChildren) {
        const birthYear = child.birthYear.trim() !== '' ? Number.parseInt(child.birthYear, 10) : undefined;

        const newPerson = await createPerson({
          data: {
            fullName: child.name.trim(),
            gender: child.gender,
            ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
          },
        });

        await createRelationship({
          data: {
            personAId: personId,
            personBId: newPerson.id,
            type: 'biological_child',
          },
        });

        if (selectedSpouseId && selectedSpouseId !== 'unknown') {
          await createRelationship({
            data: {
              personAId: selectedSpouseId,
              personBId: newPerson.id,
              type: 'biological_child',
            },
          });
        }

        successCount++;
      }

      if (successCount === validChildren.length) {
        setIsAddingBulk(false);
        setBulkChildren([{ name: '', gender: 'male', birthYear: '', isProcessing: false }]);
        setSelectedSpouseId('');
        fetchRelationships();
      } else {
        alert(`Đã xảy ra lỗi. Chỉ lưu thành công ${successCount}/${validChildren.length} người.`);
        fetchRelationships();
      }
    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleQuickAddSpouse = async () => {
    if (!newSpouseName.trim()) {
      alert('Vui lòng nhập tên Vợ/Chồng.');
      return;
    }

    setProcessing(true);
    try {
      const newSpouseGender = personGender === 'male' ? 'female' : personGender === 'female' ? 'male' : 'female';
      const birthYear = newSpouseBirthYear.trim() !== '' ? Number.parseInt(newSpouseBirthYear, 10) : undefined;

      const newPerson = await createPerson({
        data: {
          fullName: newSpouseName.trim(),
          gender: newSpouseGender as 'male' | 'female' | 'other',
          ...(birthYear && !Number.isNaN(birthYear) ? { birthYear } : {}),
        },
      });

      await createRelationship({
        data: {
          personAId: personId,
          personBId: newPerson.id,
          type: 'marriage',
          note: newSpouseNote.trim() || null,
        },
      });

      setIsAddingSpouse(false);
      setNewSpouseName('');
      setNewSpouseBirthYear('');
      setNewSpouseNote('');
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (relId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mối quan hệ này?')) return;
    try {
      await deleteRelationship({ data: { id: relId } });
      fetchRelationships();
    } catch (err) {
      const e = err as Error;
      alert(`Lỗi: ${e.message}`);
    }
  };

  const groupByType = (type: string) => relationships.filter((r) => r.direction === type);

  if (loading) return <div className="text-stone-500 text-sm">Đang tải thông tin gia đình...</div>;

  return (
    <div className="space-y-6">
      {['parent', 'spouse', 'child', 'child_in_law'].map((group) => {
        const items = groupByType(group);
        let title = '';
        if (group === 'parent') title = 'Bố / Mẹ';
        if (group === 'spouse') title = 'Vợ / Chồng';
        if (group === 'child') title = 'Con cái';
        if (group === 'child_in_law') title = 'Con dâu / Con rể';

        if (items.length === 0 && !isAdmin) return null;

        return (
          <div key={group} className="border-b border-stone-100 pb-4 last:border-0">
            <h4 className="font-bold text-stone-700 mb-3 flex justify-between items-center text-sm uppercase tracking-wide">{title}</h4>
            {items.length > 0 ? (
              <ul className="space-y-3">
                {items.map((rel) => (
                  <li key={rel.id} className="flex items-center justify-between group">
                    <button
                      type="button"
                      onClick={() => handlePersonClick(rel.targetPerson.id)}
                      className="flex items-center gap-3 hover:bg-stone-100 p-2.5 -mx-2.5 rounded-xl transition-all duration-200 flex-1 text-left"
                    >
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs text-white overflow-hidden
                            ${rel.targetPerson.gender === 'male' ? 'bg-sky-700' : rel.targetPerson.gender === 'female' ? 'bg-rose-700' : 'bg-stone-500'}`}
                      >
                        {rel.targetPerson.avatarUrl ? (
                          <img src={rel.targetPerson.avatarUrl} alt={rel.targetPerson.fullName} className="h-full w-full object-cover" />
                        ) : (
                          <DefaultAvatar gender={rel.targetPerson.gender} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-stone-900 font-medium text-sm">{rel.targetPerson.fullName}</span>
                        {rel.note && <span className="text-xs text-amber-600 font-medium italic mt-0.5">({rel.note})</span>}
                        {rel.type === 'adopted_child' && <span className="text-xs text-stone-400 italic mt-0.5">(Con nuôi)</span>}
                      </div>
                    </button>
                    {isAdmin && rel.direction !== 'child_in_law' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(rel.id)}
                        className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 sm:p-2.5 rounded-lg transition-colors flex items-center justify-center ml-2"
                        title="Xóa mối quan hệ"
                        aria-label="Xóa mối quan hệ"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-stone-400 italic">Chưa có thông tin.</p>
            )}
          </div>
        );
      })}

      {/* Add Buttons (Admin) */}
      {isAdmin && !isAdding && !isAddingBulk && !isAddingSpouse && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            type="button"
            onClick={() => setIsAddingBulk(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-sky-400 hover:text-sky-700 transition-all duration-200"
          >
            + Thêm Con
          </button>
          <button
            type="button"
            onClick={() => setIsAddingSpouse(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-rose-400 hover:text-rose-700 transition-all duration-200"
          >
            + Thêm Vợ/Chồng
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex-1 py-3 border-2 border-dashed border-stone-200 bg-stone-50/50 hover:bg-stone-50 rounded-xl sm:rounded-2xl text-stone-500 font-medium text-sm hover:border-amber-400 hover:text-amber-700 transition-all duration-200"
          >
            + Thêm Mối Quan Hệ
          </button>
        </div>
      )}

      {/* Add Relationship Form */}
      {isAdmin && isAdding && (
        <div className="mt-4 bg-stone-50/50 p-4 sm:p-5 rounded-xl border border-stone-200 shadow-sm">
          <h4 className="font-bold text-stone-800 mb-3 text-sm">Thêm Quan Hệ Mới</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="relNote" className="block text-xs font-medium text-stone-500 mb-1">
                Ghi chú mối quan hệ (tuỳ chọn)
              </label>
              <input
                id="relNote"
                type="text"
                placeholder="VD: Vợ cả, Vợ hai, Chồng trước..."
                value={newRelNote}
                onChange={(e) => setNewRelNote(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border mb-3 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="relDirection" className="block text-xs font-medium text-stone-500 mb-1">
                Loại quan hệ
              </label>
              <select
                id="relDirection"
                value={newRelDirection}
                onChange={(e) => setNewRelDirection(e.target.value as 'parent' | 'child' | 'spouse')}
                className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
              >
                <option value="parent">Người này là Con của...</option>
                <option value="spouse">Người này là Vợ/Chồng của...</option>
                <option value="child">Người này là Bố/Mẹ của...</option>
              </select>
            </div>

            {(newRelDirection === 'child' || newRelDirection === 'parent') && (
              <div>
                <label htmlFor="relType" className="block text-xs font-medium text-stone-500 mb-1">
                  Chi tiết
                </label>
                <select
                  id="relType"
                  value={newRelType}
                  onChange={(e) => setNewRelType(e.target.value as RelationshipType)}
                  className="bg-white text-stone-900 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
                >
                  <option value="biological_child">Con ruột</option>
                  <option value="adopted_child">Con nuôi</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="relSearch" className="block text-xs font-medium text-stone-500 mb-1">
                Tìm người thân
              </label>
              <input
                id="relSearch"
                type="text"
                placeholder="Nhập tên để tìm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 p-2 sm:p-2.5 border transition-colors"
              />
              {searchResults.length > 0 && (
                <div className="mt-2 bg-white border border-stone-200 rounded-md shadow-lg max-h-[250px] overflow-y-auto">
                  <div className="px-3 py-1.5 bg-stone-100 text-[10px] font-bold text-stone-500 uppercase tracking-wide border-b border-stone-200 sticky top-0 z-10">
                    Kết quả tìm kiếm
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
                      className="w-full px-3 py-2 hover:bg-amber-50 text-sm flex items-center justify-between border-b border-stone-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`flex items-center justify-center text-[8px] font-bold size-3 rounded-full text-white shrink-0
                               ${p.gender === 'male' ? 'bg-sky-500' : p.gender === 'female' ? 'bg-rose-500' : 'bg-stone-400'}`}
                        >
                          {p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : '?'}
                        </span>
                        <span className="font-medium text-stone-800">{p.fullName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">{formatDisplayDate(p.birthYear, p.birthMonth, p.birthDay)}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedTargetId && <p className="text-xs text-green-600 mt-1">Đã chọn: {searchTerm}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleAddRelationship}
                disabled={!selectedTargetId || processing}
                className="flex-1 bg-amber-700 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-amber-800 disabled:opacity-50 transition-colors"
              >
                {processing ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedTargetId(null);
                  setSearchTerm('');
                  setNewRelNote('');
                }}
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Children Form */}
      {isAdmin && isAddingBulk && (
        <div className="mt-4 bg-sky-50/50 p-4 sm:p-5 rounded-xl border border-sky-200 shadow-sm">
          <h4 className="font-bold text-sky-800 mb-3 text-sm">Thêm Nhanh Nhiều Con</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="bulkSpouse" className="block text-xs font-medium text-stone-500 mb-1">
                Chọn người mẹ/cha còn lại
              </label>
              <select
                id="bulkSpouse"
                value={selectedSpouseId}
                onChange={(e) => setSelectedSpouseId(e.target.value)}
                className="flex-1 bg-white text-stone-900 text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 sm:p-2.5 border transition-colors"
              >
                <option value="unknown">Không rõ (hoặc Vợ/Chồng khác chưa thêm)</option>
                {groupByType('spouse').map((rel) => (
                  <option key={rel.id} value={rel.targetPerson.id}>
                    {rel.targetPerson.fullName} {rel.note ? `(${rel.note})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-medium text-stone-500 mb-1">Danh sách các con</span>
              {bulkChildren.map((child, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: dynamic form rows without stable IDs
                <div key={index} className="flex gap-2 items-center">
                  <span className="text-stone-400 text-xs w-4">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder="Họ và tên..."
                    value={child.name}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].name = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className="flex-2 bg-white text-stone-900 placeholder-stone-400 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border"
                  />
                  <select
                    value={child.gender}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].gender = e.target.value as 'male' | 'female' | 'other';
                      setBulkChildren(newBulk);
                    }}
                    className="flex-1 bg-white text-stone-900 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Năm sinh"
                    value={child.birthYear}
                    onChange={(e) => {
                      const newBulk = [...bulkChildren];
                      newBulk[index].birthYear = e.target.value;
                      setBulkChildren(newBulk);
                    }}
                    className="flex-1 bg-white text-stone-900 placeholder-stone-400 text-sm rounded-md border-stone-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 p-2 border w-24"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newBulk = bulkChildren.filter((_, i) => i !== index);
                      if (newBulk.length === 0) {
                        newBulk.push({ name: '', gender: 'male', birthYear: '', isProcessing: false });
                      }
                      setBulkChildren(newBulk);
                    }}
                    className="text-stone-400 hover:text-red-500 p-2"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setBulkChildren([...bulkChildren, { name: '', gender: 'male', birthYear: '', isProcessing: false }]);
                }}
                className="text-sky-600 text-xs font-semibold hover:text-sky-800 mt-2 px-6"
              >
                + Thêm dòng
              </button>
            </div>

            <div className="flex gap-2 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={handleBulkAdd}
                disabled={processing || bulkChildren.every((c) => c.name.trim() === '')}
                className="flex-1 bg-sky-600 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 transition-colors"
              >
                {processing ? 'Đang lưu...' : 'Lưu Tất Cả'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingBulk(false);
                  setBulkChildren([{ name: '', gender: 'male', birthYear: '', isProcessing: false }]);
                  setSelectedSpouseId('');
                }}
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Spouse Form */}
      {isAdmin && isAddingSpouse && (
        <div className="mt-4 bg-rose-50/50 p-4 sm:p-5 rounded-xl border border-rose-200 shadow-sm">
          <h4 className="font-bold text-rose-800 mb-3 text-sm">Thêm Nhanh Vợ/Chồng</h4>
          <div className="space-y-3">
            <div>
              <label htmlFor="spouseName" className="block text-xs font-medium text-rose-700 mb-1">
                Họ và Tên *
              </label>
              <input
                id="spouseName"
                type="text"
                placeholder="Nhập họ và tên..."
                value={newSpouseName}
                onChange={(e) => setNewSpouseName(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spouseBirthYear" className="block text-xs font-medium text-rose-700 mb-1">
                Năm sinh (Tuỳ chọn)
              </label>
              <input
                id="spouseBirthYear"
                type="number"
                placeholder="VD: 1980"
                value={newSpouseBirthYear}
                onChange={(e) => setNewSpouseBirthYear(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <div>
              <label htmlFor="spouseRelNote" className="block text-xs font-medium text-rose-700 mb-1">
                Ghi chú mối quan hệ (Ví dụ: Vợ cả, Chồng thứ...)
              </label>
              <input
                id="spouseRelNote"
                type="text"
                placeholder="Tuỳ chọn..."
                value={newSpouseNote}
                onChange={(e) => setNewSpouseNote(e.target.value)}
                className="bg-white text-stone-900 placeholder-stone-400 block w-full text-sm rounded-md sm:rounded-lg border-stone-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 p-2 sm:p-2.5 border transition-colors"
              />
            </div>
            <p className="text-xs text-stone-500 italic mt-1">
              * Giới tính sẽ tự động gán là {personGender === 'male' ? 'Nữ' : personGender === 'female' ? 'Nam' : 'Nữ'} (dựa theo giới tính người hiện tại).
            </p>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleQuickAddSpouse}
                disabled={!newSpouseName.trim() || processing}
                className="flex-1 bg-rose-600 text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg text-sm font-medium hover:bg-rose-700 disabled:opacity-50 transition-colors"
              >
                {processing ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingSpouse(false);
                  setNewSpouseName('');
                  setNewSpouseBirthYear('');
                  setNewSpouseNote('');
                }}
                className="px-4 py-2 sm:py-2.5 bg-white border border-stone-300 text-stone-700 rounded-md sm:rounded-lg text-sm hover:bg-stone-50 transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
