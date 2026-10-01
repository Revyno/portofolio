import type { NextConfig } from "next";

// Let next/image load uploaded media from S3 (and an optional CDN / custom
// domain in front of the bucket). Everything else stays blocked.
const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
];
try {
  if (process.env.S3_PUBLIC_URL) {
    remotePatterns.push({ protocol: "https", hostname: new URL(process.env.S3_PUBLIC_URL).hostname, pathname: "/**" });
  }
} catch {
  // malformed S3_PUBLIC_URL — the amazonaws pattern still applies.
}

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Without this, a stray
    // C:\package-lock.json makes Next infer C:\ as the root and compile
    // an unrelated C:\middleware.ts, which broke the build.
    root: __dirname,
  },
  images: { remotePatterns },
};

export default nextConfig;
