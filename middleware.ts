import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected: the CMS UI and every write. /api/content (reads) stays public so
// the public site can hydrate without a session.
const isProtected = createRouteMatcher(["/cms(.*)", "/api/mutate(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  // Skip Next internals and static files; run on everything else + API.
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ico|woff2?|ttf|mp3|pdf)).*)", "/(api|trpc)(.*)"],
};
