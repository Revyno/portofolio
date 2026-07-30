import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Single-admin gate (PRD §8). A user is admin if signed in AND their primary
 * email is in ADMIN_EMAILS. If ADMIN_EMAILS is blank, any signed-in user passes
 * (dev convenience) — set it before deploy to enforce one admin.
 */
export async function isAdmin(): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) return false;

  const allow = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true; // no allowlist set → any signed-in user

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase();
  return !!email && allow.includes(email);
}
