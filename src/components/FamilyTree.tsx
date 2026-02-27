import React, { useEffect, useRef, useState } from 'react';
import type { Person, Relationship } from '../types';
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-center scroll when roots change
  useEffect(() => {
    if (containerRef.current) {
      const el = containerRef.current;
      el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    }
  }, [roots]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPressed(true);
    hasDraggedRef.current = false;
    setDragStart({ x: e.pageX, y: e.pageY });
    if (containerRef.current) {
      setScrollStart({ left: containerRef.current.scrollLeft, top: containerRef.current.scrollTop });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPressed || !containerRef.current) return;
    const dx = e.pageX - dragStart.x;
    const dy = e.pageY - dragStart.y;
    if (!hasDraggedRef.current && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
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

  const handleClickCapture = (e: React.MouseEvent) => {
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

  const renderTreeNode = (personId: string, visited: Set<string> = new Set()): React.ReactNode => {
    if (visited.has(personId)) return null;
    visited.add(personId);

    const data = getTreeData(personId);
    if (!data.person) return null;

    return (
      <li key={personId}>
        <div className="node-container inline-flex flex-col items-center">
          <div className="flex relative z-10 bg-white rounded-2xl shadow-md border border-stone-200/80 transition-opacity">
            <FamilyNodeCard person={data.person} isMainNode />
            {data.spouses.length > 0 &&
              data.spouses.map((spouseData, idx) => (
                <div key={spouseData.person.id} className="flex relative">
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
              <React.Fragment key={child.id}>{renderTreeNode(child.id, new Set(visited))}</React.Fragment>
            ))}
          </ul>
        )}
      </li>
    );
  };

  if (roots.length === 0) return <div className="text-center p-10 text-stone-500">Không tìm thấy dữ liệu.</div>;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drag-to-scroll container
    <div
      ref={containerRef}
      className={`w-full overflow-auto bg-stone-50 ${isPressed ? 'cursor-grabbing' : 'cursor-grab'}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
      onDragStart={(e) => e.preventDefault()}
    >
      <style
        // biome-ignore lint/security/noDangerouslySetInnerHtml: CSS-only tree connector styles
        dangerouslySetInnerHTML={{
          __html: `
        .css-tree ul {
          padding-top: 30px;
          position: relative;
          display: flex;
          justify-content: center;
          padding-left: 0;
        }
        .css-tree li {
          float: left; text-align: center;
          list-style-type: none;
          position: relative;
          padding: 30px 5px 0 5px;
        }
        .css-tree li::before, .css-tree li::after {
          content: '';
          position: absolute; top: 0; right: 50%;
          border-top: 2px solid #d6d3d1;
          width: 50%; height: 30px;
        }
        .css-tree li::after {
          right: auto; left: 50%;
          border-left: 2px solid #d6d3d1;
        }
        .css-tree li:only-child::after {
          display: none;
        }
        .css-tree li:only-child::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 2px solid #d6d3d1;
          width: 0;
          height: 30px;
        }
        .css-tree ul:first-child > li {
          padding-top: 0px;
        }
        .css-tree ul:first-child > li::before {
          display: none;
        }
        .css-tree li:first-child::before, .css-tree li:last-child::after {
          border: 0 none;
        }
        .css-tree li:last-child::before {
          border-right: 2px solid #d6d3d1;
          border-radius: 0 12px 0 0;
        }
        .css-tree li:first-child::after {
          border-radius: 12px 0 0 0;
        }
        .css-tree ul ul::before {
          content: '';
          position: absolute; top: 0; left: 50%;
          border-left: 2px solid #d6d3d1;
          width: 0; height: 30px;
        }
      `,
        }}
      />

      <div id="export-container" className={`w-max min-w-full mx-auto p-4 css-tree transition-opacity duration-200 ${isDragging ? 'opacity-90' : ''}`}>
        <ul>
          {roots.map((root) => (
            <React.Fragment key={root.id}>{renderTreeNode(root.id)}</React.Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}
