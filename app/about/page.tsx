import { redirect } from "next/navigation";

// Merged into the single-page landing. Keep the URL alive → jump to #about.
export default function AboutRedirect() {
  redirect("/#about");
}
