import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_ROLE } from "@/lib/site";

// Dynamic 1200×630 social card — Swiss / dark-minimal to match the site.
// Used for Open Graph + Twitter previews (generated at build, no asset needed).
export const alt = `${SITE_NAME} — ${SITE_ROLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b0b",
          color: "#ffffff",
          padding: 80,
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#9b9b9b" }}>
          Portfolio
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.05 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 34, color: "#d4a843", marginTop: 20 }}>{SITE_ROLE}</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
