"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/match/match-card";
import { Fixture } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function FixturesPage() {
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFixtures() {
      const { data } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_player:players!home_player_id(*),
          away_player:players!away_player_id(*)
        `)
        .neq('status', 'completed')
        .order('matchday', { ascending: true });
        
      if (data) setFixtures(data);
      setLoading(false);
    }
    loadFixtures();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col mb-12 text-center md:text-left border-l-8 border-primary pl-6">
        <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-white uppercase tracking-tighter">
          UPCOMING <span className="text-primary">FIXTURES</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
          Schedule for the upcoming matches.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : fixtures.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
          No fixtures scheduled yet.
        </div>
      ) : (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          {fixtures.map((fixture) => (
            <MatchCard key={fixture.id} fixture={fixture as any} />
          ))}
        </div>
      )}
    </div>
  );
}
