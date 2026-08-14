"use client";

import { Season, Tournament } from "@/types";

interface SeasonFilterBarProps {
  title: string;
  subtitle?: string;
  seasons: (Season & { tournament?: Tournament })[];
  selectedTournamentId: string;
  selectedSeasonId: string;
  onTournamentChange: (tournamentId: string) => void;
  onSeasonChange: (seasonId: string) => void;
  showAllTimeOption?: boolean;
}

export function SeasonFilterBar({
  title,
  subtitle,
  seasons,
  selectedTournamentId,
  selectedSeasonId,
  onTournamentChange,
  onSeasonChange,
  showAllTimeOption = false,
}: SeasonFilterBarProps) {
  // Extract unique tournaments from seasons
  const tournamentsMap: Record<string, Tournament> = {};
  seasons.forEach((s) => {
    if (s.tournament_id && s.tournament) {
      tournamentsMap[s.tournament_id] = s.tournament;
    }
  });
  const tournaments = Object.values(tournamentsMap);

  // Filter seasons based on selected tournament
  const availableSeasons = seasons.filter(
    (s) => selectedTournamentId === "all" || s.tournament_id === selectedTournamentId
  );

  return (
    <div className="w-full bg-background border-b-2 border-border py-6">
      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-primary" />
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-heading text-foreground">
              {title}
            </h1>
          </div>
          {subtitle && (
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1 ml-4.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto print:hidden">
          {/* Tournament Selector */}
          <div className="flex-1 md:flex-none">
            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
              Tournament
            </label>
            <select
              value={selectedTournamentId}
              onChange={(e) => {
                onTournamentChange(e.target.value);
                onSeasonChange("all");
              }}
              className="w-full md:w-48 bg-background border-2 border-primary text-foreground px-3 py-2 font-bold text-xs uppercase tracking-widest outline-none"
            >
              <option value="all">All Tournaments</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Season Selector */}
          <div className="flex-1 md:flex-none">
            <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1">
              Season
            </label>
            <select
              value={selectedSeasonId}
              onChange={(e) => onSeasonChange(e.target.value)}
              className="w-full md:w-48 bg-background border-2 border-primary text-foreground px-3 py-2 font-bold text-xs uppercase tracking-widest outline-none"
            >
              {showAllTimeOption && <option value="all">All Seasons (All Time)</option>}
              {!showAllTimeOption && <option value="all">All Seasons</option>}
              {availableSeasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (S{s.number})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
