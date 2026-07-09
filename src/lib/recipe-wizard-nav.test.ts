import { describe, expect, it } from "vitest";
import {
  canNavigateToWizardStep,
  isWizardStepConfirmed,
} from "@/lib/recipe-summary";

describe("recipe wizard step confirmation", () => {
  it("marks steps confirmed only after Siguiente", () => {
    expect(isWizardStepConfirmed(0, -1)).toBe(false);
    expect(isWizardStepConfirmed(0, 0)).toBe(true);
    expect(isWizardStepConfirmed(1, 0)).toBe(false);
    expect(isWizardStepConfirmed(2, 1)).toBe(false);
  });

  it("allows navigation only to confirmed steps", () => {
    expect(canNavigateToWizardStep(0, 2, 1)).toBe(true);
    expect(canNavigateToWizardStep(1, 2, 1)).toBe(true);
    expect(canNavigateToWizardStep(2, 2, 1)).toBe(false);
    expect(canNavigateToWizardStep(3, 2, 1)).toBe(false);
  });
});
