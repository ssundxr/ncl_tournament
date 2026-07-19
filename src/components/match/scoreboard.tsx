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
    <div className="w-full bg-card border-[3px] border-foreground shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.05] z-0 mix-blend-overlay" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-12 gap-8 md:gap-4">
        
        {/* Home Player */}
        <div className="flex flex-1 flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:justify-end">
          <div className="flex flex-col items-center md:items-end text-center md:text-right order-2 md:order-1">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-foreground uppercase drop-shadow-sm">{homePlayer.name}</h2>
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground mt-1">{homePlayer.favorite_team}</span>
          </div>
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-foreground flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] order-1 md:order-2 overflow-hidden transform md:-skew-x-[5deg]">
            {homePlayer.photo_url ? (
               <img src={homePlayer.photo_url} alt={homePlayer.name} className="w-full h-full object-cover filter contrast-125 saturate-50" />
            ) : (
               <Shield className="w-12 h-12 md:w-16 md:h-16 text-foreground" />
            )}
          </div>
        </div>

        {/* Score / Center Info */}
        <div className="flex flex-col items-center justify-center min-w-[140px] gap-3">
          <StatusBadge status={status} className="mb-2 shadow-sm transform -skew-x-[10deg]" />
          
          {isCompletedOrLive ? (
            <div className="flex items-center gap-4 font-heading font-black text-6xl md:text-8xl tracking-tighter">
              <span className={homeScore && awayScore && homeScore > awayScore ? "text-primary drop-shadow-[2px_2px_0px_rgba(17,24,39,1)]" : "text-foreground"}>
                {homeScore ?? 0}
              </span>
              <span className="text-muted text-5xl font-black">-</span>
              <span className={homeScore && awayScore && awayScore > homeScore ? "text-primary drop-shadow-[2px_2px_0px_rgba(17,24,39,1)]" : "text-foreground"}>
                {awayScore ?? 0}
              </span>
            </div>
          ) : (
            <div className="text-4xl font-black italic font-heading text-foreground/40 px-4 py-2 border-y-[3px] border-foreground/20">VS</div>
          )}

          {status === "live" && matchTime && (
            <div className="mt-2 text-primary font-black animate-pulse text-xl drop-shadow-sm">
              {matchTime}'
            </div>
          )}
          {status === "completed" && (
            <div className="mt-2 text-foreground font-black text-xs tracking-[0.2em] uppercase border-b-2 border-primary pb-1">
              Full Time
            </div>
          )}
        </div>

        {/* Away Player */}
        <div className="flex flex-1 flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:justify-start">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white border-4 border-foreground flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] overflow-hidden transform md:-skew-x-[5deg]">
            {awayPlayer.photo_url ? (
               <img src={awayPlayer.photo_url} alt={awayPlayer.name} className="w-full h-full object-cover filter contrast-125 saturate-50" />
            ) : (
               <Shield className="w-12 h-12 md:w-16 md:h-16 text-foreground" />
            )}
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tighter text-foreground uppercase drop-shadow-sm">{awayPlayer.name}</h2>
            <span className="text-xs md:text-sm font-black uppercase tracking-widest text-muted-foreground mt-1">{awayPlayer.favorite_team}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
