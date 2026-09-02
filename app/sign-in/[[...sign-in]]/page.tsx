"use client";

import { useEffect } from "react";
import { SignIn } from "@clerk/nextjs";
import { rearmVeil } from "@/components/site/veil";

export default function SignInPage() {
  // Relog re-arms the intro: after signing back in and returning to the site,
  // the curtain plays again instead of a cold hero. Clearing on mount (not on
  // success) is fine — worst case the curtain replays on the next `/` visit.
  useEffect(() => { rearmVeil(); }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-s0 px-6">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#4CE0FF",
            colorBackground: "#0E0E0E",
            colorForeground: "#ffffff",
            colorInput: "#111111",
            borderRadius: "0px",
          },
        }}
      />
    </main>
  );
}
