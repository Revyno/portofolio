import type { Metadata } from "next";
import { IBM_Plex_Mono, Yesteryear } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AIAssistantGate } from "@/components/ai-assistant/AIAssistantGate";
import { VEIL_BOOT } from "@/components/site/veil";
import { SITE_URL, SITE_NAME, SITE_ROLE, SITE_DESCRIPTION } from "@/lib/site";

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  weight: ["400", "500"],
  subsets: ["latin"],
});

// Script face, used for exactly one thing: the hand-drawn wordmark on the
// intro loading screen. `swap` on purpose — a loading screen that waits on its
// own font is the blank-screen problem it exists to solve.
const yesteryear = Yesteryear({
  variable: "--font-yesteryear",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Absolute-URL base for OG/canonical/sitemap. Child pages set only `title`
  // (via the template) and inherit the rest. `app/opengraph-image.tsx` is picked
  // up automatically for OG + Twitter cards.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_ROLE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: "Revellio Portfolio",
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  keywords: [
    "Revellio",
    "Revellio Lumbaa",
    "Revellio Christopel Oktufovian Lumbaa",
    "full-stack developer",
    "web developer",
    "software engineer",
    "Next.js",
    "React",
    "TypeScript",
    "portfolio",
  ],
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_ROLE}`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_ROLE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${plex.variable} ${yesteryear.variable}`} suppressHydrationWarning>
        <body suppressHydrationWarning>
          {/* Intro-veil decision, before first paint. Server-rendered <script>:
              runs at HTML parse, self-guards to `/` (see VEIL_BOOT). Must lead
              <body> so `veil-on` is set before <PageVeil>'s .veil parses. */}
          <script dangerouslySetInnerHTML={{ __html: VEIL_BOOT }} />
          {children}
          <AIAssistantGate />
        </body>
      </html>
    </ClerkProvider>
  );
}
