import type { ReactNode } from "react";
import {
  paragraphStartsWithFairyOpening,
  type StoryBlock,
} from "@/lib/story-markdown";

type Props = {
  blocks: StoryBlock[];
  title?: string | null;
  subtitle?: string | null;
  includeTitle?: boolean;
  includeSubtitle?: boolean;
  dropCap?: boolean;
};

const INLINE = /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g;

/** Convierte marcadores en línea (**negrita**, *cursiva*, _cursiva_) en nodos. */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      nodes.push(<strong key={key++}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      nodes.push(<em key={key++}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      nodes.push(<em key={key++}>{match[3]}</em>);
    }
    last = INLINE.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function firstParagraphText(blocks: StoryBlock[]): string | null {
  for (const block of blocks) {
    if (block.type === "paragraph") return block.text;
  }
  return null;
}

export default function StoryPageBlocks({
  blocks,
  title,
  subtitle,
  includeTitle = false,
  includeSubtitle = false,
  dropCap = false,
}: Props) {
  // Solo capitular si el cuento empieza de verdad con la fórmula (evita «E» coral de «El mundo…»).
  const firstPara = firstParagraphText(blocks);
  const useDropCap =
    dropCap && firstPara !== null && paragraphStartsWithFairyOpening(firstPara);

  return (
    <div className="book-page__inner">
      {includeTitle && title ? (
        <h1 className="book-page__title">{title}</h1>
      ) : null}
      {includeSubtitle && subtitle ? (
        <p className="book-page__subtitle">{subtitle}</p>
      ) : null}
      <div className="book-page__sheet">
        <div
          className={`book-page__body${useDropCap ? " book-page__body--drop" : ""}`}
        >
          {blocks.map((block, index) => {
            if (block.type === "divider") {
              return <hr key={index} className="book-page__divider" />;
            }
            if (block.type === "heading") {
              return (
                <h2 key={index} className="book-page__heading">
                  {renderInline(block.text)}
                </h2>
              );
            }
            if (block.type === "list") {
              const items = block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ));
              return block.ordered ? (
                <ol key={index} className="book-page__list">
                  {items}
                </ol>
              ) : (
                <ul key={index} className="book-page__list">
                  {items}
                </ul>
              );
            }
            return <p key={index}>{renderInline(block.text)}</p>;
          })}
        </div>
      </div>
    </div>
  );
}
