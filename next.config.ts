import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project. Without this, a stray
    // C:\package-lock.json makes Next infer C:\ as the root and compile
    // an unrelated C:\middleware.ts, which broke the build.
    root: __dirname,
  },
};

export default nextConfig;
