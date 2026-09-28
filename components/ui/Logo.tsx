import Image from "next/image";
import logo from "@/public/logo.png";
import { company } from "@/lib/content";

/**
 * The supplied logo is a complete lockup — globe mark plus wordmark — so it
 * replaces the previous mark-and-type pair outright rather than sitting beside
 * it. Statically imported so next/image gets the intrinsic dimensions and can
 * reserve the box before it loads.
 *
 * Height is a named variant rather than an overridable `className`: both would
 * land in the same Tailwind layer at equal specificity, so which one won would
 * come down to stylesheet order. Variants are named for where they are used,
 * not for how big they are, because the two are no longer a simple scale of
 * each other.
 */
const VARIANTS = {
  /**
   * Header lockup. Capped by the sticky bar — every pixel of height here is a
   * pixel of viewport the bar takes off the page on every screen, permanently.
   */
  header: { className: "h-12 sm:h-14", sizes: "160px" },
  /**
   * Footer brand plate. Taller on small screens than on large ones, which
   * reads as inverted and is not: below `sm` the plate stacks and hands the
   * mark a full-width row to itself, while from `sm` it shares that row with
   * the promise and the motto, and settles back to the header's height.
   */
  footer: { className: "h-16 sm:h-14", sizes: "200px" },
} as const;

export function Logo({
  variant = "header",
  className = "",
  priority = false,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  priority?: boolean;
}) {
  const { className: height, sizes } = VARIANTS[variant];

  return (
    <Image
      src={logo}
      alt={company.name}
      priority={priority}
      sizes={sizes}
      className={`w-auto ${height} ${className}`}
    />
  );
}
