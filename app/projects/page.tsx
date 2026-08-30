import { redirect } from "next/navigation";

// Grid merged into the single-page landing (#work). Detail pages
// (/projects/[slug]) stay. Keep this URL alive → jump to #work.
export default function ProjectsRedirect() {
  redirect("/#work");
}
