/** Architecture diagram — hairline boxes + 1px accent connectors, node highlight = accent border + wash. */

function Node({ label, sub, hot = false }: { label: string; sub: string; hot?: boolean }) {
  return (
    <div className={`flex-1 border p-4 ${hot ? "border-accent bg-[var(--accent-wash)]" : "border-[var(--line-diagram)]"}`}>
      <div className="text-[14px] text-white">{label}</div>
      <div className="mono mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)]">{sub}</div>
    </div>
  );
}
function Arrow() {
  return (
    <div className="mono hidden self-center px-3 text-accent md:block" aria-hidden>
      →
    </div>
  );
}
function Down() {
  return (
    <div className="mono py-1 text-center text-accent md:hidden" aria-hidden>
      ↓
    </div>
  );
}

function Row({ nodes }: { nodes: { label: string; sub: string; hot?: boolean }[] }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
      {nodes.map((n, i) => (
        <div key={n.label} className="contents">
          <Node {...n} />
          {i < nodes.length - 1 && (
            <>
              <Arrow />
              <Down />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function Diagram() {
  return (
    <div className="border border-[var(--line-box)] bg-s1 p-6">
      <Row
        nodes={[
          { label: "Browser", sub: "RSC · ISR" },
          { label: "Route Handler", sub: "edge · cache 60s", hot: true },
          { label: "Neon Postgres", sub: "scale-to-zero" },
        ]}
      />
      <div className="mono py-1 text-center text-accent" aria-hidden>
        ↓
      </div>
      <Row
        nodes={[
          { label: "CMS mutation", sub: "POST /api/projects" },
          { label: "revalidateTag", sub: "'content'", hot: true },
          { label: "Vercel Blob", sub: "images · pdf" },
        ]}
      />
    </div>
  );
}
