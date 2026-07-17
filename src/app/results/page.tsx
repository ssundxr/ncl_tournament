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

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const [results, setResults] = useState<any[]>([]);
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

  // 2. Fetch completed matches when selected local season changes (using split queries)
  useEffect(() => {
    async function loadResults() {
      if (!selectedSeasonId) return;
      setDataLoading(true);

      // Fetch completed fixtures
      const { data: fixturesData } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_player:players!home_player_id(*),
          away_player:players!away_player_id(*)
        `)
        .eq('season_id', selectedSeasonId)
        .eq('status', 'completed')
        .order('matchday', { ascending: false });
        
      // Fetch all matches separately
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
        setResults(formattedData);
      } else if (fixturesData) {
        setResults(fixturesData.map((f: any) => ({ ...f, home_score: 0, away_score: 0 })));
      } else {
        setResults([]);
      }
      setDataLoading(false);
    }
    loadResults();
  }, [selectedSeasonId]);

  const groupResults = results.filter(r => r.stage === 'group');
  const knockoutResults = results.filter(r => r.stage === 'semi_final' || r.stage === 'final');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      {/* Page Header with local selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-foreground uppercase tracking-tighter skew-x-[-10deg]">
            <span className="skew-x-[10deg] block md:inline">MATCH</span> <span className="text-primary skew-x-[10deg] block md:inline">RESULTS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
            Latest scores and match history.
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
      ) : results.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
          No results available yet for this season.
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          {/* Knockout Stage Results */}
          {knockoutResults.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                  Knockout Results
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {knockoutResults.map((fixture) => (
                  <MatchBox key={fixture.id} fixture={fixture as any} />
                ))}
              </div>
            </div>
          )}

          {/* Group Stage Results */}
          {groupResults.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight text-white font-heading">
                  Group Stage Results
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                {groupResults.map((fixture) => (
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}
