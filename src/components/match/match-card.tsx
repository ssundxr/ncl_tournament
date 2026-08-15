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

import { generateMatchCode } from "@/lib/match-code";
import { ensurePlayerNclId } from "@/lib/ncl-id";

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

  const homePlayer = fixture.home_player ? ensurePlayerNclId(fixture.home_player) : null;
  const awayPlayer = fixture.away_player ? ensurePlayerNclId(fixture.away_player) : null;

  const homeName = homePlayer?.name || "TBD";
  const awayName = awayPlayer?.name || "TBD";
  const homeTag = homePlayer?.short_tag || "IND";
  const awayTag = awayPlayer?.short_tag || "IND";
  const homePhoto = homePlayer?.photo_url || undefined;
  const awayPhoto = awayPlayer?.photo_url || undefined;

  const matchCode = generateMatchCode(fixture);

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
              
              {/* Status, Match Code & Matchday (Mobile) */}
              <div className="flex w-full md:hidden items-center justify-between mb-2 border-b-2 border-border pb-2">
                <span className="font-mono text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 border border-primary/30">
                  {matchCode}
                </span>
                <StatusBadge status={fixture.status} />
              </div>

              {/* Home Player */}
              <div className="flex flex-1 items-center justify-end gap-3 w-full md:w-auto">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-1.5 py-0.2 rounded-xs">
                    {homeTag}
                  </span>
                  <span className="font-heading font-black text-base md:text-xl text-right uppercase tracking-wider truncate mt-0.5">
                    {homeName}
                  </span>
                </div>
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0 skew-x-[-10deg] overflow-hidden">
                   {homePhoto ? (
                      <img src={homePhoto} alt="" className="w-full h-full object-cover skew-x-[10deg]" />
                   ) : (
                      <Shield className="w-6 h-6 text-primary skew-x-[10deg]" />
                   )}
                </div>
              </div>

              {/* Score / Time & Match Code Center */}
              <div className="flex flex-col items-center justify-center min-w-[120px] md:min-w-[160px] px-4">
                <span className="hidden md:inline-block font-mono text-[10px] font-black uppercase text-primary tracking-widest bg-primary/10 px-2 py-0.5 border border-primary/30 mb-2">
                  {matchCode}
                </span>
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
              <div className="flex flex-1 items-center justify-start gap-3 w-full md:w-auto flex-row-reverse md:flex-row">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-none bg-secondary border border-border flex items-center justify-center shrink-0 skew-x-[-10deg] overflow-hidden">
                   {awayPhoto ? (
                      <img src={awayPhoto} alt="" className="w-full h-full object-cover skew-x-[10deg]" />
                   ) : (
                      <Shield className="w-6 h-6 text-primary skew-x-[10deg]" />
                   )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background px-1.5 py-0.2 rounded-xs">
                    {awayTag}
                  </span>
                  <span className="font-heading font-black text-base md:text-xl text-left uppercase tracking-wider truncate mt-0.5">
                    {awayName}
                  </span>
                </div>
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
