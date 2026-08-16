"use client";

import { useEffect, useRef } from "react";
import { useAssistant } from "./assistant-store";

export function ChatMessages() {
  const { messages, status } = useAssistant();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  return (
    <div
      className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm"
      role="log"
      aria-live="polite"
      aria-label="Riwayat percakapan"
    >
      {messages.map((m) => (
        <div
          key={m.id}
          className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
        >
          <span
            className={`max-w-[80%] rounded-2xl px-3 py-2 leading-snug backdrop-blur-sm ${
              m.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white/90 text-neutral-900 rounded-bl-sm dark:bg-neutral-800/85 dark:text-white"
            }`}
          >
            {m.text}
          </span>
        </div>
      ))}

      {status === "thinking" && (
        <div className="flex justify-start" aria-label="Asisten sedang mengetik">
          <span className="rounded-2xl rounded-bl-sm bg-black/5 dark:bg-white/10 px-3 py-2">
            <span className="inline-flex gap-1">
              <Dot /> <Dot delay="150ms" /> <Dot delay="300ms" />
            </span>
          </span>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function Dot({ delay = "0ms" }: { delay?: string }) {
  return (
    <span
      className="h-1.5 w-1.5 rounded-full bg-current opacity-50 animate-bounce"
      style={{ animationDelay: delay }}
    />
  );
}
