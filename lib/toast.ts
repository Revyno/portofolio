"use client";

/** Minimal toast bus — accent pill, auto-hides after 2.2s (DESIGN §5, AC6). */
import { useSyncExternalStore } from "react";

export type Toast = { id: number; text: string };
let current: Toast | null = null;
let seq = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | null = null;

function emit() {
  listeners.forEach((l) => l());
}

export function toast(text: string) {
  seq += 1;
  current = { id: seq, text };
  emit();
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    current = null;
    emit();
  }, 2200);
}

export function useToast(): Toast | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}
