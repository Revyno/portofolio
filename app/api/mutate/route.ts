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
    switch (action) {
      case "createProject":
        return Response.json({ projects: await db.createProject(a) });
      case "updateProject":
        return Response.json({ projects: await db.updateProject(a.id as string, a) });
      case "deleteProject":
        return Response.json({ projects: await db.deleteProject(a.id as string) });
      case "toggleProjectPublished":
        return Response.json({ projects: await db.toggleProjectPublished(a.id as string) });
      case "moveProject":
        return Response.json({ projects: await db.moveProject(a.id as string, a.dir as -1 | 1) });
      case "unpublishAll":
        return Response.json({ projects: await db.unpublishAll() });
      case "resetToSeed":
        return Response.json(await db.resetToSeed());

      case "updateProfile":
        return Response.json({ profile: await db.updateProfile(a) });

      case "saveJourney":
        return Response.json({ journey: await db.saveJourney(a) });
      case "deleteJourney":
        return Response.json({ journey: await db.deleteJourney(a.id as string) });
      case "toggleJourneyPublished":
        return Response.json({ journey: await db.toggleJourneyPublished(a.id as string) });

      case "saveCertificate":
        return Response.json({ certificates: await db.saveCertificate(a) });
      case "deleteCertificate":
        return Response.json({ certificates: await db.deleteCertificate(a.id as string) });
      case "toggleCertificatePublished":
        return Response.json({ certificates: await db.toggleCertificatePublished(a.id as string) });

      case "addMedia":
        return Response.json({ media: await db.addMedia(a.url as string, (a.caption as string) ?? "") });
      case "deleteMedia":
        return Response.json({ media: await db.deleteMedia(a.id as string) });

      case "addCvVersion":
        return Response.json({
          cvVersions: await db.addCvVersion(a.name as string, a.sizeBytes as number, (a.url as string) ?? null),
        });
      case "restoreCvVersion":
        return Response.json({ cvVersions: await db.restoreCvVersion(a.id as string) });
      case "deleteCvVersion":
        return Response.json({ cvVersions: await db.deleteCvVersion(a.id as string) });

      default:
        return Response.json({ error: `unknown action: ${action}` }, { status: 400 });
    }
  } catch (e) {
    console.error("[api/mutate]", action, e);
    return Response.json({ error: (e as Error).message, stack: (e as Error).stack }, { status: 500 });
  }
}
