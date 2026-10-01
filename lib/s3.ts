import "server-only";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * S3 presigned-upload helper. The browser PUTs the file straight to S3 using a
 * short-lived signed URL (see /api/upload) — bytes never pass through our server
 * or Neon, so there's no request-body size ceiling and the DB only stores the
 * final public URL.
 *
 * Required env: AWS_REGION, S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.
 * Optional: S3_PUBLIC_URL (CDN / custom domain in front of the bucket).
 */
const region = process.env.AWS_REGION;
const bucket = process.env.S3_BUCKET;

export function s3Configured(): boolean {
  return Boolean(region && bucket && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

let _client: S3Client | undefined;
function client(): S3Client {
  if (!_client) {
    _client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return _client;
}

// Where the object is readable once uploaded: a CDN/custom domain if set,
// else the bucket's virtual-hosted S3 URL.
const publicBase = (process.env.S3_PUBLIC_URL || `https://${bucket}.s3.${region}.amazonaws.com`).replace(/\/$/, "");

export async function presignPut(key: string, contentType: string): Promise<{ uploadUrl: string; publicUrl: string }> {
  const uploadUrl = await getSignedUrl(
    client(),
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: 60 },
  );
  return { uploadUrl, publicUrl: `${publicBase}/${key}` };
}
