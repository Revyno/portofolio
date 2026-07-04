"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Image from "next/image";
import gsap from "gsap";
import { AngledPanel, ActionLink, RankBadge, StatusChip, Tag } from "./ui";
import { profile, projects, skillGroups, socials, timeline } from "@/lib/content";

/* ---- jagged headline helper: alternate-rotated letters, every 3rd red ---- */
function Jag({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span className={`p5-jag ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span key={i} aria-hidden>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}

/* ---- shared frame with slam-in entrance ---- */
function ScreenFrame({
  code,
  title,
  children,
}: {
  code: string;
  title: string;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll("[data-slam]");
    if (!els?.length) return;
    gsap.fromTo(
      els,
      { x: -60, opacity: 0, rotate: -3 },
      { x: 0, opacity: 1, rotate: 0, duration: 0.5, stagger: 0.07, ease: "back.out(1.8)" }
    );
  }, []);

  return (
    <div ref={rootRef} className="relative z-10 flex h-full flex-col px-4 pb-14 pt-16 md:px-12 md:pb-16 md:pt-24">
      <header className="mb-4 shrink-0 pl-14 md:mb-5 md:pl-0" data-slam>
        <Tag>{code}</Tag>
        <h1 className="p5-display fs-title mt-1 text-[var(--p5-pure-white)]">
          <Jag text={title} />
        </h1>
      </header>
      <div className="p5-scroll min-h-0 flex-1 pb-4 pr-1">{children}</div>
    </div>
  );
}

/* ================= ABOUT ================= */
export function AboutScreen() {
  return (
    <ScreenFrame code="CONFIDENT INFO" title="ABOUT">
      <div className="flex max-w-6xl flex-col gap-6 md:flex-row md:items-start">
        <div className="relative mx-auto w-56 shrink-0 md:mx-0 md:w-72" data-slam>
          <AngledPanel variant="red" rotate={-3} className="p-2">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <Image
                src={profile.aboutPhoto}
                alt={profile.name}
                fill
                sizes="(min-width: 768px) 288px, 224px"
                className="object-cover object-top"
                priority
              />
            </div>
          </AngledPanel>
          <span className="absolute -bottom-3 -right-2 rotate-[-8deg]">
            <Tag>USR {profile.handle}</Tag>
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div data-slam>
            <h2 className="p5-display text-3xl leading-none text-[var(--p5-red)] md:text-5xl">
              {profile.name}
            </h2>
            <p className="p5-display mt-1 text-xl text-[var(--p5-white)] opacity-80 md:text-2xl">
              {profile.role} — {profile.location}
            </p>
          </div>

          <AngledPanel className="max-w-2xl p-5 md:p-6" data-slam>
            {profile.bio.map((line, i) => (
              <p key={i} className="mb-3 text-lg font-medium leading-snug last:mb-0 md:text-xl">
                {line}
              </p>
            ))}
          </AngledPanel>

          <div className="flex flex-wrap gap-3" data-slam>
            {profile.stats.map((s) => (
              <StatusChip key={s.tag} tag={s.tag} value={s.value} />
            ))}
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ================= RESUME ================= */
export function ResumeScreen() {
  return (
    <ScreenFrame code="SKILL CHECK" title="RESUME">
      <div className="flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          {skillGroups.map((group, gi) => (
            <AngledPanel key={group.title} className="p-5" rotate={gi % 2 ? 0.6 : -0.6} data-slam>
              <h2 className="p5-display mb-4 text-3xl text-[var(--p5-red)]">{group.title}</h2>
              <ul className="flex flex-col gap-3">
                {group.skills.map((skill) => (
                  <li key={skill.name} className="flex items-center gap-4">
                    <RankBadge rank={skill.rank} />
                    <span className="p5-display text-2xl">{skill.name}</span>
                    <span className="ml-auto text-base font-medium opacity-60">{skill.note}</span>
                  </li>
                ))}
              </ul>
            </AngledPanel>
          ))}
        </div>

        <AngledPanel variant="dark" className="h-fit flex-1 p-5" data-slam>
          <h2 className="p5-display mb-4 text-3xl text-[var(--p5-red)]">RECORD</h2>
          <ul className="flex flex-col gap-5">
            {timeline.map((t) => (
              <li key={t.year} className="flex gap-4">
                <span className="p5-tag h-fit shrink-0">{t.year}</span>
                <div>
                  <p className="p5-display text-2xl leading-none">{t.title}</p>
                  <p className="mt-1 text-base font-medium opacity-70">{t.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </AngledPanel>
      </div>
    </ScreenFrame>
  );
}

/* ================= PROJECT LOG ================= */
export function ProjectsScreen({ onHover }: { onHover?: () => void }) {
  return (
    <ScreenFrame code="PHANTOM RECORDS" title="PROJECT LOG">
      <div className="flex max-w-5xl flex-col gap-6 pb-4">
        {projects.map((p, i) => (
          <a
            key={p.code}
            href={p.link ?? "#"}
            target={p.link?.startsWith("http") ? "_blank" : undefined}
            rel="noreferrer"
            onMouseEnter={onHover}
            data-slam
            className="group relative flex flex-col gap-0 bg-[var(--p5-ink)] transition-transform duration-150 hover:translate-x-2 hover:shadow-[var(--shadow-red)] sm:flex-row"
            style={{ clipPath: "var(--clip-notch)", transform: `rotate(${i % 2 ? 0.4 : -0.4}deg)` }}
          >
            <div className="relative h-44 w-full shrink-0 sm:h-auto sm:w-64" style={{ clipPath: "var(--clip-para)" }}>
              <Image
                src={p.image}
                alt={p.title}
                fill
                sizes="(min-width: 640px) 256px, 100vw"
                className="object-cover grayscale-[35%] transition-all duration-200 group-hover:grayscale-0"
              />
              {p.isNew && (
                <Image
                  src="/assets/newsign.png"
                  alt="NEW"
                  width={110}
                  height={55}
                  className="absolute -left-2 top-2 rotate-[-10deg] mix-blend-screen"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-2 p-5">
              <div className="flex items-center gap-3">
                <Tag>{p.code}</Tag>
                <h2 className="p5-display text-3xl text-[var(--p5-pure-white)] group-hover:text-[var(--p5-red)] md:text-4xl">
                  {p.title}
                </h2>
              </div>
              <p className="max-w-xl text-lg font-medium leading-snug opacity-80">{p.desc}</p>
              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {p.tags.map((t) => (
                  <span key={t} className="p5-chip text-sm">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ================= SOCIALS ================= */
export function SocialsScreen({ onHover }: { onHover?: () => void }) {
  return (
    <ScreenFrame code="CALLING CARD" title="SOCIALS">
      <div className="flex max-w-6xl flex-col-reverse items-center gap-8 md:flex-row md:items-start">
        <div className="flex w-full max-w-xl flex-col gap-4">
          {socials.map((s) => (
            <div key={s.label} data-slam>
              <ActionLink label={s.label} sub={s.handle} href={s.href} onHover={onHover} />
            </div>
          ))}
          <p className="mt-2 text-lg font-medium opacity-60" data-slam>
            {profile.tagline}
          </p>
        </div>
        <div className="relative w-52 shrink-0 md:w-80" data-slam>
          <Image
            src="/assets/jokerface2.png"
            alt=""
            width={668}
            height={693}
            className="rotate-6 drop-shadow-[8px_8px_0_var(--p5-red)]"
            priority
          />
        </div>
      </div>
    </ScreenFrame>
  );
}
