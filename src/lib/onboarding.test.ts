import { describe, expect, it } from "vitest";
import {
  DEMO_SHOWCASE_STORIES,
  buildFamiliaHref,
  householdIsReady,
} from "@/lib/onboarding";

describe("onboarding", () => {
  it("exposes exactly 3 demo showcase stories", () => {
    expect(DEMO_SHOWCASE_STORIES).toHaveLength(3);
    expect(DEMO_SHOWCASE_STORIES[0]?.slug).toBe("demo-noche-en-casa");
    expect(DEMO_SHOWCASE_STORIES.every((s) => s.openPath?.startsWith("/cuentos/"))).toBe(
      true,
    );
  });

  it("requires at least one child and one adult for household", () => {
    expect(householdIsReady(null)).toBe(false);
    expect(
      householdIsReady({
        adultos: [{ id: "a1", rol: "papa", nombre: "José" }],
        ninos: [],
      }),
    ).toBe(false);
    expect(
      householdIsReady({
        adultos: [{ id: "a1", rol: "papa", nombre: "José" }],
        ninos: [{ id: "n1", nombre: "Nico" }],
      }),
    ).toBe(true);
  });

  it("builds familia href with next", () => {
    expect(buildFamiliaHref("/crear")).toBe("/familia?next=%2Fcrear");
  });
});
