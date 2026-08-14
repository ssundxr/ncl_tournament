"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Header() {
  const pathname = usePathname();
  const [hasLive, setHasLive] = useState(false);

  // Hooks must be called in exact order before any early returns

  // Real-time subscription to check if any match is currently live
  useEffect(() => {
    const fetchLiveStatus = () => {
      supabase
        .from("fixtures")
        .select("id", { count: "exact", head: true })
        .eq("status", "live")
        .then(({ count }) => setHasLive((count ?? 0) > 0));
    };

    fetchLiveStatus();

    // Subscribe to realtime database changes on fixtures table
    const channel = supabase
      .channel("header-live-fixtures-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "fixtures" },
        () => {
          fetchLiveStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const links = [
    { name: "MATCH CENTER", href: "/fixtures" },
    { name: "STANDINGS", href: "/standings" },
    { name: "PLAYERS", href: "/players" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b-4 border-foreground transition-all duration-300 print:hidden">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden mr-2 text-foreground hover:bg-foreground hover:text-background rounded-none" />
          }>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-background text-foreground border-r-4 border-foreground">
            <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-heading font-black text-2xl tracking-tighter uppercase text-foreground"><span className="text-ncl-brand">NCL</span> Hub</span>
              </Link>
              <div className="flex flex-col space-y-3 mt-4">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-foreground hover:text-primary transition-colors font-black text-xl uppercase tracking-widest py-2"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 mr-8 group bg-foreground text-background px-4 py-1 h-full skew-x-[-10deg] hover:bg-primary transition-colors border-r-4 border-foreground -ml-4"
        >
          <span className="font-heading font-black text-2xl tracking-tighter uppercase skew-x-[10deg]">
            <span className="text-ncl-brand">NCL</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0 font-medium h-full">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center px-5 h-full text-sm font-black uppercase tracking-widest transition-colors skew-x-[-10deg] ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                <span className="skew-x-[10deg]">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center space-x-2">
          {/* Dynamic Live Badge */}
          {hasLive && (
            <div className="hidden sm:flex items-center px-3 py-1 bg-success text-success-foreground border-2 border-foreground font-black uppercase tracking-widest text-[10px] skew-x-[-10deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="skew-x-[10deg] flex items-center">
                <div className="w-2 h-2 rounded-full bg-white animate-ping mr-2" />
                Live Match
              </span>
            </div>
          )}
          <ThemeToggle />

          <Link href="/auth/login">
            <Button
              className="ml-2 font-black uppercase tracking-widest text-xs px-4 bg-foreground text-background hover:bg-primary hover:text-white rounded-none border-2 border-foreground hover:border-primary skew-x-[-10deg] transition-all"
            >
              <span className="skew-x-[10deg] flex items-center gap-2">
                <User className="h-4 w-4" />
                Player Login
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
