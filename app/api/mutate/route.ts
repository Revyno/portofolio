import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import * as db from "@/lib/db";
import { isAdmin } from "@/lib/admin";

/**
 * Single mutation dispatcher. Body: { action, args }.
 * Each action maps 1:1 to a lib/db function and returns the affected slice,
 * so the client store can reconcile its optimistic update with server truth.
 * ponytail: no auth yet (M2 scope was DB wiring). Gate this route behind the
 * single-admin check before deploy — see PRD §8.
 */
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return Response.json({ error: "unauthorized" }, { status: 403 });
  }

  let body: { action?: string; args?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const { action, args } = body;
  const a = (args ?? {}) as Record<string, unknown>;

  try {
    let result: unknown;
    switch (action) {
      case "createProject":
        result = { projects: await db.createProject(a) };
        break;
      case "updateProject":
        result = { projects: await db.updateProject(a.id as string, a) };
        break;
      case "deleteProject":
        result = { projects: await db.deleteProject(a.id as string) };
        break;
      case "toggleProjectPublished":
        result = { projects: await db.toggleProjectPublished(a.id as string) };
        break;
      case "moveProject":
        result = { projects: await db.moveProject(a.id as string, a.dir as -1 | 1) };
        break;
      case "unpublishAll":
        result = { projects: await db.unpublishAll() };
        break;
      case "resetToSeed":
        result = await db.resetToSeed();
        break;

      case "updateProfile":
        result = { profile: await db.updateProfile(a) };
        break;

      case "saveJourney":
        result = { journey: await db.saveJourney(a) };
        break;
      case "deleteJourney":
        result = { journey: await db.deleteJourney(a.id as string) };
        break;
      case "toggleJourneyPublished":
        result = { journey: await db.toggleJourneyPublished(a.id as string) };
        break;

      case "saveCertificate":
        result = { certificates: await db.saveCertificate(a) };
        break;
      case "deleteCertificate":
        result = { certificates: await db.deleteCertificate(a.id as string) };
        break;
      case "toggleCertificatePublished":
        result = { certificates: await db.toggleCertificatePublished(a.id as string) };
        break;

      case "addMedia":
        result = { media: await db.addMedia(a.url as string, (a.caption as string) ?? "") };
        break;
      case "deleteMedia":
        result = { media: await db.deleteMedia(a.id as string) };
        break;

      case "addCvVersion":
        result = {
          cvVersions: await db.addCvVersion(a.name as string, a.sizeBytes as number, (a.url as string) ?? null),
        };
        break;
      case "restoreCvVersion":
        result = { cvVersions: await db.restoreCvVersion(a.id as string) };
        break;
      case "deleteCvVersion":
        result = { cvVersions: await db.deleteCvVersion(a.id as string) };
        break;

      default:
        return Response.json({ error: `unknown action: ${action}` }, { status: 400 });
    }
    revalidateTag("content", "max"); // stale-while-revalidate; Route Handlers can't use updateTag
    return Response.json(result);
  } catch (e) {
    console.error("[api/mutate]", action, e);
    return Response.json({ error: (e as Error).message, stack: (e as Error).stack }, { status: 500 });
  }
}
