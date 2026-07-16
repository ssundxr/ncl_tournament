import { Scoreboard } from "@/components/match/scoreboard";
import { StatBar } from "@/components/match/stat-bar";
import { Match, MatchStats, Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Trophy, Share2, Download, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock Data
const MOCK_PLAYER_1: Player = { id: "1", name: "Player Alpha", slug: "alpha", photo_url: null, overall_rating: 95, favorite_team: "FC Barcelona", bio: null };
const MOCK_PLAYER_2: Player = { id: "2", name: "Player Beta", slug: "beta", photo_url: null, overall_rating: 92, favorite_team: "Real Madrid", bio: null };

const MOCK_MATCH: Match = {
  id: "m1",
  fixture_id: "f1",
  home_score: 2,
  away_score: 1,
  home_team: "FC Barcelona",
  away_team: "Real Madrid",
  started_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  ended_at: new Date(Date.now()).toISOString(),
  status: "completed",
  home_player: MOCK_PLAYER_1,
  away_player: MOCK_PLAYER_2,
};

const MOCK_STATS: MatchStats = {
  home_possession: 55, away_possession: 45,
  home_shots: 12, away_shots: 8,
  home_shots_on_target: 6, away_shots_on_target: 4,
  home_passes: 120, away_passes: 95,
  home_pass_accuracy: 88, away_pass_accuracy: 82,
  home_corners: 4, away_corners: 2,
  home_fouls: 2, away_fouls: 5,
  home_yellow_cards: 0, away_yellow_cards: 1,
  home_red_cards: 0, away_red_cards: 0,
};

export default function MatchCenterPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen space-y-8">
      
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading text-primary">Match Center</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass hover:bg-white/10 hidden md:flex">
            <Download className="w-4 h-4 mr-2" /> Match Graphic
          </Button>
          <Button variant="outline" size="sm" className="glass hover:bg-white/10">
            <Share2 className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Share</span>
          </Button>
        </div>
      </div>

      {/* Main Scoreboard */}
      <Scoreboard 
        homePlayer={MOCK_MATCH.home_player}
        awayPlayer={MOCK_MATCH.away_player}
        homeScore={MOCK_MATCH.home_score}
        awayScore={MOCK_MATCH.away_score}
        status={MOCK_MATCH.status}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Match Report & POTM */}
        <div className="space-y-8 lg:col-span-1">
          {/* Player of the Match */}
          <Card className="glass border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full z-0" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="flex items-center text-primary text-sm uppercase tracking-widest">
                <Trophy className="w-4 h-4 mr-2" /> Player of the Match
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-black border-2 border-primary overflow-hidden">
                 <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs text-muted-foreground">Photo</div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-xl">{MOCK_MATCH.home_player.name}</h3>
                <p className="text-sm text-muted-foreground">Rating: 8.5 • 2 Goals</p>
              </div>
            </CardContent>
          </Card>

          {/* AI Match Report */}
          <Card className="glass border-border">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center text-lg">
                <Bot className="w-5 h-5 mr-2 text-primary" /> AI Match Report
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <h4 className="font-bold font-heading text-xl text-foreground">Alpha's Tactical Masterclass Secures Victory</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                In a thrilling encounter, Player Alpha dominated the midfield with 55% possession, eventually breaking down Beta's stubborn defense. Alpha's clinical finishing proved to be the difference maker in this highly anticipated Group Stage clash.
              </p>
              <div className="bg-black/30 p-3 rounded-lg border border-white/5">
                <p className="text-xs text-primary font-bold mb-1">Key Insight</p>
                <p className="text-xs text-muted-foreground">Alpha completed 120 passes with an 88% accuracy, effectively neutralizing Beta's counter-attacking threat.</p>
              </div>
            </CardContent>
          </Card>

          {/* Original Screenshot */}
          <Card className="glass border-border">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="flex items-center text-lg text-muted-foreground">
                <ImageIcon className="w-5 h-5 mr-2" /> Match Evidence
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="aspect-video bg-black/50 rounded-lg border border-white/10 flex items-center justify-center text-xs text-muted-foreground">
                Screenshot not available
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Full Statistics */}
        <div className="lg:col-span-2">
          <Card className="glass-elevated border-border h-full">
            <CardHeader className="border-b border-white/5 text-center">
              <CardTitle className="font-heading text-2xl tracking-tight">Match Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pt-8 px-6 md:px-12 space-y-6">
              
              {/* Possession Donut / Bar */}
              <div className="mb-10 text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Possession</p>
                <div className="flex items-center justify-center gap-6 font-heading font-bold text-3xl">
                  <span className={MOCK_STATS.home_possession > MOCK_STATS.away_possession ? "text-primary" : "text-foreground"}>
                    {MOCK_STATS.home_possession}%
                  </span>
                  <div className="w-1/2 h-4 rounded-full flex overflow-hidden border border-white/10 bg-black">
                    <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${MOCK_STATS.home_possession}%` }} />
                    <div className="bg-white h-full transition-all duration-1000" style={{ width: `${MOCK_STATS.away_possession}%` }} />
                  </div>
                  <span className={MOCK_STATS.away_possession > MOCK_STATS.home_possession ? "text-primary" : "text-foreground"}>
                    {MOCK_STATS.away_possession}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <StatBar label="Shots" homeValue={MOCK_STATS.home_shots} awayValue={MOCK_STATS.away_shots} />
                <StatBar label="Shots on Target" homeValue={MOCK_STATS.home_shots_on_target} awayValue={MOCK_STATS.away_shots_on_target} />
                <StatBar label="Passes" homeValue={MOCK_STATS.home_passes} awayValue={MOCK_STATS.away_passes} />
                <StatBar label="Pass Accuracy" homeValue={MOCK_STATS.home_pass_accuracy} awayValue={MOCK_STATS.away_pass_accuracy} isPercentage />
                <StatBar label="Corners" homeValue={MOCK_STATS.home_corners} awayValue={MOCK_STATS.away_corners} />
                <StatBar label="Fouls" homeValue={MOCK_STATS.home_fouls} awayValue={MOCK_STATS.away_fouls} />
              </div>

              <div className="grid grid-cols-2 gap-8 pt-8 mt-8 border-t border-white/5">
                <div className="space-y-4">
                  <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">Cards</p>
                  <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-10 bg-yellow-400 rounded-sm mb-2 shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                      <span className="font-bold text-xl">{MOCK_STATS.home_yellow_cards}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-10 bg-red-500 rounded-sm mb-2 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                      <span className="font-bold text-xl">{MOCK_STATS.home_red_cards}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-center text-xs text-muted-foreground uppercase tracking-widest">Cards</p>
                  <div className="flex justify-center gap-8">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-10 bg-yellow-400 rounded-sm mb-2 shadow-[0_0_10px_rgba(250,204,21,0.3)]" />
                      <span className="font-bold text-xl">{MOCK_STATS.away_yellow_cards}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-10 bg-red-500 rounded-sm mb-2 shadow-[0_0_10px_rgba(239,68,68,0.3)]" />
                      <span className="font-bold text-xl">{MOCK_STATS.away_red_cards}</span>
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
