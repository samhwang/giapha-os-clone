import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { Relationship } from "../../relationships/types";
import type { GraphLink, GraphNode } from "../utils/bubbleMapHelpers";

import { useDashboardStore } from "../../dashboard/store/dashboardStore";
import { logger } from "../../lib/logger";
import { Gender, type Person } from "../../members/types";
import { AVATAR_VERSION } from "../../ui/icons/DefaultAvatar";
import { buildGraphData } from "../utils/bubbleMapHelpers";
import { buildAdjacencyLists } from "../utils/treeHelpers";

interface BubbleMapTreeProps {
  personsMap: Map<string, Person>;
  relationships: Relationship[];
  roots: Person[];
}

export default function BubbleMapTree({ personsMap, relationships, roots }: BubbleMapTreeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation();
  const { showAvatar } = useDashboardStore();

  const adj = useMemo(
    () => buildAdjacencyLists(relationships, personsMap),
    [relationships, personsMap],
  );
  const { nodes, links } = useMemo(
    () => buildGraphData(roots, personsMap, adj),
    [roots, personsMap, adj],
  );

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    try {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      // Pin root nodes to the center
      const rootNodes = nodes.filter((n) => n.isRoot);
      if (rootNodes.length === 1) {
        rootNodes[0].fx = width / 2;
        rootNodes[0].fy = height / 2;
      } else if (rootNodes.length > 1) {
        rootNodes.forEach((n, i) => {
          n.fx = width / 2 + (i - (rootNodes.length - 1) / 2) * 150;
          n.fy = height / 2;
        });
      }

      const svg = d3
        .select(svgRef.current)
        .attr("viewBox", [0, 0, width, height])
        .style("cursor", "grab");
      svg.selectAll("*").remove();

      const g = svg.append("g");

      // Defs for avatar clipping
      const defs = svg.append("defs");
      defs
        .append("clipPath")
        .attr("id", "avatar-clip")
        .append("circle")
        .attr("r", 26)
        .attr("cx", 0)
        .attr("cy", 0);
      defs
        .append("clipPath")
        .attr("id", "avatar-clip-root")
        .append("circle")
        .attr("r", 36)
        .attr("cx", 0)
        .attr("cy", 0);

      // Zoom
      const zoom = d3
        .zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });
      svg.call(zoom);
      svg.call(zoom.translateTo, width / 2, height / 2);

      // Force simulation
      const simulation = d3
        .forceSimulation<GraphNode>(nodes)
        .force(
          "link",
          d3
            .forceLink<GraphNode, GraphLink>(links)
            .id((d) => d.id)
            .distance(150),
        )
        .force("charge", d3.forceManyBody().strength(-1200))
        .force(
          "collide",
          d3
            .forceCollide<GraphNode>()
            .radius((d) => d.width / 2 + 15)
            .iterations(2),
        );

      // Draw links
      const link = g
        .append("g")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "#d6d3d1")
        .attr("stroke-width", 2);

      // Draw nodes
      const node = g
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .call(
          d3
            .drag<SVGGElement, GraphNode>()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
              svg.style("cursor", "grabbing");
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              if (!d.isRoot) {
                d.fx = null;
                d.fy = null;
              }
              svg.style("cursor", "grab");
            }) as never,
        );

      // Pill shape
      node
        .append("rect")
        .attr("x", (d) => -d.width / 2)
        .attr("y", (d) => -d.radius)
        .attr("rx", (d) => d.radius)
        .attr("ry", (d) => d.radius)
        .attr("width", (d) => d.width)
        .attr("height", (d) => d.radius * 2)
        .attr("fill", "white")
        .attr("stroke", (d) => (d.people[0].gender === Gender.enum.male ? "#3b82f6" : "#ec4899"))
        .attr("stroke-width", (d) => (d.isRoot ? 4 : 2))
        .attr("class", "shadow-md transition-all hover:scale-105 cursor-pointer");

      // Avatars
      if (showAvatar) {
        node.each(function (d) {
          const unitContent = d3.select(this);

          d.people.forEach((person, index) => {
            const totalSpacing = d.width - d.radius * 2;
            const spacingStep = d.people.length > 1 ? totalSpacing / (d.people.length - 1) : 0;
            const startX = -(totalSpacing / 2);
            const cx = startX + index * spacingStep;

            const avatarGroup = unitContent.append("g").attr("transform", `translate(${cx}, 0)`);

            avatarGroup
              .append("image")
              .attr("x", -d.radius + 4)
              .attr("y", -d.radius + 4)
              .attr("width", (d.radius - 4) * 2)
              .attr("height", (d.radius - 4) * 2)
              .attr("clip-path", d.isRoot ? "url(#avatar-clip-root)" : "url(#avatar-clip)")
              .attr("preserveAspectRatio", "xMidYMid slice")
              .attr(
                "href",
                person.avatarUrl ||
                  (person.gender === Gender.enum.male
                    ? `/avatar/${AVATAR_VERSION}/male.svg`
                    : `/avatar/${AVATAR_VERSION}/female.svg`),
              );
          });
        });
      }

      // Names
      node
        .append("text")
        .attr("dy", (d) => d.radius + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "#44403c")
        .attr("font-size", (d) => (d.isRoot ? "14px" : "12px"))
        .attr("font-weight", (d) => (d.isRoot ? "bold" : "normal"))
        .style("pointer-events", "none")
        .text((d) => d.people.map((p) => p.fullName.split(" ").pop()).join(" & "));

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as GraphNode).x!)
          .attr("y1", (d) => (d.source as GraphNode).y!)
          .attr("x2", (d) => (d.target as GraphNode).x!)
          .attr("y2", (d) => (d.target as GraphNode).y!);

        node.attr("transform", (d) => `translate(${d.x},${d.y})`);
      });

      return () => {
        simulation.stop();
      };
    } catch (err) {
      logger.error("D3 rendering error:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
    }
  }, [nodes, links, showAvatar]);

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl border border-border-default bg-stone-50 p-4 text-center shadow-inner">
        <span className="text-text-muted">
          {t("error.tree.renderFailed", { message: error.message })}
        </span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden rounded-2xl border border-border-default bg-stone-50 shadow-inner">
      <div ref={containerRef} className="h-full w-full">
        <svg ref={svgRef} className="block h-full w-full" />
      </div>
    </div>
  );
}
