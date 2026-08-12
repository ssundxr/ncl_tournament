"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

export function Header() {
  const pathname = usePathname();
  const [hasLive, setHasLive] = useState(false);

  // Check if any fixture is currently live
  useEffect(() => {
    supabase
      .from("fixtures")
      .select("id", { count: "exact", head: true })
      .eq("status", "live")
      .then(({ count }) => setHasLive((count ?? 0) > 0));
  }, []);

  const links = [
    { name: "Match Center", href: "/fixtures" },
    { name: "Standings", href: "/standings" },
    { name: "Players", href: "/players" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b-4 border-foreground transition-all duration-300">
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
                <span className="font-heading font-black text-2xl tracking-tighter uppercase text-foreground">NCL Hub</span>
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
            NCL
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
                className={`flex items-center px-4 h-full text-sm font-black uppercase tracking-widest transition-colors skew-x-[-10deg] ${
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
            <div className="hidden sm:flex items-center px-3 py-1 bg-success text-success-foreground border-2 border-foreground font-black uppercase tracking-widest text-[10px] skew-x-[-10deg]">
              <span className="skew-x-[10deg] flex items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-1.5" />
                Live
              </span>
            </div>
          )}

          <Link href="/auth/login">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-primary hover:text-white rounded-none ml-2 border-2 border-transparent hover:border-foreground"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
