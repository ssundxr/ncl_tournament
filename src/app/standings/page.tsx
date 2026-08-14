"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, Trophy, ShieldAlert } from "lucide-react";
import { SeasonFilterBar } from "@/components/common/season-filter-bar";
import { getSeasons, getGroups, getLeaderboards, getKnockouts } from "@/lib/supabase/queries";
import { GroupTable } from "@/components/standings/group-table";
import { StandingsRow, Player } from "@/types";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function StandingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "knockout" ? "knockout" : "group";

  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [activeTab, setActiveTab] = useState<"group" | "knockout">(initialTab);

  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [knockouts, setKnockouts] = useState<any[]>([]);

  useEffect(() => {
    getSeasons()
      .then((sData) => {
        setSeasons(sData);
        if (sData.length > 0) {
          const active = sData.find((s) => s.status === "active") || sData[0];
          setSelectedSeason(active.id);
          if (active.tournament_id) setSelectedTournament(active.tournament_id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const loadStandingsData = () => {
    if (!selectedSeason || selectedSeason === "all") return;
    setDataLoading(true);

    Promise.all([getGroups(selectedSeason), getLeaderboards(selectedSeason), getKnockouts(selectedSeason)])
      .then(([g, l, k]) => {
        setGroups(g);
        setLeaderboards(l);
        setKnockouts(k);
      })
      .catch((err) => console.error(err))
      .finally(() => setDataLoading(false));
  };

  useEffect(() => {
    loadStandingsData();

    // Subscribe to realtime updates on fixtures and leaderboard table
    const channel = supabase
      .channel("standings-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "fixtures" }, () => {
        loadStandingsData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "season_leaderboards" }, () => {
        loadStandingsData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSeason]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

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

  const r16 = knockouts.filter((k) => k.stage === "round_of_16");
  const quarters = knockouts.filter((k) => k.stage === "quarter_final");
  const semis = knockouts.filter((k) => k.stage === "semi_final");
  const finals = knockouts.filter((k) => k.stage === "final");

  const renderKnockoutCard = (match: any, label: string, accentClass: string) => {
    const rawMatch = Array.isArray(match.matches) ? match.matches[0] : match.matches;
    const homeScore = match.home_score ?? rawMatch?.home_score ?? "—";
    const awayScore = match.away_score ?? rawMatch?.away_score ?? "—";

    return (
      <div key={match.id} className="bg-card border-2 border-border p-4 shadow-sm relative group hover:border-primary transition-colors">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-2">
          <span>{label}</span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] ${match.status === "completed" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
            {match.status}
          </span>
        </div>
        <div className="space-y-2">
          <div className={`flex items-center justify-between p-2 font-bold text-sm ${match.winner_id === match.home_player_id ? "bg-primary/10 border-l-4 border-primary" : "bg-muted/30"}`}>
            <span className="truncate max-w-[120px]">{match.home_player?.name || "TBD"}</span>
            <span className="font-mono text-base font-black">{homeScore}</span>
          </div>
          <div className={`flex items-center justify-between p-2 font-bold text-sm ${match.winner_id === match.away_player_id ? "bg-primary/10 border-l-4 border-primary" : "bg-muted/30"}`}>
            <span className="truncate max-w-[120px]">{match.away_player?.name || "TBD"}</span>
            <span className="font-mono text-base font-black">{awayScore}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20">
      <SeasonFilterBar
        title="Tournament Standings"
        subtitle="Group Tables & Knockout Brackets"
        seasons={seasons}
        selectedTournamentId={selectedTournament}
        selectedSeasonId={selectedSeason}
        onTournamentChange={(tId) => setSelectedTournament(tId)}
        onSeasonChange={(sId) => setSelectedSeason(sId)}
      />

      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-8">
        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b-2 border-border pb-4 mb-8">
          <button
            onClick={() => setActiveTab("group")}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all ${
              activeTab === "group"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-foreground"
            }`}
          >
            Group Stage Tables
          </button>
          <button
            onClick={() => setActiveTab("knockout")}
            className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all ${
              activeTab === "knockout"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-muted-foreground border-border hover:border-foreground"
            }`}
          >
            Knockout Bracket
          </button>
        </div>

        {dataLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Loading Standings...
            </p>
          </div>
        ) : activeTab === "group" ? (
          groups.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-border p-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
                No Group Tables Available
              </h3>
              <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
                Group stage standings have not been generated for the selected season.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {groups.map((group) => (
                <GroupTable
                  key={group.id}
                  groupName={group.name}
                  standings={getGroupStandings(group.id)}
                />
              ))}
            </div>
          )
        ) : (
          /* Knockout Tab */
          knockouts.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-border p-8">
              <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
                No Knockout Stage Generated
              </h3>
              <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
                Knockout bracket has not been generated for this season yet.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {finals.length > 0 && (
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight font-heading mb-4 text-primary border-l-4 border-primary pl-3">
                    Grand Final
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {finals.map((m) => renderKnockoutCard(m, "Final", "border-primary"))}
                  </div>
                </div>
              )}

              {semis.length > 0 && (
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight font-heading mb-4 text-foreground border-l-4 border-foreground pl-3">
                    Semi Finals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {semis.map((m, i) => renderKnockoutCard(m, `Semi Final ${i + 1}`, "border-foreground"))}
                  </div>
                </div>
              )}

              {quarters.length > 0 && (
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight font-heading mb-4 text-foreground border-l-4 border-foreground pl-3">
                    Quarter Finals
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quarters.map((m, i) => renderKnockoutCard(m, `Quarter Final ${i + 1}`, "border-foreground"))}
                  </div>
                </div>
              )}

              {r16.length > 0 && (
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight font-heading mb-4 text-foreground border-l-4 border-foreground pl-3">
                    Round of 16
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {r16.map((m, i) => renderKnockoutCard(m, `R16 Match ${i + 1}`, "border-foreground"))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function StandingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <StandingsContent />
    </Suspense>
  );
}
