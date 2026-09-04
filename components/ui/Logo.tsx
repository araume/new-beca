import Image from "next/image";
import logo from "@/public/logo.png";
import { company } from "@/lib/content";

/**
 * The supplied logo is a complete lockup — globe mark plus wordmark — so it
 * replaces the previous mark-and-type pair outright rather than sitting beside
 * it. Statically imported so next/image gets the intrinsic dimensions and can
 * reserve the box before it loads.
 */
/**
 * Height is a named variant rather than an overridable class: both the base
 * height and an incoming `className` would land in the same Tailwind layer at
 * equal specificity, so which one won would come down to stylesheet order.
 */
const SIZES = {
  /** Footer and inline use. */
  sm: { className: "h-9 sm:h-10", sizes: "120px" },
  /** Header lockup — the page's primary brand statement. */
  lg: { className: "h-12 sm:h-14", sizes: "160px" },
} as const;

export function Logo({
  size = "sm",
  className = "",
  priority = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  priority?: boolean;
}) {
  const variant = SIZES[size];

  return (
    <Image
      src={logo}
      alt={company.name}
      priority={priority}
      sizes={variant.sizes}
      className={`w-auto ${variant.className} ${className}`}
    />
  );
}
