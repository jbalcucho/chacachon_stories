import { describe, expect, it } from "vitest";
import {
  MAX_READER_PROFILES,
  buildPerfilesHref,
  canAddReaderProfile,
  createReaderProfile,
  isSafeAppPath,
  normalizeProfileName,
  preferredHeroIdFromActive,
  resolveActiveProfile,
} from "@/lib/active-profile";

describe("active-profile (manual)", () => {
  it("normalizes and creates a reader profile from a name", () => {
    expect(normalizeProfileName("  Nico  ")).toBe("Nico");
    expect(normalizeProfileName("")).toBeNull();
    const profile = createReaderProfile("Simón");
    expect(profile?.label).toBe("Simón");
    expect(profile?.initial).toBe("S");
    expect(profile?.id.startsWith("rp-")).toBe(true);
  });

  it("caps at 5 profiles", () => {
    expect(MAX_READER_PROFILES).toBe(5);
    expect(canAddReaderProfile(4)).toBe(true);
    expect(canAddReaderProfile(5)).toBe(false);
  });

  it("resolves active profile against the manual list", () => {
    const a = createReaderProfile("Papá")!;
    const b = createReaderProfile("Nico")!;
    expect(resolveActiveProfile([a, b], b)?.label).toBe("Nico");
    expect(resolveActiveProfile([a, b], { ...b, id: "gone" })).toBeNull();
  });

  it("does not map app profile to story hero", () => {
    const p = createReaderProfile("Nico")!;
    expect(preferredHeroIdFromActive(p)).toBeNull();
  });

  it("builds safe perfiles href", () => {
    expect(buildPerfilesHref("/crear", true)).toBe(
      "/perfiles?next=%2Fcrear&required=1",
    );
    expect(isSafeAppPath("/crear")).toBe(true);
    expect(isSafeAppPath("https://evil.com")).toBe(false);
  });
});
