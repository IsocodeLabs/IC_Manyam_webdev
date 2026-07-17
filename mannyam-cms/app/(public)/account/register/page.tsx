import React from "react";
import { CustomerRegisterForm } from "../CustomerRegisterForm";

export const metadata = {
  title: "Register Traveller Account | MANNYAM",
  description: "Create your private account to manage your curated luxury journeys.",
};

export default function CustomerRegisterPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-ivory py-12 px-4 sm:px-6 lg:px-8">
      <CustomerRegisterForm />
    </div>
  );
}
