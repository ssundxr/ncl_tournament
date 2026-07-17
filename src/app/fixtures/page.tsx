"use client";

import { useEffect, useState, Suspense } from "react";
import { MatchBox } from "@/components/match/match-box";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

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
          <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-white uppercase tracking-tighter skew-x-[-10deg]">
            <span className="skew-x-[10deg] block md:inline">UPCOMING</span> <span className="text-primary skew-x-[10deg] block md:inline">FIXTURES</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
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
