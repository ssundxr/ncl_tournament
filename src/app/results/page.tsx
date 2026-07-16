"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/match/match-card";
import { Fixture } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResults() {
      const { data } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_player:players!home_player_id(*),
          away_player:players!away_player_id(*),
          matches(*)
        `)
        .eq('status', 'completed')
        .order('matchday', { ascending: false });
        
      if (data) {
        // Flatten the match score onto the fixture object so MatchCard can read it
        const formattedData = data.map((f: any) => ({
          ...f,
          home_score: f.home_score ?? 0,
          away_score: f.away_score ?? 0,
        }));
        setResults(formattedData);
      }
      setLoading(false);
    }
    loadResults();
  }, []);

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
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
          No results available yet.
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
