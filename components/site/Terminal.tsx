"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Terminal as XTerm } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

type Line =
  | { kind: "cmd"; text: string }
  | { kind: "comment"; text: string }
  | { kind: "out"; text: string }
  | { kind: "ok"; text: string };

const ACCENT = "\x1b[38;2;76;224;255m";
const WHITE = "\x1b[38;2;255;255;255m";
const POS = "\x1b[38;2;124;255;178m";
const GHOST = "\x1b[38;2;115;115;115m";
const DANGER = "\x1b[38;2;255;107;107m";
const R = "\x1b[0m";

const reduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function type(term: XTerm, text: string, ms = 14) {
  for (const ch of text) {
    term.write(ch);
    await wait(ms + Math.random() * 12);
  }
}

const ROUTES: Record<string, string> = {
  projects: "/projects",
  about: "/about",
  journey: "/journey",
  contact: "/contact",
  home: "/",
};

async function play(term: XTerm, lines: Line[]) {
  for (const l of lines) {
    if (l.kind === "cmd") {
      term.write(`${ACCENT}$ ${R}${WHITE}`);
      await type(term, l.text);
      term.write(`${R}\r\n`);
    } else if (l.kind === "comment") {
      term.write(`${GHOST}# ${l.text}${R}\r\n`);
      await wait(90);
    } else if (l.kind === "ok") {
      await wait(160);
      term.write(`${POS}${l.text}${R}\r\n`);
    } else {
      await wait(120);
      term.write(`${l.text}\r\n`);
    }
    await wait(90);
  }
}

/**
 * xterm.js-backed terminal. Plays `lines` once on scroll-into-view, then
 * drops into an interactive prompt: type a route name (work, about, ...)
 * to navigate, `help` for commands, `ls` to list routes, `clear` to wipe.
 * ponytail: no persistence across mounts; history lives in component state.
 */
export function Terminal({
  lines,
  cursor = true,
  href,
}: {
  lines: Line[];
  cursor?: boolean;
  /** Hint shown by `help` as the "main" destination. */
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const termRef = useRef<XTerm | null>(null);
  const playedRef = useRef(false);
  const inputRef = useRef("");
  const histRef = useRef<string[]>([]);
  const histIdxRef = useRef<number>(-1);
  const [router] = useState(useRouter());

  const writePrompt = useCallback((t: XTerm) => {
    t.write(`\r\n${ACCENT}$ ${R}`);
  }, []);

  const runCmd = useCallback(
    (t: XTerm, raw: string) => {
      const cmd = raw.trim();
      if (!cmd) {
        writePrompt(t);
        return;
      }
      histRef.current.push(cmd);
      histIdxRef.current = histRef.current.length;

      const [name, ...args] = cmd.split(/\s+/);
      const arg = args[0];

      if (name === "help") {
        t.write(`${GHOST}commands:${R}\r\n`);
        t.write("  projects, about, journey, contact, home   navigate\r\n");
        t.write("  ls                                     list routes\r\n");
        t.write("  clear                                  clear screen\r\n");
        t.write("  help                                   this list\r\n");
        if (href) t.write(`  → try: ${href.replace("/", "") || "home"}\r\n`);
      } else if (name === "ls") {
        t.write("projects   about   journey   contact   home\r\n");
      } else if (name === "clear") {
        t.clear();
      } else if (ROUTES[name]) {
        const path = arg && ROUTES[arg] ? ROUTES[arg] : ROUTES[name];
        t.write(`${POS}→ ${path}${R}\r\n`);
        setTimeout(() => router.push(path), 280);
        return;
      } else if (name === "cd" && arg && ROUTES[arg]) {
        t.write(`${POS}→ ${ROUTES[arg]}${R}\r\n`);
        setTimeout(() => router.push(ROUTES[arg]), 280);
        return;
      } else if (name === "open" && arg && ROUTES[arg]) {
        t.write(`${POS}→ ${ROUTES[arg]}${R}\r\n`);
        setTimeout(() => router.push(ROUTES[arg]), 280);
        return;
      } else if (name.startsWith("/")) {
        const path = name;
        t.write(`${POS}→ ${path}${R}\r\n`);
        setTimeout(() => router.push(path), 280);
        return;
      } else {
        t.write(`${DANGER}command not found: ${name}${R}  ${GHOST}(type 'help')${R}\r\n`);
      }
      writePrompt(t);
    },
    [href, router, writePrompt],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const term = new XTerm({
      convertEol: true,
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: 12.5,
      lineHeight: 1.4,
      cursorBlink: cursor,
      cols: 92,
      rows: 16,
      theme: {
        background: "#0e0e0e",
        foreground: "rgba(255,255,255,0.62)",
        cursor: "#4ce0ff",
      },
    });
    termRef.current = term;
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(el);
    fit.fit(); // size cols/rows to the container — no fixed 92-col overflow on mobile

    const ro = new ResizeObserver(() => {
      try {
        fit.fit();
      } catch {
        /* element detached mid-resize */
      }
    });
    ro.observe(el);

    const onData = (data: string) => {
      const t = termRef.current;
      if (!t) return;
      const code = data.charCodeAt(0);

      if (code === 13) {
        const cmd = inputRef.current;
        inputRef.current = "";
        t.write("\r\n");
        runCmd(t, cmd);
      } else if (code === 127) {
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1);
          t.write("\b \b");
        }
      } else if (code === 27) {
        const k = data.slice(1);
        if (k === "[A") {
          if (histRef.current.length === 0) return;
          histIdxRef.current = Math.max(0, histIdxRef.current - 1);
          const prev = histRef.current[histIdxRef.current] ?? "";
          while (inputRef.current.length > 0) {
            inputRef.current = inputRef.current.slice(0, -1);
            t.write("\b \b");
          }
          inputRef.current = prev;
          t.write(prev);
        } else if (k === "[B") {
          if (histRef.current.length === 0) return;
          histIdxRef.current = Math.min(histRef.current.length, histIdxRef.current + 1);
          const next = histRef.current[histIdxRef.current] ?? "";
          while (inputRef.current.length > 0) {
            inputRef.current = inputRef.current.slice(0, -1);
            t.write("\b \b");
          }
          inputRef.current = next;
          t.write(next);
        }
      } else if (code === 9) {
        const names = Object.keys(ROUTES).filter((n) => n.startsWith(inputRef.current));
        if (names.length === 1) {
          const rest = names[0].slice(inputRef.current.length);
          inputRef.current += rest;
          t.write(rest);
        } else if (names.length > 1) {
          t.write(`\r\n${names.join("   ")}\r\n`);
          t.write(`${ACCENT}$ ${R}${inputRef.current}`);
        }
      } else if (code >= 32 && code < 127) {
        inputRef.current += data;
        t.write(data);
      }
    };

    const run = async () => {
      if (playedRef.current) return;
      playedRef.current = true;
      if (reduced()) {
        for (const l of lines) {
          if (l.kind === "cmd") term.write(`${ACCENT}$ ${R}${WHITE}${l.text}${R}\r\n`);
          else if (l.kind === "comment") term.write(`${GHOST}# ${l.text}${R}\r\n`);
          else if (l.kind === "ok") term.write(`${POS}${l.text}${R}\r\n`);
          else term.write(`${l.text}\r\n`);
        }
        term.write(`${GHOST}— type a route name, '/help', or 'ls'. ↑↓ for history.${R}\r\n`);
        writePrompt(term);
        term.onData(onData);
      } else {
        await play(term, lines);
        term.write(`\r\n${GHOST}— type a route name, '/help', or 'ls'. ↑↓ for history.${R}`);
        writePrompt(term);
        term.onData(onData);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            void run();
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      ro.disconnect();
      term.dispose();
      termRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mono border border-[var(--line-box)] bg-s1 p-3 text-[12.5px]">
      <div ref={ref} className="h-[300px] w-full" />
    </div>
  );
}

/** Simple code snippet in the same skin. */
export function Code({ code }: { code: string }) {
  return (
    <pre className="mono scroll-thin overflow-x-auto border border-[var(--line-box)] bg-s1 p-6 text-[12.5px] leading-[1.9] text-[var(--t-body)]">
      {code}
    </pre>
  );
}
