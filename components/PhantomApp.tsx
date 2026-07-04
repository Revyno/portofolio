"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { menuItems, profile, type ScreenId } from "@/lib/content";
import { useAudio } from "@/lib/useAudio";
import { StripeTransition, type StripeHandle } from "./StripeTransition";
import { AboutScreen, ProjectsScreen, ResumeScreen, SocialsScreen } from "./screens";
import { BgmPanel } from "./BgmPanel";
import { InfoBar, KeyHints, NameTag, Tag } from "./ui";

export function PhantomApp() {
  const [screen, setScreen] = useState<ScreenId>("menu");
  const [cursor, setCursor] = useState(0);
  const [dateStr, setDateStr] = useState("");
  const stripesRef = useRef<StripeHandle>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const { enabled, toggle, playSelect } = useAudio();

  /* client-only date to avoid hydration mismatch */
  useEffect(() => {
    const d = new Date();
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    setDateStr(
      `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")} ${days[d.getDay()]}`
    );
  }, []);

  /* menu entrance slam */
  useEffect(() => {
    if (screen !== "menu") return;
    const els = menuRef.current?.querySelectorAll("[data-menu-slam]");
    if (!els?.length) return;
    gsap.fromTo(
      els,
      { x: -120, opacity: 0, rotate: -6 },
      { x: 0, opacity: 1, rotate: 0, duration: 0.45, stagger: 0.06, ease: "back.out(2)" }
    );
  }, [screen]);

  const goto = useCallback(
    (next: ScreenId) => {
      if (busyRef.current || next === screen) return;
      busyRef.current = true;
      playSelect();
      stripesRef.current?.play(() => {
        setScreen(next);
        busyRef.current = false;
      });
    },
    [screen, playSelect]
  );

  /* keyboard: ↑↓ navigate, ↵ confirm, ESC back, M sound */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "m" || e.key === "M") {
        toggle();
        return;
      }
      if (e.key === "Escape" && screen !== "menu") {
        e.preventDefault();
        goto("menu");
        return;
      }
      if (screen !== "menu") return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        playSelect();
        setCursor((c) => (c + (e.key === "ArrowDown" ? 1 : menuItems.length - 1)) % menuItems.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        goto(menuItems[cursor].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, cursor, goto, toggle, playSelect]);

  return (
    <main className="relative h-dvh overflow-hidden">
      <div className="p5-bg" aria-hidden />

      <NameTag onClick={() => goto("menu")} />
      <BgmPanel enabled={enabled} onToggle={toggle} />

      {screen === "menu" && (
        <div ref={menuRef} className="relative z-10 flex h-full">
          {/* hero art — dimmed backdrop on mobile, clipped right slab on md+ */}
          <div className="pointer-events-none absolute inset-0 opacity-25 md:hidden" data-menu-slam>
            <Image
              src={profile.photo}
              alt=""
              fill
              sizes="100vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--p5-black)] via-transparent to-[var(--p5-black)]/60" />
          </div>
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-[46%] md:block"
            style={{ clipPath: "polygon(22% 0, 100% 0, 100% 100%, 6% 100%)" }}
            data-menu-slam
          >
            <Image
              src={profile.photo}
              alt=""
              fill
              sizes="46vw"
              className="object-cover object-top"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--p5-black)] via-transparent to-transparent" />
          </div>

          {/* left column: identity + menu */}
          <div className="relative flex w-full min-w-0 flex-col justify-center gap-5 px-5 pb-16 pt-20 md:w-[58%] md:gap-8 md:px-16">
            <div data-menu-slam>
              <Tag>{profile.role}</Tag>
              <h1 className="p5-display fs-hero mt-2 max-w-xl text-[var(--p5-pure-white)]">
                {profile.name.split(" ")[0]}
                <span className="text-[var(--p5-red)]">.</span>
              </h1>
              <p className="mt-2 max-w-md text-lg font-medium opacity-70 md:text-xl">
                {profile.tagline}
              </p>
            </div>

            <nav className="flex flex-col items-start gap-2.5 md:gap-3" aria-label="Main menu">
              {menuItems.map((item, i) => (
                <div key={item.id} className="relative max-w-full" data-menu-slam>
                  <button
                    className={`p5-menu-item fs-menu ${i === cursor ? "is-active" : ""}`}
                    onMouseEnter={() => {
                      if (i !== cursor) {
                        setCursor(i);
                        playSelect();
                      }
                    }}
                    onClick={() => goto(item.id)}
                  >
                    <span className="p5-menu-label">{item.label}</span>
                  </button>
                  {item.id === "projects" && (
                    <Image
                      src="/assets/newsign.png"
                      alt=""
                      width={90}
                      height={45}
                      className="pointer-events-none absolute -right-6 -top-4 w-14 rotate-12 mix-blend-screen md:-right-16 md:w-[90px]"
                    />
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {screen === "about" && <AboutScreen />}
      {screen === "resume" && <ResumeScreen />}
      {screen === "projects" && <ProjectsScreen onHover={playSelect} />}
      {screen === "socials" && <SocialsScreen onHover={playSelect} />}

      <InfoBar
        left={
          <>
            <span className="p5-tag">{dateStr || "--/--"}</span>
            <span
              className="truncate text-lg tracking-wider opacity-70"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {screen === "menu" ? profile.tagline : `USR ${profile.handle}`}
            </span>
          </>
        }
        right={<KeyHints back={screen !== "menu"} />}
      />

      <StripeTransition ref={stripesRef} />
    </main>
  );
}
