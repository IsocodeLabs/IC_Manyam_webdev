"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface ActionState {
  error: string | null;
  success?: boolean;
}

export async function customerLoginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return { error: "Please enter both email and password." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "The email address or password is incorrect." };
  }

  redirect("/account");
}

export async function customerRegisterAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");
  const phone = formData.get("phone");
  const country = formData.get("country") || "United Kingdom";

  if (typeof name !== "string" || !name) {
    return { error: "Please enter your full name." };
  }
  if (typeof email !== "string" || !email) {
    return { error: "Please enter your email address." };
  }
  if (typeof password !== "string" || !password || password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "customer",
        name,
        phone: typeof phone === "string" ? phone : undefined,
        country: typeof country === "string" ? country : "United Kingdom",
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/account");
}

export async function customerLogoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/account/login");
}
