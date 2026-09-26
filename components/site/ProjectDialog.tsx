"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { playClick } from "@/lib/sound";
import { isVideoUrl, type Project } from "@/lib/data";

/** Quick-look dialog for a project card — replaces the direct page link.
 *  Carousel over cover + gallery, labels, live/source links, full case study. */
export function ProjectDialog({ project, children }: { project: Project; children: React.ReactNode }) {
  // cover first, then gallery — unique, non-empty urls only.
  const shots = [project.coverUrl, ...project.media.map((m) => m.url)].filter(
    (u, i, a): u is string => Boolean(u) && a.indexOf(u) === i,
  );

  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!api) return;
    const sync = () => setCurrent(api.selectedScrollSnap());
    sync();
    api.on("select", sync);
    return () => void api.off("select", sync);
  }, [api]);

  // Autoplay — advance every 4s; pause on hover/focus and for reduced motion.
  useEffect(() => {
    if (!api || shots.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => api.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [api, shots.length, paused]);

  const chips = project.stack.split("·").map((t) => t.trim()).filter(Boolean);

  return (
    <Dialog>
      <DialogTrigger asChild onClick={playClick}>
        {children}
      </DialogTrigger>

      <DialogContent>
        {/* media */}
        {shots.length > 0 && (
          <Carousel
            setApi={setApi}
            opts={{ loop: shots.length > 1 }}
            className="border-b border-[var(--line-box)]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <CarouselContent>
              {shots.map((src, i) => (
                <CarouselItem key={src}>
                  <div className="relative aspect-[16/9] w-full bg-black">
                    {isVideoUrl(src) ? (
                      <video
                        src={src}
                        className="absolute inset-0 h-full w-full object-cover"
                        controls
                        muted
                        loop
                        playsInline
                        autoPlay
                        preload="metadata"
                      />
                    ) : (
                      <Image
                        src={src}
                        alt={`${project.name} — ${i + 1}`}
                        fill
                        sizes="720px"
                        className="object-cover"
                        priority={i === 0}
                      />
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {shots.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
                  {shots.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Go to image ${i + 1}`}
                      onClick={() => api?.scrollTo(i)}
                      className={`h-1.5 w-1.5 transition-colors ${i === current ? "bg-accent" : "bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </Carousel>
        )}

        <div className="p-6 md:p-8">
          {/* meta row */}
          <div className="mono mb-3 flex flex-wrap items-center gap-2 text-[9.5px] uppercase tracking-[0.14em] text-[var(--t-muted)]">
            <span className="border border-[var(--line-box)] px-2 py-1 text-accent">{project.tag}</span>
            <span className="border border-[var(--line-box)] px-2 py-1">{project.year}</span>
            {project.duration && <span className="border border-[var(--line-box)] px-2 py-1">{project.duration}</span>}
          </div>

          <DialogHeader>
            <DialogTitle>{project.name}</DialogTitle>
            <DialogDescription className="mt-2">{project.description}</DialogDescription>
          </DialogHeader>

          {/* stack */}
          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {chips.map((t) => (
                <span
                  key={t}
                  className="mono border border-[var(--line-box)] px-1.5 py-0.5 text-[8.5px] uppercase tracking-[0.1em] text-[var(--t-muted)]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* metric */}
          {project.metric && (
            <div className="mono mt-4 border-t border-[var(--line)] pt-3 text-[11px] uppercase tracking-[0.14em] text-accent">
              {project.metric}
            </div>
          )}

          {/* actions — one accent (primary), rest neutral, so nothing clashes */}
          {(project.liveUrl || project.repoUrl) && (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={playClick}
                  className="pill mono bg-accent px-[22px] py-[13px] text-[10.5px] uppercase tracking-[0.14em] text-[#0b0b0b] transition-colors hover:bg-[#7fecff]"
                >
                  Visit site ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  onClick={playClick}
                  className="pill mono border border-[var(--line-box)] px-[22px] py-[13px] text-[10.5px] uppercase tracking-[0.14em] text-white transition-colors hover:border-white/40 hover:bg-white/[0.06]"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
