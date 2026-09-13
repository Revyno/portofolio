/**
 * Intro-veil coordination. The decision "does a curtain run on this load?" is
 * made by an inline boot script in the root layout *before first paint* (see
 * VEIL_BOOT) and recorded as `veil-on` on <html>. Everything else reads that
 * class, so React, GSAP and the pre-hydration DOM never disagree.
 *
 * Not a "use client" module: VEIL_BOOT is imported by the server root layout,
 * so the string must stay a real value, not a client reference. The functions
 * below only touch browser globals when called, which is always client-side.
 */

export const VEIL_EVENT = "veil:done";
export const VEIL_KEY = "veil:seen";
export const VEIL_CLASS = "veil-on";

/**
 * Runs from the SSR'd HTML, at parse time, before first paint.
 *
 * It sits in the shared root layout, so it is emitted on every route — hence
 * the `pathname !== '/'` guard: only the landing page arms the curtain. Without
 * it, `html.veil-on { overflow:hidden }` would scroll-lock routes like /cms
 * that have no <PageVeil> to ever call markVeilDone().
 *
 * The curtain is `display: none` by default in CSS and only shown while
 * <html> carries `veil-on` — so the default is always "no curtain" and this
 * script opts in. That ordering matters: a client-side navigation back to the
 * landing page re-mounts <PageVeil> without re-running this script (it only
 * runs on a full document load), and the curtain must stay invisible in that
 * case rather than flashing black.
 *
 * Kept as one line of ES5 on purpose: it ships inline, unminified.
 */
export const VEIL_BOOT = `(function(){try{if(location.pathname!=='/')return;if(sessionStorage.getItem('${VEIL_KEY}')==='1')return;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;sessionStorage.setItem('${VEIL_KEY}','1');document.documentElement.classList.add('${VEIL_CLASS}');}catch(e){}})();`;

/** True while a curtain is still covering the page. */
export function veilPending(): boolean {
  return (
    typeof document !== "undefined" &&
    document.documentElement.classList.contains(VEIL_CLASS)
  );
}

/**
 * Re-arm the intro so the *next* landing visit replays the curtain. Just clears
 * the once-per-tab flag — VEIL_BOOT re-adds `veil-on` on the next load of `/`.
 * Used after relog (see the sign-in page): log back in, return to the site, and
 * the intro plays again instead of a cold hero.
 */
export function rearmVeil(): void {
  try { sessionStorage.removeItem(VEIL_KEY); } catch {}
}

/**
 * Replay the curtain now. Re-arms, then forces a full document load of `/` so
 * VEIL_BOOT runs before first paint — the same path the first visit takes, so
 * reduce-motion still opts out and there is no black flash. A plain SPA nav
 * would not re-run that inline script, hence the hard load. Reused by the logo.
 */
export function replayVeil(): void {
  if (typeof window === "undefined") return;
  rearmVeil();
  if (window.location.pathname === "/") {
    // Drop any #hash so we start at the hero, then reload() — a fragment-only
    // URL change (…/#work → …/) would scroll, not reload, and skip VEIL_BOOT.
    window.history.replaceState(null, "", "/");
    window.location.reload();
  } else {
    window.location.assign("/");
  }
}

/** Called by PageVeil once the panels are clear. */
export function markVeilDone(): void {
  document.documentElement.classList.remove(VEIL_CLASS);
  window.dispatchEvent(new Event(VEIL_EVENT));
}

/**
 * Run `fn` once the curtain is gone — immediately if none is running. Returns
 * an unsubscribe. The 3s failsafe covers a backgrounded tab where GSAP's
 * ticker is throttled: content must never stay hidden waiting on a curtain.
 */
export function onVeilDone(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  if (!veilPending()) {
    fn();
    return () => {};
  }
  let spent = false;
  const run = () => {
    if (spent) return;
    spent = true;
    window.removeEventListener(VEIL_EVENT, run);
    window.clearTimeout(timer);
    fn();
  };
  const timer = window.setTimeout(run, 3000);
  window.addEventListener(VEIL_EVENT, run, { once: true });
  return () => {
    spent = true;
    window.removeEventListener(VEIL_EVENT, run);
    window.clearTimeout(timer);
  };
}
