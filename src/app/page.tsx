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
  const [stats, setStats] = useState({ totalMatches: 0, totalGoals: 0, totalPlayers: 0, totalSeasons: 0 });
  const [loading, setLoading] = useState(true);
  
  const [filterTournament, setFilterTournament] = useState("all");
  const [filterSeason, setFilterSeason] = useState("all");
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

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

  useEffect(() => {
    if (loading) return;
    setLeaderboardLoading(true);
    getAllTimeLeaderboard(
      filterSeason === "all" ? undefined : filterSeason,
      filterTournament === "all" ? undefined : filterTournament
    ).then((top) => {
      setTopPlayers(top.slice(0, 3));
    }).finally(() => setLeaderboardLoading(false));
  }, [filterTournament, filterSeason]);

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
        totalSeasons={stats.totalSeasons}
      />

      {/* All-Time Top Competitors */}
      <div className="mt-16">
        <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 border-b-2 border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-primary" />
              <h2 className="text-2xl font-black uppercase tracking-tight font-heading text-foreground">
                Global Top Competitors
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 md:mt-0 md:ml-auto w-full md:w-auto">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:block mr-2">
                {filterSeason !== 'all' ? 'Season View' : filterTournament !== 'all' ? 'Tournament View' : 'All Time'}
              </span>
              <select
                value={filterTournament}
                onChange={(e) => {
                  setFilterTournament(e.target.value);
                  setFilterSeason("all"); // Reset season when tournament changes
                }}
                className="bg-background border-2 border-primary text-foreground px-3 py-1.5 font-bold text-xs uppercase tracking-widest outline-none flex-1 md:flex-none md:w-48"
              >
                <option value="all">All Tournaments</option>
                {Array.from(new Set(seasons.map(s => s.tournament_id))).map(tId => {
                  const tournament = seasons.find(s => s.tournament_id === tId)?.tournament;
                  return tournament ? (
                    <option key={tId} value={tId}>{tournament.name}</option>
                  ) : null;
                })}
              </select>
              
              <select
                value={filterSeason}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="bg-background border-2 border-primary text-foreground px-3 py-1.5 font-bold text-xs uppercase tracking-widest outline-none flex-1 md:flex-none md:w-48"
              >
                <option value="all">All Seasons</option>
                {seasons
                  .filter(s => filterTournament === "all" || s.tournament_id === filterTournament)
                  .map(s => (
                    <option key={s.id} value={s.id}>{s.name} (S{s.number})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={`w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-20 transition-opacity duration-300 ${leaderboardLoading ? 'opacity-50' : 'opacity-100'}`}>
          <AllTimeLeaderboard topPlayers={topPlayers} hideHeader={true} />
        </div>
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
