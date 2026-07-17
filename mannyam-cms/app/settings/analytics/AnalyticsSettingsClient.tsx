"use client";

import React, { useState } from "react";
import Link from "next/link";
import { saveSiteSetting } from "../actions";

interface AnalyticsSettingsClientProps {
  initialGa4Id: string;
  initialGtmId: string;
}

export function AnalyticsSettingsClient({
  initialGa4Id,
  initialGtmId
}: AnalyticsSettingsClientProps) {
  // Input fields state
  const [ga4Id, setGa4Id] = useState(initialGa4Id);
  const [gtmId, setGtmId] = useState(initialGtmId);

  // Errors state
  const [ga4Error, setGa4Error] = useState<string | null>(null);
  const [gtmError, setGtmError] = useState<string | null>(null);

  // Loading & success flags state
  const [isSavingGa4, setIsSavingGa4] = useState(false);
  const [isSavingGtm, setIsSavingGtm] = useState(false);
  const [showGa4Success, setShowGa4Success] = useState(false);
  const [showGtmSuccess, setShowGtmSuccess] = useState(false);
  const [showTestMessage, setShowTestMessage] = useState(false);

  // Copy tooltips state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Snippets generators
  const getGa4Snippet = (id: string) => {
    return `<!-- Google Analytics (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=${id || "G-XXXXXXXXXX"}"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', '${id || "G-XXXXXXXXXX"}');\n</script>`;
  };

  const getGtmHeadSnippet = (id: string) => {
    return `<!-- Google Tag Manager -->\n<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':\nnew Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],\nj=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=\n'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);\n})(window,document,'script','dataLayer','${id || "GTM-XXXXXXX"}');</script>\n<!-- End Google Tag Manager -->`;
  };

  const getGtmBodySnippet = (id: string) => {
    return `<!-- Google Tag Manager (noscript) -->\n<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id || "GTM-XXXXXXX"}"\nheight="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>\n<!-- End Google Tag Manager (noscript) -->`;
  };

  // Clipboard copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Format validation handlers
  const handleSaveGa4 = async () => {
    setGa4Error(null);
    setShowGa4Success(false);

    const val = ga4Id.trim();
    if (val !== "" && !/^G-[A-Z0-9]{10}$/.test(val)) {
      setGa4Error("Invalid GA4 Measurement ID format. Must match G-XXXXXXXXXX (e.g. G-H2Y9B7Q8W4).");
      return;
    }

    setIsSavingGa4(true);
    try {
      await saveSiteSetting("ga4_measurement_id", val);
      setShowGa4Success(true);
      setTimeout(() => setShowGa4Success(false), 3000);
    } catch (err) {
      setGa4Error(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingGa4(false);
    }
  };

  const handleSaveGtm = async () => {
    setGtmError(null);
    setShowGtmSuccess(false);

    const val = gtmId.trim();
    if (val !== "" && !/^GTM-[A-Z0-9]+$/.test(val)) {
      setGtmError("Invalid GTM Container ID format. Must match GTM-XXXXXXX (e.g. GTM-W9F2Q8B).");
      return;
    }

    setIsSavingGtm(true);
    try {
      await saveSiteSetting("gtm_container_id", val);
      setShowGtmSuccess(true);
      setTimeout(() => setShowGtmSuccess(false), 3000);
    } catch (err) {
      setGtmError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSavingGtm(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-olive/10 pb-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-olive">Analytics Integration</h1>
          <p className="mt-1 text-sm text-olive/70">
            Configure Google Analytics 4 and Google Tag Manager properties for your frontend website.
          </p>
        </div>
        <div>
          <Link
            href="/settings"
            className="rounded-lg border border-olive/20 px-4 py-2 text-sm font-medium text-olive hover:bg-cream"
          >
            Back to Settings
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* GA4 Panel */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-olive/5 pb-2">
            <h2 className="font-display text-lg font-semibold text-olive">Google Analytics 4</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-gold/15 text-gold px-2 py-0.5 rounded">
              GA4
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="ga4-input" className="block text-xs font-semibold text-olive">
                Measurement ID
              </label>
              <input
                id="ga4-input"
                type="text"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className={`w-full rounded-md border bg-cream/10 px-3 py-2 text-sm text-olive outline-none transition-all placeholder:text-olive/30 ${
                  ga4Error ? "border-red-400 focus:border-red-500" : "border-olive/15 focus:border-gold"
                }`}
              />
              <p className="text-[10px] text-olive/50 leading-relaxed">
                Find this in GA4 &gt; Admin &gt; Data Streams &gt; your stream &gt; Measurement ID.
              </p>
            </div>

            {ga4Error && (
              <div className="rounded bg-red-50 border border-red-100 p-2 text-[10px] font-medium text-red-800">
                {ga4Error}
              </div>
            )}

            {showGa4Success && (
              <div className="rounded bg-green-50 border border-green-100 p-2 text-[10px] font-semibold text-green-800">
                ✓ GA4 Measurement ID saved successfully!
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                disabled={isSavingGa4}
                onClick={handleSaveGa4}
                className="rounded-lg bg-olive text-paper hover:bg-olive/90 disabled:opacity-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition"
              >
                {isSavingGa4 ? "Saving..." : "Save GA4 Settings"}
              </button>
              <button
                type="button"
                onClick={() => setShowTestMessage(true)}
                className="rounded-lg border border-gold text-gold hover:bg-gold hover:text-olive px-4 py-2 text-xs font-semibold uppercase tracking-wider transition"
              >
                Test Connection
              </button>
            </div>

            {showTestMessage && (
              <div className="rounded-lg border border-gold bg-cream/25 p-3 text-[10px] text-olive leading-relaxed space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold">GA4 Connection Test Checklist:</span>
                  <button
                    type="button"
                    onClick={() => setShowTestMessage(false)}
                    className="text-olive/50 hover:text-olive font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <p>
                  Open your public website (e.g. <strong>mannyam.in</strong>) and check GA4 Realtime / DebugView to confirm events are being received.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* GTM Panel */}
        <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-olive/5 pb-2">
            <h2 className="font-display text-lg font-semibold text-olive">Google Tag Manager</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-olive/15 text-olive px-2 py-0.5 rounded">
              GTM
            </span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="gtm-input" className="block text-xs font-semibold text-olive">
                Container ID
              </label>
              <input
                id="gtm-input"
                type="text"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className={`w-full rounded-md border bg-cream/10 px-3 py-2 text-sm text-olive outline-none transition-all placeholder:text-olive/30 ${
                  gtmError ? "border-red-400 focus:border-red-500" : "border-olive/15 focus:border-gold"
                }`}
              />
              <p className="text-[10px] text-olive/50 leading-relaxed">
                Find this in GTM &gt; Admin &gt; Container Settings &gt; Container ID.
              </p>
            </div>

            {gtmError && (
              <div className="rounded bg-red-50 border border-red-100 p-2 text-[10px] font-medium text-red-800">
                {gtmError}
              </div>
            )}

            {showGtmSuccess && (
              <div className="rounded bg-green-50 border border-green-100 p-2 text-[10px] font-semibold text-green-800">
                ✓ GTM Container ID saved successfully!
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                disabled={isSavingGtm}
                onClick={handleSaveGtm}
                className="rounded-lg bg-olive text-paper hover:bg-olive/90 disabled:opacity-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition"
              >
                {isSavingGtm ? "Saving..." : "Save GTM Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Snippet Preview Panel */}
      <div className="rounded-xl border border-olive/10 bg-paper p-5 shadow-sm space-y-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-olive">Frontend Code Snippets</h2>
          <p className="text-[10px] text-olive/60 mt-0.5">
            Copy these tracking tags and insert them into your public website layouts. These do not run inside the CMS.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* GA4 Snippet */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-bold text-olive">GA4 Global Site Tag (gtag.js)</span>
              <button
                type="button"
                onClick={() => handleCopy(getGa4Snippet(ga4Id), "ga4")}
                className="rounded border border-gold text-[10px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-olive px-2.5 py-1 transition"
              >
                {copiedKey === "ga4" ? "✓ Copied!" : "Copy Tag"}
              </button>
            </div>
            <pre className="text-[10px] font-mono bg-cream/15 border border-olive/5 rounded-lg p-3 text-olive/80 overflow-x-auto max-h-48 leading-relaxed select-all">
              {getGa4Snippet(ga4Id)}
            </pre>
          </div>

          {/* GTM Head Snippet */}
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-bold text-olive">GTM head Script</span>
              <button
                type="button"
                onClick={() => handleCopy(getGtmHeadSnippet(gtmId), "gtm-head")}
                className="rounded border border-gold text-[10px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-olive px-2.5 py-1 transition"
              >
                {copiedKey === "gtm-head" ? "✓ Copied!" : "Copy Tag"}
              </button>
            </div>
            <pre className="text-[10px] font-mono bg-cream/15 border border-olive/5 rounded-lg p-3 text-olive/80 overflow-x-auto max-h-48 leading-relaxed select-all">
              {getGtmHeadSnippet(gtmId)}
            </pre>
          </div>

          {/* GTM Body Snippet */}
          <div className="space-y-2 lg:col-span-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-bold text-olive">GTM body Noscript Tag</span>
              <button
                type="button"
                onClick={() => handleCopy(getGtmBodySnippet(gtmId), "gtm-body")}
                className="rounded border border-gold text-[10px] font-semibold uppercase tracking-wider text-gold hover:bg-gold hover:text-olive px-2.5 py-1 transition"
              >
                {copiedKey === "gtm-body" ? "✓ Copied!" : "Copy Tag"}
              </button>
            </div>
            <pre className="text-[10px] font-mono bg-cream/15 border border-olive/5 rounded-lg p-3 text-olive/80 overflow-x-auto max-h-24 leading-relaxed select-all">
              {getGtmBodySnippet(gtmId)}
            </pre>
          </div>
        </div>

        <div className="rounded bg-cream/30 border border-gold/15 p-3 text-[10px] text-olive/75 leading-relaxed italic">
          💡 <strong>Deployment Note:</strong> These codes are made available to the public endpoint <code>/api/site-config</code>. Your production web portal can dynamically query the configuration and execute it to save on hardcoded values.
        </div>
      </div>
    </div>
  );
}
