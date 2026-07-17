import { NextRequest } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { notifyNewLead } from "@/lib/email/notifyNewLead";

// Simple in-memory rate limiter per IP address
interface RateLimitRecord {
  count: number;
  expiresAt: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();

// Define schema for lead validation
const leadSchema = z.object({
  source: z.enum(["Contact Form", "AI Chat"]),
  source_page: z.string().min(1, "Source page cannot be empty").refine(
    (val) => val.startsWith("/"),
    "Source page must start with /"
  ),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  email: z.string().email("Invalid email format"),
  message: z.string().max(2000, "Message must be at most 2000 characters").optional().or(z.literal("")),
});

export async function OPTIONS() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function POST(req: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://mannyam.in";

  // 1. Rate Limiting Check
  // Extract client IP address
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || (req as any).ip || "127.0.0.1";
  const now = Date.now();
  const limitWindow = 3600000; // 1 hour in milliseconds
  const record = rateLimitMap.get(ip);

  if (record) {
    if (now > record.expiresAt) {
      // Limit window expired, will reset count on successful insert
    } else if (record.count >= 5) {
      // Exceeded limit (max 5 submissions per hour)
      return Response.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Access-Control-Allow-Origin": origin,
          },
        }
      );
    }
  }

  // 2. Parse and Validate Request Body
  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON payload" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  }

  const result = leadSchema.safeParse(body);

  if (!result.success) {
    const issues = result.error.issues;
    const fields = issues.map((err) => err.path.join("."));
    
    // Determine custom error messages based on validation failures
    const hasSourceError = issues.some((e) => e.path.includes("source"));
    const hasSourcePageError = issues.some((e) => e.path.includes("source_page"));
    const hasEmailFormatError = issues.some((e) => e.path.includes("email") && e.code === "invalid_format");

    let errorMsg = "Validation failed";
    if (hasSourceError) {
      errorMsg = "Source must be exactly 'Contact Form' or 'AI Chat'";
    } else if (hasSourcePageError) {
      errorMsg = "Source page must start with /";
    } else if (hasEmailFormatError) {
      errorMsg = "Invalid email format";
    }

    return Response.json(
      { error: errorMsg, fields },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  }

  const validatedData = result.data;

  // 3. Insert Lead Into Supabase (bypassing RLS via admin client)
  const { data: insertedLead, error: dbError } = await supabaseAdmin
    .from("leads")
    .insert({
      name: validatedData.name,
      email: validatedData.email,
      source: validatedData.source,
      source_page: validatedData.source_page,
      message: validatedData.message || null,
      status: "New",
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("Database lead insertion failed:", dbError);
    return Response.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": origin,
        },
      }
    );
  }

  // Increment rate limit count upon successful submission
  const currentRecord = rateLimitMap.get(ip);
  if (currentRecord) {
    if (now > currentRecord.expiresAt) {
      rateLimitMap.set(ip, { count: 1, expiresAt: now + limitWindow });
    } else {
      currentRecord.count += 1;
    }
  } else {
    rateLimitMap.set(ip, { count: 1, expiresAt: now + limitWindow });
  }

  // 4. Trigger Email Notification (non-blocking)
  notifyNewLead({
    name: validatedData.name,
    email: validatedData.email,
    source: validatedData.source,
    source_page: validatedData.source_page,
    message: validatedData.message || undefined,
  }).catch((err) => {
    console.error("Email notification deferred failure:", err);
  });

  // 5. Success Response
  return Response.json(
    { id: insertedLead.id, message: "Enquiry received" },
    {
      status: 201,
      headers: {
        "Access-Control-Allow-Origin": origin,
      },
    }
  );
}
