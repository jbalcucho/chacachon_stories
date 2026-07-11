/**
 * Cuento de prueba sin login: mock corto con nombre + reto, solo en sessionStorage.
 */

import { moderateUserText } from "@/lib/content-moderation";
import {
  parseBodyBlocks,
  parseStoryHeader,
  splitBlocksForPagination,
} from "@/lib/story-markdown";
import type { PersonalizedStoryContent } from "@/lib/story-reader";
import { buildMockStoryMarkdown } from "@/lib/story-mock";
import type { RecipeIngredient } from "@/lib/story-recipe";
import type { RecipeSelectionSlice } from "@/lib/recipe-summary";

export const TRIAL_STORY_STORAGE_KEY = "chacachon.trialStory.v1";
export const TRIAL_NAME_MAX = 24;

export type TrialChallenge = {
  id: string;
  label: string;
  lesson: string;
};

export const TRIAL_CHALLENGES: TrialChallenge[] = [
  {
    id: "dormir",
    label: "Hora de dormir",
    lesson: "Calma",
  },
  {
    id: "pantallas",
    label: "Soltar la tablet",
    lesson: "Responsabilidad",
  },
  {
    id: "colegio",
    label: "Un día de colegio",
    lesson: "Valentía",
  },
];

export type TrialStoryPayload = {
  name: string;
  challengeId: string;
  markdown: string;
  createdAt: string;
};

function ing(
  id: string,
  kind: RecipeIngredient["kind"],
  label: string,
): RecipeIngredient {
  return { id, kind, label, emoji: "" };
}

export function normalizeTrialName(raw: string): string | null {
  const name = raw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > TRIAL_NAME_MAX) return null;
  if (moderateUserText(name)) return null;
  return name;
}

export function getTrialChallenge(id: string): TrialChallenge {
  return (
    TRIAL_CHALLENGES.find((c) => c.id === id) ?? TRIAL_CHALLENGES[0]
  );
}

export function buildTrialSelection(
  name: string,
  challengeId: string,
): RecipeSelectionSlice {
  const challenge = getTrialChallenge(challengeId);
  return {
    heroes: [ing("trial-hero", "persona", name)],
    reto: [ing(`trial-reto-${challenge.id}`, "dilema", challenge.label)],
    aprenden: [
      ing(`trial-emo-${challenge.id}`, "emocion", challenge.lesson),
    ],
    lugar: [ing("trial-lugar", "lugar", "el apartamento")],
    mascota: [],
    acompanantes: [],
    rolReto: [],
    objeto: [],
    molde: [],
  };
}

export function buildTrialStoryMarkdown(
  name: string,
  challengeId: string,
): string {
  return buildMockStoryMarkdown(buildTrialSelection(name, challengeId));
}

export function trialMarkdownToContent(
  markdown: string,
): PersonalizedStoryContent {
  const parsed = parseStoryHeader(markdown);
  return {
    title: parsed.title,
    subtitle: null,
    blocks: splitBlocksForPagination(parseBodyBlocks(parsed.body)),
  };
}

export function saveTrialStory(payload: TrialStoryPayload): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    TRIAL_STORY_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function readTrialStory(): TrialStoryPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(TRIAL_STORY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TrialStoryPayload;
    if (!parsed?.name || !parsed?.markdown) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearTrialStory(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TRIAL_STORY_STORAGE_KEY);
}
