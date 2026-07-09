import type { PersonalizedStoryContent } from "@/lib/story-reader";
import type { StoryBlock } from "@/lib/story-markdown";
import type { BookPageData } from "@/lib/story-book-pages";

type RenderPage = Pick<
  BookPageData,
  "blocks" | "includeTitle" | "includeSubtitle"
> & {
  title?: string | null;
  subtitle?: string | null;
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
  body.className = "book-page__body";
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
  let isFirstPage = true;

  while (true) {
    const includeTitle = isFirstPage && hasTitle;
    const includeSubtitle = isFirstPage && hasSubtitle;
    const remaining = blocks.length - blockIndex;

    if (!includeTitle && !includeSubtitle && remaining === 0) break;

    if (remaining === 0) {
      renderPageToInner(inner, {
        blocks: [],
        includeTitle,
        includeSubtitle,
        title,
        subtitle,
      });
      if ((includeTitle || includeSubtitle) && pageFits(inner)) {
        pages.push({ blocks: [], includeTitle, includeSubtitle });
      }
      break;
    }

    let fitCount = 0;
    for (let tryCount = 1; tryCount <= remaining; tryCount += 1) {
      const candidate = blocks.slice(blockIndex, blockIndex + tryCount);
      renderPageToInner(inner, {
        blocks: candidate,
        includeTitle,
        includeSubtitle,
        title,
        subtitle,
      });
      if (pageFits(inner)) {
        fitCount = tryCount;
      } else {
        break;
      }
    }

    if (fitCount === 0) {
      pages.push({
        blocks: [blocks[blockIndex]],
        includeTitle,
        includeSubtitle,
      });
      blockIndex += 1;
    } else {
      pages.push({
        blocks: blocks.slice(blockIndex, blockIndex + fitCount),
        includeTitle,
        includeSubtitle,
      });
      blockIndex += fitCount;
    }

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
