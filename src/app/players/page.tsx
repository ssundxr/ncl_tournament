"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, Search, Users, User, Download, Trophy } from "lucide-react";
import { SeasonFilterBar } from "@/components/common/season-filter-bar";
import { getSeasons, getAllTimeLeaderboard } from "@/lib/supabase/queries";

function PlayersContent() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [playersLoading, setPlayersLoading] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    getSeasons()
      .then((sData) => {
        setSeasons(sData);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPlayersLoading(true);
    getAllTimeLeaderboard(
      selectedSeason === "all" ? undefined : selectedSeason,
      selectedTournament === "all" ? undefined : selectedTournament
    )
      .then((pData) => setPlayers(pData))
      .catch((err) => console.error(err))
      .finally(() => setPlayersLoading(false));
  }, [selectedSeason, selectedTournament]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const filteredPlayers = players.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.favorite_team?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20">
      <SeasonFilterBar
        title="Players Directory"
        subtitle="Competitor Directory, Stats & Rankings"
        seasons={seasons}
        selectedTournamentId={selectedTournament}
        selectedSeasonId={selectedSeason}
        onTournamentChange={(tId) => setSelectedTournament(tId)}
        onSeasonChange={(sId) => setSelectedSeason(sId)}
        showAllTimeOption={true}
      />

      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-8">
        {/* Search Bar */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search player or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border-2 border-primary pl-10 pr-4 py-2.5 text-xs font-bold uppercase tracking-widest text-foreground outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground hidden sm:block">
            {filteredPlayers.length} Player{filteredPlayers.length !== 1 ? "s" : ""} Found
          </span>
        </div>

        {/* Players Grid */}
        {playersLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Loading Players...
            </p>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-border p-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
              No Players Found
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
              No registered competitors match your selected filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPlayers.map((player, index) => (
              <div
                key={player.id || index}
                className="bg-card border-2 border-border p-5 relative group transition-all duration-300 hover:border-primary hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-black uppercase tracking-widest border-l-2 border-foreground">
                      {player.favorite_team || "IND"}
                    </span>
                    <span className="font-mono text-xs font-black text-muted-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-muted border-2 border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-base uppercase tracking-tight text-foreground line-clamp-1 font-heading">
                        {player.name}
                      </h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {player.mobile ? `+91 ${player.mobile.slice(-4)}` : "Verified Competitor"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t-2 border-border pt-3 grid grid-cols-2 gap-2 text-center">
                  <div className="bg-muted/30 p-2">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Goals
                    </span>
                    <span className="font-mono text-lg font-black text-foreground">
                      {player.allTimeGoals || 0}
                    </span>
                  </div>
                  <div className="bg-muted/30 p-2">
                    <span className="block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                      Points
                    </span>
                    <span className="font-mono text-lg font-black text-primary">
                      {player.allTimePoints || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <PlayersContent />
    </Suspense>
  );
}
