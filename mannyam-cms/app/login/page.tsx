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
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#eee7da]">
      <LoginForm initialError={initialError} />
    </main>
  );
}
