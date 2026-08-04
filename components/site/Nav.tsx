"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./primitives";
import { playClick } from "@/lib/sound";

const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/journey", label: "Journey" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/** Desktop top nav — 4 mono items, active = 2px accent underline, last = fill button. */
export function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 hidden border-b border-[var(--line)] bg-s0/90 backdrop-blur md:block">
      <nav className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-[72px]">
        <Link href="/" onClick={playClick} className="mono text-[13px] font-medium tracking-[0.14em] text-white">
          Revellio
        </Link>
        <ul className="mono flex items-center gap-9 text-[11px] font-medium uppercase tracking-[0.14em]">
          {ITEMS.map((it) => {
            const active = isActive(pathname, it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  onClick={playClick}
                  className={`pb-1 transition-colors ${
                    active
                      ? "border-b-2 border-accent text-white"
                      : "border-b-2 border-transparent text-[var(--t-muted)] hover:text-white"
                  }`}
                >
                  {it.label}
                </Link>
              </li>
            );
          })}
          <li>
            <Button
              href="/contact"
              className={`rounded-full px-[18px] py-[9px] transition-all ${
                isActive(pathname, "/contact")
                  ? "rounded-full border-accent bg-white text-[#0b0b0b]"
                  : "rounded-md border-white/40 bg-accent text-[#4CE0FF] hover:border-white hover:bg-[#4CE0FF]"
              }`}
            >
              Contact
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

/** Mobile sticky tab bar — 5 columns, 2px indicator on top of active. */
export function MobileTabBar() {
  const pathname = usePathname();
  const tabs = [...ITEMS, { href: "/contact", label: "Contact" }];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-[var(--line)] bg-s0/95 backdrop-blur md:hidden">
      {tabs.map((it) => {
        const active = isActive(pathname, it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            onClick={playClick}
            className={`mono flex min-h-[52px] flex-col items-center justify-center gap-1 border-t-2 px-1 py-[14px] text-[9.5px] uppercase tracking-[0.14em] ${
              active ? "border-accent text-white" : "border-transparent text-[var(--t-muted)]"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
