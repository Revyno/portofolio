import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { AIAssistantGate } from "@/components/ai-assistant/AIAssistantGate";

const plex = IBM_Plex_Mono({
  variable: "--font-plex",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revellio Christopel Oktufovian Lumbaa — Full-stack Developer",
  description:
    "Portfolio & self-hosted CMS. Swiss / dark minimal. Built with Next.js 16, React 19, TypeScript.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={plex.variable} suppressHydrationWarning>
        <body suppressHydrationWarning>
          {children}
          <AIAssistantGate />
        </body>
      </html>
    </ClerkProvider>
  );
}
