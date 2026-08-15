"use client";

import { use, useEffect, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import { PlayerCard } from "@/components/player/player-card";
import { Loader2 } from "lucide-react";
import { Player } from "@/types";
import { cleanBranding } from "@/lib/utils/branding";

export default function SeasonPlayersPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  const { season, isLoading: seasonLoading } = useSeason();

  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    setLoading(true);
    fetch(`/api/season/players?season_id=${seasonId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setPlayers(json.data as Player[]);
        } else {
          setPlayers([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load season players:", err);
        setPlayers([]);
      })
      .finally(() => setLoading(false));
  }, [seasonId]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter text-foreground">
            Player Directory
          </h1>
          {season && (
            <p className="text-muted-foreground text-base font-bold uppercase tracking-widest mt-2">
              {cleanBranding(season.name)} • {players.length} competitor{players.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {loading || seasonLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground font-bold uppercase tracking-wider border-2 border-dashed border-border">
          No players registered for this season yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {players.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </div>
      )}
    </div>
  );
}
