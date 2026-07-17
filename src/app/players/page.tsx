"use client";

import { useEffect, useState, Suspense } from "react";
import { PlayerCard } from "@/components/player/player-card";
import { Player } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function PlayersPageContent() {
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get("season");

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
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
        // Fetch only players enrolled in this season
        const { data, error } = await supabase
          .from('season_enrollments')
          .select('player:players(*)')
          .eq('season_id', targetSeasonId);

        if (error) {
          console.error("Error fetching enrolled players:", error);
          setPlayers([]);
        } else if (data) {
          const playersList = data.map((e: any) => e.player).filter(Boolean) as Player[];
          // Sort players by name
          playersList.sort((a, b) => a.name.localeCompare(b.name));
          setPlayers(playersList);
        }
      } else {
        setPlayers([]);
      }
      setLoading(false);
    }
    loadPlayers();
  }, [seasonParam]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-6xl font-bold font-heading mb-4 text-foreground tracking-tighter drop-shadow-lg">
          PLAYER <span className="text-primary">DIRECTORY</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Browse the elite competitors of the Namma Champions League.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center text-muted-foreground py-24">
          No players registered for this season yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {players.map(player => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    }>
      <PlayersPageContent />
    </Suspense>
  );
}
