import { redirect } from "next/navigation";

// Merged into the single-page landing. Keep the URL alive → jump to #journey.
export default function JourneyRedirect() {
  redirect("/#journey");
}
