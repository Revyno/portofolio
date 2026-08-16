"use client";

import dynamic from "next/dynamic";
import { AssistantButton } from "./AssistantButton";
import { AssistantProvider, useAssistant } from "./assistant-store";
import { AssistantWindow } from "./AssistantWindow";
import { Z_INDEX } from "./config";

// Three.js/VRM is client-only and heavy — load its chunk on first open, not on
// initial page load. `ssr: false` keeps WebGL out of the server render.
const VRMCharacter = dynamic(() => import("./VRMCharacter"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center text-xs opacity-50">
      Memuat karakter…
    </div>
  ),
});

function Widget() {
  const { open, mounted } = useAssistant();

  return (
    <div
      className="fixed flex flex-col items-end gap-3"
      style={{ bottom: 20, right: 20, zIndex: Z_INDEX }}
    >
      {/* `mounted` flips true on first open and stays — avoids reloading the VRM. */}
      <AssistantWindow vrmSlot={mounted ? <VRMCharacter /> : null} />
      <AssistantButton hidden={open} />
    </div>
  );
}

export function AIAssistant() {
  return (
    <AssistantProvider>
      <Widget />
    </AssistantProvider>
  );
}

export default AIAssistant;
