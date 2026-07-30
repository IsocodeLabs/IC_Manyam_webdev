import React from "react";
import { LoginForm } from "./LoginForm";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const initialError = error
    ? "We could not complete that sign-in. Please try again."
    : null;

  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "radial-gradient(120% 90% at 50% -10%, #4a5237, #23270f)" }}
    >
      <LoginForm initialError={initialError} />
    </main>
  );
}
