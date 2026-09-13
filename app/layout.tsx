import type { Metadata } from "next";
import { IBM_Plex_Mono, Yesteryear } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AIAssistantGate } from "@/components/ai-assistant/AIAssistantGate";
import { VEIL_BOOT } from "@/components/site/veil";

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
  title: "Revellio Christopel Oktufovian Lumbaa | Full-stack Developer",
  description:
    "Portfolio & self-hosted CMS. Swiss / dark minimal. Built with Next.js 16, React 19, TypeScript.",
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
