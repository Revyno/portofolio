"use client";

import { useRef, useState, type FormEvent } from "react";
import { useAssistant } from "./assistant-store";
import { VoiceInput } from "./VoiceInput";

export function ChatInput() {
  const { send, status } = useAssistant();
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const busy = status === "thinking" || status === "speaking";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    send(t);
    setText("");
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-2 p-2 text-white"
    >
      <VoiceInput onTranscript={(t) => send(t)} />
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask me something..."
        aria-label="Ketik pesan"
        className="min-w-0 flex-1 rounded-full bg-white/15 px-4 py-2 text-sm text-white placeholder:text-white/60 outline-none backdrop-blur-md focus:ring-2 focus:ring-blue-400"
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        aria-label="Kirim pesan"
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12l16-8-6 8 6 8-16-8Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            fill="currentColor"
          />
        </svg>
      </button>
    </form>
  );
}
