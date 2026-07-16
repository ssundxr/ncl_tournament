import { Player } from "@/types";
import { Shield } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

interface ScoreboardProps {
  homePlayer: Player;
  awayPlayer: Player;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "completed" | "cancelled";
  matchTime?: string;
}

export function Scoreboard({ homePlayer, awayPlayer, homeScore, awayScore, status, matchTime }: ScoreboardProps) {
  const isCompletedOrLive = status === "completed" || status === "live";

  return (
    <div className="w-full glass-elevated border border-primary/20 rounded-3xl overflow-hidden relative shadow-2xl">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80 z-0" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 mix-blend-overlay" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 md:gap-4">
        
        {/* Home Player */}
        <div className="flex flex-1 flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:justify-end">
          <div className="flex flex-col items-center md:items-end text-center md:text-right order-2 md:order-1">
            <h2 className="text-2xl md:text-4xl font-heading font-black text-foreground">{homePlayer.name}</h2>
            <span className="text-sm md:text-base text-muted-foreground">{homePlayer.favorite_team}</span>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/60 border-2 border-primary/50 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(212,175,55,0.2)] order-1 md:order-2 overflow-hidden">
            {homePlayer.photo_url ? (
               <img src={homePlayer.photo_url} alt={homePlayer.name} className="w-full h-full object-cover" />
            ) : (
               <Shield className="w-12 h-12 md:w-16 md:h-16 text-primary/40" />
            )}
          </div>
        </div>

        {/* Score / Center Info */}
        <div className="flex flex-col items-center justify-center min-w-[140px] gap-3">
          <StatusBadge status={status} className="mb-2" />
          
          {isCompletedOrLive ? (
            <div className="flex items-center gap-4 font-heading font-black text-6xl md:text-7xl drop-shadow-2xl">
              <span className={homeScore && awayScore && homeScore > awayScore ? "text-primary" : "text-foreground"}>
                {homeScore ?? 0}
              </span>
              <span className="text-primary/30 text-5xl">-</span>
              <span className={homeScore && awayScore && awayScore > homeScore ? "text-primary" : "text-foreground"}>
                {awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="text-3xl font-bold font-heading text-muted-foreground">VS</div>
          )}

          {status === "live" && matchTime && (
            <div className="mt-2 text-primary font-bold animate-pulse text-lg">
              {matchTime}'
            </div>
          )}
          {status === "completed" && (
            <div className="mt-2 text-muted-foreground font-bold text-sm tracking-widest uppercase">
              Full Time
            </div>
          )}
        </div>

        {/* Away Player */}
        <div className="flex flex-1 flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:justify-start">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-black/60 border-2 border-white/20 flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(255,255,255,0.05)] overflow-hidden">
            {awayPlayer.photo_url ? (
               <img src={awayPlayer.photo_url} alt={awayPlayer.name} className="w-full h-full object-cover" />
            ) : (
               <Shield className="w-12 h-12 md:w-16 md:h-16 text-white/40" />
            )}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-heading font-black text-foreground">{awayPlayer.name}</h2>
            <span className="text-sm md:text-base text-muted-foreground">{awayPlayer.favorite_team}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
