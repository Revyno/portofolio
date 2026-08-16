export type AssistantState = "idle" | "thinking" | "speaking" | "listening" | "error";

export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  text: string;
}

/** AI provider abstraction — swap the implementation without touching the UI. */
export interface AIProvider {
  readonly name: string;
  send(history: Message[], input: string): Promise<string>;
}

/** Shared mutable animation channel written by TTS, read by the VRM render loop. */
export interface Signals {
  /** Mouth openness 0..1, driven while speaking. */
  mouth: number;
}
