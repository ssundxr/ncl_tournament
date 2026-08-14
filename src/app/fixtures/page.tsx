"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, Calendar } from "lucide-react";
import { SeasonFilterBar } from "@/components/common/season-filter-bar";
import { getSeasons, getFixturesWithScores } from "@/lib/supabase/queries";
import { MatchCard } from "@/components/match/match-card";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function FixturesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixturesLoading, setFixturesLoading] = useState(false);

  const [selectedTournament, setSelectedTournament] = useState("all");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "upcoming">(
    initialStatus as any
  );
  const [stageTab, setStageTab] = useState<"all" | "group" | "knockout">("all");

  const [fixtures, setFixtures] = useState<any[]>([]);

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

  const loadFixtures = () => {
    if (!selectedSeason || selectedSeason === "all") return;
    setFixturesLoading(true);

    getFixturesWithScores(selectedSeason, statusFilter)
      .then((fData) => setFixtures(fData))
      .catch((err) => console.error(err))
      .finally(() => setFixturesLoading(false));
  };

  useEffect(() => {
    loadFixtures();

    // Subscribe to realtime updates on fixtures table
    const channel = supabase
      .channel("match-center-realtime-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "fixtures" }, () => {
        loadFixtures();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedSeason, statusFilter]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const filteredFixtures = fixtures.filter((f) => {
    if (stageTab === "group" && f.stage && f.stage !== "group") return false;
    if (stageTab === "knockout" && f.stage === "group") return false;
    return true;
  });

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20">
      <SeasonFilterBar
        title="Match Center"
        subtitle="Schedule, Live Fixtures & Historical Results"
        seasons={seasons}
        selectedTournamentId={selectedTournament}
        selectedSeasonId={selectedSeason}
        onTournamentChange={(tId) => setSelectedTournament(tId)}
        onSeasonChange={(sId) => setSelectedSeason(sId)}
      />

      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-8">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-border pb-6 mb-8">
          {/* Stage Tabs */}
          <div className="flex items-center gap-2 bg-muted/30 p-1 border-2 border-border">
            <button
              onClick={() => setStageTab("all")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                stageTab === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setStageTab("group")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                stageTab === "group"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Group Stage
            </button>
            <button
              onClick={() => setStageTab("knockout")}
              className={`px-4 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                stageTab === "knockout"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Knockout Stage
            </button>
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 ${
                statusFilter === "all"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => setStatusFilter("upcoming")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 ${
                statusFilter === "upcoming"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 ${
                statusFilter === "completed"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground"
              }`}
            >
              Results
            </button>
          </div>
        </div>

        {/* Fixtures List */}
        {fixturesLoading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Fetching Fixtures...
            </p>
          </div>
        ) : filteredFixtures.length === 0 ? (
          <div className="py-20 text-center border-4 border-dashed border-border p-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
              No Fixtures Found
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
              There are no matches matching the selected filters for this season.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFixtures.map((fixture) => (
              <MatchCard key={fixture.id} fixture={fixture} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FixturesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <FixturesContent />
    </Suspense>
  );
}
