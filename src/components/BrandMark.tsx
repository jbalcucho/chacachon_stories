import { renderBrandMarkSvg } from "@/lib/brand-mark-svg";

type Props = {
  /** Sufijo único para gradientes/máscaras cuando hay varias instancias. */
  id?: string;
  variant?: "hero" | "compact";
  className?: string;
};

/** Símbolo de marca: niño leyendo acurrucado en la luna. */
export default function BrandMark({
  id = "brand-mark",
  variant = "hero",
  className,
}: Props) {
  return (
    <span
      className={`brand-mark brand-mark--${variant}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{
        __html: renderBrandMarkSvg({ id }),
      }}
    />
  );
}
