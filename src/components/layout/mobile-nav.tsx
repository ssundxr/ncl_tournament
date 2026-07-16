import Link from "next/link";
import { Home, Calendar, Trophy, BarChart2, MoreHorizontal } from "lucide-react";

export function MobileNav() {
  const tabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Matchday", href: "/matchday", icon: Calendar },
    { name: "Standings", href: "/standings", icon: Trophy },
    { name: "Stats", href: "/statistics", icon: BarChart2 },
    { name: "More", href: "/more", icon: MoreHorizontal },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-elevated border-t border-border pb-safe">
      <nav className="flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.name === "Home"; // TODO: Implement active state using usePathname
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium font-heading tracking-wide uppercase">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
