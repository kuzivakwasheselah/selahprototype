import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  BookOpen,
  BookMarked,
  HandHeart,
  Bookmark,
  Clapperboard,
  MessageCircle,
  Settings,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/reflect", label: "Reflect", icon: BookOpen },
  { to: "/bible", label: "Bible", icon: BookMarked },
  { to: "/prayers", label: "Prayers", icon: HandHeart },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/media", label: "Media", icon: Clapperboard },
  { to: "/assistant", label: "Assistant", icon: MessageCircle },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppMenu() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Floating hamburger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-full border border-border/60 bg-background/80 text-foreground shadow-soft backdrop-blur-md transition hover:bg-background"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-[340px] flex-col bg-sidebar shadow-float transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 px-5 pt-5">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid h-12 w-12 place-items-center rounded-full border border-border/60 bg-background text-foreground transition hover:bg-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="px-6 pb-2 pt-6 font-serif text-2xl text-muted-foreground">Menu</p>

        <nav className="flex-1 space-y-1 px-3">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || pathname.startsWith(`${to}/`);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-base transition",
                  active
                    ? "bg-accent/70 font-medium text-primary"
                    : "text-foreground hover:bg-secondary",
                )}
              >
                <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4">
          <Link
            to="/donate"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gold px-4 py-3.5 font-medium text-gold-foreground shadow-soft transition hover:brightness-105"
          >
            <Heart className="h-5 w-5" />
            Donate
          </Link>
        </div>
      </aside>
    </>
  );
}
