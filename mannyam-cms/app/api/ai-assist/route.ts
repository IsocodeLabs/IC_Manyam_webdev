import { NextRequest, NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

const GCP_PROJECT_ID = "mannyam";
const VERTEX_LOCATION = "us-central1";
const VERTEX_MODEL = "gemini-2.5-flash";

/**
 * Gets an access token from the GCP service account using JWT assertion.
 * This uses Vertex AI which bills against your GCP free credits, not Google AI Studio.
 */
async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKeyRaw) {
    throw new Error("GCP service account not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.");
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
  const key = await importPKCS8(privateKey, "RS256");

  const now = Math.floor(Date.now() / 1000);
  const jwt = await new SignJWT({
    iss: email,
    sub: email,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/cloud-platform",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .sign(key);

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`GCP token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, field } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Please type what you want the AI to write." }, { status: 400 });
    }

    const systemInstruction = `You are a writing assistant for MANNYAM, a luxury private travel company in India.
Rules:
- Write in warm, British English
- No em dashes
- No pricing or currency symbols
- Be concise and evocative
- Make readers feel the place
- Field you are writing for: ${field || "general content"}
${context ? `Context: ${context}` : ""}

Output ONLY the generated text. No explanations, no prefixes, no markdown formatting.`;

    let text = "";

    try {
      const accessToken = await getAccessToken();

      const vertexUrl = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;

      const response = await fetch(vertexUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemInstruction + "\n\nUser request: " + prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Vertex AI error:", response.status, errText);
        return NextResponse.json({ text: `[Vertex AI Error ${response.status}] ${errText.slice(0, 200)}` });
      }

      const data = await response.json();
      text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (vertexError) {
      console.error("Vertex AI unavailable:", vertexError);
      return NextResponse.json({ text: `[Error] ${vertexError instanceof Error ? vertexError.message : "Unknown error connecting to Vertex AI"}` });
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI generation failed." },
      { status: 500 }
    );
  }
}

function generateFallback(prompt: string, field: string, context: string): string {
  const ctx = context || "India";
  if (field === "description" || field === "content") {
    return `A thoughtfully designed journey through ${ctx}. Every detail planned with care, every moment yours to savour. The pace is unhurried, the stays are handpicked, and the experiences are genuine.`;
  }
  if (field === "seo_title") {
    return `${ctx} | Private Journeys | MANNYAM`;
  }
  if (field === "seo_description") {
    return `Discover ${ctx} with MANNYAM. Private, unhurried journeys designed around you and planned end to end.`;
  }
  return `[Configure Vertex AI to generate custom content] Your request: "${prompt}"`;
}
