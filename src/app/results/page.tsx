"use client";

import { useEffect, useState, Suspense } from "react";
import { MatchCard } from "@/components/match/match-card";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      setLoading(true);

      let targetSeasonId = seasonParam;
      if (!targetSeasonId) {
        // Fallback: active season
        const { data: activeSeasons } = await supabase
          .from('seasons')
          .select('id')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);
        if (activeSeasons && activeSeasons.length > 0) {
          targetSeasonId = activeSeasons[0].id;
        } else {
          // Fallback 2: first available season
          const { data: firstSeasons } = await supabase
            .from('seasons')
            .select('id')
            .order('created_at', { ascending: false })
            .limit(1);
          if (firstSeasons && firstSeasons.length > 0) {
            targetSeasonId = firstSeasons[0].id;
          }
        }
      }

      if (targetSeasonId) {
        const { data } = await supabase
          .from('fixtures')
          .select(`
            *,
            home_player:players!home_player_id(*),
            away_player:players!away_player_id(*),
            matches(*)
          `)
          .eq('season_id', targetSeasonId)
          .eq('status', 'completed')
          .order('matchday', { ascending: false });
        if (data) {
          // Flatten the match score onto the fixture object so MatchCard can read it
          const formattedData = data.map((f: any) => {
            const match = f.matches?.[0];
            return {
              ...f,
              home_score: match ? (match.home_score ?? 0) : 0,
              away_score: match ? (match.away_score ?? 0) : 0,
            };
          });
          setResults(formattedData);
        } else {
          setResults([]);
        }
      } else {
        setResults([]);
      }
      setLoading(false);
    }
    loadResults();
  }, [seasonParam]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col mb-12 text-center md:text-left border-l-8 border-primary pl-6">
        <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-foreground uppercase tracking-tighter skew-x-[-10deg]">
          <span className="skew-x-[10deg] block md:inline">MATCH</span> <span className="text-primary skew-x-[10deg] block md:inline">RESULTS</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
          Latest scores and match history.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
          No results available yet for this season.
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {results.map((fixture) => (
            <MatchCard key={fixture.id} fixture={fixture as any} />
          ))}
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
