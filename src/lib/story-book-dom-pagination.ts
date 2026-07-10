import type { PersonalizedStoryContent } from "@/lib/story-reader";
import type { StoryBlock } from "@/lib/story-markdown";
import type { BookPageData } from "@/lib/story-book-pages";
import {
  joinSentences,
  joinWords,
  splitIntoSentences,
  splitIntoWords,
} from "@/lib/story-paragraph-split";

type RenderPage = Pick<
  BookPageData,
  "blocks" | "includeTitle" | "includeSubtitle"
> & {
  title?: string | null;
  subtitle?: string | null;
  dropCap?: boolean;
};

/** Quita marcadores en línea para medir el mismo texto que se renderiza. */
function stripInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

function appendBlock(container: HTMLElement, block: StoryBlock) {
  if (block.type === "divider") {
    const hr = document.createElement("hr");
    hr.className = "book-page__divider";
    container.appendChild(hr);
    return;
  }

  if (block.type === "heading") {
    const h2 = document.createElement("h2");
    h2.className = "book-page__heading";
    h2.textContent = stripInline(block.text);
    container.appendChild(h2);
    return;
  }

  if (block.type === "list") {
    const list = document.createElement(block.ordered ? "ol" : "ul");
    list.className = "book-page__list";
    for (const item of block.items) {
      const li = document.createElement("li");
      li.textContent = stripInline(item);
      list.appendChild(li);
    }
    container.appendChild(list);
    return;
  }

  const p = document.createElement("p");
  p.textContent = stripInline(block.text);
  container.appendChild(p);
}

export function renderPageToInner(
  inner: HTMLElement,
  page: RenderPage,
): void {
  inner.replaceChildren();

  if (page.includeTitle && page.title) {
    const h1 = document.createElement("h1");
    h1.className = "book-page__title";
    h1.textContent = page.title;
    inner.appendChild(h1);
  }

  if (page.includeSubtitle && page.subtitle) {
    const sub = document.createElement("p");
    sub.className = "book-page__subtitle";
    sub.textContent = page.subtitle;
    inner.appendChild(sub);
  }

  const body = document.createElement("div");
  body.className = page.dropCap
    ? "book-page__body book-page__body--drop"
    : "book-page__body";
  for (const block of page.blocks) {
    appendBlock(body, block);
  }
  inner.appendChild(body);
}

export function pageFits(inner: HTMLElement): boolean {
  const available = inner.clientHeight;
  if (available < 24) return false;
  return inner.scrollHeight <= available + 1;
}

function blocksFit(
  inner: HTMLElement,
  shell: RenderPage,
  blocks: StoryBlock[],
): boolean {
  renderPageToInner(inner, { ...shell, blocks });
  return pageFits(inner);
}

function maxParagraphPrefixThatFits(
  inner: HTMLElement,
  paragraphText: string,
  pageBlocks: StoryBlock[],
  shell: RenderPage,
): { prefix: string; suffix: string } | null {
  const sentences = splitIntoSentences(paragraphText);
  let fitCount = 0;

  for (let i = 0; i < sentences.length; i += 1) {
    const candidate = joinSentences(sentences.slice(0, i + 1));
    if (
      blocksFit(inner, shell, [
        ...pageBlocks,
        { type: "paragraph", text: candidate },
      ])
    ) {
      fitCount = i + 1;
    } else {
      break;
    }
  }

  if (fitCount > 0) {
    return {
      prefix: joinSentences(sentences.slice(0, fitCount)),
      suffix: joinSentences(sentences.slice(fitCount)),
    };
  }

  const words = splitIntoWords(paragraphText);
  if (words.length === 0) return null;

  let lo = 1;
  let hi = words.length;
  let best = 0;

  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const candidate = joinWords(words.slice(0, mid));
    if (
      blocksFit(inner, shell, [
        ...pageBlocks,
        { type: "paragraph", text: candidate },
      ])
    ) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (best === 0) {
    return {
      prefix: words[0] ?? paragraphText,
      suffix: joinWords(words.slice(1)),
    };
  }

  return {
    prefix: joinWords(words.slice(0, best)),
    suffix: joinWords(words.slice(best)),
  };
}

/** Pagina midiendo el DOM real (misma estructura que StoryPageBlocks). */
export function paginateBookContent(
  inner: HTMLElement,
  content: PersonalizedStoryContent,
): BookPageData[] {
  const { blocks, title, subtitle } = content;
  const hasTitle = Boolean(title);
  const hasSubtitle = Boolean(subtitle);
  const pages: BookPageData[] = [];
  let blockIndex = 0;
  let pendingParagraph: string | null = null;
  let isFirstPage = true;

  while (true) {
    const includeTitle = isFirstPage && hasTitle;
    const includeSubtitle = isFirstPage && hasSubtitle;
    const shell: RenderPage = {
      blocks: [],
      includeTitle,
      includeSubtitle,
      title,
      subtitle,
      dropCap: isFirstPage,
    };

    const hasWork =
      includeTitle ||
      includeSubtitle ||
      Boolean(pendingParagraph?.trim()) ||
      blockIndex < blocks.length;

    if (!hasWork) break;

    const pageBlocks: StoryBlock[] = [];

    while (pendingParagraph?.trim() || blockIndex < blocks.length) {
      let unit: StoryBlock;
      let fromPending = false;

      if (pendingParagraph?.trim()) {
        unit = { type: "paragraph", text: pendingParagraph };
        fromPending = true;
      } else {
        unit = blocks[blockIndex];
      }

      if (blocksFit(inner, shell, [...pageBlocks, unit])) {
        pageBlocks.push(unit);
        if (fromPending) pendingParagraph = null;
        else blockIndex += 1;
        continue;
      }

      if (unit.type === "paragraph") {
        const split = maxParagraphPrefixThatFits(
          inner,
          unit.text,
          pageBlocks,
          shell,
        );
        if (split?.prefix) {
          pageBlocks.push({ type: "paragraph", text: split.prefix });
          pendingParagraph = split.suffix.trim() ? split.suffix : null;
          if (!fromPending && !pendingParagraph) blockIndex += 1;
        } else if (pageBlocks.length === 0) {
          pageBlocks.push(unit);
          pendingParagraph = null;
          if (!fromPending) blockIndex += 1;
        }
      } else if (pageBlocks.length === 0) {
        pageBlocks.push(unit);
        blockIndex += 1;
      }

      break;
    }

    if (
      pageBlocks.length === 0 &&
      !includeTitle &&
      !includeSubtitle
    ) {
      break;
    }

    if (pageBlocks.length === 0 && (includeTitle || includeSubtitle)) {
      renderPageToInner(inner, { ...shell, blocks: [] });
      if (!pageFits(inner)) break;
    }

    pages.push({
      blocks: pageBlocks,
      includeTitle,
      includeSubtitle,
    });

    isFirstPage = false;

    if (!pendingParagraph && blockIndex >= blocks.length) break;
  }

  if (pages.length === 0) {
    return [
      {
        blocks: content.blocks,
        includeTitle: hasTitle,
        includeSubtitle: hasSubtitle,
      },
    ];
  }

  return pages;
}
