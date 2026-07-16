"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import * as d3 from "d3";

type GraphNode = {
  id: string;
  title: string;
  slug: string;
  type: "Page" | "Post" | "Package";
  inboundCount: number;
  outboundCount: number;
  clusterName: string;
  x?: number;
  y?: number;
};

type GraphLink = {
  id: string;
  source: string | GraphNode;
  target: string | GraphNode;
  anchorText: string;
};

type SummaryRow = {
  id: string;
  title: string;
  slug: string;
  type: "Page" | "Post" | "Package";
  inboundCount: number;
  outboundCount: number;
  clusterName: string;
};

type OrphanPage = {
  id: string;
  title: string;
  slug: string;
  type: "Page" | "Post" | "Package";
  clusterName: string;
};

interface LinkMapClientProps {
  initialNodes: GraphNode[];
  initialLinks: GraphLink[];
  summaryRows: SummaryRow[];
  orphans: OrphanPage[];
}

export function LinkMapClient({
  initialNodes,
  initialLinks,
  summaryRows,
  orphans
}: LinkMapClientProps) {
  // Graph simulation nodes/links state
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);

  // Selection states
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [clickedEdge, setClickedEdge] = useState<GraphLink | null>(null);

  // Tooltip positions
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [edgeTooltipPos, setEdgeTooltipPos] = useState({ x: 0, y: 0 });

  // Zoom transform state
  const svgRef = useRef<SVGSVGElement>(null);
  const [zoomTransform, setZoomTransform] = useState("translate(0,0) scale(1)");

  // 1. Run D3 Simulation
  useEffect(() => {
    if (initialNodes.length === 0) {
      setNodes([]);
      setLinks([]);
      return;
    }

    const nodesCopy = initialNodes.map(d => ({ ...d }));
    const linksCopy = initialLinks.map(d => ({ ...d }));

    const simulation = d3.forceSimulation<GraphNode>(nodesCopy)
      .force("link", d3.forceLink<GraphNode, GraphLink>(linksCopy).id((d) => d.id).distance(140))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(400, 250))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => Math.max(12, 6 + d.inboundCount * 2) + 25));

    simulation.on("tick", () => {
      setNodes([...nodesCopy]);
      setLinks([...linksCopy]);
    });

    return () => {
      simulation.stop();
    };
  }, [initialNodes, initialLinks]);

  // 2. Attach D3 Zoom
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 3])
      .on("zoom", (event) => {
        setZoomTransform(event.transform.toString());
      });
    svg.call(zoom);
  }, []);

  // 3. Highlight states calculations
  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const ids = new Set<string>([selectedNodeId]);
    links.forEach(l => {
      const srcId = typeof l.source === "object" ? l.source.id : l.source;
      const tgtId = typeof l.target === "object" ? l.target.id : l.target;
      if (srcId === selectedNodeId) ids.add(tgtId);
      if (tgtId === selectedNodeId) ids.add(srcId);
    });
    return ids;
  }, [selectedNodeId, links]);

  // Handle background/empty area click
  function handleSvgClick(e: React.MouseEvent) {
    if (e.target === svgRef.current) {
      setSelectedNodeId(null);
      setClickedEdge(null);
    }
  }

  // Node styles
  function getNodeColor(type: "Page" | "Post" | "Package") {
    switch (type) {
      case "Page": return "#ba8838"; // gold
      case "Post": return "#393e29"; // olive
      case "Package": return "#dfcfb3"; // sand
      default: return "#999999";
    }
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-olive/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Internal Link Visual Map</h1>
          <p className="mt-1 text-sm text-olive/70">
            Audit your site-wide search engine discoverability. Inspect cluster topologies and resolve page orphans.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedNodeId && (
            <button
              type="button"
              onClick={() => {
                setSelectedNodeId(null);
                setClickedEdge(null);
              }}
              className="rounded-lg border border-gold text-gold hover:bg-gold hover:text-olive px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              Reset View
            </button>
          )}
          <Link
            href="/clusters"
            className="rounded-lg border border-olive/20 px-4 py-2 text-sm font-medium text-olive hover:bg-cream"
          >
            Back to Clusters
          </Link>
        </div>
      </div>

      {/* Main Graph Panel */}
      <div className="relative rounded-xl border border-olive/10 bg-paper shadow-md overflow-hidden">
        {initialNodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center bg-cream/5">
            <span className="text-4xl text-olive/30 mb-3">🕸️</span>
            <p className="text-sm font-semibold text-olive">No links yet</p>
            <p className="text-xs text-olive/50 mt-1">
              Add internal links in your topic clusters to populate the visual map.
            </p>
          </div>
        ) : (
          <>
            {/* SVG graph viewport */}
            <svg
              ref={svgRef}
              width="100%"
              height="500"
              onClick={handleSvgClick}
              className="cursor-move select-none bg-cream/10"
            >
              {/* Arrow markers for edges */}
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#393e29" opacity="0.6" />
                </marker>
              </defs>

              {/* Dynamic Zoom container wrapper */}
              <g transform={zoomTransform}>
                {/* Edges Lines group */}
                <g>
                  {links.map((link) => {
                    const src = link.source as GraphNode;
                    const tgt = link.target as GraphNode;
                    
                    const srcId = typeof src === "object" ? src.id : src;
                    const tgtId = typeof tgt === "object" ? tgt.id : tgt;

                    const isDimmed = selectedNodeId && (srcId !== selectedNodeId && tgtId !== selectedNodeId);
                    const isHighlighted = selectedNodeId && (srcId === selectedNodeId || tgtId === selectedNodeId);

                    return (
                      <line
                        key={link.id}
                        x1={src.x || 0}
                        y1={src.y || 0}
                        x2={tgt.x || 0}
                        y2={tgt.y || 0}
                        stroke="#393e29"
                        strokeWidth={isHighlighted ? "3.5" : "1.5"}
                        strokeOpacity={isDimmed ? 0.04 : isHighlighted ? 0.85 : 0.25}
                        markerEnd="url(#arrow)"
                        onClick={(e) => {
                          e.stopPropagation();
                          setClickedEdge(link);
                          // position tooltip at center of edge
                          setEdgeTooltipPos({
                            x: e.clientX - 10,
                            y: e.clientY - 20
                          });
                        }}
                        className="cursor-pointer hover:stroke-gold transition-colors duration-150"
                      />
                    );
                  })}
                </g>

                {/* Nodes group */}
                <g>
                  {nodes.map((node) => {
                    const isDimmed = selectedNodeId && !connectedNodeIds.has(node.id);
                    const isSelected = selectedNodeId === node.id;
                    const radius = Math.min(24, 7 + node.inboundCount * 1.5);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x || 0}, ${node.y || 0})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id === selectedNodeId ? null : node.id);
                          setClickedEdge(null);
                        }}
                        onMouseEnter={(e) => {
                          setHoveredNode(node);
                          setTooltipPos({ x: e.clientX + 10, y: e.clientY + 15 });
                        }}
                        onMouseMove={(e) => {
                          setTooltipPos({ x: e.clientX + 10, y: e.clientY + 15 });
                        }}
                        onMouseLeave={() => setHoveredNode(null)}
                        className="cursor-pointer"
                        style={{ transition: "opacity 0.2s" }}
                        opacity={isDimmed ? 0.15 : 1}
                      >
                        {/* Node circle */}
                        <circle
                          r={radius}
                          fill={getNodeColor(node.type)}
                          stroke={isSelected ? "#ba8838" : "#ffffff"}
                          strokeWidth={isSelected ? "3" : "1.5"}
                          className="shadow-sm hover:stroke-gold transition"
                        />
                        {/* Short Node label */}
                        <text
                          dy={radius + 14}
                          textAnchor="middle"
                          fill="#393e29"
                          fontSize="9"
                          fontWeight="600"
                          className="select-none bg-paper/50"
                        >
                          {node.title.length > 15 ? node.title.slice(0, 15) + "..." : node.title}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>

            {/* Hover Node Tooltip */}
            {hoveredNode && (
              <div
                className="fixed z-50 rounded-lg border border-olive/15 bg-paper p-3 text-xs shadow-xl space-y-1 font-sans text-olive max-w-xs pointer-events-none"
                style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
              >
                <div className="font-semibold text-sm">{hoveredNode.title}</div>
                <div className="flex gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-cream text-olive/60 px-1 rounded">
                    {hoveredNode.type}
                  </span>
                  {hoveredNode.clusterName !== "-" && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-gold/15 text-gold px-1 rounded">
                      Cluster: {hoveredNode.clusterName}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-olive/50 font-mono">/{hoveredNode.slug}</div>
                <div className="pt-1.5 border-t border-olive/10 flex justify-between gap-4 font-semibold text-[10px]">
                  <span>Inbound: {hoveredNode.inboundCount}</span>
                  <span>Outbound: {hoveredNode.outboundCount}</span>
                </div>
              </div>
            )}

            {/* Click Edge Tooltip */}
            {clickedEdge && (
              <div
                className="fixed z-50 rounded border border-gold bg-paper px-3 py-2 text-xs shadow-2xl font-sans text-olive max-w-xs"
                style={{ left: `${edgeTooltipPos.x}px`, top: `${edgeTooltipPos.y}px` }}
              >
                <div className="flex justify-between items-center gap-4 mb-1">
                  <span className="text-[10px] uppercase font-bold text-olive/50">Link Anchor Text</span>
                  <button
                    type="button"
                    onClick={() => setClickedEdge(null)}
                    className="text-olive/40 hover:text-olive font-bold text-[10px]"
                  >
                    ✕
                  </button>
                </div>
                <div className="font-mono bg-cream/20 border border-olive/5 rounded p-1 font-bold text-center">
                  &quot;{clickedEdge.anchorText}&quot;
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Summary Table & Orphan Pages grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Summary Table */}
        <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-olive border-b border-olive/10 pb-2">
            Link Summary Directory
          </h2>
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-olive/10 bg-cream/50 text-[10px] font-bold uppercase tracking-wider text-olive/70">
                  <th className="px-3 py-2.5">Title</th>
                  <th className="px-3 py-2.5">Type</th>
                  <th className="px-3 py-2.5">Slug</th>
                  <th className="px-3 py-2.5 text-center">Inbound</th>
                  <th className="px-3 py-2.5 text-center">Outbound</th>
                  <th className="px-3 py-2.5">Cluster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive/5">
                {summaryRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-center text-olive/50 italic">
                      No site pages configured.
                    </td>
                  </tr>
                ) : (
                  summaryRows.map((row) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedNodeId(row.id === selectedNodeId ? null : row.id)}
                      className={`hover:bg-cream/15 cursor-pointer ${
                        selectedNodeId === row.id ? "bg-gold/10 font-medium" : ""
                      }`}
                    >
                      <td className="px-3 py-2 text-olive font-semibold">{row.title}</td>
                      <td className="px-3 py-2">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-olive/50 bg-cream/70 px-1 py-0.5 rounded">
                          {row.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-olive/70 font-mono text-[10px]">/{row.slug}</td>
                      <td className="px-3 py-2 text-center font-bold text-olive/90">{row.inboundCount}</td>
                      <td className="px-3 py-2 text-center text-olive/70">{row.outboundCount}</td>
                      <td className="px-3 py-2 text-olive/60">{row.clusterName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orphans Pages Column */}
        <div className="rounded-lg border border-olive/10 bg-paper p-5 shadow-sm space-y-4 lg:col-span-5">
          <div className="border-b border-olive/10 pb-2">
            <h2 className="font-display text-xl font-semibold text-olive">Orphan Pages ({orphans.length})</h2>
            <p className="text-[10px] text-olive/60 mt-0.5 italic">
              These pages receive no inbound internal links and may be hard for search engines to discover.
            </p>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-olive/5 pr-1">
            {orphans.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center text-green-700 bg-green-50/50 rounded-lg p-4 border border-green-100">
                <span className="text-xl mb-1">🎉</span>
                <span className="text-xs font-bold">No orphan pages found!</span>
                <span className="text-[10px] text-green-600 mt-0.5">
                  Excellent! Every page has at least one inbound link.
                </span>
              </div>
            ) : (
              orphans.map((orphan) => (
                <div key={orphan.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] uppercase font-bold text-olive/50 bg-cream px-1 rounded leading-none py-0.5">
                        {orphan.type}
                      </span>
                      <span className="font-semibold text-olive">{orphan.title}</span>
                    </div>
                    <p className="text-[10px] text-olive/50 font-mono">/{orphan.slug}</p>
                  </div>
                  <span className="text-[10px] text-olive/45 bg-cream/40 px-1 py-0.5 rounded">
                    {orphan.clusterName}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
