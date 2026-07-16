import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const { origin } = new URL(request.url);
  // Clear the cookies and redirect to the login page
  const response = NextResponse.redirect(`${origin}/login`, {
    status: 303, // See Other (forces a GET request to /login)
  });

  return response;
}
