"use client";

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { X, Download, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fixture, Match } from '@/types';

export default function ShareChampionCard({ fixture, match, onClose }: { fixture: Fixture, match: Match, onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const winner = match.home_score > match.away_score ? fixture.home_player : match.away_score > match.home_score ? fixture.away_player : null;
  const seasonName = (fixture as any).season?.name || 'the Tournament';

  if (!winner) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card p-6 rounded-xl">
          <p>Match ended in a draw, no champion.</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, { 
        quality: 1.0,
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 2,
        style: { display: 'flex' }
      });
      const link = document.createElement('a');
      link.download = `${winner.name.replace(/\s+/g, '-').toLowerCase()}-champion-9x16.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("Failed to generate image.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
      <div className="flex justify-end w-full max-w-[320px] mb-4">
        <button onClick={onClose} className="text-white hover:text-[#ffb703] transition-colors">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative w-full max-w-[320px] aspect-[9/16] bg-[#050505] border border-[#ffb703]/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,183,3,0.2)] mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <img src={winner.photo_url || ''} className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale contrast-125" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/50" />
        <div className="absolute inset-0 bg-[#ffb703] mix-blend-color opacity-20" />
        
        <div className="relative z-20 flex flex-col items-center justify-center h-full p-6 w-full text-center">
           <Trophy className="w-12 h-12 text-[#ffb703] mb-4 drop-shadow-[0_0_10px_rgba(255,183,3,0.5)]" />
           <p className="text-[#ffb703] font-mono tracking-widest uppercase text-[10px] mb-2">SYS.REQ // CHAMPION</p>
           <h2 className="text-white font-black text-4xl uppercase tracking-tighter leading-none italic drop-shadow-lg">{winner.name}</h2>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="bg-[#ffb703] text-black hover:bg-yellow-500 font-bold tracking-widest uppercase px-8 py-6 rounded-none skew-x-[-10deg] shadow-[0_0_15px_rgba(255,183,3,0.4)]">
        <div className="skew-x-[10deg] flex items-center">
          {downloading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
          Download 9:16 Card
        </div>
      </Button>

      {/* Hidden high-res 9:16 card for generation */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={cardRef} 
          className="flex flex-col relative overflow-hidden bg-[#050505]"
          style={{ width: '1080px', height: '1920px', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
        >
          {/* Engineering Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[size:60px_60px] z-10 pointer-events-none" />
          
          {/* Player Photo */}
          <div className="absolute inset-0 z-0">
            {winner.photo_url ? (
              <img src={winner.photo_url} className="w-full h-full object-cover object-center opacity-90 grayscale contrast-150" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-[#111]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-black/40 to-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/70 via-transparent to-[#050505]/70" />
            
            {/* Gold metallic overlay */}
            <div className="absolute inset-0 bg-[#ffb703] mix-blend-overlay opacity-30" />
          </div>

          {/* Glowing center orb for SpaceX exhaust / F1 headlight vibe */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ffb703]/20 blur-[100px] mix-blend-screen rounded-full pointer-events-none z-10" />

          {/* Technical Borders & Framing */}
          <div className="absolute inset-10 border-2 border-white/10 z-20 pointer-events-none" />
          
          {/* Corner brackets */}
          <div className="absolute top-10 left-10 w-24 h-24 border-t-8 border-l-8 border-[#ffb703] z-30" />
          <div className="absolute top-10 right-10 w-24 h-24 border-t-8 border-r-8 border-[#ffb703] z-30" />
          <div className="absolute bottom-10 left-10 w-24 h-24 border-b-8 border-l-8 border-[#ffb703] z-30" />
          <div className="absolute bottom-10 right-10 w-24 h-24 border-b-8 border-r-8 border-[#ffb703] z-30" />

          {/* Crosshairs */}
          <div className="absolute top-1/4 left-10 w-6 h-px bg-[#ffb703] z-30" />
          <div className="absolute top-1/4 right-10 w-6 h-px bg-[#ffb703] z-30" />
          <div className="absolute bottom-1/4 left-10 w-6 h-px bg-[#ffb703] z-30" />
          <div className="absolute bottom-1/4 right-10 w-6 h-px bg-[#ffb703] z-30" />

          {/* Technical Metadata Top */}
          <div className="absolute top-20 left-24 right-24 z-30 flex justify-between items-start font-mono text-white/70 text-2xl tracking-widest uppercase">
            <div className="flex flex-col gap-2">
              <p className="text-[#ffb703]">SYS: TOURNAMENT_COMPLETE</p>
              <p>ID: {winner.id.substring(0,8)}</p>
            </div>
            <div className="flex flex-col gap-2 text-right">
               <p>LOC: ARENA_MAIN</p>
               <p>STATUS: VERIFIED</p>
            </div>
          </div>

          {/* Top Seal / Logo */}
          <div className="absolute top-44 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border-4 border-[#ffb703] flex items-center justify-center bg-black/50 backdrop-blur-md shadow-[0_0_40px_rgba(255,183,3,0.5)]">
              <img src="/logo_nfl.png" className="w-20 h-20 object-contain opacity-100 filter grayscale brightness-200" crossOrigin="anonymous" />
            </div>
            <div className="h-16 w-1 bg-[#ffb703] mt-6" />
          </div>

          {/* Main Content Center */}
          <div className="absolute bottom-32 left-0 w-full z-30 flex flex-col items-center text-center px-10">
            <Trophy className="w-24 h-24 text-[#ffb703] mb-8 drop-shadow-[0_0_20px_rgba(255,183,3,0.8)]" />
            
            <div className="bg-black/60 backdrop-blur-xl border-y-4 border-[#ffb703] py-10 px-16 w-full max-w-4xl skew-x-[-10deg] shadow-[0_0_50px_rgba(255,183,3,0.15)] mb-8">
              <div className="skew-x-[10deg]">
                <h3 className="text-[#ffb703] text-4xl font-black uppercase tracking-[0.6em] mb-4 drop-shadow-lg">Undisputed Champion</h3>
                <h1 className="text-white text-[160px] font-black uppercase tracking-tighter leading-[0.8] shadow-black drop-shadow-2xl italic">
                  {winner.name}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="w-16 h-1 bg-white/50" />
              <p className="text-gray-300 font-mono text-3xl tracking-[0.4em] uppercase">Has conquered {seasonName}</p>
              <div className="w-16 h-1 bg-white/50" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
