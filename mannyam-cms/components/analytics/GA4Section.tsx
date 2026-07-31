"use client";

import type { GA4Data } from "@/lib/analytics/ga4";

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

interface GA4SectionProps {
  ga4Data: GA4Data | null;
  ga4Error: string | null;
  isGA4Configured: boolean;
  range: string;
  gtmContainerId?: string;
}

export function GA4Section({ ga4Data, ga4Error, isGA4Configured, range, gtmContainerId }: GA4SectionProps) {
  // GTM direct link button (always show)
  const gtmButton = (
    <a
      href="https://tagmanager.google.com"
      target="_blank"
      rel="noopener noreferrer"
      className="btn flex items-center gap-[7px] text-[12px]"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M14 5h5v5M19 5l-8 8M12 5H6v13h13v-6" />
      </svg>
      Open Google Tag Manager
    </a>
  );

  const ga4Button = (
    <a
      href="https://analytics.google.com"
      target="_blank"
      rel="noopener noreferrer"
      className="btn flex items-center gap-[7px] text-[12px]"
    >
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M14 5h5v5M19 5l-8 8M12 5H6v13h13v-6" />
      </svg>
      Open Google Analytics
    </a>
  );

  if (!isGA4Configured) {
    return (
      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold text-ink">Google Analytics 4</h2>
          <div className="flex gap-[9px]">{ga4Button}{gtmButton}</div>
        </div>
        <div className="rounded-[14px] border border-dashed border-line-gold bg-cream/40 p-8 text-center">
          <h3 className="font-display text-[16px] font-semibold text-ink">
            GA4 data not available
          </h3>
          <p className="text-[12.5px] text-[#6f7261] mt-2 max-w-md mx-auto">
            {ga4Error || "Add GA4_PROPERTY_ID to your .env.local file and rebuild to see sessions, users, and traffic data here."}
          </p>
          <p className="text-[11px] text-[#8b8d76] mt-3 font-mono">
            GA4_PROPERTY_ID=123456789
          </p>
        </div>
      </div>
    );
  }

  if (ga4Error) {
    return (
      <div className="mt-8 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[22px] font-semibold text-ink">Google Analytics 4</h2>
          <div className="flex gap-[9px]">{ga4Button}{gtmButton}</div>
        </div>
        <div className="rounded-[14px] border border-bad/30 bg-[rgba(180,85,47,0.06)] p-6">
          <h3 className="font-display text-[16px] font-semibold text-bad">
            GA4 connection error
          </h3>
          <p className="text-[12.5px] text-bad/80 mt-1">{ga4Error}</p>
          <p className="text-[11px] text-[#6f7261] mt-2">
            Ensure the service account email has Viewer access to your GA4 property, and that GA4_PROPERTY_ID is the correct numeric property ID.
          </p>
        </div>
      </div>
    );
  }

  if (!ga4Data) return null;

  const { overview, topPages, trafficSources, daily } = ga4Data;
  const maxPageViews = Math.max(...topPages.map((p) => p.pageViews), 1);
  const maxSourceSessions = Math.max(...trafficSources.map((s) => s.sessions), 1);

  return (
    <div className="mt-8 space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-[22px] font-semibold text-ink">
            Google Analytics 4
          </h2>
          <p className="text-[12.5px] text-[#6f7261] mt-0.5">
            Site traffic, sessions, and visitor behaviour from GA4.
          </p>
        </div>
        <div className="flex items-center gap-[9px]">
          <span className="pill pill-published">
            <span className="dot" /> Connected
          </span>
          {ga4Button}
          {gtmButton}
        </div>
      </div>

      {/* GA4 KPI tiles */}
      <div className="grid gap-[14px] grid-cols-2 lg:grid-cols-5">
        <div className="kpi-card">
          <div className="text-[11px] tracking-[0.04em] text-[#6f7261]">Sessions</div>
          <p className="font-display font-semibold text-[30px] mt-[4px] leading-none text-ink">
            {formatNumber(overview.sessions)}
          </p>
        </div>
        <div className="kpi-card">
          <div className="text-[11px] tracking-[0.04em] text-[#6f7261]">Users</div>
          <p className="font-display font-semibold text-[30px] mt-[4px] leading-none text-ink">
            {formatNumber(overview.totalUsers)}
          </p>
        </div>
        <div className="kpi-card">
          <div className="text-[11px] tracking-[0.04em] text-[#6f7261]">Page views</div>
          <p className="font-display font-semibold text-[30px] mt-[4px] leading-none text-ink">
            {formatNumber(overview.pageViews)}
          </p>
        </div>
        <div className="kpi-card">
          <div className="text-[11px] tracking-[0.04em] text-[#6f7261]">Avg session</div>
          <p className="font-display font-semibold text-[30px] mt-[4px] leading-none text-ink">
            {formatDuration(overview.avgSessionDuration)}
          </p>
        </div>
        <div className="kpi-card">
          <div className="text-[11px] tracking-[0.04em] text-[#6f7261]">Bounce rate</div>
          <p className="font-display font-semibold text-[30px] mt-[4px] leading-none text-ink">
            {(overview.bounceRate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Two-column: Top pages + Traffic sources */}
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Top pages by page views */}
        <div className="panel">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="font-display text-[18px] font-semibold text-ink">
              Top pages by views
            </h3>
            <span className="text-[11px] text-[#8b8d76]">{range === "7d" ? "Last 7 days" : range === "28d" ? "Last 28 days" : "Last 90 days"}</span>
          </div>
          {topPages.length === 0 ? (
            <p className="text-[13px] text-[#8b8d76] py-6 text-center">No page view data yet.</p>
          ) : (
            <div className="space-y-[9px]">
              {topPages.slice(0, 10).map((page, idx) => (
                <div key={idx} className="flex items-center gap-[9px] text-[12.5px]">
                  <span className="font-mono text-info truncate flex-1 min-w-0">{page.path}</span>
                  <div className="w-[100px] h-[6px] rounded-[6px] bg-cream overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-[6px] bg-gold"
                      style={{ width: `${(page.pageViews / maxPageViews) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#6f7261] w-[40px] text-right flex-shrink-0">
                    {formatNumber(page.pageViews)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Traffic sources */}
        <div className="panel">
          <div className="flex items-center justify-between mb-[14px]">
            <h3 className="font-display text-[18px] font-semibold text-ink">
              Traffic sources
            </h3>
          </div>
          {trafficSources.length === 0 ? (
            <p className="text-[13px] text-[#8b8d76] py-6 text-center">No traffic source data yet.</p>
          ) : (
            <div className="space-y-[9px]">
              {trafficSources.slice(0, 8).map((src, idx) => (
                <div key={idx} className="flex items-center gap-[9px] text-[12.5px]">
                  <span className="text-ink font-medium truncate flex-1 min-w-0">
                    {src.source}{src.medium !== "(none)" ? ` / ${src.medium}` : ""}
                  </span>
                  <div className="w-[80px] h-[6px] rounded-[6px] bg-cream overflow-hidden flex-shrink-0">
                    <div
                      className="h-full rounded-[6px] bg-olive"
                      style={{ width: `${(src.sessions / maxSourceSessions) * 100}%` }}
                    />
                  </div>
                  <span className="text-[#6f7261] w-[40px] text-right flex-shrink-0">
                    {formatNumber(src.sessions)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
