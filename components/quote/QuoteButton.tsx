"use client";

import type { MouseEvent, ReactNode } from "react";
import { QUOTE_DIALOG_ID } from "@/components/quote/QuoteDialog";
import { QUOTE_HREF } from "@/lib/content";

/**
 * Opens the quote dialog.
 *
 * Renders as an anchor to the contact block and upgrades itself on click, so a
 * visitor who taps it before hydration — or with JavaScript off entirely —
 * still lands somewhere with a phone number rather than on a dead control.
 * The dialog is found by id rather than through context so that the sections
 * holding these buttons stay server components.
 */
export function QuoteButton({
  className = "",
  onNavigate,
  children,
}: {
  className?: string;
  /** Lets a caller close its own menu when the dialog takes over. */
  onNavigate?: () => void;
  children: ReactNode;
}) {
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    const dialog = document.getElementById(QUOTE_DIALOG_ID);
    if (!(dialog instanceof HTMLDialogElement)) return; // fall through to #contact
    event.preventDefault();
    onNavigate?.();
    dialog.showModal();
  };

  return (
    <a href={QUOTE_HREF} onClick={open} className={className}>
      {children}
    </a>
  );
}
