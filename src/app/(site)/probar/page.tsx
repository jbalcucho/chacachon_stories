import type { Metadata } from "next";
import PageEnterFade from "@/components/PageEnterFade";
import TrialStoryForm from "@/components/TrialStoryForm";

export const metadata: Metadata = {
  title: "Probar un cuento",
  description:
    "Crea un cuento de prueba: momento de casa o clásico, con el nombre de tu niño. Sin cuenta.",
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
