"use client";

import { useState, useRef, useEffect } from "react";

interface AiAssistButtonProps {
  field: string;
  context?: string;
  onResult: (text: string) => void;
  size?: "sm" | "md";
}

export function AiAssistButton({ field, context, onResult, size = "md" }: AiAssistButtonProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim(), context: context || "", field }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else if (data.text) {
        onResult(data.text);
        setPrompt("");
        setOpen(false);
      }
    } catch {
      setError("Failed to connect to AI service.");
    } finally {
      setLoading(false);
    }
  }

  const btnClass = size === "sm"
    ? "inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-gold border border-gold/25 rounded hover:bg-gold/10 hover:border-gold/40 transition-all"
    : "inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/30 rounded-full hover:bg-gold/10 hover:border-gold/50 transition-all";

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={btnClass} title="Generate with AI">
        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        AI
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-1.5 bg-cream/60 border border-gold/20 rounded-lg w-full">
      <input
        ref={inputRef}
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); if (e.key === "Escape") setOpen(false); }}
        placeholder="What should AI write here?"
        className="flex-1 bg-transparent text-xs text-olive outline-none placeholder:text-olive/40 px-2 py-1 min-w-0"
        disabled={loading}
      />
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="px-2.5 py-1 bg-gold text-ink text-[9px] font-bold uppercase tracking-wider rounded hover:bg-gold/90 transition-all disabled:opacity-40 whitespace-nowrap"
      >
        {loading ? "..." : "Go"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(""); setPrompt(""); }}
        className="text-olive/40 hover:text-olive text-sm leading-none px-0.5"
      >
        &times;
      </button>
      {error && <span className="text-[9px] text-red-600">{error}</span>}
    </div>
  );
}
