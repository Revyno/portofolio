import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/data";
import { pad } from "@/lib/data";

/** Selected-work row — grid: number, name+desc, stack, metric+year, arrow. Hover accent 5%. */
export function ProjectRow({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group grid grid-cols-[40px_1fr_auto] items-center gap-3 border-b border-[var(--line)] px-0 py-6 transition-colors hover:bg-[var(--accent-hover)] md:grid-cols-[80px_3.2fr_1.6fr_1.3fr_60px] md:gap-6 md:px-3"
    >
      <div className="mono text-[13px] text-[var(--t-muted)]">{pad(project.sortIndex + 1)}</div>
      <div>
        <div className="text-[16px] font-bold leading-[1.1] tracking-[-0.03em] text-white md:text-[30px]">
          {project.name}
        </div>
        <div className="mt-1 text-[13.5px] text-[var(--t-body)]">{project.description}</div>
      </div>
      <div className="mono hidden text-[10px] uppercase tracking-[0.14em] text-[var(--t-muted)] md:block">
        {project.stack}
      </div>
      <div className="mono hidden text-[11px] md:block">
        <span className="text-accent">{project.metric}</span>
        <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">
          {project.tag} · {project.year}
        </div>
      </div>
      <div className="mono self-start text-right text-accent transition-transform group-hover:translate-x-1 md:self-center">
        →
      </div>
    </Link>
  );
}

/** Work grid card. Border right+bottom, space-between layout. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex min-h-[172px] flex-col justify-between border-b border-l border-[var(--line)] p-5 transition-colors hover:bg-[var(--accent-hover)] md:min-h-[250px]"
    >
      <div className="flex items-start justify-between">
        <span className="mono text-[11px] text-[var(--t-muted)]">{pad(project.sortIndex + 1)}</span>
        <span className="mono border border-[var(--line-box)] px-2 py-1 text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
          {project.tag}
        </span>
      </div>
      <div className="relative my-4 aspect-[4/3] w-full overflow-hidden border border-[var(--line-box)]">
        {project.coverUrl && (
          <Image
            src={project.coverUrl}
            alt={project.name}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        )}
      </div>
      <div>
        <div className="text-[16px] font-bold leading-[1.12] tracking-[-0.028em] text-white md:text-[24px]">
          {project.name}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-[var(--line)] pt-3">
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-accent">
            {project.metric}
          </span>
          <span className="mono text-[10px] uppercase tracking-[0.14em] text-[var(--t-label)]">
            {project.year}
          </span>
        </div>
      </div>
    </Link>
  );
}
