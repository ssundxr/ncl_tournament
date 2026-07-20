
"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Shield, Share2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Fixture } from "@/types";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { ShareMatchResult } from "@/components/share/ShareMatchResult";
import { ShareUpcomingMatch } from "@/components/share/ShareUpcomingMatch";
import { exportAsImage } from "@/lib/exportImage";

interface MatchBoxProps {
  fixture: Fixture;
}

export function MatchBox({ fixture }: MatchBoxProps) {
  const isCompleted = fixture.status === "completed";
  const isLive = fixture.status === "live";
  const isScheduled = fixture.status === "scheduled";

  const shareResultRef = useRef<HTMLDivElement>(null);
  const shareUpcomingRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsExporting(true);
    
    if (isCompleted && shareResultRef.current) {
      await exportAsImage(shareResultRef, `result-${fixture.home_player.name}-vs-${fixture.away_player.name}`);
    } else if (isScheduled && shareUpcomingRef.current) {
      await exportAsImage(shareUpcomingRef, `upcoming-${fixture.home_player.name}-vs-${fixture.away_player.name}`);
    }
    
    setIsExporting(false);
  };

  return (
    <>
      {isCompleted && (
        <ShareMatchResult 
          ref={shareResultRef}
          homeName={fixture.home_player.name}
          awayName={fixture.away_player.name}
          homeScore={fixture.home_score || 0}
          awayScore={fixture.away_score || 0}
          homePhoto={fixture.home_player.photo_url || undefined}
          awayPhoto={fixture.away_player.photo_url || undefined}
        />
      )}
      
      {isScheduled && (
        <ShareUpcomingMatch 
          ref={shareUpcomingRef}
          homeName={fixture.home_player.name}
          awayName={fixture.away_player.name}
          homePhoto={fixture.home_player.photo_url || undefined}
          awayPhoto={fixture.away_player.photo_url || undefined}
          matchday={fixture.matchday}
        />
      )}

      <Link href={`/match/${fixture.id}`}>
        <Card className="bg-card border-[3px] border-foreground hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] hover:-translate-y-1 transition-all cursor-pointer rounded-none overflow-hidden relative group flex flex-col justify-between min-h-[210px] select-none pb-2">
          {/* Halftone dot mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] [background-size:12px_12px] opacity-[0.03] pointer-events-none mix-blend-overlay" />

          {/* Top Bar with Matchday & Status Badge */}
          <div className="flex items-center justify-between px-4 py-3 bg-foreground text-background border-b-[3px] border-foreground z-10">
            <span className="text-[10px] font-black uppercase tracking-widest font-heading">
              Matchday {fixture.matchday || "-"}
            </span>
            <div className="flex items-center gap-2">
              {(isCompleted || isScheduled) && (
                <button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="p-1 hover:bg-muted hover:text-foreground text-muted-foreground rounded transition-all cursor-pointer mr-1"
                  title="Share Image"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              )}
              <StatusBadge status={fixture.status} />
            </div>
          </div>

          {/* Main Contenders Content */}
          <div className="p-4 flex flex-col gap-3 justify-center flex-1 z-10">
            {/* Home Contender */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-none bg-white border-2 border-foreground flex items-center justify-center shrink-0 overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                  {fixture.home_player.photo_url ? (
                    <img src={fixture.home_player.photo_url} alt="" className="w-full h-full object-cover filter contrast-125 saturate-50" />
                  ) : (
                    <Shield className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-black text-base tracking-tight text-foreground uppercase truncate block leading-none mb-1">
                    {fixture.home_player.name}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate block leading-none">
                    {fixture.home_player.favorite_team || "Free Agent"}
                  </span>
                </div>
              </div>
              
              {(isCompleted || isLive) && (
                <span className={`font-heading font-black text-3xl shrink-0 ${fixture.home_score! > fixture.away_score! ? "text-primary drop-shadow-[2px_2px_0px_rgba(17,24,39,1)]" : "text-muted-foreground"}`}>
                  {fixture.home_score ?? 0}
                </span>
              )}
            </div>

            {/* Split Divider */}
            <div className="flex items-center gap-2">
              <div className="h-0.5 bg-foreground/20 flex-1" />
              <span className="text-[10px] font-black text-foreground uppercase tracking-widest px-2 bg-muted skew-x-[-10deg] border-2 border-foreground/20">VS</span>
              <div className="h-0.5 bg-foreground/20 flex-1" />
            </div>

            {/* Away Contender */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-none bg-white border-2 border-foreground flex items-center justify-center shrink-0 overflow-hidden relative shadow-[2px_2px_0px_0px_rgba(17,24,39,1)]">
                  {fixture.away_player.photo_url ? (
                    <img src={fixture.away_player.photo_url} alt="" className="w-full h-full object-cover filter contrast-125 saturate-50" />
                  ) : (
                    <Shield className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-black text-base tracking-tight text-foreground uppercase truncate block leading-none mb-1">
                    {fixture.away_player.name}
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate block leading-none">
                    {fixture.away_player.favorite_team || "Free Agent"}
                  </span>
                </div>
              </div>
              
              {(isCompleted || isLive) && (
                <span className={`font-heading font-black text-3xl shrink-0 ${fixture.away_score! > fixture.home_score! ? "text-primary drop-shadow-[2px_2px_0px_rgba(17,24,39,1)]" : "text-muted-foreground"}`}>
                  {fixture.away_score ?? 0}
                </span>
              )}
            </div>
          </div>

          {/* Footer scheduling time */}
          {isScheduled && (
            <div className="mx-4 py-3 border-t-2 border-foreground/10 flex items-center justify-between text-[10px] font-black text-muted-foreground z-10">
              <span className="uppercase tracking-widest">Scheduled Time</span>
              <span className="text-foreground font-black tracking-tight font-heading text-xs">
                {fixture.scheduled_at ? format(new Date(fixture.scheduled_at), "HH:mm") : "TBD"}
              </span>
            </div>
          )}
        </Card>
      </Link>
    </>
  );
}
