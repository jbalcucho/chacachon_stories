import type { Metadata } from "next";
import PageEnterFade from "@/components/PageEnterFade";
import TrialStoryForm from "@/components/TrialStoryForm";

export const metadata: Metadata = {
  title: "Probar un cuento",
  description:
    "Crea un cuento de prueba con un nombre, sin cuenta. Entra con Google para guardarlo.",
  robots: { index: false },
};

export default function ProbarPage() {
  return (
    <PageEnterFade>
      <main>
        <TrialStoryForm />
      </main>
    </PageEnterFade>
  );
}
