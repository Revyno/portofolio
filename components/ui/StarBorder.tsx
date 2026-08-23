import React from "react";

/**
 * StarBorder — React Bits animated rim, single-element variant. Two
 * radial-gradient glints sweep the top/bottom edges as an overlay, so the
 * caller's `className` still fully controls layout + fill (width, alignment,
 * visibility, bg) exactly like a plain element. The site's global
 * `* { border-radius: 0 }` keeps it square; `.pill` opts back into a radius.
 */
type StarBorderProps<T extends React.ElementType> = React.ComponentPropsWithoutRef<T> & {
  as?: T;
  className?: string;
  children?: React.ReactNode;
  color?: string;
  speed?: React.CSSProperties["animationDuration"];
};

const StarBorder = <T extends React.ElementType = "button">({
  as,
  className = "",
  color = "white",
  speed = "6s",
  children,
  ...rest
}: StarBorderProps<T>) => {
  const Component = (as || "button") as React.ElementType;

  return (
    <Component className={`relative isolate overflow-hidden ${className}`} {...(rest as Record<string, unknown>)}>
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-[-11px] right-[-250%] z-0 h-1/2 w-[300%] opacity-70 animate-star-movement-bottom"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-[-10px] left-[-250%] z-0 h-1/2 w-[300%] opacity-70 animate-star-movement-top"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <span className="relative z-[1] inline-flex items-center gap-2">{children}</span>
    </Component>
  );
};

export default StarBorder;
