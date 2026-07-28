"use client";

import { useState } from "react";

interface AiAssistButtonProps {
  field: string;
  context?: string;
  currentValue?: string;
  onResult: (text: string) => void;
  promptHint?: string;
}

export function AiAssistButton({ field, context, currentValue, onResult, promptHint }: AiAssistButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  async function handleGenerate(prompt: string) {
    setLoading(true);
    setShowPrompt(false);
    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: context || currentValue || "",
          field,
        }),
      });
      const data = await res.json();
      if (data.text) {
        onResult(data.text);
      }
    } catch (err) {
      console.error("AI assist failed:", err);
    } finally {
      setLoading(false);
      setCustomPrompt("");
    }
  }

  const defaultPrompts: Record<string, string> = {
    title: "Generate a compelling title for this travel page/package",
    description: `Improve and expand this description for a luxury India travel listing${currentValue ? `: "${currentValue.slice(0, 200)}"` : ""}`,
    seo_title: `Write an SEO-optimised page title (max 60 chars) for: ${context || currentValue || "this travel page"}`,
    seo_description: `Write an SEO meta description (max 155 chars) for: ${context || currentValue || "this travel page"}`,
    content: "Write engaging travel content for this section",
    itinerary: `Write a vivid one-line description for this itinerary day${currentValue ? ` about: ${currentValue}` : ""}`,
    alt_text: `Write descriptive alt text for this travel image${context ? ` showing: ${context}` : ""}`,
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowPrompt(!showPrompt)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gold border border-gold/30 rounded-md hover:bg-gold/10 hover:border-gold/50 transition-all disabled:opacity-50"
        title="AI Assist"
      >
        {loading ? (
          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round"/></svg>
        ) : (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        )}
        AI
      </button>

      {showPrompt && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-paper border border-olive/15 rounded-lg shadow-xl p-3 w-[280px] space-y-2">
          <button
            type="button"
            onClick={() => handleGenerate(defaultPrompts[field] || defaultPrompts.content)}
            className="w-full text-left px-3 py-2 text-xs text-olive rounded-md hover:bg-cream transition-colors"
          >
            {promptHint || `Auto-generate ${field}`}
          </button>
          <div className="border-t border-olive/10 pt-2">
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Or type a custom instruction..."
              className="w-full text-xs bg-cream border border-olive/10 rounded-md px-3 py-2 focus:outline-none focus:border-gold"
              onKeyDown={(e) => {
                if (e.key === "Enter" && customPrompt.trim()) {
                  handleGenerate(customPrompt);
                }
              }}
            />
            <button
              type="button"
              onClick={() => customPrompt.trim() && handleGenerate(customPrompt)}
              disabled={!customPrompt.trim()}
              className="mt-1.5 w-full text-[10px] font-semibold uppercase tracking-wider text-cream bg-olive hover:bg-gold hover:text-ink py-2 rounded-md transition-all disabled:opacity-40"
            >
              Generate
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowPrompt(false)}
            className="absolute top-2 right-2 text-olive/40 hover:text-olive text-sm"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
