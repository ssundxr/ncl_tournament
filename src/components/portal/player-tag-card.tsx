"use client";

import { useRef, useState } from "react";
import { Download, Check, Shield, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";

interface PlayerTagCardProps {
  player: {
    id: string;
    ncl_id?: string | null;
    name: string;
    short_tag?: string | null;
    favorite_team?: string | null;
    photo_url?: string | null;
    overall_rating?: number | null;
  };
  stats?: {
    goals_scored?: number;
    matches_played?: number;
    wins?: number;
  } | null;
  rankNumber?: number;
}

export function PlayerTagCard({ player, stats, rankNumber = 1 }: PlayerTagCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const shortTag = player.short_tag || "IND";
  const nclId = player.ncl_id || `NCL-${player.id.substring(0, 5).toUpperCase()}`;
  const totalGoals = stats?.goals_scored || 0;
  const matchesPlayed = stats?.matches_played || 0;
  const hasStatsUnlocked = matchesPlayed >= 2;

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cardRef.current || downloading) return;

    try {
      setDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `NCL-Tag-Card-${player.name.replace(/\s+/g, "_")}-${nclId}.png`;
      link.href = dataUrl;
      link.click();

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Failed to export player tag card:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 4K Renderable Card Container */}
      <div className="w-full max-w-xl p-1 bg-gradient-to-r from-red-600 via-primary to-black p-[2px]">
        <div
          ref={cardRef}
          className="relative w-full bg-white text-black border-2 border-black shadow-[6px_6px_0px_0px_#dc2626] overflow-hidden flex min-h-[220px] md:min-h-[250px]"
        >
          {/* Left Content Section (~55%) */}
          <div className="w-[55%] p-5 md:p-6 flex flex-col justify-between z-10 bg-white">
            
            {/* Top Bar: Tag Badge & Unique NCL ID */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="bg-black text-white text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-xs inline-block">
                  {shortTag}
                </div>
                <span className="font-mono text-[10px] font-extrabold text-neutral-400 tracking-wider">
                  {nclId}
                </span>
              </div>

              {/* Seed / Rank Number */}
              <div className="text-3xl md:text-4xl font-black font-mono leading-none text-neutral-900 mt-1">
                {rankNumber}
              </div>

              {/* Player Name */}
              <div className="mt-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 leading-none">
                  {player.name}
                </p>
                <h2 className="text-xl md:text-2xl font-black font-heading uppercase tracking-tighter text-black leading-tight mt-0.5 truncate">
                  {player.name}
                </h2>
              </div>
            </div>

            {/* Bottom Section with Red Accent Line */}
            <div className="mt-4">
              {/* Solid Red Accent Divider Line */}
              <div className="w-full h-1 bg-[#dc2626] mb-3" />

              <div className="flex items-center justify-between gap-2">
                {/* Stats / 2-Game Condition */}
                {hasStatsUnlocked ? (
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500 block leading-none">
                      Total Goals
                    </span>
                    <span className="text-2xl md:text-3xl font-black font-mono text-black leading-none mt-1 block">
                      {totalGoals}
                    </span>
                  </div>
                ) : (
                  <div className="flex-1 pr-2">
                    <p className="text-[10px] font-medium text-neutral-400 leading-tight tracking-tight">
                      Stats will be available after 2 games
                    </p>
                  </div>
                )}

                {/* Download Button Component inside rendered card */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="border border-black px-2.5 py-1 text-[11px] font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors flex items-center gap-1 shrink-0 bg-white"
                  title="Download 4K HD Card"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-600" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>4K</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Right Photo Section (~45%) with Angled Skew Clip-Path */}
          <div className="w-[45%] relative bg-neutral-900 overflow-hidden flex items-center justify-center">
            {/* Angled Background Cutout */}
            <div 
              className="absolute inset-0 bg-neutral-800" 
              style={{ clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)" }}
            />

            {player.photo_url ? (
              <img
                src={player.photo_url}
                alt={player.name}
                className="w-full h-full object-cover relative z-10 contrast-110"
                style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}
              />
            ) : (
              <div 
                className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-neutral-800 to-black text-neutral-500 relative z-10 p-4 text-center"
                style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}
              >
                <Shield className="w-12 h-12 text-neutral-600 mb-2" />
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                  {player.favorite_team || "NCL Arena"}
                </span>
              </div>
            )}

            {/* Favorite Team Floating Badge */}
            {player.favorite_team && (
              <div className="absolute bottom-2 right-2 z-20 bg-black/80 backdrop-blur-md px-2 py-0.5 border border-white/20 text-[9px] font-black text-white uppercase tracking-widest">
                {player.favorite_team}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Action Helper under Card */}
      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
        <Sparkles className="w-4 h-4 text-primary" />
        <span>Click <strong>4K</strong> to export your official HD NCL Gamer Pass</span>
      </div>
    </div>
  );
}
