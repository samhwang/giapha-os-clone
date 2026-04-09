import { ChevronsDownUp, ChevronsUpDown, Share2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Person } from "../../members/types";
import type { Relationship } from "../../relationships/types";
import type { ExpandSignal, MindmapContextData } from "./MindmapNode";

import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import { buildAdjacencyLists } from "../utils/treeHelpers";
import { MindmapNode } from "./MindmapNode";
import TreeFilters, { useTreeFilters } from "./TreeFilters";
import ZoomControls from "./ZoomControls";

const DEFAULT_AUTO_COLLAPSE_LEVEL = 2;

interface MindmapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function MindmapTree({ personsMap, relationships, roots }: MindmapTreeProps) {
  const { t } = useTranslation();
  const { showAvatar, setMemberModalId } = useDashboardStore();
  const [scale, setScale] = useState(1);
  const { filters, toggle } = useTreeFilters();
  const [hideExpandButtons, _setHideExpandButtons] = useState(false);
  const [autoCollapseLevel, _setAutoCollapseLevel] = useState(DEFAULT_AUTO_COLLAPSE_LEVEL);
  const [expandSignal, setExpandSignal] = useState<ExpandSignal | null>(null);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 2));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.3));
  const handleResetZoom = () => setScale(1);

  const adj = useMemo(
    () => buildAdjacencyLists(relationships, personsMap),
    [relationships, personsMap],
  );

  const ctx: MindmapContextData = useMemo(
    () => ({
      personsMap,
      relationships,
      adj,
      filters,
      showAvatar,
      hideExpandButtons,
      autoCollapseLevel,
      expandSignal,
      setMemberModalId,
      t,
    }),
    [
      personsMap,
      relationships,
      adj,
      filters,
      showAvatar,
      hideExpandButtons,
      autoCollapseLevel,
      expandSignal,
      setMemberModalId,
      t,
    ],
  );

  if (roots.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100">
          <Share2 className="size-8 text-stone-300" />
        </div>
        <p className="font-medium tracking-wide text-stone-500">{t("tree.emptyTree")}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        {/* Expand/Collapse all */}
        <div className="flex h-10 items-center overflow-hidden rounded-full border border-border-default bg-surface-elevated shadow-sm backdrop-blur-md">
          <button
            type="button"
            onClick={() => setExpandSignal({ type: "expand", ts: Date.now() })}
            className="flex h-full items-center gap-1.5 px-3 text-stone-600 transition-colors hover:bg-stone-100/50"
            title={t("tree.expandAll")}
          >
            <ChevronsUpDown className="size-4" />
            <span className="hidden text-xs font-medium sm:inline">{t("tree.expandAll")}</span>
          </button>
          <button
            type="button"
            onClick={() => setExpandSignal({ type: "collapse", ts: Date.now() })}
            className="flex h-full items-center gap-1.5 border-l border-stone-200/50 px-3 text-stone-600 transition-colors hover:bg-stone-100/50"
            title={t("tree.collapseAll")}
          >
            <ChevronsDownUp className="size-4" />
            <span className="hidden text-xs font-medium sm:inline">{t("tree.collapseAll")}</span>
          </button>
        </div>

        <TreeFilters filters={filters} onToggle={toggle} />
        <ZoomControls
          scale={scale}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetZoom={handleResetZoom}
        />
      </div>

      <div className="flex h-full min-h-[calc(100vh-140px)] w-full justify-start overflow-x-auto p-4 sm:p-6 lg:justify-center lg:p-8">
        <div
          id="export-container"
          className="min-w-max p-8 pb-20 font-sans transition-all duration-fast"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {roots.map((root, index) => (
            <MindmapNode
              key={root.id}
              personId={root.id}
              level={0}
              isLast={index === roots.length - 1}
              ctx={ctx}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
