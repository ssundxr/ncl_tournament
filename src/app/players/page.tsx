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

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);

  const [players, setPlayers] = useState<Player[]>([]);
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

  // 2. Fetch enrolled players when selected local season changes
  useEffect(() => {
    async function loadPlayers() {
      if (!selectedSeasonId) return;
      setDataLoading(true);

      const { data, error } = await supabase
        .from('season_enrollments')
        .select('player:players(*)')
        .eq('season_id', selectedSeasonId);

      if (error) {
        console.error("Error fetching enrolled players:", error);
        setPlayers([]);
      } else if (data) {
        const playersList = data.map((e: any) => e.player).filter(Boolean) as Player[];
        // Sort players alphabetically by name
        playersList.sort((a, b) => a.name.localeCompare(b.name));
        setPlayers(playersList);
      }
      setDataLoading(false);
    }
    loadPlayers();
  }, [selectedSeasonId]);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      {/* Page Header with local selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-foreground uppercase tracking-tighter skew-x-[-10deg]">
            <span className="skew-x-[10deg] block md:inline">PLAYER</span> <span className="text-primary skew-x-[10deg] block md:inline">DIRECTORY</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
            Browse the elite competitors of the Namma Champions League.
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
                  {s.name}
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
      ) : players.length === 0 ? (
        <div className="text-center text-muted-foreground py-24 font-bold uppercase tracking-wider">
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
