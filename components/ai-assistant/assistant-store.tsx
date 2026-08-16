"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { createProvider } from "./ai-provider";
import { speak, type SpeakHandle } from "./tts";
import type { AssistantState, Message, Signals } from "./types";

interface State {
  open: boolean;
  mounted: boolean; // VRM stays mounted after first open (avoid reloading 15MB)
  status: AssistantState;
  messages: Message[];
}

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_STATUS"; status: AssistantState }
  | { type: "ADD"; message: Message }
  | { type: "CLEAR" };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "OPEN":
      return { ...s, open: true, mounted: true };
    case "CLOSE":
      return { ...s, open: false };
    case "SET_STATUS":
      return { ...s, status: a.status };
    case "ADD":
      return { ...s, messages: [...s.messages, a.message] };
    case "CLEAR":
      return { ...s, messages: [], status: "idle" };
  }
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  text: "Halo! Saya adalah asisten AI yang siap membantu Anda. Jangan ragu untuk bertanya apa saja.",
};

interface AssistantContext extends State {
  signals: Signals; // live channel for the VRM render loop (not React state)
  open: boolean;
  openWindow(): void;
  closeWindow(): void;
  send(text: string): void;
  clear(): void;
  setStatus(status: AssistantState): void;
}

const Ctx = createContext<AssistantContext | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    open: false,
    mounted: false,
    status: "idle",
    messages: [GREETING],
  });

  const provider = useMemo(() => createProvider(), []);
  const signalsRef = useRef<Signals>({ mouth: 0 });
  const messagesRef = useRef<Message[]>(state.messages);
  const speakingRef = useRef<SpeakHandle | null>(null);
  messagesRef.current = state.messages;

  const setStatus = useCallback(
    (status: AssistantState) => dispatch({ type: "SET_STATUS", status }),
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const input = text.trim();
      if (!input) return;

      dispatch({
        type: "ADD",
        message: { id: crypto.randomUUID(), role: "user", text: input },
      });
      dispatch({ type: "SET_STATUS", status: "thinking" });

      try {
        const reply = await provider.send(messagesRef.current, input);
        dispatch({
          type: "ADD",
          message: { id: crypto.randomUUID(), role: "assistant", text: reply },
        });
        dispatch({ type: "SET_STATUS", status: "speaking" });
        speakingRef.current = speak(reply, signalsRef.current);
        await speakingRef.current.done;
        dispatch({ type: "SET_STATUS", status: "idle" });
      } catch {
        dispatch({ type: "SET_STATUS", status: "error" });
        setTimeout(() => dispatch({ type: "SET_STATUS", status: "idle" }), 2500);
      }
    },
    [provider, setStatus],
  );

  const clear = useCallback(() => {
    speakingRef.current?.cancel();
    dispatch({ type: "CLEAR" });
    dispatch({ type: "ADD", message: GREETING });
  }, []);

  const openWindow = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeWindow = useCallback(() => {
    speakingRef.current?.cancel();
    dispatch({ type: "CLOSE" });
  }, []);

  // Stop any speech synthesis if the whole widget unmounts.
  useEffect(() => () => speakingRef.current?.cancel(), []);

  const value: AssistantContext = {
    ...state,
    signals: signalsRef.current,
    openWindow,
    closeWindow,
    send,
    clear,
    setStatus,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAssistant(): AssistantContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAssistant must be used within <AssistantProvider>");
  return ctx;
}
