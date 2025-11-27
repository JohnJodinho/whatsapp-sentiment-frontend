import { useEffect, useRef } from "react";

/**
 * A hook to automatically scroll a container to the bottom when a dependency changes,
 * but only if the user is already at or near the bottom (scroll-lock).
 * * @param dependency The dependency that triggers the scroll (e.g., messages.length).
 */
export function useAutoScroll(dependency: unknown) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledNearBottomRef = useRef(true);

  // Check and store scroll position *before* new content renders
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const scrollThreshold = 100; // Pixels from bottom to "lock"
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < scrollThreshold;
      isScrolledNearBottomRef.current = isNearBottom;
    }
  }, [dependency]); // Run *before* the render that adds new content

  // Scroll to bottom *after* new content has rendered
  useEffect(() => {
    const el = scrollRef.current;
    if (el && isScrolledNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [dependency]); // Run *after* the render

  return scrollRef;
}
