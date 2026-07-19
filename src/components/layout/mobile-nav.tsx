"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, Users } from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Matches", href: "/fixtures", icon: Calendar },
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Players", href: "/players", icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border pb-safe transition-all duration-300">
      <nav className="flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href !== "/" && pathname?.startsWith(tab.href));
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1 rounded-full ${isActive ? "bg-primary/10" : "bg-transparent"}`}>
                <Icon className={`h-5 w-5 ${isActive ? "text-primary stroke-[2.5px]" : "stroke-2"}`} />
              </div>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? "text-primary font-semibold" : ""}`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
