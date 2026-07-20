"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

interface ChatMessage {
  id: string;
  sender: "curator" | "user";
  text?: string;
  isGreeting?: boolean;
  suggestion?: {
    route: string;
    title: string;
    cta: string;
  };
}

const ROUTE_MAP = [
  { pattern: /holi|colour/i, route: "/festival-holi", title: "Colours of Holi", cta: "Explore Holi journeys", desc: "Experience the vibrant colours and joy of Holi, the festival of spring." },
  { pattern: /diwali|lights|deepawali/i, route: "/festival-diwali", title: "Lights of Diwali", cta: "Explore Diwali journeys", desc: "Witness the magical illumination of India during the festival of lights." },
  { pattern: /dussehra|dasara|mysuru/i, route: "/festival-dussehra", title: "Royal Dussehra", cta: "Explore Dussehra journeys", desc: "Discover the royal grandeur of Dussehra celebrations." },
  { pattern: /honeymoon|romance|romantic/i, route: "/experience-honeymoon", title: "Honeymoon and Romance", cta: "Explore honeymoons", desc: "Craft your perfect romantic getaway with our tailored honeymoon experiences." },
  { pattern: /wildlife|tiger|safari|jungle/i, route: "/experience-wildlife", title: "Nature and Wildlife", cta: "Explore wildlife", desc: "Encounter majestic tigers and India's incredible biodiversity on a guided safari." },
  { pattern: /food|culinary|cook|eat/i, route: "/experience-food", title: "Food and Culinary Stories", cta: "Explore food journeys", desc: "Taste your way through India's rich and diverse culinary heritage." },
  { pattern: /spiritual|yoga|temple|ghat/i, route: "/experience-spiritual", title: "Spiritual and Soulful", cta: "Explore spiritual journeys", desc: "Find peace and inner reflection in the spiritual heartland of India." },
  { pattern: /heritage|fort|palace|royal/i, route: "/experience-heritage", title: "Culture and Heritage", cta: "Explore heritage", desc: "Step back in time through magnificent forts, palaces, and ancient ruins." },
  { pattern: /rajasthan|jaipur|udaipur|jodhpur/i, route: "/destination-rajasthan", title: "Rajasthan", cta: "Explore Rajasthan", desc: "Immerse yourself in the royal legacy and vibrant culture of Rajasthan." },
  { pattern: /kerala|backwater|munnar/i, route: "/destination-kerala", title: "Kerala", cta: "Explore Kerala", desc: "Relax in 'God's Own Country', known for its serene backwaters and lush greenery." },
  { pattern: /himalaya|ladakh|spiti|leh/i, route: "/destination-himalayas", title: "The Himalayas", cta: "Explore the Himalayas", desc: "Ascend to breathtaking heights and discover the serene beauty of the Himalayas." },
  { pattern: /varanasi|ganges|benares/i, route: "/destination-varanasi", title: "Varanasi", cta: "Explore Varanasi", desc: "Experience the profound spirituality and timeless rituals of Varanasi." },
  { pattern: /first time|beginner|never been/i, route: "/experiences", title: "Start with Experiences", cta: "Browse experiences", desc: "Perfect introductions to India's incredible diversity for first-time visitors." },
  { pattern: /off the beaten|unusual|secret/i, route: "/destination-north-east", title: "The North-East", cta: "Explore the North-East", desc: "Discover hidden gems and pristine landscapes far from the crowds." }
];

const DEFAULT_ROUTE = { 
  route: "/experiences", 
  title: "Let us shape it together", 
  cta: "Browse experiences", 
  desc: "We can craft a bespoke journey perfectly suited to your unique desires." 
};

function routeFor(input: string) {
  for (const mapping of ROUTE_MAP) {
    if (mapping.pattern.test(input)) {
      return mapping;
    }
  }
  return DEFAULT_ROUTE;
}

const GREETING_CHIPS = [
  "Holi near Mathura",
  "A honeymoon in Kerala",
  "Tigers and wildlife",
  "Diwali in Varanasi",
  "First time in India",
  "Off the beaten track"
];

const RELATED_CHIPS = [
  { label: "Festivals", href: "/festivals" },
  { label: "Experiences", href: "/experiences" },
  { label: "Destinations", href: "/destinations" },
  { label: "Talk to a curator", href: "/enquire" }
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatPanelRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "msg-greet-1",
          sender: "curator",
          text: "Namaste, I am Mannyam, your concierge. Tell me what you are dreaming of and I will point you to the right corner of India. What draws you most?",
          isGreeting: true
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Close on Escape
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

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    
    // Add user message
    setMessages(prev => [...prev, {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim()
    }]);
    
    setInputValue("");
    setIsTyping(true);

    const match = routeFor(text);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `curator-${Date.now()}`,
        sender: "curator",
        text: match.desc,
        suggestion: {
          route: match.route,
          title: match.title,
          cta: match.cta
        }
      }]);
    }, 800);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend(inputValue);
    }
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
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <Image src="/logo-icon.png" alt="Ask MANNYAM" width={28} height={28} className="rounded-full" />
        )}
      </button>

      {/* Chat Panel Dialog */}
      {isOpen && (
        <div
          id="mannyam-chat-panel"
          ref={chatPanelRef}
          role="dialog"
          aria-label="Curation chat with MANNYAM Studio"
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[550px] max-h-[calc(100vh-120px)] bg-white border border-olive/15 rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans"
        >
          {/* Header */}
          <header className="bg-olive p-4 flex items-center justify-between shrink-0 rounded-t-[20px]">
            <div className="flex items-center gap-3">
              <div className="w-[33px] h-[33px] rounded-full bg-gold flex items-center justify-center text-ivory font-display text-lg">
                <Image src="/logo-icon.png" alt="MANNYAM" width={33} height={33} className="rounded-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-display text-[17px] text-ivory leading-tight">
                  Ask MANNYAM
                </h3>
                <span className="font-sans text-[9.5px] uppercase tracking-[0.2em] text-gold mt-0.5">
                  YOUR JOURNEY CONCIERGE
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                triggerButtonRef.current?.focus();
              }}
              className="text-ivory hover:opacity-80 p-1.5 transition-opacity focus:outline-none"
              aria-label="Close chat panel"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f4f3ec]"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-3">
                {msg.sender === "curator" ? (
                  <div className="flex flex-col gap-2 max-w-[92%]">
                    <div className="bg-[#f4f3ec] border border-olive/10 text-olive/80 text-[13.5px] leading-[1.55] p-3.5 rounded-[14px_14px_14px_4px]">
                      {msg.text}
                    </div>
                    
                    {msg.isGreeting && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {GREETING_CHIPS.map((chip, i) => (
                          <button
                            key={chip}
                            onClick={() => handleSend(chip)}
                            className="bg-[#f4f3ec] border border-olive/10 hover:border-gold text-[#1a1a1a] text-[11.5px] px-3 py-1.5 rounded-full transition-colors text-left"
                            style={{ animation: \`fadeIn 0.3s ease forwards \${i * 0.05}s\`, opacity: 0 }}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {msg.suggestion && (
                      <div className="mt-1 bg-white border border-olive/15 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-olive/60 font-semibold mb-1">
                            A GOOD STARTING POINT
                          </p>
                          <h4 className="font-display font-bold text-lg text-olive">
                            {msg.suggestion.title}
                          </h4>
                        </div>
                        <Link 
                          href={msg.suggestion.route}
                          className="bg-gold hover:bg-[#a07525] text-ivory text-xs font-semibold py-2.5 px-4 rounded-sm transition-colors text-center uppercase tracking-wider block w-full"
                        >
                          {msg.suggestion.cta} &rarr;
                        </Link>
                        
                        <div className="flex flex-wrap gap-2 mt-1">
                          {RELATED_CHIPS.map((chip, i) => (
                            <Link
                              key={chip.label}
                              href={chip.href}
                              target={chip.href === "/enquire" ? "_blank" : undefined}
                              className="bg-[#f4f3ec] border border-olive/10 hover:border-gold text-[#1a1a1a] text-[11.5px] px-3 py-1.5 rounded-full transition-colors text-center inline-block"
                            >
                              {chip.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#3a4430] text-ivory text-[13.5px] p-3.5 rounded-[14px_14px_4px_14px] max-w-[86%] self-end">
                    {msg.text}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 max-w-[92%] items-start">
                <div className="bg-[#f4f3ec] border border-olive/10 rounded-[14px_14px_14px_4px] p-3.5 flex items-center gap-1.5 h-[45px]">
                  <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-olive/40 rounded-full animate-bounce"></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t border-olive/10 shrink-0">
            <div className="flex items-center gap-2 border border-olive/20 rounded-[24px] p-1 pl-4 bg-[#f9f9f7] focus-within:border-gold transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                disabled={isTyping}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Try: Holi in Mathura, or a honeymoon in Kerala"
                className="flex-1 bg-transparent text-[13px] text-olive outline-none placeholder:text-olive/40"
              />
              <button
                onClick={() => handleSend(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="w-8 h-8 rounded-full bg-gold hover:bg-[#a07525] text-ivory flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: \`
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(4px); }
              to { opacity: 1; transform: translateY(0); }
            }
          \`}} />
        </div>
      )}
    </>
  );
}
