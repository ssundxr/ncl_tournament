"use client";

import Link from "next/link";
import { useEffect, useState, Suspense, useRef } from "react";
import * as htmlToImage from "html-to-image";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, Calendar, Trophy, User, ChevronRight, ChevronLeft, Loader2, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GroupTable } from "@/components/standings/group-table";
import { StandingsRow, Player } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function cleanBranding(str: string): string {
  if (!str) return "";
  return str
    .replace(/Namma Champions League/gi, "Namma Football League")
    .replace(/NCL/gi, "NFL");
}

function getTeamConfig(teamName: string, rank: string) {
  const name = (teamName || "").toLowerCase().trim();
  
  // F1 Teams
  if (name.includes("mercedes")) {
    return {
      bg: "from-[#004d4a] via-[#002b29] to-[#001514] border-[#00a19b]/20 hover:border-[#00a19b]/50",
      fadeColor: "#002b29",
      textColor: "text-[#00a19b]",
      badgeBg: "bg-[#00a19b]/10 border-[#00a19b]/30 text-[#00a19b]"
    };
  }
  if (name.includes("ferrari")) {
    return {
      bg: "from-[#8a0400] via-[#4d0200] to-[#240100] border-[#e10600]/20 hover:border-[#e10600]/50",
      fadeColor: "#4d0200",
      textColor: "text-[#e10600]",
      badgeBg: "bg-[#e10600]/10 border-[#e10600]/30 text-[#e10600]"
    };
  }
  if (name.includes("red bull")) {
    return {
      bg: "from-[#06008f] via-[#03004d] to-[#010024] border-[#1e41ff]/20 hover:border-[#1e41ff]/50",
      fadeColor: "#03004d",
      textColor: "text-[#1e41ff]",
      badgeBg: "bg-[#1e41ff]/10 border-[#1e41ff]/30 text-[#1e41ff]"
    };
  }
  if (name.includes("mclaren")) {
    return {
      bg: "from-[#b86100] via-[#663600] to-[#331b00] border-[#ff8700]/20 hover:border-[#ff8700]/50",
      fadeColor: "#663600",
      textColor: "text-[#ff8700]",
      badgeBg: "bg-[#ff8700]/10 border-[#ff8700]/30 text-[#ff8700]"
    };
  }
  if (name.includes("aston martin")) {
    return {
      bg: "from-[#00381e] via-[#001f11] to-[#000d07] border-[#005a30]/20 hover:border-[#005a30]/50",
      fadeColor: "#001f11",
      textColor: "text-[#005a30]",
      badgeBg: "bg-[#005a30]/10 border-[#005a30]/30 text-[#005a30]"
    };
  }
  
  // Football Teams
  if (name.includes("madrid")) {
    return {
      bg: "from-[#003a70] via-[#002140] to-[#000f1f] border-[#00529f]/20 hover:border-[#00529f]/50",
      fadeColor: "#002140",
      textColor: "text-[#00529f]",
      badgeBg: "bg-[#00529f]/10 border-[#00529f]/30 text-[#00529f]"
    };
  }
  if (name.includes("barcelona") || name.includes("barca")) {
    return {
      bg: "from-[#002f5c] via-[#330015] to-[#1a000a] border-[#004d98]/20 hover:border-[#004d98]/50",
      fadeColor: "#330015",
      textColor: "text-[#004d98]",
      badgeBg: "bg-[#004d98]/10 border-[#004d98]/30 text-[#004d98]"
    };
  }
  if (name.includes("city") || name.includes("mancity")) {
    return {
      bg: "from-[#386b94] via-[#1f3b52] to-[#0f1d29] border-[#6cabdd]/20 hover:border-[#6cabdd]/50",
      fadeColor: "#1f3b52",
      textColor: "text-[#6cabdd]",
      badgeBg: "bg-[#6cabdd]/10 border-[#6cabdd]/30 text-[#6cabdd]"
    };
  }
  if (name.includes("united") || name.includes("manchester united") || name.includes("manutd")) {
    return {
      bg: "from-[#8f1a13] via-[#4f0e0a] to-[#290705] border-[#da291c]/20 hover:border-[#da291c]/50",
      fadeColor: "#4f0e0a",
      textColor: "text-[#da291c]",
      badgeBg: "bg-[#da291c]/10 border-[#da291c]/30 text-[#da291c]"
    };
  }
  if (name.includes("chelsea")) {
    return {
      bg: "from-[#022f64] via-[#011a37] to-[#000c1a] border-[#034694]/20 hover:border-[#034694]/50",
      fadeColor: "#011a37",
      textColor: "text-[#034694]",
      badgeBg: "bg-[#034694]/10 border-[#034694]/30 text-[#034694]"
    };
  }
  if (name.includes("liverpool")) {
    return {
      bg: "from-[#800a1d] via-[#470510] to-[#240208] border-[#c8102e]/20 hover:border-[#c8102e]/50",
      fadeColor: "#470510",
      textColor: "text-[#c8102e]",
      badgeBg: "bg-[#c8102e]/10 border-[#c8102e]/30 text-[#c8102e]"
    };
  }
  if (name.includes("bayern") || name.includes("munich")) {
    return {
      bg: "from-[#8f031d] via-[#4f010f] to-[#290008] border-[#dc052d]/20 hover:border-[#dc052d]/50",
      fadeColor: "#4f010f",
      textColor: "text-[#dc052d]",
      badgeBg: "bg-[#dc052d]/10 border-[#dc052d]/30 text-[#dc052d]"
    };
  }
  
  // Default Rank Gradients
  if (rank === '1ST') {
    return {
      bg: "from-[#382b0b] via-[#1a1405] to-[#0d0a03] border-yellow-500/20 hover:border-yellow-500/50",
      fadeColor: "#1a1405",
      textColor: "text-yellow-500",
      badgeBg: "bg-yellow-500/5 border-yellow-500/30 text-yellow-500"
    };
  }
  if (rank === '2ND') {
    return {
      bg: "from-[#292e38] via-[#14171c] to-[#0a0b0e] border-slate-400/20 hover:border-slate-400/50",
      fadeColor: "#14171c",
      textColor: "text-slate-400",
      badgeBg: "bg-slate-400/5 border-slate-400/30 text-slate-400"
    };
  }
  return {
    bg: "from-[#3d210a] via-[#1c0f05] to-[#0e0702] border-amber-600/20 hover:border-amber-600/50",
    fadeColor: "#1c0f05",
    textColor: "text-amber-600",
    badgeBg: "bg-amber-600/5 border-amber-600/30 text-amber-600"
  };
}

function HomeContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [seasonsList, setSeasonsList] = useState<any[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Competitors Section States
  // const [competitorsSeasonId, setCompetitorsSeasonId] = useState<string | null>(null); // Removed: Global now
  const competitorsRef = useRef<HTMLDivElement>(null);
  const [sharingCompetitors, setSharingCompetitors] = useState(false);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);

  // Standings Section States
  const [standingsSeasonId, setStandingsSeasonId] = useState<string | null>(null);
  const [homeGroups, setHomeGroups] = useState<any[]>([]);
  const [homeLeaderboards, setHomeLeaderboards] = useState<any[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // Load Seasons and initialize selections
  useEffect(() => {
    async function loadSeasons() {
      setLoading(true);
      const { data } = await supabase
        .from('seasons')
        .select('*, tournament:tournaments(*)')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setSeasonsList(data);
        
        // Use URL parameter or fallback to the latest active season
        const defaultSeason = data.find((s: any) => s.id === seasonParam) || 
                              data.find((s: any) => s.status === 'active') || 
                              data[0];
                              
        setStandingsSeasonId(defaultSeason.id);
      }
      setLoading(false);
    }
    loadSeasons();
  }, [seasonParam]);

  // Slideshow Auto-Play Effect
  useEffect(() => {
    if (seasonsList.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % seasonsList.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [seasonsList]);

  const handleShareCompetitors = async () => {
    if (!competitorsRef.current) return;
    setSharingCompetitors(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(competitorsRef.current, { 
        quality: 0.95,
        backgroundColor: '#ffffff',
        style: { display: 'block' } // Ensure it's visible during render
      });
      
      // If Web Share API is available (usually mobile)
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'nfl-top-competitors.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: 'NFL Global Top Competitors',
            files: [file]
          });
        } catch (shareErr) {
          console.warn('Share API failed or cancelled, falling back to download', shareErr);
          triggerDownload(dataUrl, 'nfl-top-competitors.jpg');
        }
      } else {
        // Fallback for desktop
        triggerDownload(dataUrl, 'nfl-top-competitors.jpg');
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Could not generate image for sharing.");
    } finally {
      setSharingCompetitors(false);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  // Load Global Top Competitors 
  useEffect(() => {
    async function loadGlobalCompetitors() {
      setCompetitorsLoading(true);

      const { data: allPlayers } = await supabase
        .from('players')
        .select('*');

      const { data: allLeaderboards } = await supabase
        .from('leaderboards')
        .select('player_id, points, goals_for, season_id, season:seasons(name)');

      const playerPointsMap: Record<string, number> = {};
      const playerGoalsMap: Record<string, number> = {};
      const seasonMaxPoints: Record<string, { player_id: string, points: number, season_name: string }> = {};

      if (allLeaderboards) {
        allLeaderboards.forEach((l: any) => {
          if (l.player_id) {
            playerPointsMap[l.player_id] = (playerPointsMap[l.player_id] || 0) + (l.points || 0);
            playerGoalsMap[l.player_id] = (playerGoalsMap[l.player_id] || 0) + (l.goals_for || 0);
          }
          
          if (!seasonMaxPoints[l.season_id] || (l.points > seasonMaxPoints[l.season_id].points)) {
            seasonMaxPoints[l.season_id] = { player_id: l.player_id, points: l.points, season_name: l.season?.name || 'Season' };
          }
        });
      }

      const playerTopsMap: Record<string, string[]> = {};
      Object.values(seasonMaxPoints).forEach(top => {
        if (!playerTopsMap[top.player_id]) playerTopsMap[top.player_id] = [];
        playerTopsMap[top.player_id].push(top.season_name);
      });

      let playersWithPoints = allPlayers ? allPlayers.map((p: any) => {
        return {
          ...p,
          allTimePoints: playerPointsMap[p.id] || 0,
          allTimeGoals: playerGoalsMap[p.id] || 0,
          toppedSeasons: playerTopsMap[p.id] || []
        };
      }).filter((p: any) => p.allTimePoints > 0) : [];

      playersWithPoints.sort((a: any, b: any) => b.allTimePoints - a.allTimePoints);
      
      // We take top 3 for the main view
      setTopPlayers(playersWithPoints.slice(0, 3) as any);
      setCompetitorsLoading(false);
    }
    loadGlobalCompetitors();
  }, []);

  // Load Standings when selection changes
  useEffect(() => {
    async function loadStandings() {
      if (!standingsSeasonId) return;
      setStandingsLoading(true);

      const { data: gData } = await supabase
        .from('groups')
        .select('*')
        .eq('season_id', standingsSeasonId)
        .order('sort_order');
      setHomeGroups(gData || []);

      const { data: lData } = await supabase
        .from('leaderboards')
        .select('*, player:players(*)')
        .eq('season_id', standingsSeasonId)
        .order('points', { ascending: false })
        .order('goal_difference', { ascending: false })
        .order('goals_for', { ascending: false });
      setHomeLeaderboards(lData || []);

      setStandingsLoading(false);
    }
    loadStandings();
  }, [standingsSeasonId]);

  const top3 = [
    {
      rank: '1ST',
      rankShort: '1ST',
      order: 'order-1 md:order-2',
      height: 'h-[230px] md:h-[280px]',
      player: topPlayers[0]
    },
    {
      rank: '2ND',
      rankShort: '2ND',
      order: 'order-2 md:order-1',
      height: 'h-[200px] md:h-[235px]',
      player: topPlayers[1]
    },
    {
      rank: '3RD',
      rankShort: '3RD',
      order: 'order-3 md:order-3',
      height: 'h-[200px] md:h-[235px]',
      player: topPlayers[2]
    }
  ];

  const handlePrevSlide = () => {
    if (seasonsList.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + seasonsList.length) % seasonsList.length);
  };

  const handleNextSlide = () => {
    if (seasonsList.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % seasonsList.length);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const currentSlideSeason = seasonsList[activeSlideIndex];

  return (
    <div className="flex flex-col w-full min-h-screen pb-20 md:pb-0 font-sans bg-background text-foreground">
      {/* Sliding Hero Section */}
      <section className="relative w-full h-[75vh] flex items-end overflow-hidden bg-background border-b border-border">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-[url('/bg_banner.jpeg')] bg-cover bg-center bg-no-repeat" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />

        {/* Slideshow Content Container */}
        <div className="relative z-20 w-full px-4 md:px-12 lg:px-24 xl:px-32 pb-20 h-full flex flex-col justify-end">
          <AnimatePresence mode="wait">
            {currentSlideSeason && (
              <motion.div
                key={currentSlideSeason.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-end justify-between gap-8 w-full"
              >
                <div className="flex flex-col items-start max-w-4xl">
                  <div className="inline-flex items-center px-3 py-1 bg-primary text-primary-foreground mb-4 font-bold text-[10px] uppercase tracking-widest rounded-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse mr-2" /> 
                    {currentSlideSeason.status}
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-4 text-white leading-tight uppercase font-heading">
                    {cleanBranding(currentSlideSeason.tournament?.name || "NFL")}: {cleanBranding(currentSlideSeason.name)}
                  </h1>
                  
                  <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl">
                    Experience the ultimate eFootball mobile tournament. Track standings, fixtures, and check results dynamically.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <Link href={`/fixtures?season=${currentSlideSeason.id}`}>
                      <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-white text-black hover:bg-white/90 border-0 transition-colors uppercase tracking-widest text-xs">
                        <PlayCircle className="mr-2 h-4 w-4" /> View Fixtures
                      </Button>
                    </Link>
                    {currentSlideSeason.status === 'active' && (
                      <Link href={`/enroll?season=${currentSlideSeason.id}`}>
                        <Button size="lg" className="font-bold rounded-md px-8 h-12 bg-primary hover:bg-primary/90 text-white border-0 transition-colors uppercase tracking-widest text-xs shadow-[0_0_20px_rgba(var(--primary),0.5)]">
                          <User className="mr-2 h-4 w-4" /> Enroll Now
                        </Button>
                      </Link>
                    )}
                    <Link href={`/standings?season=${currentSlideSeason.id}`}>
                      <Button size="lg" variant="outline" className="font-bold rounded-md px-8 h-12 border-2 border-muted hover:border-white text-white bg-background/50 backdrop-blur-sm transition-colors uppercase tracking-widest text-xs">
                        View Standings <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="hidden md:flex flex-shrink-0 items-center justify-center opacity-80 drop-shadow-[0_0_30px_rgba(225,6,0,0.25)] pointer-events-none">
                  <img src="/logo_nfl.png" alt="NFL Logo" className="w-[380px] lg:w-[480px] h-auto object-contain" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Manual Slideshow Arrows */}
        {seasonsList.length > 1 && (
          <div className="absolute bottom-6 right-6 md:right-12 lg:right-24 z-30 flex items-center gap-2">
            <button 
              onClick={handlePrevSlide}
              className="w-10 h-10 rounded-full border border-white/20 bg-background/30 hover:bg-background/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNextSlide}
              className="w-10 h-10 rounded-full border border-white/20 bg-background/30 hover:bg-background/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm focus:outline-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Paginator Dots */}
        {seasonsList.length > 1 && (
          <div className="absolute bottom-6 left-6 md:left-12 lg:left-24 z-30 flex items-center gap-1.5">
            {seasonsList.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveSlideIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === activeSlideIndex ? 'bg-primary w-6' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}

        {/* Hidden F1 Style Card for Image Generation */}
        <div className="absolute -left-[9999px] top-0">
          <div ref={competitorsRef} className="w-[1080px] h-[1920px] bg-white relative overflow-hidden flex flex-col p-20 font-sans tracking-tight">
            {/* Minimalist Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,#f8f8f8_0%,#ffffff_100%)] opacity-100" />
            <div className="absolute -right-32 top-32 w-[600px] h-[600px] bg-gray-50 rounded-full blur-[80px]" />
            <div className="absolute top-0 right-0 w-1/3 h-full border-l border-gray-100" />
            
            {/* Header & Seal */}
            <div className="relative z-10 flex justify-between items-start mb-24 mt-12">
              <div>
                <h1 className="text-black text-7xl font-black uppercase tracking-tighter leading-none m-0">
                  NFL LEAGUE
                </h1>
                <p className="text-gray-500 text-3xl font-medium tracking-[0.3em] mt-6">GLOBAL COMPETITORS</p>
              </div>
              
              {/* NFL Official Seal */}
              <div className="w-48 h-48 rounded-full border-[6px] border-black flex flex-col items-center justify-center bg-white p-2 text-center rotate-[-15deg] shadow-2xl relative">
                <div className="absolute inset-2 border-[2px] border-dashed border-black rounded-full" />
                <img src="/logo_nfl.png" className="w-16 h-16 object-contain mb-1 opacity-90 grayscale contrast-125" />
                <p className="text-[10px] font-black uppercase tracking-widest text-black leading-tight mt-2 w-32">
                  Top 1 Player<br/>NFL League
                </p>
                <div className="w-12 h-1 bg-black mt-2 rounded-full" />
              </div>
            </div>

            {/* Players List Minimalist */}
            <div className="relative z-10 flex-1 flex flex-col gap-16 mt-12">
              {topPlayers.map((player, idx) => {
                const isFirst = idx === 0;
                const toppedSeasons = (player as any).toppedSeasons || [];
                return (
                  <div key={player.id} className="relative flex flex-col md:flex-row md:items-center bg-white border border-gray-200 shadow-sm overflow-hidden p-6 hover:shadow-xl transition-shadow rounded-2xl gap-6">
                    
                    {/* Position / Rank */}
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center shrink-0 ${isFirst ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}>
                      <span className="text-5xl font-black">{idx + 1}</span>
                    </div>

                    {/* Player Info */}
                    <div className="flex-1 px-10 flex flex-col justify-center">
                      <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mb-1">{player.favorite_team || 'IND'}</p>
                      <h2 className="text-black text-5xl font-black uppercase tracking-tight">{player.name}</h2>
                      
                      {/* Seasons Topped */}
                      {toppedSeasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="bg-gray-100 text-gray-500 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Winner
                          </span>
                          {toppedSeasons.map((sName: string, sIdx: number) => (
                            <span key={sIdx} className="bg-black text-white text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {sName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right shrink-0 border-l border-gray-100 pl-10 pr-6">
                      <p className="text-black text-7xl font-black tracking-tighter">{(player as any).allTimePoints}</p>
                      <p className="text-gray-400 text-lg font-bold uppercase tracking-widest mt-1">Total PTS</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-auto border-t-[3px] border-black pt-12 flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-lg font-bold tracking-widest uppercase mb-2">Cumulative Seasons Leaderboard</p>
                <p className="text-black text-3xl font-black tracking-tight">nfl.sundxr.dev</p>
              </div>
              <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center p-4">
                 <img src="/logo_nfl.png" className="w-full h-full object-contain grayscale opacity-60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Players */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mt-12 mb-16 relative z-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white">Global Top Competitors</h3>
        </div>

        {competitorsLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : topPlayers.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No competitors have earned points yet.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {topPlayers.map((player, idx) => {
              const isFirst = idx === 0;
              const toppedSeasons = (player as any).toppedSeasons || [];
              const isGenerating = sharingPlayerId === player.id;
              
              return (
                <div key={player.id} className="relative flex flex-col md:flex-row items-center justify-between bg-[#13131a] border border-border rounded-xl p-6 hover:border-primary/50 transition-colors gap-6 group">
                  
                  {/* Left Side: Rank & Info */}
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${isFirst ? 'bg-primary text-white shadow-[0_0_20px_rgba(225,6,0,0.5)]' : 'bg-white/5 text-white/50'}`}>
                      <span className="text-3xl font-black">{idx + 1}</span>
                    </div>

                    <div className="flex-1">
                      <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1">{player.favorite_team || 'IND'}</p>
                      <h2 className="text-white text-3xl font-black uppercase tracking-tight">{player.name}</h2>
                      
                      {toppedSeasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                            Winner
                          </span>
                          {toppedSeasons.map((sName: string, sIdx: number) => (
                            <span key={sIdx} className="bg-white/10 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                              {sName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Stats & Action */}
                  <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-8 border-t border-border md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-center md:text-right">
                      <p className="text-white text-4xl font-black tracking-tighter">{(player as any).allTimePoints}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total PTS</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-white text-4xl font-black tracking-tighter">{(player as any).allTimeGoals}</p>
                      <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Total Gs</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleDownloadCard(player)}
                      disabled={isGenerating}
                      className="bg-white hover:bg-gray-200 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-lg border-0 shrink-0 shadow-lg ml-4"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                      4K Card
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

        {/* Hidden Unity 4K Aesthetic Card for Image Generation */}
        {selectedPlayerForCard && (
          <div className="overflow-hidden w-0 h-0 absolute -left-[9999px] top-0 pointer-events-none">
            <div ref={competitorsRef} className="w-[2160px] h-[3840px] bg-black relative flex flex-col font-sans tracking-tight">
              
              {/* Unity Cinematic Lighting & Textures */}
              <div className="absolute inset-0 bg-[#050508] z-0" />
              {/* Massive glowing orb behind player */}
              <div className="absolute -right-[400px] top-[200px] w-[1800px] h-[1800px] bg-red-600/40 rounded-full blur-[200px] z-0 mix-blend-screen" />
              <div className="absolute -left-[200px] bottom-[400px] w-[1200px] h-[1200px] bg-blue-600/20 rounded-full blur-[200px] z-0 mix-blend-screen" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-0" />
              <div className="absolute inset-0 border-[40px] border-white/5 z-20 pointer-events-none mix-blend-overlay" />
              
              {/* Massive Player Portrait */}
              <div className="absolute top-0 right-0 w-[1800px] h-[2200px] z-10 pointer-events-none" style={{ maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)' }}>
                {selectedPlayerForCard.photo_url ? (
                  <img src={selectedPlayerForCard.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125 saturate-50 drop-shadow-[0_0_100px_rgba(225,6,0,0.8)]" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-bl from-gray-800 to-black" />
                )}
              </div>

              {/* Grid / Tech Overlays */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.02)_2px,transparent_2px)] bg-[size:100px_100px] z-0" />

              {/* Official Seal Watermark */}
              <div className="absolute top-32 left-32 z-20 flex flex-col items-center">
                <div className="w-80 h-80 rounded-full border-[12px] border-red-600/80 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl p-4 text-center shadow-[0_0_80px_rgba(225,6,0,0.4)]">
                  <div className="absolute inset-4 border-[4px] border-dashed border-white/30 rounded-full animate-[spin_20s_linear_infinite]" />
                  <img src="/logo_nfl.png" className="w-32 h-32 object-contain mb-2 opacity-100" />
                  <p className="text-2xl font-black uppercase tracking-[0.4em] text-white leading-tight mt-2 text-center w-full">
                    TOP 1%<br/><span className="text-red-500">ELITE</span>
                  </p>
                </div>
              </div>

              {/* Center Tech HUD Content */}
              <div className="relative z-20 mt-auto px-32 pb-[600px] flex flex-col">
                <p className="text-red-500 text-6xl font-black uppercase tracking-[0.5em] mb-4 drop-shadow-[0_0_20px_rgba(225,6,0,0.8)]">
                  {selectedPlayerForCard.favorite_team || 'IND'}
                </p>
                <h1 className="text-white text-[250px] font-black uppercase tracking-tighter leading-[0.8] mb-12 drop-shadow-2xl mix-blend-overlay opacity-90">
                  {selectedPlayerForCard.name}
                </h1>
                <h1 className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 text-[250px] font-black uppercase tracking-tighter leading-[0.8] absolute top-[-5px] left-32 pointer-events-none">
                  {selectedPlayerForCard.name}
                </h1>
                
                {/* HUD Stats Row */}
                <div className="flex gap-24 mt-32 border-t-[4px] border-white/10 pt-16">
                  <div className="flex flex-col">
                    <p className="text-white/50 text-4xl font-bold uppercase tracking-widest mb-4">Total Points</p>
                    <p className="text-white text-[150px] font-black leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimePoints}
                    </p>
                  </div>
                  <div className="w-[4px] bg-white/10" />
                  <div className="flex flex-col">
                    <p className="text-white/50 text-4xl font-bold uppercase tracking-widest mb-4">Total Goals</p>
                    <p className="text-white text-[150px] font-black leading-none drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                      {(selectedPlayerForCard as any).allTimeGoals}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer / Quote */}
              <div className="absolute bottom-0 left-0 w-full h-[450px] bg-gradient-to-t from-red-950 via-black to-transparent z-10 flex items-end justify-between px-32 pb-32">
                <div className="max-w-[1200px]">
                  <p className="text-white/40 text-5xl font-medium italic tracking-wide leading-relaxed font-serif">
                    "Legends are forged in the shadows,<br/>but crowned in the lights."
                  </p>
                  <p className="text-red-500 text-3xl font-black uppercase tracking-[0.3em] mt-8">
                    NAMMAFOOTBALL.COM
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  {selectedPlayerForCard.toppedSeasons?.length > 0 && (
                    <div className="flex gap-4 mb-8">
                      {selectedPlayerForCard.toppedSeasons.map((s: string, i: number) => (
                        <div key={i} className="bg-red-600 border border-red-400 px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(225,6,0,0.5)]">
                          <p className="text-white text-3xl font-black uppercase tracking-widest">{s}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <img src="/logo_nfl.png" className="h-40 opacity-50 grayscale contrast-200" />
                </div>
              </div>
            </div>
          </div>
        )}
      </section>


      {/* Standings */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30 flex flex-col gap-6">
        <div className="w-full h-2 bg-primary f1-slant-right mb-2" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-4">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight font-heading text-white">
            Standings
          </h2>
          
          {/* Local Season Selector */}
          {seasonsList.length > 0 && (
            <div className="flex items-center gap-2 bg-[#1a1a24] border border-border rounded-md px-3 py-1.5 self-start sm:self-auto">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Season:</span>
              <select
                value={standingsSeasonId || ""}
                onChange={(e) => setStandingsSeasonId(e.target.value)}
                className="bg-transparent text-white text-xs font-black uppercase tracking-widest outline-none border-0 cursor-pointer pr-4"
              >
                {seasonsList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#15151e] text-white">
                    {cleanBranding(s.name)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="relative min-h-[250px]">
          {standingsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : homeGroups.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground font-bold uppercase tracking-wider">No groups or standings configured for this season yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-12">
              {homeGroups.map((group) => {
                const groupBoards = homeLeaderboards.filter(l => l.group_id === group.id);
                const groupStandings: StandingsRow[] = groupBoards.map(l => ({
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

                return (
                  <div key={group.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-primary" />
                      <h3 className="text-xl font-black uppercase tracking-tight text-white">{group.name}</h3>
                    </div>
                    <GroupTable 
                      groupName={group.name}
                      standings={groupStandings} 
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Explore Grid */}
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-24 relative z-30">
        <div className="w-full h-2 bg-primary f1-slant-right mb-8" />
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-8 font-heading text-white">Explore NFL</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
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
