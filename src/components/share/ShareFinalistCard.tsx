"use client";

import React, { useRef, useState, useEffect } from 'react';
import * as htmlToImage from 'html-to-image';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Fixture, Match } from '@/types';
import { supabase } from '@/lib/supabase/client';

export default function ShareFinalistCard({ fixture, match, onClose }: { fixture: Fixture, match: Match, onClose: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [totalGoals, setTotalGoals] = useState<number | null>(null);

  const winner = match.home_score > match.away_score ? fixture.home_player : match.away_score > match.home_score ? fixture.away_player : null;
  const seasonName = (fixture as any).season?.name || 'Tournament';

  useEffect(() => {
    if (!winner || !fixture) return;
    const fetchGoals = async () => {
      const { data } = await supabase
        .from('fixtures')
        .select('id, home_player_id, away_player_id, home_score, away_score')
        .eq('season_id', fixture.season_id)
        .eq('status', 'completed');
      
      if (data) {
        let goals = 0;
        data.forEach(f => {
          if (f.home_player_id === winner.id) goals += (f.home_score || 0);
          if (f.away_player_id === winner.id) goals += (f.away_score || 0);
        });
        // Include the current match goals since fixture might not be marked completed yet in DB
        if (fixture.home_player.id === winner.id) goals += match.home_score;
        if (fixture.away_player.id === winner.id) goals += match.away_score;
        
        // Wait, if the current match IS in the DB and completed, we might double count.
        // Let's just calculate from the DB + ensure we don't double count.
        let calcGoals = 0;
        let matchFound = false;
        data.forEach(f => {
          if (f.home_player_id === winner.id) calcGoals += (f.home_score || 0);
          if (f.away_player_id === winner.id) calcGoals += (f.away_score || 0);
          if (f.id === fixture.id) matchFound = true;
        });
        if (!matchFound) {
          if (fixture.home_player.id === winner.id) calcGoals += match.home_score;
          if (fixture.away_player.id === winner.id) calcGoals += match.away_score;
        }
        setTotalGoals(calcGoals);
      }
    };
    fetchGoals();
  }, [winner, fixture, match]);

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
        <img src={winner.photo_url || ''} className="absolute inset-0 w-full h-full object-cover opacity-80" crossOrigin="anonymous" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
        
        <div className="relative z-20 flex flex-col items-start justify-end h-full p-6 w-full">
           <h3 className="text-white font-black text-2xl uppercase tracking-widest italic mb-1">{seasonName}</h3>
           <h2 className="text-red-500 font-black text-4xl uppercase tracking-tighter leading-none italic mb-1">{winner.name}</h2>
           <p className="text-white font-mono uppercase text-xs mt-2">GRAND FINALIST</p>
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
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_2px,transparent_2px),linear-gradient(90deg,rgba(255,255,255,0.04)_2px,transparent_2px)] bg-[size:60px_60px] z-10 pointer-events-none" />
          
          {/* Player Photo - COLOR */}
          <div className="absolute inset-0 z-0">
            {winner.photo_url ? (
              <img src={winner.photo_url} className="w-full h-full object-cover object-center opacity-100" crossOrigin="anonymous" />
            ) : (
              <div className="w-full h-full bg-[#111]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/40 to-transparent" />
          </div>

          {/* Technical Borders & Framing */}
          <div className="absolute inset-10 border border-white/20 z-20 pointer-events-none" />
          
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

          {/* Technical Metadata Top */}
          <div className="absolute top-16 left-20 z-30 flex flex-col gap-1 font-mono text-white/60 text-xl tracking-widest uppercase">
            <p>ID: {winner.id.substring(0,8)}</p>
            <p>LOC: ARENA_MAIN</p>
            {totalGoals !== null && (
              <p className="text-red-500 font-bold mt-2">GOALS: {totalGoals}</p>
            )}
          </div>

          {/* Top Right Seal */}
          <div className="absolute top-16 right-20 z-30">
            <div className="w-24 h-24 rounded-none border-2 border-red-600 flex items-center justify-center bg-black/70 backdrop-blur-md skew-x-[-15deg]">
              <img src="/logo_nfl.png" className="w-16 h-16 object-contain opacity-100 skew-x-[15deg] filter grayscale brightness-200" crossOrigin="anonymous" />
            </div>
          </div>

          {/* Main Content Bottom */}
          <div className="absolute bottom-24 left-20 right-20 z-30 flex flex-col">
            <h3 className="text-red-600 text-[60px] font-black uppercase tracking-widest italic leading-none drop-shadow-xl">
              {seasonName}
            </h3>
            <h1 className="text-white text-[150px] font-black uppercase tracking-tighter leading-[0.9] italic mb-4 shadow-black drop-shadow-2xl">
              {winner.name}
            </h1>
            
            <div className="bg-red-600 px-8 py-4 inline-block w-max skew-x-[-15deg] mb-8">
              <p className="text-white font-black text-4xl uppercase tracking-[0.3em] italic skew-x-[15deg]">
                Grand Finalist
              </p>
            </div>
            
            {/* Website URL */}
            <div className="font-mono text-white/60 text-2xl tracking-[0.2em]">
              ncl.sundxr.dev
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
