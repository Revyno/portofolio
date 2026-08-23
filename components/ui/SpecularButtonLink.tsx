"use client";

import { useRouter } from "next/navigation";
import SpecularButton, { type SpecularButtonProps } from "@/components/ui/SpecularButton";
import { playClick } from "@/lib/sound";

/**
 * SpecularButtonLink — React Bits SpecularButton wired for navigation.
 * SpecularButton renders a bare <button>, so href handling (internal SPA push,
 * external tab, data:/blob: download) lives here, mirroring the site Button's
 * branching. Defaults match the site's dark-glass + cyan-rim look.
 */
type Props = Omit<SpecularButtonProps, "onClick"> & { href?: string };

export default function SpecularButtonLink({
  href,
  children,
  lineColor = "#4ce0ff",
  baseColor = "#0b0b0b",
  tint = "#0b0b0b",
  tintOpacity = 0.5,
  blur = 8,
  textColor = "#ffffff",
  size = "sm",
  radius = 14,
  className = "",
  ...rest
}: Props) {
  const router = useRouter();

  function handleClick() {
    playClick();
    if (!href) return;
    // data:/blob: can't be top-level-navigated in Chromium — force a save.
    if (href.startsWith("data:") || href.startsWith("blob:")) {
      const a = document.createElement("a");
      a.href = href;
      a.download = "";
      document.body.appendChild(a);
      a.click();
      a.remove();
      return;
    }
    const external = !href.startsWith("/") && !href.startsWith("#");
    if (external) {
      window.open(href, href.startsWith("http") ? "_blank" : "_self");
      return;
    }
    router.push(href);
  }

  return (
    <SpecularButton
      onClick={handleClick}
      lineColor={lineColor}
      baseColor={baseColor}
      tint={tint}
      tintOpacity={tintOpacity}
      blur={blur}
      textColor={textColor}
      size={size}
      radius={radius}
      className={`rb-round mono uppercase tracking-[0.14em] ${className}`}
      {...rest}
    >
      {children}
    </SpecularButton>
  );
}
