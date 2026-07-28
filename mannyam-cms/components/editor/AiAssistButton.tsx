"use client";

import { useState, useRef, useEffect } from "react";

interface AiAssistButtonProps {
  field: string;
  context?: string;
  onResult: (text: string) => void;
}

export function AiAssistButton({ field, context, onResult }: AiAssistButtonProps) {
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

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gold border border-gold/30 rounded-full hover:bg-gold/10 hover:border-gold/50 transition-all"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        Generate with AI
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-cream/50 border border-gold/20 rounded-lg w-full max-w-xl">
      <input
        ref={inputRef}
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
        placeholder="Tell AI what to write, e.g. 'Write a description for a Kerala backwater journey'"
        className="flex-1 bg-transparent text-sm text-olive outline-none placeholder:text-olive/40 px-2 py-1.5"
        disabled={loading}
      />
      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="px-3 py-1.5 bg-gold text-ink text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-gold/90 transition-all disabled:opacity-40 whitespace-nowrap"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
      <button
        type="button"
        onClick={() => { setOpen(false); setError(""); }}
        className="text-olive/40 hover:text-olive text-lg leading-none px-1"
      >
        &times;
      </button>
      {error && <span className="text-[10px] text-red-600 absolute -bottom-5 left-2">{error}</span>}
    </div>
  );
}
