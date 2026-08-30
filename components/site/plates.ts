/**
 * Baroque art plates — the two darkened paintings behind the hero and the
 * footer. Decorative layout, not CMS content: they live in /public so they can
 * be `priority`-loaded without a round-trip through the store.
 *
 * Both sources are public-domain paintings (a reworked "Creation of Adam" and a
 * Baroque ceiling fresco); see docs/prd-hero-footer-cinematic.md §4.
 *
 * PRD O1 — to swap which painting goes where, swap these two lines. Nothing
 * else in the codebase names the files.
 */
export const PLATES = {
  hero: {
    src: "/assets/art/hero-plate.jpg",
    /** object-position: desktop crop, then the tighter phone crop. Both keep
     *  the two almost-touching hands (the painting's focal gesture) in frame. */
    focal: "50% 46%",
    focalMobile: "36% 46%",
  },
  footer: {
    src: "/assets/art/footer-plate.jpg",
    focal: "50% 46%",
    focalMobile: "50% 48%",
  },
} as const;
