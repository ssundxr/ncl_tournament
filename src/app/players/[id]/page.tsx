import { Player } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Trophy, Activity, Target } from "lucide-react";
import { MatchCard } from "@/components/match/match-card";

const MOCK_PLAYER: Player = { 
  id: "1", 
  name: "Player Alpha", 
  slug: "alpha", 
  photo_url: null, 
  overall_rating: 95, 
  favorite_team: "FC Barcelona", 
  bio: "A tactical mastermind known for possession-based gameplay and clinical finishing." 
};

export default function PlayerProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12 min-h-screen space-y-8">
      
      {/* Profile Header */}
      <div className="relative rounded-3xl overflow-hidden glass-elevated border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/20 z-10" />
        {/* Placeholder banner image */}
        <div className="absolute inset-0 bg-[#1a1a1a] z-0" />
        
        <div className="relative z-20 p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-black/60 border-4 border-primary overflow-hidden shrink-0 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
            {MOCK_PLAYER.photo_url ? (
               <img src={MOCK_PLAYER.photo_url} alt={MOCK_PLAYER.name} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center">
                 <Shield className="w-20 h-20 text-primary/40" />
               </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <span className="text-primary text-xs font-bold tracking-widest uppercase">NFL Competitor</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-black text-foreground mb-2">{MOCK_PLAYER.name}</h1>
            <p className="text-lg md:text-xl text-primary font-medium">{MOCK_PLAYER.favorite_team}</p>
          </div>

          <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-2xl p-6 border border-white/10 shrink-0">
             <span className="text-5xl font-heading font-black text-primary leading-none mb-2">{MOCK_PLAYER.overall_rating}</span>
             <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Overall Rating</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info & Stats */}
        <div className="space-y-8 lg:col-span-1">
          <Card className="glass border-border">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">About</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                {MOCK_PLAYER.bio}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="glass border-border text-center p-6 flex flex-col justify-center items-center">
              <Trophy className="w-6 h-6 text-primary mb-2" />
              <span className="text-3xl font-heading font-bold text-foreground">4</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Wins</span>
            </Card>
            <Card className="glass border-border text-center p-6 flex flex-col justify-center items-center">
              <Target className="w-6 h-6 text-primary mb-2" />
              <span className="text-3xl font-heading font-bold text-foreground">12</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Goals</span>
            </Card>
            <Card className="glass border-border text-center p-6 flex flex-col justify-center items-center">
              <Activity className="w-6 h-6 text-primary mb-2" />
              <span className="text-3xl font-heading font-bold text-foreground">58%</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Avg Poss</span>
            </Card>
            <Card className="glass border-border text-center p-6 flex flex-col justify-center items-center">
              <Shield className="w-6 h-6 text-primary mb-2" />
              <span className="text-3xl font-heading font-bold text-foreground">3</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Clean Sheets</span>
            </Card>
          </div>
        </div>

        {/* Right Col: Match History */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="glass border-border h-full">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-lg">Recent Matches</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Reuse MatchCard component with mock data */}
              <MatchCard fixture={{
                  id: "m1", round: "Group Stage", matchday: 3, scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
                  status: "completed", home_player: MOCK_PLAYER, 
                  away_player: { id: "2", name: "Player Beta", slug: "beta", photo_url: null, overall_rating: 92, favorite_team: "Real Madrid", bio: null },
                  home_score: 3, away_score: 1,
              }} />
              <MatchCard fixture={{
                  id: "m3", round: "Group Stage", matchday: 2, scheduled_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
                  status: "completed", home_player: MOCK_PLAYER, 
                  away_player: { id: "4", name: "Player Delta", slug: "delta", photo_url: null, overall_rating: 85, favorite_team: "Bayern Munich", bio: null },
                  home_score: 4, away_score: 0,
              }} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
