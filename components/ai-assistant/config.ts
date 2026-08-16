// Public config (safe to expose). Secret keys must NOT use NEXT_PUBLIC_.
export const VRM_URL = process.env.NEXT_PUBLIC_VRM_URL || "/AvatarSample_C.vrm";

// Optional .vrma idle animation (VRM Animation format). When absent, a
// procedural relaxed pose + idle sway is used instead.
export const VRMA_URL = process.env.NEXT_PUBLIC_VRMA_URL || "";
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "true";

// Kept below typical navbar/modal ranges but above page content.
export const Z_INDEX = 9999;
