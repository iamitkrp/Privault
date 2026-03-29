"use client";

/**
 * Solid page backdrop: black (dark) / white (light). Matches `body` via `--page-solid-bg`.
 */
export function ImmersiveBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 min-h-dvh bg-[var(--page-solid-bg)]"
      aria-hidden
    />
  );
}
