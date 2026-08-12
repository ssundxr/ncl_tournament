"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function DeveloperCredit() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setDownloading(true);
      // Generate high-quality image (scale up for "4k" look)
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3, // High DPI for 4K aesthetic
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        }
      });
      
      const link = document.createElement("a");
      link.download = "developer-credit-ncl-hub.png";
      link.href = dataUrl;
      link.click();
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-16 pt-12 border-t-[3px] border-background/10 flex flex-col items-center">
      <div className="w-full max-w-sm relative group">
        {/* The Card */}
        <div 
          ref={cardRef}
          className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 p-6 md:p-8 flex flex-col items-center justify-center aspect-[9/16] shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
        >
          {/* Aesthetic Background Overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 w-full">
            {/* Profile Image with Ring */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-zinc-800 via-zinc-400 to-zinc-800 shadow-2xl">
              <div className="w-full h-full rounded-full overflow-hidden bg-black relative border-[4px] border-[#0a0a0a]">
                <img 
                  src="/shyam.png" 
                  alt="Shyam Sunder" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Shyam+Sunder&background=0D8ABC&color=fff&size=256';
                  }}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[10px] uppercase tracking-[0.3em] text-white/70 font-semibold mb-2">
                Developer & Architect
              </div>
              <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
                Shyam Sunder
              </h4>
              <p className="text-sm md:text-base text-zinc-400 font-medium max-w-[250px] mx-auto leading-relaxed">
                Website thoughtfully designed, engineered, and maintained.
              </p>
            </div>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent my-6" />

            {/* Logo & Domain */}
            <div className="flex flex-col items-center space-y-2">
              <span className="font-heading font-black text-3xl tracking-tighter uppercase skew-x-[10deg]">
                <span className="text-white">NCL</span> <span className="text-red-500">Hub</span>
              </span>
              <p className="text-xs text-zinc-500 font-mono tracking-wider uppercase">
                2026 Edition
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons (Not included in the downloaded image) */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/10 text-white shadow-lg transition-all active:scale-95"
            title="Download for Instagram Story"
          >
            {downloaded ? <Check className="w-5 h-5 text-green-400" /> : <Download className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Subtle Link under the card */}
      <a 
        href="https://www.linkedin.com/in/sundxrr" 
        target="_blank" 
        rel="noreferrer"
        className="mt-6 flex items-center gap-2 text-sm font-medium text-background/60 hover:text-white transition-colors"
      >
        linkedin.com/in/sundxrr <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
