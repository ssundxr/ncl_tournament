"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { HeroSection } from "@/components/home/hero-section";
import { SeasonCards } from "@/components/home/season-cards";
import { AllTimeLeaderboard } from "@/components/home/all-time-leaderboard";
import { QuickStats } from "@/components/home/quick-stats";
import { getSeasons, getAllTimeLeaderboard, getQuickStats } from "@/lib/supabase/queries";

function HomeContent() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [topPlayers, setTopPlayers] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalMatches: 0, totalGoals: 0, totalPlayers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSeasons(),
      getAllTimeLeaderboard(),
      getQuickStats(),
    ])
      .then(([s, top, qs]) => {
        setSeasons(s);
        setTopPlayers(top.slice(0, 3));
        setStats(qs);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen pb-20 md:pb-0 bg-background text-foreground">
      {/* Hero — Season Slideshow */}
      <HeroSection seasons={seasons} />

      {/* Quick Stats Strip */}
      <QuickStats
        totalMatches={stats.totalMatches}
        totalGoals={stats.totalGoals}
        totalPlayers={stats.totalPlayers}
      />

      {/* All-Time Top Competitors */}
      <div className="mt-16">
        <AllTimeLeaderboard topPlayers={topPlayers} />
      </div>

      {/* All Seasons Grid */}
      <SeasonCards seasons={seasons} />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
