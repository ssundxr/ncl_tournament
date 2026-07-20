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
        canvasHeight: 1350,
        pixelRatio: 2,
        style: { display: 'flex' }
      });
      const link = document.createElement('a');
      link.download = `${winner.name.replace(/\s+/g, '-').toLowerCase()}-finalist-nfl.jpg`;
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

      <div className="relative w-full max-w-[320px] aspect-[4/5] bg-black border border-white/20 rounded-xl overflow-hidden shadow-2xl mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-10 pointer-events-none" />
        <img src={winner.photo_url || ''} className="absolute inset-0 w-full h-full object-cover opacity-50" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="relative z-20 flex flex-col items-center justify-end h-full p-6 text-center">
           <p className="text-yellow-500 font-black tracking-[0.3em] uppercase text-sm mb-2">Grand Finalist</p>
           <h2 className="text-white font-black text-4xl uppercase tracking-tighter leading-none mb-1">{winner.name}</h2>
        </div>
      </div>

      <Button onClick={handleDownload} disabled={downloading} className="bg-yellow-500 text-black hover:bg-yellow-600 font-bold tracking-widest uppercase px-8 py-6 rounded-full">
        {downloading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Download className="w-5 h-5 mr-2" />}
        Download 4K Card
      </Button>

      {/* Hidden high-res card for generation */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div 
          ref={cardRef} 
          className="flex flex-col relative overflow-hidden bg-[#050508]"
          style={{ width: '1080px', height: '1350px', fontFamily: 'var(--font-sans), system-ui, sans-serif' }}
        >
          {/* Background and Noise */}
          <div className="absolute inset-0 z-0">
            {winner.photo_url ? (
              <img src={winner.photo_url} className="w-full h-full object-cover object-top opacity-80" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-yellow-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black" />
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[size:50px_50px] z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30 mix-blend-overlay z-10 pointer-events-none" />
          
          {/* Border */}
          <div className="absolute inset-0 border-[24px] border-yellow-500/20 z-20 pointer-events-none" />
          
          {/* Seal */}
          <div className="absolute top-16 right-16 z-30">
            <div className="w-32 h-32 rounded-full border-[4px] border-yellow-500 flex items-center justify-center bg-black/80 backdrop-blur-md">
              <img src="/logo_nfl.png" className="w-16 h-16 object-contain opacity-100" crossOrigin="anonymous" />
            </div>
          </div>

          <div className="absolute bottom-16 left-16 right-16 z-30 flex flex-col border-l-[8px] border-yellow-500 pl-12 bg-black/40 backdrop-blur-md p-10">
            <h3 className="text-yellow-500 text-3xl font-black uppercase tracking-[0.4em] mb-4 drop-shadow-lg">Ticket to the Final</h3>
            <h1 className="text-white text-[100px] font-black uppercase tracking-tighter leading-none mb-4 shadow-black drop-shadow-2xl">{winner.name}</h1>
            <p className="text-gray-300 text-3xl font-medium tracking-widest uppercase">Has reached the Grand Final</p>
          </div>
        </div>
      </div>
    </div>
  );
}
