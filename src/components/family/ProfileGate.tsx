"use client";

import { Suspense } from "react";
import OnboardingGate from "@/components/family/OnboardingGate";

export default function ProfileGate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="profile-gate mx-auto max-w-lg px-4 py-16 text-center">
          <p className="intro-copy">Preparando tu casa…</p>
        </div>
      }
    >
      <OnboardingGate>{children}</OnboardingGate>
    </Suspense>
  );
}
