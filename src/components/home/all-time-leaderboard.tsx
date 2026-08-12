"use client";

import Link from "next/link";
import { User, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";

export function AllTimeLeaderboard({ topPlayers }: { topPlayers: any[] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const handleDownload = async (player: any) => {
    setSelectedPlayer(player);
    setGeneratingId(player.id);
    setTimeout(async () => {
      if (!cardRef.current) { setGeneratingId(null); return; }
      try {
        const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
          quality: 1.0, canvasWidth: 2160, canvasHeight: 3840, pixelRatio: 1,
          style: { display: "block" },
        });
        const link = document.createElement("a");
        link.download = `${player.name.replace(/\s+/g, "-").toLowerCase()}-nfl-4k.jpg`;
        link.href = dataUrl;
        link.click();
      } catch (e) { console.error(e); }
      finally { setGeneratingId(null); setSelectedPlayer(null); }
    }, 500);
  };

  if (topPlayers.length === 0) return null;

  const display =
    topPlayers.length === 3
      ? [topPlayers[1], topPlayers[0], topPlayers[2]]
      : topPlayers.slice(0, 3);

  return (
    <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 mb-20">
      <div className="flex items-center gap-3 border-b-2 border-border pb-4 mb-8">
        <div className="w-1.5 h-6 bg-primary" />
        <h2 className="text-2xl font-black uppercase tracking-tight font-heading text-foreground">
          Global Top Competitors
        </h2>
        <span className="ml-auto text-xs font-black uppercase tracking-widest text-muted-foreground">
          All Time
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {display.map((player: any) => {
          const realRank = topPlayers.indexOf(player) + 1;
          const isFirst = realRank === 1;
          const isGenerating = generatingId === player.id;

          return (
            <div
              key={player.id}
              className={`bg-background border-4 border-foreground relative overflow-hidden group transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(220,38,38,1)] flex ${isFirst ? "h-[320px] md:h-[300px]" : "h-[280px]"}`}
              style={{
                boxShadow: "8px 8px 0px 0px rgba(220,38,38,1)",
              }}
            >
              {/* Left text block */}
              <div
                className="w-[60%] h-full bg-background relative z-10 flex flex-col p-6"
                style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 30px) 100%, 0 100%)" }}
              >
                <div className="flex flex-col">
                  <span className="bg-foreground text-background px-2 py-0.5 w-max text-xs font-black uppercase tracking-widest mb-2 border-l-4 border-primary">
                    {player.favorite_team || "IND"}
                  </span>
                  <span className="text-foreground text-5xl font-black tabular-nums tracking-tighter leading-none font-heading">
                    {realRank}
                  </span>
                </div>
                <div className="mt-auto">
                  <h3 className="text-lg font-bold text-muted-foreground uppercase leading-none mb-0.5 font-heading">
                    {player.name.split(" ")[0]}
                  </h3>
                  <h3 className="text-3xl font-black text-foreground uppercase tracking-tighter leading-none mb-4 font-heading">
                    {player.name.split(" ").slice(1).join(" ") || player.name}
                  </h3>
                  <div className="flex items-center justify-between border-t-4 border-primary pt-3">
                    <div className="flex flex-col">
                      <span className="text-foreground text-[10px] font-black uppercase tracking-widest mb-0.5">Total PTS</span>
                      <span className="text-foreground text-3xl font-black tracking-tighter leading-none font-heading">
                        {player.allTimePoints}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleDownload(player)}
                      disabled={isGenerating}
                      variant="outline"
                      size="sm"
                      className="font-black uppercase tracking-widest text-[10px] h-8 px-2 rounded-none border-2 border-foreground hover:bg-primary hover:text-white transition-colors mr-8"
                    >
                      {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3 mr-1" />}
                      4K
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right image block */}
              <div className="absolute top-0 right-0 w-[50%] h-full z-0 bg-muted">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.name}
                    className="w-full h-full object-cover object-top contrast-125 saturate-100 group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-foreground/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hidden 4K card */}
      {selectedPlayer && (
        <div className="fixed -left-[5000px] top-0 opacity-0 pointer-events-none z-[-100]">
          <div ref={cardRef} className="w-[1080px] h-[1920px] bg-[#050508] relative flex flex-col font-sans tracking-tight overflow-hidden">
            <div className="absolute inset-0 z-0">
              {selectedPlayer.photo_url ? (
                <img src={selectedPlayer.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125 saturate-50" crossOrigin="anonymous" />
              ) : (
                <div className="w-full h-full bg-gradient-to-bl from-gray-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-transparent to-[#050508]" />
            </div>
            <div className="absolute -right-[200px] top-[100px] w-[900px] h-[900px] bg-red-600/40 rounded-full blur-[100px] z-10 mix-blend-screen" />
            <div className="absolute top-16 left-16 z-30 flex flex-col items-center">
              <div className="w-40 h-40 rounded-full border-[6px] border-red-600/80 flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl p-2 text-center">
                <img src="/logo_ncl.png" className="w-16 h-16 object-contain mb-1" crossOrigin="anonymous" />
                <p className="text-xs font-black uppercase tracking-[0.4em] text-white leading-tight mt-1">TOP 1%<br /><span className="text-red-500">ELITE</span></p>
              </div>
            </div>
            <div className="absolute bottom-[250px] left-16 right-16 z-30 flex flex-col">
              <p className="text-red-500 text-3xl font-black uppercase tracking-[0.5em] mb-2">{selectedPlayer.favorite_team || "IND"}</p>
              <h1 className="text-white text-[120px] font-black uppercase tracking-tighter leading-[0.85] mb-6">{selectedPlayer.name}</h1>
              <div className="flex gap-12 mt-12 border-t-[4px] border-white/20 pt-8 bg-black/30 backdrop-blur-sm p-8 rounded-2xl w-max border border-white/10">
                <div className="flex flex-col">
                  <p className="text-white/70 text-2xl font-bold uppercase tracking-widest mb-2">Total Points</p>
                  <p className="text-white text-[85px] font-black leading-none">{selectedPlayer.allTimePoints}</p>
                </div>
                <div className="w-[4px] bg-white/20 rounded-full" />
                <div className="flex flex-col">
                  <p className="text-white/70 text-2xl font-bold uppercase tracking-widest mb-2">Total Goals</p>
                  <p className="text-white text-[85px] font-black leading-none">{selectedPlayer.allTimeGoals}</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-[250px] bg-gradient-to-t from-red-950 via-black to-black z-30 flex items-end justify-between px-16 pb-16">
              <p className="text-white/60 text-2xl font-medium italic">"Legends are forged in the shadows, crowned in the lights."</p>
              <img src="/logo_ncl.png" className="h-28 opacity-80" crossOrigin="anonymous" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
