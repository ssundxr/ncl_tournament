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
        <Card className="bg-[#1e1e27] border-border hover:border-primary/50 transition-all cursor-pointer rounded-xl overflow-hidden relative group hover:shadow-[0_0_20px_rgba(225,6,0,0.15)] flex flex-col justify-between min-h-[210px] select-none pb-2">
          {/* Halftone dot mesh overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none mix-blend-overlay" />

          {/* Top Bar with Matchday & Status Badge */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#15151e] border-b border-border z-10">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Matchday {fixture.matchday || "-"}
            </span>
            <div className="flex items-center gap-2">
              {(isCompleted || isScheduled) && (
                <button
                  onClick={handleShare}
                  disabled={isExporting}
                  className="p-1 hover:bg-primary/20 hover:text-primary text-muted-foreground rounded transition-all cursor-pointer mr-1"
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
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                  {fixture.home_player.photo_url ? (
                    <img src={fixture.home_player.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-black text-sm uppercase tracking-wide text-white truncate block">
                    {fixture.home_player.name}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate block leading-none mt-0.5">
                    {fixture.home_player.favorite_team || "Free Agent"}
                  </span>
                </div>
              </div>
              
              {(isCompleted || isLive) && (
                <span className={`font-heading font-black text-xl shrink-0 ${fixture.home_score! > fixture.away_score! ? "text-primary" : "text-white"}`}>
                  {fixture.home_score ?? 0}
                </span>
              )}
            </div>

            {/* Split Divider */}
            <div className="flex items-center gap-2">
              <div className="h-px bg-border flex-1 opacity-50" />
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest px-1">VS</span>
              <div className="h-px bg-border flex-1 opacity-50" />
            </div>

            {/* Away Contender */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0 overflow-hidden relative">
                  {fixture.away_player.photo_url ? (
                    <img src={fixture.away_player.photo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="font-heading font-black text-sm uppercase tracking-wide text-white truncate block">
                    {fixture.away_player.name}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider truncate block leading-none mt-0.5">
                    {fixture.away_player.favorite_team || "Free Agent"}
                  </span>
                </div>
              </div>
              
              {(isCompleted || isLive) && (
                <span className={`font-heading font-black text-xl shrink-0 ${fixture.away_score! > fixture.home_score! ? "text-primary" : "text-white"}`}>
                  {fixture.away_score ?? 0}
                </span>
              )}
            </div>
          </div>

          {/* Footer scheduling time */}
          {isScheduled && (
            <div className="mx-4 py-2 border-t border-border flex items-center justify-between text-[9px] font-bold text-muted-foreground z-10">
              <span>SCHEDULED TIME</span>
              <span className="text-white font-black font-heading tracking-wide">
                {fixture.scheduled_at ? format(new Date(fixture.scheduled_at), "HH:mm") : "TBD"}
              </span>
            </div>
          )}
        </Card>
      </Link>
    </>
  );
}
