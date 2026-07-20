"use client";

import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fixture, Match } from '@/types';

export default function ShareFinalistCard({ fixture, match, onClose }: { fixture: Fixture, match: Match, onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const winner = match.home_score > match.away_score ? fixture.home_player : match.away_score > match.home_score ? fixture.away_player : null;
  const seasonName = (fixture as any).season?.name || 'the Tournament';

  if (!winner) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-card p-6 rounded-xl">
          <p>Match ended in a draw, no finalist.</p>
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
      link.download = `${winner.name.replace(/\s+/g, '-').toLowerCase()}-finalist-9x16.jpg`;
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
        <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative w-full max-w-[320px] aspect-[9/16] bg-[#0a0a0c] border border-white/20 rounded-xl overflow-hidden shadow-2xl mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
        <img src={winner.photo_url || ''} className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale contrast-125" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-[#0a0a0c]/50" />
        
        <div className="relative z-20 flex flex-col items-start justify-end h-full p-6 w-full">
           <div className="w-8 h-1 bg-red-600 mb-3 skew-x-[-20deg]" />
           <p className="text-red-500 font-mono tracking-widest uppercase text-[10px] mb-1">SYS.REQ // QUALIFIED</p>
           <h2 className="text-white font-black text-3xl uppercase tracking-tighter leading-none italic mb-1">{winner.name}</h2>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="bg-white text-black hover:bg-gray-200 font-bold tracking-widest uppercase px-8 py-6 rounded-none skew-x-[-10deg]">
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
              <img src={winner.photo_url} className="w-full h-full object-cover object-center opacity-80 grayscale contrast-125" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-[#111]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-red-600 mix-blend-overlay opacity-20" />
          </div>

          {/* Technical Borders & Framing */}
          <div className="absolute inset-10 border border-white/10 z-20 pointer-events-none" />
          
          {/* Corner brackets */}
          <div className="absolute top-10 left-10 w-16 h-16 border-t-4 border-l-4 border-red-600 z-30" />
          <div className="absolute top-10 right-10 w-16 h-16 border-t-4 border-r-4 border-white/30 z-30" />
          <div className="absolute bottom-10 left-10 w-16 h-16 border-b-4 border-l-4 border-white/30 z-30" />
          <div className="absolute bottom-10 right-10 w-16 h-16 border-b-4 border-r-4 border-red-600 z-30" />

          {/* Crosshairs */}
          <div className="absolute top-1/3 left-10 w-4 h-px bg-white/50 z-30" />
          <div className="absolute top-1/3 right-10 w-4 h-px bg-white/50 z-30" />
          <div className="absolute bottom-1/3 left-10 w-4 h-px bg-white/50 z-30" />
          <div className="absolute bottom-1/3 right-10 w-4 h-px bg-white/50 z-30" />
          <div className="absolute top-10 left-1/2 w-px h-4 bg-white/50 z-30 -translate-x-1/2" />
          <div className="absolute bottom-10 left-1/2 w-px h-4 bg-white/50 z-30 -translate-x-1/2" />

          {/* Technical Metadata Top */}
          <div className="absolute top-16 left-20 z-30 flex flex-col gap-1 font-mono text-white/50 text-xl tracking-widest uppercase">
            <p>ID: {winner.id.substring(0,8)}</p>
            <p>SYS: NCL_CORE_V1</p>
            <p>LOC: ARENA_MAIN</p>
          </div>

          {/* Top Right Seal */}
          <div className="absolute top-16 right-20 z-30">
            <div className="w-24 h-24 rounded-none border-2 border-red-600 flex items-center justify-center bg-black/50 backdrop-blur-md skew-x-[-15deg]">
              <img src="/logo_nfl.png" className="w-16 h-16 object-contain opacity-100 skew-x-[15deg] filter grayscale brightness-200" crossOrigin="anonymous" />
            </div>
          </div>

          {/* Main Content Bottom */}
          <div className="absolute bottom-20 left-20 right-20 z-30 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-32 h-2 bg-red-600 skew-x-[-30deg]" />
              <p className="text-red-500 font-mono text-2xl tracking-[0.3em] uppercase">STATUS // ADVANCED</p>
            </div>
            
            <h1 className="text-white text-[130px] font-black uppercase tracking-tighter leading-[0.85] italic mb-6 shadow-black drop-shadow-2xl">
              {winner.name}
            </h1>
            
            <div className="bg-white/10 backdrop-blur-md border-l-8 border-red-600 p-8 w-[800px]">
              <h3 className="text-white text-4xl font-bold uppercase tracking-widest mb-2 italic">Grand Finalist</h3>
              <p className="text-gray-400 font-mono text-2xl tracking-widest uppercase">Ticket Secured for {seasonName}</p>
            </div>
          </div>
          
          {/* Vertical text right edge */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 z-30">
            <p className="font-mono text-white/20 text-xl tracking-[0.5em] uppercase">NCL // GRAND FINAL TICKET</p>
          </div>
        </div>
      </div>
    </div>
  );
}
