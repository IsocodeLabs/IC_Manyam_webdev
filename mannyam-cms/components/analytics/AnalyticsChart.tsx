"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DailyData {
  date: string;
  clicks: number;
  impressions: number;
}

export function AnalyticsChart({ data, height = 280 }: { data: DailyData[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current.clientWidth || 700;
    const margin = { top: 20, right: 20, bottom: 44, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y-%m-%d");
    const parsed = data.map((d) => ({
      date: parseDate(d.date) || new Date(d.date),
      clicks: d.clicks,
      impressions: d.impressions,
    }));

    // X scale spans the full date range
    const x = d3.scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const maxVal = d3.max(parsed, (d) => Math.max(d.clicks, d.impressions)) || 10;
    const y = d3.scaleLinear().domain([0, maxVal * 1.15]).nice().range([innerHeight, 0]);

    // Determine tick count based on data length for readable labels
    const tickCount = data.length <= 7 ? data.length : data.length <= 14 ? 7 : data.length <= 30 ? 8 : 10;

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
      .call((sel) => sel.selectAll("line").attr("stroke", "rgba(57,62,41,0.06)"))
      .call((sel) => sel.select(".domain").remove());

    // X axis with dynamic ticks
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x)
          .ticks(tickCount)
          .tickFormat((d) => {
            const date = d as Date;
            // Show month name for 90d, day+month for shorter ranges
            return data.length > 30
              ? d3.timeFormat("%d %b")(date)
              : d3.timeFormat("%d %b")(date);
          })
      )
      .call((sel) => sel.select(".domain").attr("stroke", "rgba(57,62,41,0.12)"))
      .call((sel) => sel.selectAll("text").attr("fill", "rgba(57,62,41,0.55)").attr("font-size", "10px").attr("font-family", "var(--font-jost), system-ui, sans-serif"))
      .call((sel) => sel.selectAll("line").attr("stroke", "rgba(57,62,41,0.08)"));

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => {
        const num = d as number;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
        return String(num);
      }))
      .call((sel) => sel.select(".domain").remove())
      .call((sel) => sel.selectAll("text").attr("fill", "rgba(57,62,41,0.55)").attr("font-size", "10px").attr("font-family", "var(--font-jost), system-ui, sans-serif"))
      .call((sel) => sel.selectAll("line").remove());

    // Impressions area + line (sand/gold colour)
    const impressionsArea = d3.area<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.impressions))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "rgba(186,136,56,0.08)")
      .attr("d", impressionsArea);

    const impressionsLine = d3.line<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.impressions))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "rgba(186,136,56,0.6)")
      .attr("stroke-width", 1.5)
      .attr("d", impressionsLine);

    // Clicks area + line (olive/ink colour)
    const clicksArea = d3.area<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "rgba(57,62,41,0.06)")
      .attr("d", clicksArea);

    const clicksLine = d3.line<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "#2c3120")
      .attr("stroke-width", 2)
      .attr("d", clicksLine);

    // Data point dots (hide when too many points to avoid clutter)
    if (data.length <= 30) {
      g.selectAll(".dot-click")
        .data(parsed)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.date))
        .attr("cy", (d) => y(d.clicks))
        .attr("r", data.length <= 14 ? 3.5 : 2.5)
        .attr("fill", "#2c3120")
        .attr("stroke", "#fffdf9")
        .attr("stroke-width", 1.5);

      g.selectAll(".dot-impr")
        .data(parsed)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.date))
        .attr("cy", (d) => y(d.impressions))
        .attr("r", data.length <= 14 ? 3 : 2)
        .attr("fill", "rgba(186,136,56,0.7)")
        .attr("stroke", "#fffdf9")
        .attr("stroke-width", 1);
    }

    // Resize handler
    const handleResize = () => {
      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        svg.attr("width", newWidth);
        // Re-render on resize
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-[#8b8d76] text-[13px]">
        No data available for this period.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <svg ref={svgRef} className="w-full" />
      <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-[#6f7261]">
        <span className="flex items-center gap-2">
          <span className="w-4 h-[2px] bg-[#2c3120] rounded-full inline-block" />
          Clicks
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-[2px] bg-[rgba(186,136,56,0.6)] rounded-full inline-block" />
          Impressions
        </span>
      </div>
    </div>
  );
}
