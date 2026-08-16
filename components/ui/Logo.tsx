import Image from "next/image";
import logo from "@/public/logo.png";
import { company } from "@/lib/content";

/**
 * The supplied logo is a complete lockup — globe mark plus wordmark — so it
 * replaces the previous mark-and-type pair outright rather than sitting beside
 * it. Statically imported so next/image gets the intrinsic dimensions and can
 * reserve the box before it loads.
 */
export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt={company.name}
      priority={priority}
      sizes="120px"
      className={`h-9 w-auto sm:h-10 ${className}`}
    />
  );
}
