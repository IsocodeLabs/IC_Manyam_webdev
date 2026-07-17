"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

interface ChatMessage {
  id: string;
  sender: "curator" | "user";
  text: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [step, setStep] = useState<"dream" | "name" | "email" | "complete">("dream");
  
  // Input fields
  const [dreamInput, setDreamInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  
  // Chat states
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pathname = usePathname();
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Initialise chat with greetings
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "msg-greet-1",
          sender: "curator",
          text: "Greetings from MANNYAM. I am your digital curator. Together, we can begin shaping your custom journey through the story of India."
        },
        {
          id: "msg-greet-2",
          sender: "curator",
          text: "What kind of journey are you dreaming of? Please tell me about the places, festivals, or experiences that inspire you."
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Auto-focus the appropriate input when step changes or chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (step === "dream") {
          document.getElementById("chat-dream")?.focus();
        } else if (step === "name") {
          document.getElementById("chat-name")?.focus();
        } else if (step === "email") {
          document.getElementById("chat-email")?.focus();
        } else if (step === "complete") {
          document.getElementById("chat-reset")?.focus();
        }
      }, 50);
    }
  }, [step, isOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus trap inside the chat panel
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const panel = chatPanelRef.current;
      if (!panel) return;

      // Find all focusable elements
      const focusableElements = panel.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: loop backward
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab: loop forward
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleFocusTrap);
    return () => window.removeEventListener("keydown", handleFocusTrap);
  }, [isOpen]);

  // Conversational Flow handlers
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (step === "dream") submitDream();
      else if (step === "name") submitName();
      else if (step === "email") submitEmail();
    }
  };

  const submitDream = () => {
    setError("");
    const dream = dreamInput.trim();
    if (!dream) {
      setError("Please share a detail of your dream journey.");
      return;
    }

    // Add User response
    setMessages((prev) => [
      ...prev,
      { id: `user-dream-${Date.now()}`, sender: "user", text: dream }
    ]);
    
    setIsTyping(true);
    setStep("name");

    // Simulate curator typing
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `curator-dream-reply-${Date.now()}`,
          sender: "curator",
          text: "That sounds absolutely wonderful. Our human curators specialise in crafting exactly these kinds of detailed, inspiring experiences."
        },
        {
          id: `curator-ask-name-${Date.now()}`,
          sender: "curator",
          text: "To help us tailor this outline specifically for you, may I ask your full name?"
        }
      ]);
    }, 1200);
  };

  const submitName = () => {
    setError("");
    const name = nameInput.trim();
    if (!name) {
      setError("Please enter your name.");
      return;
    }
    if (name.length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    // Add User name
    setMessages((prev) => [
      ...prev,
      { id: `user-name-${Date.now()}`, sender: "user", text: name }
    ]);

    setIsTyping(true);
    setStep("email");

    // Simulate curator typing
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `curator-name-reply-${Date.now()}`,
          sender: "curator",
          text: `It is a pleasure to meet you, ${name}.`
        },
        {
          id: `curator-ask-email-${Date.now()}`,
          sender: "curator",
          text: "And your email address, so we can send you your bespoke journey outline?"
        }
      ]);
    }, 1200);
  };

  const submitEmail = async () => {
    setError("");
    const email = emailInput.trim();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // Add User email
    setMessages((prev) => [
      ...prev,
      { id: `user-email-${Date.now()}`, sender: "user", text: email }
    ]);

    setIsTyping(true);
    setIsSubmitting(true);

    // Build lead details and message transcript
    const name = nameInput.trim();
    const dream = dreamInput.trim();
    const transcript = `[AI Chat Transcript]\n\nDream Journey: ${dream}\n\nName: ${name}\nEmail: ${email}`;

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "AI Chat",
          source_page: pathname || "/",
          name,
          email,
          message: transcript
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      setStep("complete");
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `curator-complete-1-${Date.now()}`,
          sender: "curator",
          text: `Thank you, ${name}. Your journey details have been safely sent to our curators.`
        },
        {
          id: `curator-complete-2-${Date.now()}`,
          sender: "curator",
          text: "A dedicated curation specialist will review your preferences and reach out within one working day with a bespoke journey outline. No cost, and no obligation."
        }
      ]);
    } catch (err: unknown) {
      setIsTyping(false);
      const errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(errorMsg);
      // Remove email bubble so they can correct it and retry
      setMessages((prev) => prev.filter((m) => m.id !== `user-email-${Date.now()}`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setDreamInput("");
    setNameInput("");
    setEmailInput("");
    setError("");
    setStep("dream");
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        ref={triggerButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold text-ivory rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-[#a07525] hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
        aria-label={isOpen ? "Close curation chat" : "Open curation chat"}
        aria-expanded={isOpen}
        aria-controls="mannyam-chat-panel"
      >
        {isOpen ? (
          // Close Icon
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          // Chat Bubble Icon
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat Panel Dialog */}
      {isOpen && (
        <div
          id="mannyam-chat-panel"
          ref={chatPanelRef}
          role="dialog"
          aria-label="Curation chat with MANNYAM Studio"
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[550px] max-h-[calc(100vh-120px)] bg-paper border border-olive/15 rounded-sm shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans"
        >
          {/* Header */}
          <header className="bg-olive text-ivory p-4 flex items-center justify-between shrink-0">
            <div className="flex flex-col">
              <h3 className="font-display text-lg font-bold uppercase tracking-wider text-ivory">
                Curator Chat
              </h3>
              <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-gold mt-0.5 font-light">
                MANNYAM Studio
              </span>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                triggerButtonRef.current?.focus();
              }}
              className="text-ivory/80 hover:text-ivory p-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-gold"
              aria-label="Close chat panel"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper/50"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto justify-end" : "items-start"
                }`}
              >
                {msg.sender === "curator" && (
                  <div
                    className="w-7 h-7 rounded-full bg-cream border border-olive/10 flex items-center justify-center text-[10px] font-semibold text-olive uppercase font-sans select-none shrink-0"
                    aria-hidden="true"
                  >
                    M
                  </div>
                )}
                <div
                  className={`rounded-sm p-3.5 text-xs font-light leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-gold text-ivory"
                      : "bg-cream/40 border border-olive/10 text-olive"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 max-w-[85%] items-start">
                <div
                  className="w-7 h-7 rounded-full bg-cream border border-olive/10 flex items-center justify-center text-[10px] font-semibold text-olive uppercase font-sans select-none shrink-0"
                  aria-hidden="true"
                >
                  M
                </div>
                <div className="bg-cream/40 border border-olive/10 rounded-sm p-3.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions / Input Area */}
          <div className="border-t border-olive/10 p-4 bg-cream/10 shrink-0">
            {error && (
              <div role="alert" className="text-[11px] font-medium text-red-700 bg-red-50 border border-red-200/50 px-3 py-2 rounded-sm mb-3">
                {error}
              </div>
            )}

            {step === "dream" && (
              <div className="flex flex-col gap-2.5">
                <textarea
                  id="chat-dream"
                  rows={2}
                  value={dreamInput}
                  disabled={isSubmitting}
                  onChange={(e) => setDreamInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Tell us what you are dreaming of..."
                  className="w-full text-xs rounded-sm border border-olive/20 px-3 py-2.5 bg-cream/5 text-olive outline-none focus:border-gold resize-none transition-colors disabled:opacity-50"
                  aria-label="Your dream journey description"
                />
                <button
                  onClick={submitDream}
                  disabled={isSubmitting}
                  className="font-sans text-[10px] font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-[#a07525] py-2.5 rounded-sm transition-colors duration-200 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === "name" && (
              <div className="flex flex-col gap-2.5">
                <input
                  id="chat-name"
                  type="text"
                  value={nameInput}
                  disabled={isSubmitting}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Your name"
                  className="w-full text-xs rounded-sm border border-olive/20 px-3 py-2.5 bg-cream/5 text-olive outline-none focus:border-gold transition-colors disabled:opacity-50"
                  aria-label="Your full name"
                />
                <button
                  onClick={submitName}
                  disabled={isSubmitting}
                  className="font-sans text-[10px] font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-[#a07525] py-2.5 rounded-sm transition-colors duration-200 disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            )}

            {step === "email" && (
              <div className="flex flex-col gap-2.5">
                <input
                  id="chat-email"
                  type="email"
                  value={emailInput}
                  disabled={isSubmitting}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="you@email.com"
                  className="w-full text-xs rounded-sm border border-olive/20 px-3 py-2.5 bg-cream/5 text-olive outline-none focus:border-gold transition-colors disabled:opacity-50"
                  aria-label="Your email address"
                />
                <button
                  onClick={submitEmail}
                  disabled={isSubmitting}
                  className="font-sans text-[10px] font-semibold uppercase tracking-wider text-ivory bg-gold hover:bg-[#a07525] py-2.5 rounded-sm transition-colors duration-200 disabled:opacity-50"
                >
                  {isSubmitting ? "Sending..." : "Send to Curator"}
                </button>
              </div>
            )}

            {step === "complete" && (
              <button
                id="chat-reset"
                onClick={handleResetChat}
                className="w-full font-sans text-[10px] font-semibold uppercase tracking-wider text-olive border border-olive/20 hover:bg-cream py-2.5 rounded-sm transition-colors duration-200"
              >
                Start New Chat
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
