import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { company, contact } from "@/lib/content";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://becalogistics.com"),
  title: {
    default: `${company.name} — ${company.motto}`,
    template: `%s | ${company.name}`,
  },
  description: company.intro,
  keywords: [
    "customs brokerage Philippines",
    "freight forwarder Manila",
    "warehousing Las Piñas",
    "door to door delivery Philippines",
    "cargo marine insurance",
    "returning resident shipment",
  ],
  openGraph: {
    type: "website",
    locale: "en_PH",
    siteName: company.name,
    title: `${company.name} — ${company.motto}`,
    description: company.intro,
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.name} — ${company.motto}`,
    description: company.intro,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#001238",
  colorScheme: "dark",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LogisticsBusiness",
  name: company.name,
  slogan: company.motto,
  description: company.intro,
  email: contact.email,
  telephone: contact.telephone.label,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Km 16, RSTI Compound, Unit R-16, Alabang–Zapote Road, Pamplona 1",
    addressLocality: "Las Piñas City",
    postalCode: "1740",
    addressCountry: "PH",
  },
  areaServed: "Philippines",
  foundingDate: "2009",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ink-900">
        <script
          type="application/ld+json"
          // Static, developer-authored object — no user input reaches this string.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
