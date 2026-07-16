import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type PublishRpcResult = {
  data: number | null;
  error: { message: string } | null;
};

function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

function getProvidedSecret(request: NextRequest): string | null {
  const authorisation = request.headers.get("authorization");

  if (authorisation) {
    const match = /^Bearer\s+(.+)$/i.exec(authorisation.trim());
    if (match) return match[1].trim();
  }

  return request.headers.get("x-cron-secret")?.trim() || null;
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json(
      { error: "Scheduled publishing is not configured" },
      { status: 500 },
    );
  }

  if (!secretsMatch(getProvidedSecret(request), cronSecret)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const publishRpc = supabaseAdmin.rpc.bind(supabaseAdmin) as unknown as (
    name: "publish_scheduled_posts",
  ) => PromiseLike<PublishRpcResult>;
  const { data, error } = await publishRpc("publish_scheduled_posts");

  if (error) {
    console.error("Scheduled publishing failed", error.message);
    return NextResponse.json(
      { error: "Scheduled publishing failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ published: data ?? 0 });
}
