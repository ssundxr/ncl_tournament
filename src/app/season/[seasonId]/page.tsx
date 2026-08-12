"use client";

import { use, useEffect, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import Link from "next/link";
import { Loader2, Trophy, Calendar, PlayCircle, Users, UserPlus, Target, Swords } from "lucide-react";
import { cleanBranding } from "@/lib/utils/branding";
import { getLeaderboards, getGroups, getFixturesWithScores } from "@/lib/supabase/queries";
import { GroupTable } from "@/components/standings/group-table";
import { MatchBox } from "@/components/match/match-box";
import { motion } from "framer-motion";
import { StandingsRow, Player } from "@/types";
import { Button } from "@/components/ui/button";

export default function SeasonOverviewPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  const { season, tournament, isLoading: seasonLoading } = useSeason();

  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!seasonId) return;
    setLoading(true);
    Promise.all([
      getGroups(seasonId),
      getLeaderboards(seasonId),
      getFixturesWithScores(seasonId, false),
      getFixturesWithScores(seasonId, true),
    ])
      .then(([g, l, upcoming, results]) => {
        setGroups(g);
        setLeaderboards(l);
        setUpcomingFixtures(upcoming.slice(0, 3));
        setRecentResults(results.slice(0, 3));
      })
      .finally(() => setLoading(false));
  }, [seasonId]);

  if (seasonLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-black uppercase text-foreground">Season Not Found</h2>
        <Link href="/">
          <Button variant="outline">Return Home</Button>
        </Link>
      </div>
    );
  }

  const totalPlayed = leaderboards.reduce((s, l) => s + (l.played || 0), 0) / 2;
  const totalGoals = leaderboards.reduce((s, l) => s + (l.goals_for || 0), 0);
  const topScorer = leaderboards.length > 0
    ? leaderboards.reduce((top, l) => (l.goals_for > (top?.goals_for ?? -1) ? l : top), null)
    : null;

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

  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-16 flex flex-col gap-16 min-h-screen">

      {/* Season Title */}
      <motion.div {...fadeUp} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-2">
            {cleanBranding(tournament?.name ?? "NFL")}
          </p>
          <h1 className="text-5xl md:text-7xl font-black font-heading uppercase tracking-tighter text-foreground leading-none">
            {cleanBranding(season.name)}
          </h1>
          {season.start_date && (
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest mt-3">
              {new Date(season.start_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              {season.end_date && ` — ${new Date(season.end_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`}
            </p>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link href={`/season/${seasonId}/fixtures`}>
            <Button className="rounded-none border-2 border-foreground font-black uppercase tracking-widest">
              <Calendar className="w-4 h-4 mr-2" /> Fixtures
            </Button>
          </Link>
          <Link href={`/season/${seasonId}/standings`}>
            <Button variant="outline" className="rounded-none border-2 border-foreground font-black uppercase tracking-widest">
              <Trophy className="w-4 h-4 mr-2" /> Standings
            </Button>
          </Link>
          {season.status === "active" && (
            <Link href={`/season/${seasonId}/enroll`}>
              <Button className="rounded-none border-2 border-primary bg-primary text-white font-black uppercase tracking-widest">
                <UserPlus className="w-4 h-4 mr-2" /> Enroll
              </Button>
            </Link>
          )}
        </div>
      </motion.div>

      {/* Quick Stats Strip */}
      {!loading && (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Matches Played", value: Math.floor(totalPlayed), icon: Swords },
            { label: "Total Goals", value: totalGoals, icon: Target },
            { label: "Players", value: leaderboards.length, icon: Users },
            {
              label: "Top Scorer",
              value: topScorer?.player?.name?.split(" ").slice(-1)[0] ?? "—",
              icon: Trophy,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card border-2 border-border p-5 flex flex-col gap-2"
              >
                <Icon className="w-5 h-5 text-primary" />
                <p className="text-3xl font-black font-heading text-foreground tracking-tight">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            );
          })}
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Standings Preview */}
          <div className="lg:col-span-2 flex flex-col gap-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-primary" />
                <h2 className="text-2xl font-black uppercase tracking-tight font-heading">Standings</h2>
              </div>
              <Link href={`/season/${seasonId}/standings`} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                Full Table →
              </Link>
            </div>

            {groups.length === 0 ? (
              <div className="border-2 border-dashed border-border p-12 text-center text-muted-foreground font-bold uppercase tracking-wider">
                Standings not yet configured.
              </div>
            ) : (
              groups.map((group) => (
                <GroupTable
                  key={group.id}
                  groupName={group.name}
                  standings={getGroupStandings(group.id)}
                />
              ))
            )}
          </div>

          {/* Sidebar: Upcoming + Recent */}
          <div className="flex flex-col gap-10">
            {upcomingFixtures.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary" />
                    <h2 className="text-xl font-black uppercase tracking-tight font-heading">Upcoming</h2>
                  </div>
                  <Link href={`/season/${seasonId}/fixtures`} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    All →
                  </Link>
                </div>
                {upcomingFixtures.map((f) => (
                  <MatchBox key={f.id} fixture={f} />
                ))}
              </div>
            )}

            {recentResults.length > 0 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-foreground" />
                    <h2 className="text-xl font-black uppercase tracking-tight font-heading">Results</h2>
                  </div>
                  <Link href={`/season/${seasonId}/results`} className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    All →
                  </Link>
                </div>
                {recentResults.map((f) => (
                  <MatchBox key={f.id} fixture={f} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
