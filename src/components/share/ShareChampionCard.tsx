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
        canvasHeight: 1350,
        pixelRatio: 2,
        style: { display: 'flex' }
      });
      const link = document.createElement('a');
      link.download = `${winner.name.replace(/\s+/g, '-').toLowerCase()}-champion-nfl.jpg`;
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
      <div className="flex justify-end w-full max-w-lg mb-4">
        <button onClick={onClose} className="text-white hover:text-red-500 transition-colors">
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative w-full max-w-[320px] aspect-[4/5] bg-black border border-yellow-500/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(234,179,8,0.3)] mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-10 pointer-events-none" />
        <img src={winner.photo_url || ''} className="absolute inset-0 w-full h-full object-cover opacity-60 contrast-125" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-yellow-500/10 mix-blend-color" />
        
        <div className="relative z-20 flex flex-col items-center justify-end h-full p-6 text-center w-full">
           <Trophy className="w-12 h-12 text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
           <p className="text-yellow-400 font-black tracking-[0.4em] uppercase text-xs mb-2">Tournament Champion</p>
           <h2 className="text-white font-black text-5xl uppercase tracking-tighter leading-none mb-1 drop-shadow-lg">{winner.name}</h2>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="bg-gradient-to-r from-yellow-600 to-yellow-400 text-black hover:from-yellow-500 hover:to-yellow-300 font-black tracking-widest uppercase px-10 py-6 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.4)]">
        {downloading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
        Download 4K Champion Card
      </Button>

      {/* Hidden high-res card for generation */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={cardRef} 
          className="flex flex-col relative overflow-hidden bg-[#0a0800]"
          style={{ width: '1080px', height: '1350px', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
        >
          {/* Background and Noise */}
          <div className="absolute inset-0 z-0">
            {winner.photo_url ? (
              <img src={winner.photo_url} className="w-full h-full object-cover object-top opacity-90 contrast-125" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-[#0a0800]" />
            <div className="absolute inset-0 bg-yellow-500/10 mix-blend-color" />
          </div>
          
          <div className="absolute inset-0 bg-[linear-gradient(rgba(234,179,8,0.05)_2px,transparent_2px),linear-gradient(90deg,rgba(234,179,8,0.05)_2px,transparent_2px)] bg-[size:50px_50px] z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-10 pointer-events-none" />
          
          {/* Glowing Orbs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-yellow-500/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-10" />
          
          {/* Border */}
          <div className="absolute inset-0 border-[30px] border-yellow-500 z-20 pointer-events-none" />
          <div className="absolute inset-[30px] border-[2px] border-black/50 z-20 pointer-events-none" />
          
          {/* Header Seal */}
          <div className="absolute top-20 right-20 z-30">
            <div className="w-40 h-40 rounded-full border-[8px] border-yellow-500 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md shadow-[0_0_50px_rgba(234,179,8,0.5)]">
              <img src="/logo_nfl.png" className="w-20 h-20 object-contain opacity-100 mb-1" crossOrigin="anonymous" />
              <p className="text-yellow-500 font-black text-[10px] uppercase tracking-widest leading-none">Champion</p>
            </div>
          </div>

          <div className="absolute top-20 left-20 z-30 flex items-center gap-4">
             <Trophy className="w-24 h-24 text-yellow-500 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
          </div>

          <div className="absolute bottom-20 left-20 right-20 z-30 flex flex-col text-center items-center justify-center p-12 relative">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl border-t-[8px] border-yellow-500 rounded-3xl" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h3 className="text-yellow-500 text-4xl font-black uppercase tracking-[0.5em] mb-6 drop-shadow-lg">Undisputed Champion</h3>
              <h1 className="text-white text-[120px] font-black uppercase tracking-tighter leading-none mb-6 shadow-black drop-shadow-2xl bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-300">
                {winner.name}
              </h1>
              
              <div className="w-32 h-2 bg-yellow-500 mb-6 rounded-full" />
              
              <p className="text-yellow-100 text-3xl font-medium tracking-widest uppercase">Has conquered {seasonName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
