"use client";

import Link from "next/link";
import { Menu, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const links = [
    { name: "Matchday", href: "/matchday" },
    { name: "Fixtures", href: "/fixtures" },
    { name: "Results", href: "/results" },
    { name: "Standings", href: "/standings" },
    { name: "Players", href: "/players" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#15151e] border-b border-border">
      {/* Top red bar like F1 */}
      <div className="w-full h-1 bg-primary" />
      
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger render={
            <Button variant="ghost" size="icon" className="md:hidden mr-2 text-white hover:text-primary hover:bg-white/5 rounded-none" />
          }>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-[#15151e] text-white border-r border-border">
            <nav className="flex flex-col gap-6 text-lg font-medium mt-8">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo_nfl.png" alt="NFL Logo" className="h-8 w-auto object-contain" />
                <span className="font-heading font-black text-xl uppercase tracking-wider text-white">Hub</span>
              </Link>
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-white hover:text-primary transition-colors font-bold uppercase tracking-widest text-sm border-b border-border pb-4"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 mr-8">
          <img src="/logo_nfl.png" alt="NFL Logo" className="h-8 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium h-full">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-white hover:text-primary transition-colors font-bold uppercase tracking-widest flex items-center h-full border-b-2 border-transparent hover:border-primary"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center space-x-4 h-full">
          <div className="hidden sm:flex items-center px-3 py-1 bg-primary text-white rounded-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Live</span>
          </div>
          
          <Button variant="ghost" size="icon" className="hidden sm:flex text-white hover:text-primary hover:bg-white/5 rounded-none h-full w-12">
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>
          <Link href="/auth/login" className="h-full">
            <Button variant="ghost" size="icon" className="text-white hover:text-primary hover:bg-white/5 rounded-none h-full w-12">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
