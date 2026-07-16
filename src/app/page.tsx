"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, PlayCircle, Calendar, Trophy, BarChart2, Shield, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GroupTable } from "@/components/standings/group-table";
import { StandingsRow, Player } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function Home() {
  const [activeGroup, setActiveGroup] = useState<"A" | "B">("A");
  const [activeSeason, setActiveSeason] = useState<any>(null);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch Active Season
      const { data: seasons } = await supabase
        .from('seasons')
        .select('*, tournament:tournaments(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);
      
      const currentSeason = seasons?.[0] || null;
      setActiveSeason(currentSeason);

      // 2. Fetch Top Players (by rating for now, or you could compute goals)
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .order('overall_rating', { ascending: false })
        .limit(3);
      setTopPlayers(players as Player[] || []);

      // 3. Fetch Standings (mock logic, ideally computed from matches in Supabase)
      // For now, let's just generate a basic standings table from all players
      const { data: allPlayers } = await supabase.from('players').select('*');
      
      if (allPlayers) {
        const generatedStandings: StandingsRow[] = allPlayers.map(p => ({
          player: p as Player,
          played: 0, wins: 0, draws: 0, losses: 0,
          goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0, form: []
        }));
        setStandings(generatedStandings);
      }

      setLoading(false);
    }
    loadData();
  }, []);

  const top3 = [
    { rank: '1ST', bg: 'f1-gradient-teal', player: topPlayers[0] },
    { rank: '2ND', bg: 'f1-gradient-teal', player: topPlayers[1] },
    { rank: '3RD', bg: 'f1-gradient-red', player: topPlayers[2] },
  ];

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
              <Link href="/fixtures">
                <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-white text-black hover:bg-white/90 border-0 transition-colors uppercase tracking-widest">
                  <PlayCircle className="mr-2 h-5 w-5" /> View Fixtures
                </Button>
              </Link>
              {activeSeason && (
                <Link href={`/enroll?season=${activeSeason.id}`}>
                  <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 transition-colors uppercase tracking-widest shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                    <User className="mr-2 h-5 w-5" /> Enroll Now
                  </Button>
                </Link>
              )}
              <Link href="/standings">
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

      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32">
        <div className="w-full h-2 bg-primary f1-slant-right mt-12 mb-8" />
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 font-heading text-white">
          {activeSeason?.name || "Current Season"}
        </h2>
      </div>

      {/* Top Players (F1 Style Cards) */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-16">
        <div className="flex gap-6 mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest border-b-2 border-primary pb-2 text-white">Top Players</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {!loading && top3.map((item, idx) => (
            item.player ? (
              <div key={idx} className="bg-card rounded-xl overflow-hidden flex flex-col h-[280px] relative group cursor-pointer border border-border hover:border-muted-foreground transition-colors">
                <div className={`absolute inset-0 ${item.bg} opacity-90 z-0`} />
                <div className="absolute inset-0 bg-[radial-gradient(var(--color-background)_1px,transparent_1px)] [background-size:8px_8px] opacity-10 z-0" />
                
                <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                  <div>
                    <span className="text-white font-bold text-xl">{item.rank}</span>
                    <h4 className="text-white font-black text-2xl uppercase mt-2 tracking-tight">{item.player.name}</h4>
                    <p className="text-white/80 text-sm mt-1 uppercase font-bold tracking-wider">{item.player.favorite_team}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-white font-black text-4xl">{item.player.overall_rating || 0} <span className="text-sm font-bold align-middle">RATING</span></span>
                  </div>
                </div>
                {item.player.photo_url && (
                  <div className="absolute bottom-0 right-4 w-32 h-48 z-10 pointer-events-none flex items-end justify-center">
                    <img src={item.player.photo_url} alt={item.player.name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
                  </div>
                )}
                {!item.player.photo_url && (
                  <div className="absolute bottom-0 right-4 w-32 h-48 bg-black/20 rounded-t-full z-10 blur-md" />
                )}
              </div>
            ) : null
          ))}
        </div>
      </section>

      {/* Standings Right After Hero */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30 flex flex-col gap-6">
        <div className="w-full h-2 bg-primary f1-slant-right mb-2" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-heading text-white">Current Standings</h2>
        </div>
        
        <div className="relative min-h-[500px]">
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
                groupName="All Players"
                standings={standings} 
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>


      {/* Quick Links Grid (F1 News Style) */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30">
        <div className="w-full h-2 bg-primary f1-slant-right mb-8" />
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 font-heading text-white">More NCL Hub</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <Link href="/fixtures" className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <Calendar className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Upcoming Fixtures</h3>
          </Link>
          
          <Link href="/results" className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <PlayCircle className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Latest Results</h3>
          </Link>

          <Link href="/standings" className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <Trophy className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Full Standings</h3>
          </Link>

          <Link href="/statistics" className="group">
            <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-muted-foreground transition-colors aspect-video flex items-center justify-center relative">
              <div className="absolute inset-0 bg-muted opacity-50 group-hover:opacity-100 transition-opacity" />
              <BarChart2 className="w-10 h-10 text-white relative z-10 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-sm md:text-base mt-3 text-white group-hover:text-primary transition-colors">Player Statistics</h3>
          </Link>
        </div>
      </section>
    </div>
  );
}
