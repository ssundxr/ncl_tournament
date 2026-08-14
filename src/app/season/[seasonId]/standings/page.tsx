"use client";

import { use, useEffect, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import { getGroups, getLeaderboards, getKnockouts } from "@/lib/supabase/queries";
import { GroupTable } from "@/components/standings/group-table";
import { Loader2, Trophy } from "lucide-react";
import { StandingsRow, Player } from "@/types";
import { cleanBranding } from "@/lib/utils/branding";

export default function SeasonStandingsPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  const { season, tournament, isLoading: seasonLoading } = useSeason();

  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [knockouts, setKnockouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    setLoading(true);
    Promise.all([getGroups(seasonId), getLeaderboards(seasonId), getKnockouts(seasonId)])
      .then(([g, l, k]) => {
        setGroups(g);
        setLeaderboards(l);
        setKnockouts(k);
      })
      .finally(() => setLoading(false));
  }, [seasonId]);

  const getGroupStandings = (groupId: string): StandingsRow[] =>
    leaderboards
      .filter((l) => l.group_id === groupId)
      .map((l) => ({
        player: l.player as Player,
        played: l.played,
        wins: l.wins,
        draws: l.draws,
        losses: l.losses,
        goalsFor: l.goals_for,
        goalsAgainst: l.goals_against,
        goalDifference: l.goal_difference,
        points: l.points,
        form: l.form || [],
      }));

  const quarters = knockouts.filter((k) => k.stage === "quarter_final");
  const semis = knockouts.filter((k) => k.stage === "semi_final");
  const finals = knockouts.filter((k) => k.stage === "final");

  const renderKnockoutCard = (match: any, label: string, accentClass: string) => {
    const rawMatch = Array.isArray(match.matches) ? match.matches[0] : match.matches;
    const homeScore = match.home_score ?? rawMatch?.home_score ?? "—";
    const awayScore = match.away_score ?? rawMatch?.away_score ?? "—";
    const homeName = match.home?.name || match.home_player?.name || "TBD";
    const awayName = match.away?.name || match.away_player?.name || "TBD";
    return (
      <div key={match.id} className={`bg-card border-2 ${accentClass} rounded-none overflow-hidden relative`}>
        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
        <div className="p-5 flex flex-col gap-3">
          <div className={`text-xs font-black uppercase tracking-widest ${accentClass.includes("yellow") ? "text-yellow-500" : "text-primary"}`}>
            {label} • <span className="text-muted-foreground">{match.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-foreground">{homeName}</span>
            <span className="font-black text-2xl text-primary">{homeScore}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-foreground">{awayName}</span>
            <span className="font-black text-2xl text-primary">{awayScore}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-l-8 border-primary pl-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter text-foreground skew-x-[-10deg]">
            <span className="block skew-x-[10deg]">{cleanBranding(tournament?.name ?? "NCL")}</span>
            <span className="text-primary block skew-x-[10deg]">STANDINGS</span>
          </h1>
          {season && (
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-2">
              {cleanBranding(season.name)} • Official Rankings & Knockouts
            </p>
          )}
        </div>
      </div>

      {loading || seasonLoading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 bg-card border-2 border-dashed border-border">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest">
            Groups have not been generated yet.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-16 max-w-5xl mx-auto">
          {groups.map((group) => (
            <GroupTable
              key={group.id}
              groupName={group.name}
              standings={getGroupStandings(group.id)}
            />
          ))}

          {knockouts.length > 0 && (
            <div>
              <h2 className="text-4xl font-black font-heading uppercase text-foreground mb-8 border-b-2 border-border pb-4">
                Knockout Stage
              </h2>
              <div className="flex flex-col gap-8">
                {quarters.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase text-primary tracking-widest mb-4">Quarter-Finals</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {quarters.map((m) => renderKnockoutCard(m, "QF", "border-border"))}
                    </div>
                  </div>
                )}
                {semis.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase text-primary tracking-widest mb-4">Semi-Finals</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      {semis.map((m) => renderKnockoutCard(m, "SF", "border-border"))}
                    </div>
                  </div>
                )}
                {finals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-black uppercase text-yellow-500 tracking-widest mb-4">Grand Final</h3>
                    <div className="max-w-md">
                      {finals.map((m) => renderKnockoutCard(m, "Championship Match", "border-yellow-500/50"))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
