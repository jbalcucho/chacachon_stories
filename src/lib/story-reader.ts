import type { FamilyProfileDocument } from "@/lib/family-profile-schema";
import { parseFrontmatter } from "@/lib/markdown-frontmatter";
import { personalizeStoryText } from "@/lib/story-personalization";
import { readStorySourceFile } from "@/lib/story-content-loader.server";
import { getStoryContentSource } from "@/lib/story-content-index";
import { parseBodyBlocks, parseStoryHeader } from "@/lib/story-markdown";
import type { StoryBlock } from "@/lib/story-markdown";

export type { StoryBlock } from "@/lib/story-markdown";

export type PersonalizedStoryContent = {
  title: string;
  subtitle: string | null;
  blocks: StoryBlock[];
};

function personalizeBlocks(
  blocks: StoryBlock[],
  perfil: FamilyProfileDocument,
  options: { useCanonReplacements: boolean; familyTag?: string },
): StoryBlock[] {
  return blocks.map((block) => {
    if (block.type === "divider") return block;
    if (block.type === "list") {
      return {
        ...block,
        items: block.items.map((item) =>
          personalizeStoryText(item, perfil, {
            useCanonReplacements: options.useCanonReplacements,
            familyTag: options.familyTag,
          }),
        ),
      };
    }
    return {
      ...block,
      text: personalizeStoryText(block.text, perfil, {
        useCanonReplacements: options.useCanonReplacements,
        familyTag: options.familyTag,
      }),
    };
  });
}

export async function loadPersonalizedStory(
  slug: string,
  perfil: FamilyProfileDocument,
): Promise<PersonalizedStoryContent | null> {
  const source = getStoryContentSource(slug);
  if (!source) return null;

  const raw = await readStorySourceFile(slug);
  if (!raw) return null;
  const { body: rawBody } = parseFrontmatter(raw);
  const parsed = parseStoryHeader(rawBody);
  const personalizeOptions = {
    useCanonReplacements: source.kind === "markdown",
    familyTag: source.familyTag,
  };

  const title = personalizeStoryText(parsed.title, perfil, personalizeOptions);
  const subtitle = parsed.subtitle
    ? personalizeStoryText(parsed.subtitle, perfil, personalizeOptions)
    : null;
  const bodyBlocks = parseBodyBlocks(parsed.body);

  return {
    title,
    subtitle,
    blocks: personalizeBlocks(bodyBlocks, perfil, personalizeOptions),
  };
}
