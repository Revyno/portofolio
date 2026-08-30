import { redirect } from "next/navigation";

// Merged into the single-page landing. Keep the URL alive → jump to #contact.
export default function ContactRedirect() {
  redirect("/#contact");
}
