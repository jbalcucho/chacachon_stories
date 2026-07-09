import { BRAND_ILLUSTRATION } from "@/lib/brand-illustration";

type Variant = "hero" | "compact" | "crear" | "recipe";

type Props = {
  variant?: Variant;
  priority?: boolean;
  className?: string;
};

const SIZES: Record<Variant, string> = {
  hero: "(max-width: 639px) 100px, 132px",
  compact: "32px",
  crear: "40px",
  recipe: "32px",
};

/** Ilustración de marca Chacachón (luna + cuento). */
export default function BrandIllustration({
  variant = "compact",
  priority = false,
  className,
}: Props) {
  const variantClass = `brand-illustration brand-illustration--${variant}`;
  const mergedClass = className ? `${variantClass} ${className}` : variantClass;

  return (
    <picture className={mergedClass}>
      <source srcSet={BRAND_ILLUSTRATION.webp} type="image/webp" />
      <img
        src={BRAND_ILLUSTRATION.png}
        alt=""
        width={BRAND_ILLUSTRATION.width}
        height={BRAND_ILLUSTRATION.height}
        decoding={priority ? "sync" : "async"}
        fetchPriority={priority ? "high" : undefined}
        sizes={SIZES[variant]}
        className="brand-illustration__img"
      />
    </picture>
  );
}
