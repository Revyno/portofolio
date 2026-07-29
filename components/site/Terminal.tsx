type Line =
  | { kind: "cmd"; text: string }
  | { kind: "comment"; text: string }
  | { kind: "out"; text: string }
  | { kind: "ok"; text: string };

/** Terminal / code block — Surface 1, mono, $ prompt accent, positive output green. */
export function Terminal({ lines, cursor = true }: { lines: Line[]; cursor?: boolean }) {
  return (
    <div className="mono border border-[var(--line-box)] bg-s1 p-6 text-[12.5px] leading-[1.85]">
      {lines.map((l, i) => {
        if (l.kind === "cmd")
          return (
            <div key={i} className="text-white">
              <span className="text-accent">$ </span>
              {l.text}
            </div>
          );
        if (l.kind === "comment")
          return (
            <div key={i} className="text-[var(--t-ghost)]">
              # {l.text}
            </div>
          );
        if (l.kind === "ok")
          return (
            <div key={i} className="text-positive">
              {l.text}
            </div>
          );
        return (
          <div key={i} className="text-[var(--t-body)]">
            {l.text}
          </div>
        );
      })}
      {cursor && <div className="cursor text-white" />}
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
