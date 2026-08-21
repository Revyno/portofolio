// Minimal shim for the `framer` runtime, so a vendored Framer module
// (LiquidMorphButton) runs inside this app without the heavy `framer` package.
// ponytail: covers only what LiquidMorphButton.js touches. Extend if a future
// vendored component uses more of the framer API.

// Property controls are editor-only metadata — no-op at runtime.
export function addPropertyControls() {}

// ControlType keys are only read by addPropertyControls; any value works.
export const ControlType = new Proxy({}, { get: (_t, k) => k });

// Component checks `RenderTarget.current() === RenderTarget.thumbnail` to skip
// animation on static thumbnails. Return a non-thumbnail target so it animates.
export const RenderTarget = {
  canvas: "CANVAS",
  export: "EXPORT",
  preview: "PREVIEW",
  thumbnail: "THUMBNAIL",
  current: () => "PREVIEW",
};
