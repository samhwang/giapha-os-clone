import { Fragment, type MouseEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { css } from '../../../styled-system/css';
import type { Person, Relationship } from '../../types';
import FamilyNodeCard from './FamilyNodeCard';

interface SpouseData {
  person: Person;
  note?: string | null;
}

export default function FamilyTree({ personsMap, relationships, roots }: { personsMap: Map<string, Person>; relationships: Relationship[]; roots: Person[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const hasDraggedRef = useRef(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollStart, setScrollStart] = useState({ left: 0, top: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, []);

  const handleMouseDown = (e: MouseEvent) => {
    setIsPressed(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) {
      setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isPressed || !containerRef.current) return;
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    const hasExceededDragThreshold = Math.abs(dx) > 5 || Math.abs(dy) > 5;
    if (!hasDraggedRef.current && hasExceededDragThreshold) {
      setIsDragging(true);
      hasDraggedRef.current = true;
    }
    if (hasDraggedRef.current) {
      e.preventDefault();
      containerRef.current.scrollLeft = scrollStart.left - dx;
      containerRef.current.scrollTop = scrollStart.top - dy;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsPressed(false);
    setIsDragging(false);
  };

  const handleClickCapture = (e: MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  };

  const getTreeData = (personId: string) => {
    const spousesList: SpouseData[] = relationships
      .filter((r) => r.type === 'marriage' && (r.personAId === personId || r.personBId === personId))
      .map((r) => {
        const spouseId = r.personAId === personId ? r.personBId : r.personAId;
        return { person: personsMap.get(spouseId) as Person, note: r.note };
      })
      .filter((s) => s.person);

    const childRels = relationships.filter((r) => (r.type === 'biological_child' || r.type === 'adopted_child') && r.personAId === personId);

    const childrenList = (childRels.map((r) => personsMap.get(r.personBId)).filter(Boolean) as Person[]).sort((a, b) => {
      const aOrder = a.birthOrder ?? Number.POSITIVE_INFINITY;
      const bOrder = b.birthOrder ?? Number.POSITIVE_INFINITY;
      if (aOrder !== bOrder) return aOrder - bOrder;
      const aYear = a.birthYear ?? Number.POSITIVE_INFINITY;
      const bYear = b.birthYear ?? Number.POSITIVE_INFINITY;
      return aYear - bYear;
    });

    return { person: personsMap.get(personId) as Person, spouses: spousesList, children: childrenList };
  };

  const renderTreeNode = (personId: string, visited: Set<string> = new Set()): ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const data = getTreeData(personId);
    if (!data.person) return null;

    return (
      <li key={personId}>
        <div className={css({ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' })}>
          <div
            className={css({
              display: 'flex',
              position: 'relative',
              zIndex: 10,
              backgroundColor: 'white',
              borderRadius: '2xl',
              boxShadow: 'md',
              border: '1px solid rgb(228 228 231 / 0.8)',
              transition: 'opacity 0.2s',
            })}
          >
            <FamilyNodeCard person={data.person} isMainNode />
            {data.spouses.length > 0 &&
              data.spouses.map((spouseData, idx) => (
                <div key={spouseData.person.id} className={css({ display: 'flex', position: 'relative' })}>
                  <FamilyNodeCard
                    isRingVisible={idx === 0}
                    isPlusVisible={idx > 0}
                    person={spouseData.person}
                    role={spouseData.person.gender === 'male' ? 'Chồng' : 'Vợ'}
                    note={spouseData.note}
                  />
                </div>
              ))}
          </div>
        </div>

        {data.children.length > 0 && (
          <ul>
            {data.children.map((child) => (
              <Fragment key={child.id}>{renderTreeNode(child.id, new Set(visited))}</Fragment>
            ))}
          </ul>
        )}
      </li>
    );
  };

  if (roots.length === 0) return <div className={css({ textAlign: 'center', padding: '10', color: 'stone.500' })}>Không tìm thấy dữ liệu.</div>;

  return (
    <section
      aria-label="Family tree"
      ref={containerRef}
      className={css({ width: '100%', overflow: 'auto', backgroundColor: 'stone.50', cursor: isPressed ? 'grabbing' : 'grab' })}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      <div
        id="export-container"
        className={css(
          { width: 'max-content', minWidth: '100%', marginX: 'auto', padding: '4', transition: 'opacity 0.2s' },
          isDragging ? { opacity: 0.9 } : {}
        )}
      >
        <ul>
          {roots.map((root) => (
            <Fragment key={root.id}>{renderTreeNode(root.id)}</Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
