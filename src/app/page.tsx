"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Calendar, Trophy, BarChart2, User, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupTable } from "@/components/standings/group-table";
import { StandingsRow, Player } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function HomeContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      let currentSeason = null;
      if (seasonParam) {
        const { data: s } = await supabase
          .from('seasons')
          .select('*, tournament:tournaments(*)')
          .eq('id', seasonParam)
          .single();
        currentSeason = s;
      } else {
        const { data: seasons } = await supabase
          .from('seasons')
          .select('*, tournament:tournaments(*)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        currentSeason = seasons?.[0] || null;
      }

      setActiveSeason(currentSeason);

      if (currentSeason) {
        // Fetch all season enrollments
        const { data: enrollData } = await supabase
          .from('season_enrollments')
          .select('player:players(*)')
          .eq('season_id', currentSeason.id);

        // Fetch all-time leaderboard points
        const { data: allLeaderboards } = await supabase
          .from('leaderboards')
          .select('player_id, points');

        const playerPointsMap: Record<string, number> = {};
        if (allLeaderboards) {
          allLeaderboards.forEach((l: any) => {
            if (l.player_id) {
              playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
            }
          });
        }

        let enrolledPlayers = enrollData ? enrollData.map((e: any) => {
          if (!e.player) return null;
          return {
            ...e.player,
            allTimePoints: playerPointsMap[e.player.id] || 0
          };
        }).filter(Boolean) : [];

        // Sort by allTimePoints descending
        enrolledPlayers.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
        
        setTopPlayers(enrolledPlayers.slice(0, 3) as any);

        // Fetch standings for this season
        const { data: lData } = await supabase
          .from('leaderboards')
          .select('*, player:players(*)')
          .eq('season_id', currentSeason.id)
          .order('points', { ascending: false })
          .order('goal_difference', { ascending: false })
          .order('goals_for', { ascending: false });

        if (lData) {
          const generatedStandings: StandingsRow[] = lData.map(l => ({
            player: l.player as Player,
            played: l.played,
            wins: l.wins,
            draws: l.draws,
            losses: l.losses,
            goalsFor: l.goals_for,
            goalsAgainst: l.goals_against,
            goalDifference: l.goal_difference,
            points: l.points,
            form: l.form || []
          }));
          setStandings(generatedStandings);
        } else {
          setStandings([]);
        }
      } else {
        setTopPlayers([]);
        setStandings([]);
      }

      setLoading(false);
    }
    loadData();
  }, [seasonParam]);

  const top3 = [
    {
      rank: '1ST PLACE',
      bg: 'bg-gradient-to-br from-yellow-500/10 via-[#15151e] to-[#15151e] border-yellow-500/20 hover:border-yellow-500/50',
      rankBadge: 'border-yellow-500/30 text-yellow-500 bg-yellow-500/5',
      glow: 'shadow-[inset_0_0_20px_rgba(234,179,8,0.05)]',
      player: topPlayers[0] as any
    },
    {
      rank: '2ND PLACE',
      bg: 'bg-gradient-to-br from-slate-400/10 via-[#15151e] to-[#15151e] border-slate-400/20 hover:border-slate-400/50',
      rankBadge: 'border-slate-400/30 text-slate-400 bg-slate-400/5',
      glow: 'shadow-[inset_0_0_20px_rgba(148,163,184,0.05)]',
      player: topPlayers[1] as any
    },
    {
      rank: '3RD PLACE',
      bg: 'bg-gradient-to-br from-amber-600/10 via-[#15151e] to-[#15151e] border-amber-600/20 hover:border-amber-600/50',
      rankBadge: 'border-amber-600/30 text-amber-600 bg-amber-600/5',
      glow: 'shadow-[inset_0_0_20px_rgba(180,83,9,0.05)]',
      player: topPlayers[2] as any
    },
  ];

  const getLinkWithSeason = (href: string) => {
    if (!seasonParam) return href;
    return `${href}?season=${seasonParam}`;
  };

  return (
    <div className="flex flex-col w-full min-h-screen pb-20 md:pb-0 font-sans bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-end overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[url('/bg_banner.jpeg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        
        <div className="relative z-20 w-full px-4 md:px-12 lg:px-24 xl:px-32 pb-16 flex flex-col md:flex-row items-end justify-between gap-8 h-full">
          <div className="flex flex-col items-start max-w-4xl">
            <div className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground mb-4 font-bold text-xs uppercase tracking-widest rounded-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" /> Live
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white leading-tight uppercase font-heading">
              {activeSeason ? `${activeSeason.tournament?.name}: ${activeSeason.name}` : "NAMMA CHAMPIONS LEAGUE"}
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl">
              The premium eFootball Mobile tournament experience. Watch the elite compete for ultimate glory.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link href={getLinkWithSeason("/fixtures")}>
                <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-white text-black hover:bg-white/90 border-0 transition-colors uppercase tracking-widest">
                  <PlayCircle className="mr-2 h-5 w-5" /> View Fixtures
                </Button>
              </Link>
              {activeSeason && activeSeason.status === 'active' && (
                <Link href={`/enroll?season=${activeSeason.id}`}>
                  <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                    <User className="mr-2 h-5 w-5" /> Enroll Now
                  </Button>
                </Link>
              )}
              <Link href={getLinkWithSeason("/standings")}>
                <Button size="lg" variant="outline" className="font-bold rounded-md px-8 h-12 border-2 border-muted hover:border-white text-white bg-background/50 backdrop-blur-sm transition-colors uppercase tracking-widest">
                  View Standings <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex flex-shrink-0 items-center justify-center opacity-90 drop-shadow-[0_0_30px_rgba(225,6,0,0.3)] pointer-events-none">
            <img src="/logo_removed.png" alt="NCL Logo" className="w-[450px] lg:w-[650px] xl:w-[800px] h-auto object-contain transition-transform hover:scale-105 duration-500" />
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center items-center py-24 min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32">
            <div className="w-full h-2 bg-primary f1-slant-right mt-12 mb-8" />
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 font-heading text-white">
              {activeSeason?.name || "Current Season"}
            </h2>
          </div>

          {/* Top Players */}
          {topPlayers.length > 0 && (
            <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-16">
              <div className="flex gap-6 mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-2 text-white">Top Competitors (All-Time Pts)</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {top3.map((item, idx) => (
                  item.player ? (
                    <div key={idx} className={`bg-card rounded-xl overflow-hidden flex flex-col h-[200px] relative group cursor-pointer border transition-all duration-300 ${item.bg} ${item.glow}`}>
                      <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                        <div>
                          <span className={`inline-block font-bold text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm border mb-3 ${item.rankBadge}`}>
                            {item.rank}
                          </span>
                          <h4 className="text-white font-black text-2xl uppercase tracking-tight">{item.player.name}</h4>
                          <p className="text-white/60 text-xs mt-1 uppercase font-bold tracking-wider">{item.player.favorite_team || "Free Agent"}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col">
                            <span className="text-white font-black text-4xl leading-none">
                              {item.player.allTimePoints || 0}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                              ALL-TIME POINTS
                            </span>
                          </div>
                        </div>
                      </div>
                      {item.player.photo_url && (
                        <div className="absolute top-6 right-6 w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-300">
                          <img src={item.player.photo_url} alt={item.player.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ) : null
                ))}
              </div>
            </section>
          )}

          {/* Standings */}
          <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30 flex flex-col gap-6">
            <div className="w-full h-2 bg-primary f1-slant-right mb-2" />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-heading text-white">Standings</h2>
            </div>
            
            <div className="relative min-h-[400px]">
              {standings.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground font-bold uppercase tracking-wider">No standings generated for this season yet.</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key="standings"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="w-full"
                  >
                    <GroupTable 
                      groupName={`${activeSeason?.name || ""} standings`}
                      standings={standings} 
                    />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </section>
        </>
      )}

      {/* Quick Links Grid */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30">
        <div className="w-full h-2 bg-primary f1-slant-right mb-8" />
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 font-heading text-white">Explore NCL</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <Link href={getLinkWithSeason("/fixtures")} className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <Calendar className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Upcoming Fixtures</h3>
          </Link>
          
          <Link href={getLinkWithSeason("/results")} className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <PlayCircle className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Latest Results</h3>
          </Link>

          <Link href={getLinkWithSeason("/standings")} className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <Trophy className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Full Standings</h3>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
