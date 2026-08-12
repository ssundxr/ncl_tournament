"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMatchDetail } from "@/lib/supabase/queries";
import { Scoreboard } from "@/components/match/scoreboard";
import { StatBar } from "@/components/match/stat-bar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Trophy, Image as ImageIcon, Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MatchCenterPage() {
  const params = useParams();
  const fixtureId = params?.id as string;

  const [fixture, setFixture] = useState<any>(null);
  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fixtureId) return;
    setLoading(true);
    getMatchDetail(fixtureId)
      .then(({ fixture: f, match: m }) => {
        setFixture(f);
        setMatch(m);
      })
      .catch(() => setError("Match not found."))
      .finally(() => setLoading(false));
  }, [fixtureId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !fixture) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground font-bold uppercase tracking-wider">{error ?? "Match not found."}</p>
        <Link href="/">
          <Button variant="outline" className="font-black uppercase tracking-widest rounded-none">
            <ChevronLeft className="w-4 h-4 mr-2" /> Return Home
          </Button>
        </Link>
      </div>
    );
  }

  const stats = match?.statistics?.[0] ?? null;
  const aiReports = match?.ai_reports ?? [];
  const media = match?.media ?? [];
  const matchReport = aiReports.find((r: any) => r.report_type === "match_report") ?? null;

  const seasonId = fixture.season_id;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen space-y-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
        <Link href={`/season/${seasonId}`} className="hover:text-foreground transition-colors">Season</Link>
        <span>/</span>
        <Link href={`/season/${seasonId}/results`} className="hover:text-foreground transition-colors">Results</Link>
        <span>/</span>
        <span className="text-foreground">Match Detail</span>
      </div>

      {/* Stage & Round Badge */}
      <div className="flex items-center gap-3">
        <span className="bg-foreground text-background px-3 py-1 text-xs font-black uppercase tracking-widest">
          {fixture.stage?.replace("_", " ") ?? "Group Stage"}
        </span>
        {fixture.matchday && (
          <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">
            Matchday {fixture.matchday}
          </span>
        )}
      </div>

      {/* Main Scoreboard */}
      <Scoreboard
        homePlayer={fixture.home_player}
        awayPlayer={fixture.away_player}
        homeScore={match?.home_score ?? 0}
        awayScore={match?.away_score ?? 0}
        status={fixture.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8 lg:col-span-1">

          {/* Player of the Match */}
          {match?.player_of_match && (
            <Card className="bg-card border-2 border-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full z-0 blur-xl" />
              <CardHeader className="pb-2 relative z-10">
                <CardTitle className="flex items-center text-primary text-xs font-black uppercase tracking-wider">
                  <Trophy className="w-4 h-4 mr-2" /> Player of the Match
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex items-center gap-4">
                {[fixture.home_player, fixture.away_player].find((p: any) => p.id === match.player_of_match) && (() => {
                  const potm = [fixture.home_player, fixture.away_player].find((p: any) => p.id === match.player_of_match);
                  return (
                    <>
                      <div className="w-16 h-16 rounded-full bg-muted border-2 border-border overflow-hidden flex-shrink-0">
                        {potm?.photo_url ? (
                          <img src={potm.photo_url} alt={potm.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold uppercase">
                            {potm?.name?.[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-heading font-black tracking-tight text-xl text-foreground uppercase">{potm?.name}</h3>
                        <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">{potm?.favorite_team}</p>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* AI Match Report */}
          {matchReport && (
            <Card className="bg-card border-2 border-border">
              <CardHeader className="border-b-2 border-border pb-4">
                <CardTitle className="flex items-center text-lg font-black tracking-tight uppercase">
                  <Bot className="w-5 h-5 mr-2 text-primary" /> AI Match Report
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {matchReport.headline && (
                  <h4 className="font-black font-heading tracking-tight text-lg text-foreground uppercase">{matchReport.headline}</h4>
                )}
                <p className="text-sm text-muted-foreground font-medium leading-relaxed">{matchReport.content}</p>
              </CardContent>
            </Card>
          )}

          {/* Match Screenshots */}
          {(match?.screenshot_url || media.length > 0) && (
            <Card className="bg-card border-2 border-border">
              <CardHeader className="border-b-2 border-border pb-4">
                <CardTitle className="flex items-center text-lg font-black uppercase tracking-tight text-muted-foreground">
                  <ImageIcon className="w-5 h-5 mr-2" /> Match Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {match?.screenshot_url && (
                  <img
                    src={match.screenshot_url}
                    alt="Match screenshot"
                    className="w-full rounded-none border-2 border-border object-cover"
                  />
                )}
                {media.map((m: any) => (
                  <img key={m.id} src={m.url} alt={m.caption ?? "Match media"} className="w-full border-2 border-border object-cover" />
                ))}
              </CardContent>
            </Card>
          )}

          {!matchReport && !match?.screenshot_url && media.length === 0 && (
            <Card className="bg-card border-2 border-border">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground font-bold uppercase tracking-wider text-sm">No match report available yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Statistics */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-2 border-border h-full">
            <CardHeader className="border-b-2 border-border text-center">
              <CardTitle className="font-heading font-black text-2xl tracking-tight text-foreground uppercase">
                Match Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-6 md:px-12 space-y-6">
              {stats ? (
                <>
                  {/* Possession */}
                  <div className="mb-10 text-center">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Possession</p>
                    <div className="flex items-center justify-center gap-6 font-heading font-black text-3xl">
                      <span className={stats.home_possession > stats.away_possession ? "text-primary" : "text-foreground"}>
                        {stats.home_possession}%
                      </span>
                      <div className="w-1/2 h-3 flex overflow-hidden bg-muted">
                        <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${stats.home_possession}%` }} />
                        <div className="bg-primary/20 h-full transition-all duration-1000" style={{ width: `${stats.away_possession}%` }} />
                      </div>
                      <span className={stats.away_possession > stats.home_possession ? "text-primary" : "text-foreground"}>
                        {stats.away_possession}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <StatBar label="Shots" homeValue={stats.home_shots} awayValue={stats.away_shots} />
                    <StatBar label="Shots on Target" homeValue={stats.home_shots_on_target} awayValue={stats.away_shots_on_target} />
                    <StatBar label="Passes" homeValue={stats.home_passes} awayValue={stats.away_passes} />
                    <StatBar label="Pass Accuracy" homeValue={stats.home_pass_accuracy} awayValue={stats.away_pass_accuracy} isPercentage />
                    <StatBar label="Corners" homeValue={stats.home_corners} awayValue={stats.away_corners} />
                    <StatBar label="Fouls" homeValue={stats.home_fouls} awayValue={stats.away_fouls} />
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t-2 border-border">
                    {[
                      { label: fixture.home_player?.name, yellow: stats.home_yellow_cards, red: stats.home_red_cards },
                      { label: fixture.away_player?.name, yellow: stats.away_yellow_cards, red: stats.away_red_cards },
                    ].map((side) => (
                      <div key={side.label} className="space-y-4">
                        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">{side.label}</p>
                        <div className="flex justify-center gap-8">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-10 bg-yellow-400 mb-2" />
                            <span className="font-black text-xl text-foreground">{side.yellow}</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-10 bg-destructive mb-2" />
                            <span className="font-black text-xl text-foreground">{side.red}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-20 text-muted-foreground font-bold uppercase tracking-wider">
                  Match statistics not yet available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
