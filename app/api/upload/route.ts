import type { NextRequest } from "next/server";
import { isAdmin } from "@/lib/admin";
import { presignPut, s3Configured } from "@/lib/s3";

// Server-only: AWS creds never reach the browser. The client calls this to get a
// short-lived presigned PUT URL, then uploads the file straight to S3.
export const dynamic = "force-dynamic";

// Sanity cap so a mis-click can't presign a giant object. S3 has no practical
// limit; this just bounds what the CMS will accept. Bump if you store video.
const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const UNSAFE = /[^a-zA-Z0-9._-]/g;

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "unauthorized" }, { status: 403 });
  if (!s3Configured()) {
    return Response.json(
      { error: "S3 not configured — set AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY" },
      { status: 503 },
    );
  }

  const { filename, contentType, size } = (await req.json().catch(() => ({}))) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };
  if (!filename || !contentType) {
    return Response.json({ error: "filename and contentType required" }, { status: 400 });
  }
  if (typeof size === "number" && size > MAX_BYTES) {
    return Response.json({ error: `File too large (max ${Math.round(MAX_BYTES / 1024 / 1024)} MB)` }, { status: 413 });
  }

  // Collision-proof key; keep a readable suffix of the original name.
  const safe = filename.replace(UNSAFE, "-").slice(-80);
  const key = `uploads/${new Date().getFullYear()}/${crypto.randomUUID()}-${safe}`;

  try {
    const { uploadUrl, publicUrl } = await presignPut(key, contentType);
    return Response.json({ uploadUrl, publicUrl });
  } catch (e) {
    console.error("[api/upload] presign failed", e);
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
