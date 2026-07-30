import Link from "next/link";
import { isAdmin } from "@/lib/admin";

// Server gate: middleware guarantees a signed-in user reaches here; this
// enforces the single-admin allowlist (PRD §8). Signed-in-but-not-admin sees
// a refusal instead of the CMS.
export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-s0 px-6 text-center">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-accent">403 · Not authorized</p>
        <h1 className="text-[46px] font-bold tracking-[-0.05em] text-white">Admin only</h1>
        <p className="max-w-[420px] text-[15px] leading-[1.6] text-[var(--t-body)]">
          You&apos;re signed in, but this account isn&apos;t on the admin allowlist. Ask the owner to
          add your email to <span className="mono text-white">ADMIN_EMAILS</span>.
        </p>
        <Link
          href="/"
          className="mono border border-[var(--line-box)] px-[18px] py-[11px] text-[11px] uppercase tracking-[0.14em] text-white hover:border-accent hover:text-accent"
        >
          ← Back to site
        </Link>
      </main>
    );
  }
  return <>{children}</>;
}
