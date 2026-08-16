"use client";

import { usePathname } from "next/navigation";
import { AIAssistant } from "./AIAssistant";

// Show the assistant across the public site, but not inside the /cms admin area.
export function AIAssistantGate() {
  const pathname = usePathname();
  if (pathname?.startsWith("/cms")) return null;
  return <AIAssistant />;
}
