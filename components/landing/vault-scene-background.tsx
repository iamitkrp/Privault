"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Full-viewport WebGPU shield scene (from `landing_page/scene.js`).
 * Skipped when user prefers reduced motion or when init fails.
 */
export function VaultSceneBackground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setActive(false);
      return;
    }

    const el = hostRef.current;
    if (!el) return;

    let cancelled = false;
    let dispose: (() => void) | undefined;

    void import("./vault-hero-scene").then(({ mountVaultHeroScene }) => {
      if (cancelled || !el) return;
      mountVaultHeroScene(el)
        .then((d) => {
          if (cancelled) {
            d();
            return;
          }
          dispose = d;
        })
        .catch((err) => {
          console.warn("Vault 3D background:", err);
          setActive(false);
        });
    });

    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  if (!active) return null;

  return (
    <div
      ref={hostRef}
      className="fixed inset-0 z-0 min-h-dvh w-full overflow-hidden bg-[#050505]"
      aria-hidden
    />
  );
}
