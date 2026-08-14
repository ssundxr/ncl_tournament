"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Share2 } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Fixture } from "@/types";
import { format } from "date-fns";
import { useRef, useState } from "react";
import { ShareMatchResult } from "@/components/share/ShareMatchResult";
import { ShareUpcomingMatch } from "@/components/share/ShareUpcomingMatch";
import { exportAsImage } from "@/lib/exportImage";

interface MatchCardProps {
  fixture: Fixture;
}

export function MatchCard({ fixture }: MatchCardProps) {
  const isCompleted = fixture.status === "completed";
  const isLive = fixture.status === "live";
  const isScheduled = fixture.status === "scheduled";

  const shareResultRef = useRef<HTMLDivElement>(null);
  const shareUpcomingRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const homeName = fixture.home_player?.name || "TBD";
  const awayName = fixture.away_player?.name || "TBD";
  const homePhoto = fixture.home_player?.photo_url || undefined;
  const awayPhoto = fixture.away_player?.photo_url || undefined;

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to match page
    e.stopPropagation();
    
    setIsExporting(true);
    
    if (isCompleted && shareResultRef.current) {
      await exportAsImage(shareResultRef, `result-${homeName}-vs-${awayName}`);
    } else if (isScheduled && shareUpcomingRef.current) {
      await exportAsImage(shareUpcomingRef, `upcoming-${homeName}-vs-${awayName}`);
    }
    
    setIsExporting(false);
  };

  return (
    <>
      {isCompleted && (
        <ShareMatchResult 
          ref={shareResultRef}
          homeName={homeName}
          awayName={awayName}
          homeScore={fixture.home_score || 0}
          awayScore={fixture.away_score || 0}
          homePhoto={homePhoto}
          awayPhoto={awayPhoto}
        />
      )}
      
      {isScheduled && (
        <ShareUpcomingMatch 
          ref={shareUpcomingRef}
          homeName={homeName}
          awayName={awayName}
          homePhoto={homePhoto}
          awayPhoto={awayPhoto}
          matchday={fixture.matchday}
        />
      )}

      <Link href={`/match/${fixture.id}`}>
        <Card className="bg-card border-border hover:border-primary transition-all cursor-pointer w-full group rounded-none relative overflow-hidden shadow-sm hover:shadow-[4px_4px_0px_rgba(225,6,0,0.2)]">
          <div className="absolute left-0 top-0 w-1.5 h-full bg-border group-hover:bg-primary transition-colors" />
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              
              {/* Status and Time (Mobile) */}
              <div className="flex w-full md:hidden items-center justify-between mb-2 border-b-2 border-border pb-2">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  Matchday {fixture.matchday}
                </span>
                <StatusBadge status={fixture.status} />
              </div>

              {/* Home Player */}
              <div className="flex flex-1 items-center justify-end gap-4 w-full md:w-auto">
                <span className="font-heading font-black text-base md:text-xl text-right uppercase tracking-wider truncate">
                  {homeName}
                </span>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0 skew-x-[-10deg] overflow-hidden">
                   {homePhoto ? (
                      <img src={homePhoto} alt="" className="w-full h-full object-cover skew-x-[10deg]" />
                   ) : (
                      <Shield className="w-6 h-6 text-primary skew-x-[10deg]" />
                   )}
                </div>
              </div>

              {/* Score / Time Center */}
              <div className="flex flex-col items-center justify-center min-w-[100px] md:min-w-[140px] px-4">
                {(isCompleted || isLive) ? (
                  <div className="flex items-center gap-4 font-heading font-black text-3xl md:text-5xl">
                    <span className={fixture.home_score! > fixture.away_score! ? "text-primary" : ""}>{fixture.home_score}</span>
                    <div className="w-px h-8 bg-border skew-x-[-15deg]" />
                    <span className={fixture.away_score! > fixture.home_score! ? "text-primary" : ""}>{fixture.away_score}</span>
                  </div>
                ) : (
                  <div className="text-xl md:text-2xl font-black font-heading tracking-widest">
                    {fixture.scheduled_at ? format(new Date(fixture.scheduled_at), "HH:mm") : "TBD"}
                  </div>
                )}
                
                {/* Status and Time (Desktop) */}
                <div className="hidden md:flex flex-col items-center mt-3 gap-2">
                  <StatusBadge status={fixture.status} />
                </div>
              </div>

              {/* Away Player */}
              <div className="flex flex-1 items-center justify-start gap-4 w-full md:w-auto flex-row-reverse md:flex-row">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0 skew-x-[-10deg] overflow-hidden">
                   {awayPhoto ? (
                      <img src={awayPhoto} alt="" className="w-full h-full object-cover skew-x-[10deg]" />
                   ) : (
                      <Shield className="w-6 h-6 text-primary skew-x-[10deg]" />
                   )}
                </div>
                <span className="font-heading font-black text-base md:text-xl text-left uppercase tracking-wider truncate">
                  {awayName}
                </span>
              </div>
              
              {/* Share Button Overlay */}
              {(isCompleted || isScheduled) && (
                <div className="flex justify-end w-full md:w-auto">
                  <button
                    onClick={handleShare}
                    disabled={isExporting}
                    className="p-2 bg-secondary border border-border hover:bg-primary hover:text-white transition-colors text-muted-foreground skew-x-[-10deg] flex items-center justify-center"
                    title="Export Share Card"
                  >
                    <Share2 className="w-4 h-4 skew-x-[10deg]" />
                  </button>
                </div>
              )}

            </div>
          </CardContent>
        </Card>
      </Link>
    </>
  );
}
