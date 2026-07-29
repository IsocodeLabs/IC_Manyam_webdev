"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface DailyData {
  date: string;
  clicks: number;
  impressions: number;
}

export function AnalyticsChart({ data, height = 260 }: { data: DailyData[]; height?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = svgRef.current.parentElement;
    const width = container?.clientWidth || 700;
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
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

    const x = d3.scaleTime()
      .domain(d3.extent(parsed, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const maxVal = d3.max(parsed, (d) => Math.max(d.clicks, d.impressions)) || 100;
    const y = d3.scaleLinear().domain([0, maxVal * 1.1]).range([innerHeight, 0]);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-innerWidth).tickFormat(() => ""))
      .call((g) => g.selectAll("line").attr("stroke", "rgba(57,62,41,0.06)"))
      .call((g) => g.select(".domain").remove());

    // X axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(Math.min(data.length, 7)).tickFormat((d) => d3.timeFormat("%d %b")(d as Date)))
      .call((g) => g.select(".domain").attr("stroke", "rgba(57,62,41,0.15)"))
      .call((g) => g.selectAll("text").attr("fill", "rgba(57,62,41,0.5)").attr("font-size", "10px"))
      .call((g) => g.selectAll("line").attr("stroke", "rgba(57,62,41,0.1)"));

    // Y axis
    g.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d3.format(".2s")(d as number)))
      .call((g) => g.select(".domain").remove())
      .call((g) => g.selectAll("text").attr("fill", "rgba(57,62,41,0.5)").attr("font-size", "10px"))
      .call((g) => g.selectAll("line").remove());

    // Impressions area + line (gold)
    const impressionsArea = d3.area<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.impressions))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "rgba(177,131,47,0.08)")
      .attr("d", impressionsArea);

    const impressionsLine = d3.line<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.impressions))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "rgba(177,131,47,0.6)")
      .attr("stroke-width", 1.5)
      .attr("d", impressionsLine);

    // Clicks area + line (olive)
    const clicksArea = d3.area<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "rgba(58,68,48,0.08)")
      .attr("d", clicksArea);

    const clicksLine = d3.line<typeof parsed[0]>()
      .x((d) => x(d.date))
      .y((d) => y(d.clicks))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(parsed)
      .attr("fill", "none")
      .attr("stroke", "#3a4430")
      .attr("stroke-width", 2)
      .attr("d", clicksLine);

    // Dots for clicks
    g.selectAll(".dot-click")
      .data(parsed)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.date))
      .attr("cy", (d) => y(d.clicks))
      .attr("r", 3)
      .attr("fill", "#3a4430")
      .attr("opacity", parsed.length > 30 ? 0 : 0.7);

  }, [data, height]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-olive/40 text-sm italic">
        No data available for this period
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <svg ref={svgRef} className="w-full" />
      <div className="flex items-center justify-center gap-6 mt-3 text-xs text-olive/60">
        <span className="flex items-center gap-2">
          <span className="w-3 h-[2px] bg-[#3a4430] rounded-full inline-block" />
          Clicks
        </span>
        <span className="flex items-center gap-2">
          <span className="w-3 h-[2px] bg-[rgba(177,131,47,0.6)] rounded-full inline-block" />
          Impressions
        </span>
      </div>
    </div>
  );
}
