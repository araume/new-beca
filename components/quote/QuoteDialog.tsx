"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  QUOTE_LIMITS,
  company,
  contact,
  incoterms,
  leadTimes,
  loadTypes,
  portsOfDischarge,
  services,
} from "@/lib/content";

/**
 * Quote request form.
 *
 * The transport is a `mailto:` link, not a server: this site is fully static,
 * so a form post would mean standing up (and paying for) an endpoint, a spam
 * filter and somewhere to store submissions. Handing a pre-composed message to
 * the visitor's own mail client keeps the reply thread in the office inbox the
 * team already works in, and keeps the site free to host.
 *
 * The cost of that choice is that nothing can be confirmed — a `mailto:` either
 * opens something or silently does nothing, with no event either way. Worse,
 * it is handed to the OS, so it reaches the machine's default mail program and
 * never a webmail tab: a Gmail user clicking it sees nothing happen.
 *
 * So the dialog never claims the message was sent. It hands over, then offers
 * the routes the OS cannot reach — a prefilled Gmail or Outlook compose window,
 * and the full text to copy — because for a good share of visitors one of those
 * is the only path that actually works.
 *
 * Rendered once per page. Anything can open it — see QuoteButton.
 */
export const QUOTE_DIALOG_ID = "quote-dialog";

/**
 * Ceiling for the whole `mailto:` URL. macOS and Android handlers take far
 * more, but some Windows handlers truncate silently past ~2000 characters, and
 * a silently truncated enquiry is worse than a visibly short one.
 *
 * A realistically complete submission measures around 1,400 against this. The
 * trim below fires for the two tails: a message filling nearly every field to
 * its cap, and one written in a non-Latin script, where each character costs
 * six bytes encoded. It says so in the message rather than quietly dropping
 * the end — and the Gmail and Outlook links carry the whole thing either way,
 * since an https URL has far more room than a mail handler.
 */
const MAX_MAILTO_LENGTH = 2000;

const TRIM_NOTICE = "\r\n\r\n[Message shortened to fit the mail link — please ask us for the rest.]";

type Composed = {
  message: string;
  /** `mailto:` — the OS default mail program. */
  url: string;
  /** Browser compose windows, for people whose mail lives in a tab. */
  gmail: string;
  outlook: string;
};

/**
 * House style for the email itself.
 *
 * A `mailto:` body cannot carry HTML — the parameter is plain text by
 * specification, and Gmail's compose URL is the same — so being on brand here
 * is a matter of typography rather than markup: a masthead, one rule weight,
 * a fixed section order, and a label column that reads down the page.
 *
 * Every rule and bullet is deliberately ASCII. Box-drawing characters would
 * look better and cost three bytes each, which becomes nine per character once
 * percent-encoded; one decorative rule in `═` would eat a fifth of the URL
 * budget on its own. A hyphen encodes as itself.
 */
const RULE = "-".repeat(47);

/**
 * A human reference, not an identifier — nothing stores it. Its worth is that
 * the sender keeps a copy in their own sent mail and the office can search an
 * inbox for it when the thread resurfaces weeks later.
 */
function buildReference(now: Date) {
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  return `BECA-${date}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** The sender's own clock, with the offset, so the office can place it. */
function formatSubmitted(now: Date) {
  const parts = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  } as const;

  try {
    return new Intl.DateTimeFormat("en-GB", { ...parts, timeZoneName: "shortOffset" }).format(now);
  } catch {
    // `shortOffset` landed later than the rest of Intl; degrade, never throw
    // mid-submission.
    return new Intl.DateTimeFormat("en-GB", { ...parts, timeZoneName: "short" }).format(now);
  }
}

function composeMessage(form: FormData, reference: string, now: Date) {
  const read = (key: string) => String(form.get(key) ?? "").trim();
  const destination = read("destination");
  const leadTime = leadTimes.find((row) => row.area === destination);
  const chosen = form.getAll("services").map(String);

  const lines: string[] = [
    `${company.name.toUpperCase()} - QUOTE REQUEST`,
    company.motto,
    `Ref ${reference}  -  ${formatSubmitted(now)}`,
    RULE,
  ];

  /**
   * Unanswered optional fields are dropped, not printed as a dash. A quote
   * desk gains nothing from reading nine em-dashes, and every omitted line is
   * budget handed back to the `mailto:` ceiling.
   */
  const section = (title: string, rows: [string, string][]) => {
    const filled = rows.filter(([, value]) => value);
    if (filled.length === 0) return;
    lines.push("", title, ...filled.map(([label, value]) => `${label}: ${value}`));
  };

  section("CONTACT", [
    ["Name", read("name")],
    ["Company", read("company")],
    ["Email", read("email")],
    ["Phone", read("phone")],
  ]);

  section("ROUTE", [
    ["Origin", read("origin")],
    ["Port of discharge", read("port")],
    [
      "Delivery area",
      destination && leadTime
        ? `${destination} (published lead time ${leadTime.days})`
        : destination,
    ],
    ["Incoterm", read("incoterm")],
  ]);

  section("CARGO", [
    ["Load type", read("loadType")],
    ["Containers / packages", read("containers")],
    ["Weight / volume", read("weightVolume")],
    ["Commodity", read("commodity")],
    ["Cargo ready", read("readyDate")],
  ]);

  lines.push(
    "",
    "SERVICES REQUESTED",
    ...(chosen.length ? chosen.map((name) => `- ${name}`) : ["- Not specified"])
  );

  const notes = read("notes");
  if (notes) lines.push("", "NOTES", notes);

  lines.push(
    "",
    RULE,
    "Sent from the quote form at becalogistics.com",
    "Reply to this message to reach the sender directly."
  );

  return lines.join("\r\n");
}

/**
 * Subject line. Carries who and the lane, because that is what someone
 * triaging an inbox needs before opening anything. The reference stays in the
 * body — it would push the subject past the width most clients show.
 */
function buildSubject(form: FormData) {
  const read = (key: string) => String(form.get(key) ?? "").trim();
  const who = read("company") || read("name");
  const origin = read("origin");
  const destination = read("destination");
  const lane = origin && destination ? `${origin} to ${destination}` : origin || destination;

  const subject = ["Quote request", who, lane].filter(Boolean).join(" — ");
  return subject.length > 110 ? `${subject.slice(0, 107).trimEnd()}…` : subject;
}

function buildMailtoUrl(subject: string, message: string) {
  const base = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=`;
  const encoded = encodeURIComponent(message);
  if (base.length + encoded.length <= MAX_MAILTO_LENGTH) return base + encoded;

  // Reserve room for the notice first, then walk the message down until the
  // whole URL fits. Encoding is not 1:1 with characters, so this measures
  // rather than assumes.
  const budget = MAX_MAILTO_LENGTH - base.length - encodeURIComponent(TRIM_NOTICE).length;
  let text = message;
  while (text.length > 0 && encodeURIComponent(text).length > budget) {
    text = text.slice(0, Math.max(0, text.length - 48));
  }
  return base + encodeURIComponent(text + TRIM_NOTICE);
}

/**
 * Browser compose windows, as an escape hatch from `mailto:`.
 *
 * A `mailto:` link is handed to the operating system, not to the browser, so
 * it reaches whatever is registered as the machine's default mail program.
 * Gmail is a website and is not that by default — which is why a visitor whose
 * entire mail life is a Chrome tab can click the button and watch nothing
 * happen, or watch an Outlook they never use open instead. Neither the page
 * nor the browser can detect that: `mailto:` reports nothing back.
 *
 * These URLs sidestep the OS entirely and open a prefilled compose window in
 * whichever account the visitor is already signed into. They also carry the
 * FULL message rather than the trimmed one: the ~2000-character ceiling is a
 * limit on mail handlers, and an ordinary https URL has far more room.
 */
function buildWebmailUrls(subject: string, message: string) {
  const to = encodeURIComponent(contact.email);
  const su = encodeURIComponent(subject);
  const body = encodeURIComponent(message);

  return {
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`,
    outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${su}&body=${body}`,
  };
}

export function QuoteDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [composed, setComposed] = useState<Composed | null>(null);
  const [copied, setCopied] = useState(false);

  /**
   * Everything that has to happen when the dialog opens or shuts, driven off
   * the `open` attribute.
   *
   * A modal <dialog> makes the page inert but does not stop it scrolling
   * behind the backdrop, so the lock is ours to apply; and the panel has to
   * fall back to the form once it closes, or the next visitor reopens it onto
   * the last person's handoff screen.
   *
   * Both hang off a MutationObserver rather than the `close` and `toggle`
   * events. `close` is the obvious choice and it is not reliable: some engines
   * simply do not fire it for a programmatic `.close()`, which strands the
   * dialog in whatever state it was left in. The attribute always changes.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const sync = () => {
      const isOpen = dialog.open;
      document.documentElement.style.overflow = isOpen ? "hidden" : "";
      if (isOpen) return;
      // Reset on close, not on open, so an accidental dismissal does not lose
      // a composed message the visitor may still want to copy.
      setComposed(null);
      setCopied(false);
    };

    const observer = new MutationObserver(sync);
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });

    return () => {
      observer.disconnect();
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = new Date();
    const subject = buildSubject(form);
    const message = composeMessage(form, buildReference(now), now);
    const url = buildMailtoUrl(subject, message);

    setComposed({ message, url, ...buildWebmailUrls(subject, message) });
    // Hand off. Nothing reports back, which is why the panel below stays up
    // and offers the webmail routes as well.
    window.location.href = url;
  };

  const copyMessage = async () => {
    if (!composed) return;
    try {
      await navigator.clipboard.writeText(`To: ${contact.email}\r\n\r\n${composed.message}`);
      setCopied(true);
    } catch {
      // Clipboard access can be refused outright; the message is on screen and
      // selectable either way, so this only downgrades the convenience.
      setCopied(false);
    }
  };

  return (
    <dialog ref={dialogRef} id={QUOTE_DIALOG_ID} aria-labelledby="quote-title" className="quote-dialog">
      <div className="dialog-panel flex max-h-[88svh] flex-col overflow-hidden rounded-3xl">
        <header className="flex shrink-0 items-start justify-between gap-6 border-b border-ice/10 px-6 py-5 sm:px-8">
          <div>
            <h2
              id="quote-title"
              className="font-display text-xl font-bold tracking-tight text-ice sm:text-2xl"
            >
              Get a quote
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-ice/55 sm:text-sm">
              {composed
                ? "Nothing was sent through this website."
                : "Fills an email for you to send — nothing is submitted through this website."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ice/20 text-ice transition-colors duration-300 hover:border-ice/40 hover:bg-ice/10"
          >
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
              <path
                d="m5.5 5.5 9 9m0-9-9 9"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {composed ? (
          <Handoff
            composed={composed}
            copied={copied}
            onCopy={copyMessage}
            onBack={() => setComposed(null)}
          />
        ) : (
          <QuoteForm onSubmit={handleSubmit} />
        )}
      </div>
    </dialog>
  );
}

function QuoteForm({ onSubmit }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  // Notes is the only field where the cap is tight enough to be worth showing:
  // the rest are far longer than anything anyone types into them.
  const [noteLength, setNoteLength] = useState(0);
  const notesLeft = QUOTE_LIMITS.notes - noteLength;

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      {/* Eleven controls in one grid reads as a wall. Splitting them into three
          named groups gives the eye somewhere to rest, and they are <fieldset>s
          so the grouping reaches a screen reader rather than only the page. */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <Group title="Who to reply to" className="pb-7">
          <Field label="Your name" htmlFor="quote-name" required>
            <input
              id="quote-name"
              name="name"
              required
              maxLength={QUOTE_LIMITS.name}
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              className="field"
            />
          </Field>

          <Field label="Company" htmlFor="quote-company">
            <input
              id="quote-company"
              name="company"
              maxLength={QUOTE_LIMITS.company}
              autoComplete="organization"
              placeholder="Forwarder or consignee"
              className="field"
            />
          </Field>

          <Field label="Email" htmlFor="quote-email" required>
            <input
              id="quote-email"
              name="email"
              type="email"
              required
              maxLength={QUOTE_LIMITS.email}
              autoComplete="email"
              placeholder="you@company.com"
              className="field"
            />
          </Field>

          <Field label="Phone or Viber" htmlFor="quote-phone">
            <input
              id="quote-phone"
              name="phone"
              type="tel"
              maxLength={QUOTE_LIMITS.phone}
              autoComplete="tel"
              placeholder="Optional"
              className="field"
            />
          </Field>
        </Group>

        <Group title="The route" className="border-t border-ice/10 py-7">
          <Field
            label="Origin"
            htmlFor="quote-origin"
            hint="Port or city the cargo ships from."
            required
          >
            <input
              id="quote-origin"
              name="origin"
              required
              maxLength={QUOTE_LIMITS.origin}
              placeholder="Los Angeles, USA"
              className="field"
            />
          </Field>

          <Field label="Port of discharge" htmlFor="quote-port">
            <select id="quote-port" name="port" defaultValue="" className="field">
              <option value="">Not sure yet</option>
              {portsOfDischarge.map((port) => (
                <option key={port} value={port}>
                  {port}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Delivery area"
            htmlFor="quote-destination"
            hint="Our published lead time is sent with the request."
            required
          >
            <select id="quote-destination" name="destination" required defaultValue="" className="field">
              <option value="" disabled>
                Select an area
              </option>
              {leadTimes.map((row) => (
                <option key={row.area} value={row.area}>
                  {row.area} — {row.days}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Incoterm"
            htmlFor="quote-incoterm"
            hint="Decides what the quote has to cover."
          >
            <select id="quote-incoterm" name="incoterm" defaultValue="" className="field">
              <option value="">Not specified</option>
              {incoterms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          </Field>
        </Group>

        <Group title="The cargo" className="border-t border-ice/10 py-7">
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Load type</legend>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {loadTypes.map((type, index) => (
                <label key={type.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="loadType"
                    value={type.value}
                    defaultChecked={index === loadTypes.length - 1}
                    className="peer sr-only"
                  />
                  <span className="chip peer-checked:border-gold peer-checked:bg-gold/15 peer-checked:text-ice peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                    <span className="font-semibold">{type.label}</span>
                    <span className="text-ice/45">{type.detail}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Containers or packages" htmlFor="quote-containers">
            <input
              id="quote-containers"
              name="containers"
              maxLength={QUOTE_LIMITS.containers}
              placeholder="1 x 40ft HC, or 8 pallets"
              className="field"
            />
          </Field>

          <Field label="Weight and volume" htmlFor="quote-weight">
            <input
              id="quote-weight"
              name="weightVolume"
              maxLength={QUOTE_LIMITS.weightVolume}
              placeholder="4,500 kg / 58 CBM"
              className="field"
            />
          </Field>

          <Field label="Commodity" htmlFor="quote-commodity">
            <input
              id="quote-commodity"
              name="commodity"
              maxLength={QUOTE_LIMITS.commodity}
              placeholder="What is in the container?"
              className="field"
            />
          </Field>

          <Field label="Cargo ready" htmlFor="quote-ready">
            <input id="quote-ready" name="readyDate" type="date" className="field" />
          </Field>
        </Group>

        <Group title="What you need" className="border-t border-ice/10 pt-7">
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Services</legend>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {services.map((service) => (
                <label key={service.slug} className="cursor-pointer">
                  <input type="checkbox" name="services" value={service.name} className="peer sr-only" />
                  <span className="chip peer-checked:border-gold peer-checked:bg-gold/15 peer-checked:text-ice peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                    {service.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field
            label="Anything else"
            htmlFor="quote-notes"
            className="sm:col-span-2"
            hint={
              notesLeft <= 80
                ? `${notesLeft} character${notesLeft === 1 ? "" : "s"} left`
                : "Volumes, deadlines, special handling."
            }
          >
            <textarea
              id="quote-notes"
              name="notes"
              rows={3}
              maxLength={QUOTE_LIMITS.notes}
              onChange={(event) => setNoteLength(event.target.value.length)}
              placeholder="Two 40ft containers, needs delivery before the 15th…"
              className="field resize-y"
            />
          </Field>
        </Group>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-ice/10 bg-ink-950/35 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs leading-relaxed text-ice/45">
          Opens your mail app addressed to <span className="text-ice/70">{contact.email}</span>
        </p>
        <button type="submit" className="btn btn-primary shrink-0">
          Open in mail app
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4" fill="none">
            <path
              d="M4 10h11m0 0-4.5-4.5M15 10l-4.5 4.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </footer>
    </form>
  );
}

function Handoff({
  composed,
  copied,
  onCopy,
  onBack,
}: {
  composed: Composed;
  copied: boolean;
  onCopy: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
            <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4.5 w-4.5" fill="none">
              <path
                d="M2.5 6.5h15v11h-15v-11Zm0 .5 7.5 5.5L17.5 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <h3 className="font-display text-base font-semibold text-ice">
              Your mail app should be opening
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ice/60">
              Check it and press send — the message is already written.
            </p>
          </div>
        </div>

        {/* The likeliest outcome for anyone whose mail is a browser tab is that
            nothing happened at all, so the alternatives are offered up front
            rather than buried as a footnote under the transcript. */}
        <div className="mt-6 rounded-2xl border border-ice/10 bg-ice/4 p-5">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-ice/50">
            Nothing opened, or you use webmail?
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ice/55">
            A mail link opens your computer&apos;s default mail program, which is not Gmail unless
            you have set it up that way. These open a prefilled draft in the browser instead.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a
              href={composed.gmail}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary py-2.5 text-sm"
            >
              Open in Gmail
            </a>
            <a
              href={composed.outlook}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost py-2.5 text-sm"
            >
              Open in Outlook
            </a>
            <a href={composed.url} className="btn btn-ghost py-2.5 text-sm">
              Try the mail app again
            </a>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-ice/55">
          Or copy the message below and send it to{" "}
          <a
            href={`mailto:${contact.email}`}
            className="text-gold transition-opacity duration-300 hover:opacity-80"
          >
            {contact.email}
          </a>{" "}
          from anywhere.
        </p>

        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-ice/10 bg-ink-950/50 p-4 font-mono text-xs leading-relaxed text-ice/70">
          {composed.message}
        </pre>
      </div>

      <footer className="flex shrink-0 flex-col gap-3 border-t border-ice/10 bg-ink-950/35 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <button
          type="button"
          onClick={onBack}
          className="text-left text-xs text-ice/50 transition-colors duration-300 hover:text-ice"
        >
          ← Back to the form
        </button>
        <button type="button" onClick={onCopy} className="btn btn-ghost shrink-0 py-2.5 text-sm">
          {copied ? "Copied" : "Copy message"}
        </button>
      </footer>
    </div>
  );
}

function Group({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className={className}>
      <legend className="eyebrow mb-4">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  required = false,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="field-label">
        {label}
        {required ? (
          // Decorative only — the control itself carries `required`, which is
          // what a screen reader announces.
          <span aria-hidden="true" className="ml-1 text-gold">
            *
          </span>
        ) : null}
      </label>
      <div className="mt-2.5">{children}</div>
      {hint ? <p className="mt-1.5 text-xs text-ice/40">{hint}</p> : null}
    </div>
  );
}
