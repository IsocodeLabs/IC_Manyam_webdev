import React from "react";
import { CustomerLoginForm } from "../CustomerLoginForm";

export const metadata = {
  title: "Traveller Login | MANNYAM",
  description: "Access your bespoke travel itinerary, payments, and private journeys.",
};

export default function CustomerLoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-ivory py-12 px-4 sm:px-6 lg:px-8">
      <CustomerLoginForm />
    </div>
  );
}
