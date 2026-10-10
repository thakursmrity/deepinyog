"use client";

import { useEffect } from "react";

// Closes the Programs menu when someone clicks outside it, presses Escape, or picks a link.
export function MenuCloser() {
  useEffect(() => {
    const closeAll = (except?: Element | null) => {
      document.querySelectorAll("details.nav-menu[open]").forEach((d) => {
        if (d !== except) d.removeAttribute("open");
      });
    };
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const menu = target.closest("details.nav-menu");
      if (!menu) closeAll();
      else if (target.closest(".nav-menu-panel a")) closeAll();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll();
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
