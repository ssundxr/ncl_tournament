"use client";

import { SeasonProvider, useSeason } from "@/contexts/season-context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { use } from "react";
import {
  Calendar,
  Trophy,
  PlayCircle,
  Users,
  UserPlus,
  ChevronRight,
  Loader2,
  Home,
} from "lucide-react";
import { cleanBranding } from "@/lib/utils/branding";
import { motion } from "framer-motion";

function SeasonSubNav({ seasonId }: { seasonId: string }) {
  const pathname = usePathname();
  const { season, tournament, isLoading } = useSeason();

  const tabs = [
    { name: "Overview", href: `/season/${seasonId}`, icon: Home, exact: true },
    { name: "Fixtures", href: `/season/${seasonId}/fixtures`, icon: Calendar },
    { name: "Standings", href: `/season/${seasonId}/standings`, icon: Trophy },
    { name: "Results", href: `/season/${seasonId}/results`, icon: PlayCircle },
    { name: "Players", href: `/season/${seasonId}/players`, icon: Users },
    ...(season?.status === "active"
      ? [{ name: "Enroll", href: `/season/${seasonId}/enroll`, icon: UserPlus }]
      : []),
  ];

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500",
    upcoming: "bg-blue-500",
    completed: "bg-amber-500",
  };

  return (
    <div className="w-full border-b-2 border-border bg-background sticky top-16 z-40">
      {/* Season Breadcrumb Banner */}
      <div className="container mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-widest transition-colors"
        >
          NFL
        </Link>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {cleanBranding(tournament?.name ?? "")}
            </span>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              {cleanBranding(season?.name ?? "")}
            </span>
            {season?.status && (
              <span
                className={`ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white ${
                  statusColors[season.status] ?? "bg-muted"
                }`}
              >
                {season.status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
                {season.status}
              </span>
            )}
          </>
        )}
      </div>

      {/* Sub-navigation Tabs */}
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center gap-0 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.name}
                {isActive && (
                  <motion.div
                    layoutId="season-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function SeasonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);

  return (
    <SeasonProvider seasonId={seasonId}>
      <div className="flex flex-col min-h-screen">
        <SeasonSubNav seasonId={seasonId} />
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
      </div>
    </SeasonProvider>
  );
}
