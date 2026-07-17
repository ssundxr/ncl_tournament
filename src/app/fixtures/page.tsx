"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import * as htmlToImage from "html-to-image";
import { MatchBox } from "@/components/match/match-box";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Loader2, Share2, Download } from "lucide-react";

function cleanBranding(str: string): string {
  if (!str) return "";
  return str
    .replace(/Namma Champions League/gi, "Namma Football League")
    .replace(/NCL/gi, "NFL");
}

function FixturesPageContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const fixturesRef = useRef<HTMLDivElement>(null);
  const [sharingFixtures, setSharingFixtures] = useState(false);

  const handleShareFixtures = async () => {
    if (!fixturesRef.current) return;
    setSharingFixtures(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(fixturesRef.current, { 
        quality: 0.95,
        backgroundColor: '#0a0a0a',
        style: { display: 'block' }
      });
      
      if (navigator.share) {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const file = new File([blob], 'nfl-fixtures.jpg', { type: 'image/jpeg' });
          await navigator.share({
            title: 'NFL Fixtures',
            files: [file]
          });
        } catch (shareErr) {
          triggerDownload(dataUrl, 'nfl-fixtures.jpg');
        }
      } else {
        triggerDownload(dataUrl, 'nfl-fixtures.jpg');
      }
    } catch (err) {
      console.error("Error generating image:", err);
      alert("Could not generate image for sharing.");
    } finally {
      setSharingFixtures(false);
    }
  };

  const triggerDownload = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  // 1. Initial Load: fetch all seasons and set default selection
  useEffect(() => {
    async function loadSeasons() {
      setLoading(true);
      const { data } = await supabase
        .from('seasons')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setSeasons(data);
        const defaultSeason = data.find((s: any) => s.id === seasonParam) || 
                              data.find((s: any) => s.status === 'active') || 
                              data[0];
        setSelectedSeasonId(defaultSeason.id);
      }
      setLoading(false);
    }
    loadSeasons();
  }, [seasonParam]);

  // 2. Fetch fixtures when selected local season changes (using split queries)
  useEffect(() => {
    async function loadFixtures() {
      if (!selectedSeasonId) return;
      setDataLoading(true);

      const { data: fixturesData } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_player:players!home_player_id(*),
          away_player:players!away_player_id(*)
        `)
        .eq('season_id', selectedSeasonId)
        .neq('status', 'completed')
        .order('matchday', { ascending: true });
        
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*');

      if (fixturesData && matchesData) {
        const matchMap: Record<string, any> = {};
        matchesData.forEach(m => {
          matchMap[m.fixture_id] = m;
        });

        // Flatten match scores in-memory
        const formattedData = fixturesData.map((f: any) => {
          const match = matchMap[f.id];
          return {
            ...f,
            home_score: match ? (match.home_score ?? 0) : 0,
            away_score: match ? (match.away_score ?? 0) : 0,
          };
        });
        setFixtures(formattedData);
      } else if (fixturesData) {
        setFixtures(fixturesData.map((f: any) => ({ ...f, home_score: 0, away_score: 0 })));
      } else {
        setFixtures([]);
      }
      setDataLoading(false);
    }
    loadFixtures();
  }, [selectedSeasonId]);

  const groupFixtures = fixtures.filter(f => f.stage === 'group');
  const semis = fixtures.filter(f => f.stage === 'semi_final');
  const finals = fixtures.filter(f => f.stage === 'final');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      {/* Page Header with local selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-white uppercase tracking-tighter skew-x-[-10deg]">
              <span className="skew-x-[10deg] block md:inline">UPCOMING</span> <span className="text-primary skew-x-[10deg] block md:inline">FIXTURES</span>
            </h1>
            <Button 
              onClick={handleShareFixtures}
              disabled={sharingFixtures || fixtures.length === 0}
              size="sm"
              className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black uppercase tracking-widest text-[10px] h-8 rounded-sm shadow-[0_0_15px_rgba(225,6,0,0.4)] border border-red-500/50 skew-x-[-10deg] sm:ml-4"
            >
              <div className="flex items-center skew-x-[10deg]">
                {sharingFixtures ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Share2 className="w-3.5 h-3.5 mr-2" />}
                Share F1 Card
              </div>
            </Button>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest mt-2">
            Schedule for the upcoming matches.
          </p>
        </div>

        {!loading && seasons.length > 0 && (
          <div className="flex items-center gap-2 bg-[#1a1a24] border border-border rounded-md px-4 py-2 self-start md:self-auto select-none">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Season:</span>
            <select
              value={selectedSeasonId || ""}
              onChange={(e) => setSelectedSeasonId(e.target.value)}
              className="bg-transparent text-white text-xs font-black uppercase tracking-widest outline-none border-0 cursor-pointer pr-4"
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#15151e] text-white">
                  {cleanBranding(s.name)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading || dataLoading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : fixtures.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
          No fixtures scheduled yet for this season.
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Knockout Bracket */}
          {(semis.length > 0 || finals.length > 0) && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                  Knockout Bracket
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto bg-[#13131a] p-6 border border-border rounded-2xl relative">
                {/* Semis */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase text-primary tracking-widest text-center border-b border-border pb-2">Semi-Finals</h3>
                  {semis.map((match) => (
                    <MatchBox key={match.id} fixture={match} />
                  ))}
                  {semis.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Semis TBD
                    </div>
                  )}
                </div>

                {/* Finals */}
                <div className="space-y-6 flex flex-col justify-center">
                  <h3 className="text-xs font-black uppercase text-yellow-500 tracking-widest text-center border-b border-border pb-2">Grand Final</h3>
                  {finals.map((match) => (
                    <MatchBox key={match.id} fixture={match} />
                  ))}
                  {finals.length === 0 && (
                    <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                      Grand Final TBD
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Group Stage Matches Grid */}
          {groupFixtures.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                  Group Stage Fixtures
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {groupFixtures.map((fixture) => (
                  <MatchBox key={fixture.id} fixture={fixture as any} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Hidden F1 Style Card for Image Generation */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={fixturesRef} className="w-[1080px] h-[1920px] bg-[#0a0a0a] relative overflow-hidden flex flex-col p-16 font-sans">
          {/* Background Texture & Effects */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#330000_0%,#0a0a0a_70%)] opacity-80" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute -right-64 top-32 w-[800px] h-[200px] bg-red-600/30 blur-[120px] rounded-full rotate-45" />
          <div className="absolute -left-64 bottom-32 w-[800px] h-[200px] bg-red-600/20 blur-[120px] rounded-full -rotate-45" />
          
          {/* Header */}
          <div className="relative z-10 border-l-[12px] border-red-600 pl-8 mb-24 mt-12 flex justify-between items-end">
            <div>
              <h1 className="text-white text-8xl font-black uppercase italic tracking-tighter leading-none m-0">
                MATCH<br/>DAY
              </h1>
              <p className="text-red-500 text-3xl font-bold uppercase tracking-[0.2em] mt-4">Namma Football League</p>
            </div>
            <div className="text-right pb-4">
              <p className="text-white/50 text-2xl font-black uppercase tracking-widest italic">{
                seasons.find(s => s.id === selectedSeasonId)?.name || 'Season'
              }</p>
            </div>
          </div>

          {/* Fixtures List */}
          <div className="relative z-10 flex-1 flex flex-col gap-10 mt-8">
            {fixtures.slice(0, 4).map((fixture, idx) => {
              const home = fixture.home_player;
              const away = fixture.away_player;
              
              if (!home || !away) return null;
              
              return (
                <div key={fixture.id} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent skew-x-[-15deg] transform -translate-x-4 opacity-50" />
                  <div className="relative flex items-center bg-[#151515] border border-white/10 skew-x-[-15deg] overflow-hidden p-1">
                    
                    {/* Home Player */}
                    <div className="flex-1 px-8 flex justify-end items-center bg-[#111] h-36">
                      <div className="skew-x-[15deg] flex items-center gap-6">
                         <div className="text-right">
                           <p className="text-white/50 text-xl font-bold uppercase tracking-widest">{home.favorite_team || 'IND'}</p>
                           <h2 className="text-white text-4xl font-black uppercase italic tracking-tight">{home.name}</h2>
                         </div>
                         {home.photo_url && (
                           <img src={home.photo_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover grayscale contrast-125" />
                         )}
                      </div>
                    </div>
                    
                    {/* VS Box */}
                    <div className="w-24 h-36 bg-red-600 flex items-center justify-center border-x-4 border-black shrink-0">
                      <div className="skew-x-[15deg]">
                        <span className="text-4xl font-black italic text-white leading-none">VS</span>
                      </div>
                    </div>

                    {/* Away Player */}
                    <div className="flex-1 px-8 flex justify-start items-center bg-[#111] h-36">
                      <div className="skew-x-[15deg] flex items-center gap-6">
                         {away.photo_url && (
                           <img src={away.photo_url} className="w-20 h-20 rounded-full border-2 border-white/20 object-cover grayscale contrast-125" />
                         )}
                         <div className="text-left">
                           <p className="text-white/50 text-xl font-bold uppercase tracking-widest">{away.favorite_team || 'IND'}</p>
                           <h2 className="text-white text-4xl font-black uppercase italic tracking-tight">{away.name}</h2>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="relative z-10 mt-auto border-t border-white/10 pt-12 flex justify-between items-end pb-8">
            <div>
              <p className="text-white/50 text-xl font-bold tracking-widest uppercase">Official Matchday Fixtures</p>
              <p className="text-white text-2xl font-black italic tracking-tighter">NAMMAFOOTBALL.COM</p>
            </div>
            <img src="/logo_nfl.png" className="h-24 opacity-80 grayscale contrast-200" />
          </div>
        </div>
      </div>

    </div>
  );
}

export default function FixturesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <FixturesPageContent />
    </Suspense>
  );
}
