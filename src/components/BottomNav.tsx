"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Camino", icon: "✟" },
  { href: "/rosario", label: "Rosario", icon: "◎" },
  { href: "/comunidad", label: "Comunidad", icon: "⛪" },
  { href: "/perfil", label: "Mi Perfil", icon: "◐" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#eae7df] bg-white/90 backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => {
          const active =
            tab.href === "/" ? pathname === "/" : pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5"
            >
              <span
                className={`text-[18px] leading-none ${
                  active ? "text-[#1c1c1e]" : "text-[#b0aca0]"
                }`}
              >
                {tab.icon}
              </span>
              <span
                className={`text-[10px] font-medium tracking-wide ${
                  active ? "text-[#1c1c1e]" : "text-[#b0aca0]"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
