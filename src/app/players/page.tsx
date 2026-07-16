"use client";

import { useEffect, useState } from "react";
import { PlayerCard } from "@/components/player/player-card";
import { Player } from "@/types";
import { supabase } from "@/lib/supabase/client";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlayers() {
      const { data } = await supabase.from("players").select("*").order("name");
      if (data) setPlayers(data as Player[]);
      setLoading(false);
    }
    loadPlayers();
  }, []);

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
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center text-muted-foreground py-24">
          No players registered yet.
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
