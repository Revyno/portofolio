// Minimal typings for the Web Speech API (not in TS lib.dom by default).
interface SpeechRecognitionResultLike {
  0: { transcript: string };
  isFinal: boolean;
}
interface SpeechRecognitionEventLike {
  results: ArrayLike<SpeechRecognitionResultLike>;
}
interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSTTSupported(): boolean {
  return getCtor() !== null;
}

export interface ListenHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface ListenHandle {
  stop(): void;
}

/** Start a single dictation session. Returns a handle to stop early. */
export function listen(h: ListenHandlers): ListenHandle | null {
  const Ctor = getCtor();
  if (!Ctor) return null;

  const rec = new Ctor();
  rec.lang = "id-ID";
  rec.continuous = false;
  rec.interimResults = true;

  rec.onresult = (e) => {
    const last = e.results[e.results.length - 1];
    if (last) h.onResult(last[0].transcript, last.isFinal);
  };
  rec.onend = () => h.onEnd?.();
  rec.onerror = (e) => h.onError?.(e.error);

  rec.start();
  return { stop: () => rec.stop() };
}
