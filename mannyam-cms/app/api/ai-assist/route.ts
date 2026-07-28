import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, field } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const systemPrompt = `You are an AI writing assistant for MANNYAM, a luxury private travel company in India serving foreign clients. 
Your tone is: warm, British English, unhurried, elegant, no em dashes, no pricing or currency symbols.
You write concise, evocative travel copy that makes readers feel the place.
Field context: ${field || "general text"}
${context ? `Additional context: ${context}` : ""}

Respond with ONLY the generated text, no explanations or prefixes.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: systemPrompt + "\n\n" + prompt }] }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
