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

function availableHeight(inner: HTMLElement): number {
  const measured = Number.parseInt(inner.dataset.pageHeight ?? "", 10);
  if (Number.isFinite(measured) && measured >= 24) return measured;
  return inner.clientHeight;
}

export function pageFits(inner: HTMLElement): boolean {
  const available = availableHeight(inner);
  if (available < 24) return false;
  return inner.scrollHeight <= available + 1;
}

function buildTryBlocks(
  blocks: StoryBlock[],
  blockIndex: number,
  tryCount: number,
  pendingParagraph: string | null,
): StoryBlock[] {
  if (pendingParagraph) {
    const pageBlocks: StoryBlock[] = [
      { type: "paragraph", text: pendingParagraph },
    ];
    if (tryCount > 1) {
      pageBlocks.push(...blocks.slice(blockIndex, blockIndex + tryCount - 1));
    }
    return pageBlocks;
  }
  return blocks.slice(blockIndex, blockIndex + tryCount);
}

function maxParagraphPrefixThatFits(
  inner: HTMLElement,
  paragraphText: string,
  shell: RenderPage,
  baseBlocks: StoryBlock[] = [],
): { prefix: string; suffix: string } | null {
  const sentences = splitIntoSentences(paragraphText);
  let fitCount = 0;

  for (let i = 0; i < sentences.length; i += 1) {
    const candidate = joinSentences(sentences.slice(0, i + 1));
    renderPageToInner(inner, {
      ...shell,
      blocks: [...baseBlocks, { type: "paragraph", text: candidate }],
    });
    if (pageFits(inner)) fitCount = i + 1;
    else break;
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
    renderPageToInner(inner, {
      ...shell,
      blocks: [...baseBlocks, { type: "paragraph", text: candidate }],
    });
    if (pageFits(inner)) {
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

const MIN_REMAINING_PX = 44;

/** Añade trozos del siguiente bloque si aún cabe espacio en la página. */
function growPageWithFollowingBlocks(
  inner: HTMLElement,
  shell: RenderPage,
  pageBlocks: StoryBlock[],
  blocks: StoryBlock[],
  fromIndex: number,
): {
  pageBlocks: StoryBlock[];
  nextIndex: number;
  pendingParagraph: string | null;
} {
  let current = pageBlocks;
  let index = fromIndex;
  let pending: string | null = null;

  for (;;) {
    renderPageToInner(inner, { ...shell, blocks: current });
    if (availableHeight(inner) - inner.scrollHeight < MIN_REMAINING_PX) break;

    const nextBlock = blocks[index];
    const sourceText =
      pending ??
      (nextBlock?.type === "paragraph" ? nextBlock.text : null);
    if (!sourceText) break;

    const split = maxParagraphPrefixThatFits(
      inner,
      sourceText,
      shell,
      current,
    );
    if (!split?.prefix.trim()) break;

    current = [
      ...current,
      { type: "paragraph", text: split.prefix.trim() },
    ];

    if (split.suffix.trim()) {
      pending = split.suffix;
    } else {
      pending = null;
      index += 1;
    }
  }

  return {
    pageBlocks: current,
    nextIndex: index,
    pendingParagraph: pending,
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

  while (
    pendingParagraph ||
    blockIndex < blocks.length ||
    (isFirstPage && (hasTitle || hasSubtitle))
  ) {
    const includeTitle = isFirstPage && hasTitle && !pendingParagraph;
    const includeSubtitle = isFirstPage && hasSubtitle && !pendingParagraph;
    const shell: RenderPage = {
      blocks: [],
      includeTitle,
      includeSubtitle,
      title,
      subtitle,
      dropCap: isFirstPage && !pendingParagraph,
    };

    if (!pendingParagraph && blockIndex >= blocks.length) {
      renderPageToInner(inner, { ...shell, blocks: [] });
      if ((includeTitle || includeSubtitle) && pageFits(inner)) {
        pages.push({ blocks: [], includeTitle, includeSubtitle });
      }
      break;
    }

    const maxTry = pendingParagraph
      ? 1 + (blocks.length - blockIndex)
      : blocks.length - blockIndex;

    let fitCount = 0;
    for (let tryCount = 1; tryCount <= maxTry; tryCount += 1) {
      const candidate = buildTryBlocks(
        blocks,
        blockIndex,
        tryCount,
        pendingParagraph,
      );
      renderPageToInner(inner, { ...shell, blocks: candidate });
      if (pageFits(inner)) fitCount = tryCount;
      else break;
    }

    if (fitCount > 0) {
      let pageBlocks = buildTryBlocks(
        blocks,
        blockIndex,
        fitCount,
        pendingParagraph,
      );

      if (!pendingParagraph) {
        const nextIndex = blockIndex + fitCount;
        const grown = growPageWithFollowingBlocks(
          inner,
          shell,
          pageBlocks,
          blocks,
          nextIndex,
        );
        pageBlocks = grown.pageBlocks;
        if (grown.pendingParagraph) {
          pages.push({
            blocks: pageBlocks,
            includeTitle,
            includeSubtitle,
          });
          pendingParagraph = grown.pendingParagraph;
          blockIndex = grown.nextIndex;
          isFirstPage = false;
          continue;
        }
        blockIndex = grown.nextIndex;
      } else {
        pendingParagraph = null;
        blockIndex += Math.max(fitCount - 1, 0);
      }

      pages.push({
        blocks: pageBlocks,
        includeTitle,
        includeSubtitle,
      });
      isFirstPage = false;
      continue;
    }

    const overflowBlock: StoryBlock = pendingParagraph
      ? { type: "paragraph", text: pendingParagraph }
      : blocks[blockIndex];

    if (overflowBlock.type === "paragraph") {
      const split = maxParagraphPrefixThatFits(inner, overflowBlock.text, shell);
      if (split?.prefix.trim()) {
        pages.push({
          blocks: [{ type: "paragraph", text: split.prefix }],
          includeTitle,
          includeSubtitle,
        });
        pendingParagraph = split.suffix.trim() ? split.suffix : null;
        if (!pendingParagraph) blockIndex += 1;
        isFirstPage = false;
        continue;
      }
    }

    pages.push({
      blocks: [overflowBlock],
      includeTitle,
      includeSubtitle,
    });
    pendingParagraph = null;
    blockIndex += 1;
    isFirstPage = false;
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
