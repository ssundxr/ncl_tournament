"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getPlayerStatsBySlug } from "@/lib/supabase/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Trophy, Activity, Target, Loader2, ChevronLeft } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cleanBranding } from "@/lib/utils/branding";

export default function PlayerProfilePage() {
  const params = useParams();
  const slug = params?.id as string;

  const [player, setPlayer] = useState<any>(null);
  const [stats, setStats] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [recentFixtures, setRecentFixtures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getPlayerStatsBySlug(slug)
      .then(({ player: p, stats: s, leaderboards: l, recentFixtures: rf }) => {
        setPlayer(p);
        setStats(s);
        setLeaderboards(l);
        setRecentFixtures(rf);
      })
      .catch(() => setError("Player not found."))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground font-bold uppercase tracking-wider">{error ?? "Player not found."}</p>
        <Link href="/"><Button variant="outline" className="rounded-none font-black uppercase tracking-widest"><ChevronLeft className="w-4 h-4 mr-2" />Return Home</Button></Link>
      </div>
    );
  }

  // Aggregate stats across all seasons
  const totalWins = leaderboards.reduce((s, l) => s + (l.wins ?? 0), 0);
  const totalGoals = leaderboards.reduce((s, l) => s + (l.goals_for ?? 0), 0);
  const totalPoints = leaderboards.reduce((s, l) => s + (l.points ?? 0), 0);
  const totalPlayed = leaderboards.reduce((s, l) => s + (l.played ?? 0), 0);
  const avgPoss = stats.length > 0
    ? (stats.reduce((s, st) => s + (st.avg_possession ?? 0), 0) / stats.length).toFixed(0)
    : "—";
  const cleanSheets = stats.reduce((s, st) => s + (st.clean_sheets ?? 0), 0);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen space-y-8">

      {/* Profile Header */}
      <div className="relative overflow-hidden bg-card border-2 border-border">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        {player.photo_url ? (
          <div className="absolute inset-0 z-0">
            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover object-top opacity-30 contrast-125" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-muted z-0" />
        )}

        <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-secondary border-4 border-background overflow-hidden flex-shrink-0">
            {player.photo_url ? (
              <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Shield className="w-20 h-20 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center px-3 py-1 border-2 border-primary bg-primary/10 mb-4">
              <span className="text-primary text-[10px] font-black tracking-wider uppercase">NCL Competitor</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tighter text-foreground mb-2 uppercase">
              {player.name}
            </h1>
            <p className="text-lg text-muted-foreground font-black uppercase tracking-widest">
              {player.favorite_team ?? "Independent"}
            </p>
            {player.bio && (
              <p className="text-sm text-muted-foreground font-medium mt-3 max-w-xl">{player.bio}</p>
            )}
          </div>

          <div className="flex flex-col items-center bg-background/50 backdrop-blur-md p-6 border-2 border-border flex-shrink-0">
            <span className="text-5xl font-heading font-black tracking-tight text-primary leading-none mb-2">
              {totalPoints}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black">All-Time PTS</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Stats cards */}
        <div className="space-y-8 lg:col-span-1">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Wins", value: totalWins, icon: Trophy },
              { label: "Goals", value: totalGoals, icon: Target },
              { label: "Avg Poss", value: avgPoss + (avgPoss !== "—" ? "%" : ""), icon: Activity },
              { label: "Clean Sheets", value: cleanSheets, icon: Shield },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="bg-card border-2 border-border text-center p-6 flex flex-col justify-center items-center hover:border-primary transition-colors">
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <span className="text-3xl font-heading font-black text-foreground">{stat.value}</span>
                  <span className="text-[10px] uppercase tracking-wider font-black text-muted-foreground mt-1">{stat.label}</span>
                </Card>
              );
            })}
          </div>

          {/* Season breakdown */}
          {leaderboards.length > 0 && (
            <Card className="bg-card border-2 border-border">
              <CardHeader className="border-b-2 border-border pb-4">
                <CardTitle className="text-sm font-black uppercase tracking-widest">Season History</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {leaderboards.map((l: any) => (
                  <div key={l.id} className="flex items-center justify-between text-sm border-b border-border pb-3 last:border-0 last:pb-0">
                    <span className="font-bold text-muted-foreground">{cleanBranding(l.season?.name ?? "Season")}</span>
                    <div className="flex gap-3 text-xs font-black">
                      <span className="text-foreground">{l.points} PTS</span>
                      <span className="text-muted-foreground">{l.played}P</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Recent matches */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-2 border-border h-full">
            <CardHeader className="border-b-2 border-border pb-4">
              <CardTitle className="text-lg font-black uppercase tracking-tight">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {recentFixtures.length === 0 ? (
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm text-center py-12">No matches played yet.</p>
              ) : (
                recentFixtures.map((fixture: any) => {
                  const m = Array.isArray(fixture.matches) ? fixture.matches[0] : fixture.matches;
                  const fixtureWithScore = {
                    ...fixture,
                    home_score: fixture.home_score ?? m?.home_score ?? 0,
                    away_score: fixture.away_score ?? m?.away_score ?? 0,
                  };
                  return <MatchCard key={fixture.id} fixture={fixtureWithScore} />;
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
