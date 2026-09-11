import { test, expect, type Page } from "@playwright/test";

/**
 * Overall responsiveness + smoke suite for the single-page portfolio.
 * Runs once per viewport project (mobile / tablet / desktop, see config).
 *
 * The site is one page (`/`); every legacy route 307s into an anchor of it,
 * so the anchored sections are what we assert. Detail pages (/projects/[slug])
 * are the only other rendered route.
 *
 * NOTE ON LOADING: this page runs GSAP tickers, a Chakra marquee and (gated)
 * a 3D assistant, so the network never goes idle. `networkidle` would hang —
 * we wait on `domcontentloaded` plus a concrete element instead.
 */

const SLUG = "feasstid"; // a published project — see /api/content

async function open(page: Page, path = "/") {
  await page.goto(path, { waitUntil: "domcontentloaded" });
}

/** Fail a test if the page throws an uncaught error while we drive it. */
function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return errors;
}

/** Drive the whole page so lazy/animated sections mount and layout settles. */
async function scrollThrough(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(150);
}

/**
 * The honest horizontal-overflow signal: does the *document* scroll sideways?
 * `scrollWidth > clientWidth` catches a stray fixed width, an un-wrapped flex
 * row, or an image without max-width. It deliberately does NOT use per-element
 * bounding boxes — a marquee/carousel track is meant to be wider than the
 * viewport and is clipped by an `overflow:hidden` ancestor, so its box pokes
 * out without ever scrolling the page. When the page does overflow, we name the
 * true culprit (an element wide past the viewport with no clipping ancestor).
 */
async function expectNoHorizontalOverflow(page: Page) {
  const width = page.viewportSize()!.width;
  const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  if (scrollW > width + 2) {
    const culprit = await realOverflower(page);
    expect(
      scrollW,
      `page scrolls sideways: scrollWidth ${scrollW}px > viewport ${width}px. Widest unclipped culprit: ${JSON.stringify(culprit)}`,
    ).toBeLessThanOrEqual(width + 2);
  }
  expect(scrollW).toBeLessThanOrEqual(width + 2);
}

/** Widest element past the viewport that has NO horizontally-clipping ancestor. */
async function realOverflower(page: Page) {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el: Element) => {
      let p = el.parentElement;
      while (p) {
        const ox = getComputedStyle(p).overflowX;
        if (ox === "hidden" || ox === "clip" || ox === "auto" || ox === "scroll") return true;
        p = p.parentElement;
      }
      return false;
    };
    let worst: { tag: string; cls: string; right: number } | null = null;
    for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.right > vw + 2 && !clipped(el) && (!worst || r.right > worst.right)) {
        worst = { tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0, 80) ?? "", right: Math.round(r.right) };
      }
    }
    return worst;
  });
}

test.describe("landing page", () => {
  test("loads with the hero heading and no page errors", async ({ page }) => {
    const errors = trackPageErrors(page);
    await open(page);
    await expect(page.locator("#home h1")).toContainText("Revellio");
    expect(errors, `uncaught page errors:\n${errors.join("\n")}`).toEqual([]);
  });

  test("all anchor sections are present", async ({ page }) => {
    await open(page);
    for (const id of ["home", "work", "about", "journey", "contact"]) {
      await expect(page.locator(`#${id}`)).toBeAttached();
    }
  });

  test("no horizontal overflow at any viewport", async ({ page }) => {
    await open(page);
    await expect(page.locator("#home h1")).toBeVisible();
    await scrollThrough(page);
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("navigation", () => {
  test("shows the right nav for the viewport", async ({ page }) => {
    await open(page);
    await expect(page.locator("#home h1")).toBeVisible();
    const mobile = page.viewportSize()!.width < 768;
    const tabBar = page.locator("nav.fixed.bottom-0");

    if (mobile) {
      await expect(tabBar).toBeVisible();
      await expect(page.locator("header").first()).toBeHidden();
    } else {
      await expect(page.locator("header").first()).toBeVisible();
      await expect(page.locator("header nav").getByText("Contact", { exact: true })).toBeVisible();
      await expect(tabBar).toBeHidden();
    }
  });

  test("nav item scrolls to its section", async ({ page }) => {
    await open(page);
    await expect(page.locator("#home h1")).toBeVisible();
    const mobile = page.viewportSize()!.width < 768;
    const scope = mobile ? page.locator("nav.fixed.bottom-0") : page.locator("header nav");

    await scope.getByText("Journey", { exact: true }).click();

    // Smooth-scroll settles asynchronously — poll instead of a fixed wait.
    await expect
      .poll(
        () =>
          page.locator("#journey").evaluate((el) => {
            const r = el.getBoundingClientRect();
            return r.top < window.innerHeight && r.bottom > 0;
          }),
        { timeout: 6000 },
      )
      .toBe(true);
  });
});

test.describe("contact form", () => {
  test("renders every required field", async ({ page }) => {
    await open(page);
    await page.locator('[name="name"]').scrollIntoViewIfNeeded();
    for (const name of ["name", "email", "company", "type", "budget", "timeline", "message"]) {
      await expect(page.locator(`[name="${name}"]`)).toBeAttached();
    }
    await expect(page.getByRole("button", { name: /send brief/i })).toBeVisible();
  });

  test("email field is a required email input", async ({ page }) => {
    await open(page);
    const email = page.locator('[name="email"]');
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("required", "");
  });
});

test.describe("FAQ accordion", () => {
  test("opens an item on click", async ({ page }) => {
    await open(page);
    const first = page.locator("details.faq").first();
    await first.scrollIntoViewIfNeeded();
    await expect(first).not.toHaveAttribute("open", "");
    await first.locator("summary").click();
    await expect(first).toHaveAttribute("open", "");
  });
});

test.describe("project detail page", () => {
  test("loads and stays within the viewport", async ({ page }) => {
    const errors = trackPageErrors(page);
    const res = await page.goto(`/projects/${SLUG}`, { waitUntil: "domcontentloaded" });
    expect(res?.status(), "detail page should be reachable").toBeLessThan(400);
    await page.locator("body").waitFor();
    await scrollThrough(page);
    await expectNoHorizontalOverflow(page);
    expect(errors, `page errors:\n${errors.join("\n")}`).toEqual([]);
  });
});

test.describe("legacy routes", () => {
  test("/projects, /about, /journey, /contact redirect into the landing page", async ({ page }) => {
    for (const path of ["/projects", "/about", "/journey", "/contact"]) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await expect(page).toHaveURL(/\/(#|$)/);
    }
  });
});
