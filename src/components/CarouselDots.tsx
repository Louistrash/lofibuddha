"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CarouselDotsProps {
  /** Ref to the scroll-snap container (overflow-x: auto) */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Dot color from the LofiBuddha palette (default: gold) */
  color?: string;
  /** Accessible label, e.g. "Meditations carousel" */
  label?: string;
}

/**
 * Dot indicators for horizontal scroll-snap carousels.
 * - Renders one dot per item; active dot follows the scroll position.
 * - Clicking a dot scrolls to that item.
 * - Only visible when the container is actually scrollable (mobile), so
 *   desktop grids (e.g. .mindful-services) stay clean.
 */
export default function CarouselDots({
  containerRef,
  color = "#b89258",
  label = "carousel",
}: CarouselDotsProps) {
  const [count, setCount] = useState(0);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rafRef = useRef<number>(0);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const n = el.children.length;
    setCount(n);
    // Only show dots when the row actually overflows (scrollable)
    setVisible(el.scrollWidth > el.clientWidth + 4 && n > 1);
  }, [containerRef]);

  const updateActive = useCallback(() => {
    const el = containerRef.current;
    if (!el || el.children.length === 0) return;
    const scrollLeft = el.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement;
      const dist = Math.abs(child.offsetLeft - el.offsetLeft - scrollLeft);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setActive(best);
  }, [containerRef]);

  // Re-measure on mount + when children/content change
  useEffect(() => {
    setMounted(true);
    const el = containerRef.current;
    if (!el) return;
    measure();

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        measure();
        updateActive();
      });
    });
    ro.observe(el);

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateActive);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);

    // MutationObserver: meditations/tracks load async, count may change
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        measure();
        updateActive();
      });
    });
    mo.observe(el, { childList: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      mo.disconnect();
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [containerRef, measure, updateActive]);

  if (!mounted || !visible) return null;

  return (
    <div className="carousel-dots" role="tablist" aria-label={label}>
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${label} ${i + 1}`}
          className={`carousel-dot ${i === active ? "carousel-dot-active" : ""}`}
          style={{ "--dot-color": color } as React.CSSProperties}
          onClick={() => {
            const el = containerRef.current;
            const child = el?.children[i] as HTMLElement | undefined;
            if (!el || !child) return;
            el.scrollTo({
              left: child.offsetLeft - el.offsetLeft,
              behavior: "smooth",
            });
          }}
        />
      ))}
    </div>
  );
}
