import { NextRequest, NextResponse } from "next/server";
import { SignJWT, importPKCS8 } from "jose";

const GCP_PROJECT_ID = "mannyam";
const VERTEX_LOCATION = "us-central1";
const VERTEX_MODEL = "gemini-2.0-flash-001";

/**
 * Generate a short-lived access token using the GCP service account credentials.
 */
async function getAccessToken(): Promise<string> {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKeyRaw) {
    throw new Error("GCP service account credentials not configured.");
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
    throw new Error(`Token exchange failed: ${err}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { prompt, context, field } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();

    const systemPrompt = `You are an AI writing assistant for MANNYAM, a luxury private travel company in India serving foreign clients. 
Your tone is: warm, British English, unhurried, elegant, no em dashes, no pricing or currency symbols.
You write concise, evocative travel copy that makes readers feel the place.
Field context: ${field || "general text"}
${context ? `Additional context: ${context}` : ""}

Respond with ONLY the generated text, no explanations or prefixes.`;

    const vertexUrl = `https://${VERTEX_LOCATION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${VERTEX_LOCATION}/publishers/google/models/${VERTEX_MODEL}:generateContent`;

    const response = await fetch(vertexUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
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
      console.error("Vertex AI error:", error);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error("AI assist error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
