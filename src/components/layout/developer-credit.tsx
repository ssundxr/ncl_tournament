"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Check, ExternalLink } from "lucide-react";

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
    <div className="mt-8 pt-8 border-t-[3px] border-background/10 flex flex-col items-center text-center">
      {/* Visible Footer Text */}
      <p className="text-sm font-medium text-background/60 leading-relaxed max-w-2xl">
        Website thoughtfully designed, developed, and maintained by{" "}
        <a 
          href="https://www.linkedin.com/in/sundxrr" 
          target="_blank" 
          rel="noreferrer"
          className="text-primary hover:text-primary/80 font-bold transition-colors inline-flex items-center gap-1"
        >
          Shyam Sunder
        </a>
        .{" "}
        <a 
          href="https://sundxr.dev" 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-500 hover:text-blue-400 font-bold transition-colors inline-flex items-center gap-1"
        >
          Explore my portfolio
        </a>.
      </p>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-background/40 hover:text-primary transition-colors group"
      >
        {downloaded ? <Check className="w-4 h-4 text-green-500" /> : <Download className="w-4 h-4 group-hover:animate-bounce" />}
        Download 4K Developer Card
      </button>

      {/* Hidden Card for Download (Magazine/Split Aesthetic) */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden w-0 h-0">
        <div 
          ref={cardRef}
          className="relative w-[1080px] h-[1920px] bg-white flex overflow-hidden"
        >
          {/* Right Side Full Color Image Background */}
          <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
            <img 
              src="/shyam.png" 
              alt="Shyam Sunder" 
              className="absolute top-0 right-0 w-[80%] h-full object-cover object-[70%_20%]"
            />
          </div>

          {/* Diagonal White Overlay on Left */}
          <div 
            className="absolute top-0 left-0 bottom-0 z-10 w-[65%] bg-white"
            style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 100%)" }}
          >
            {/* Thick Red Accent Line at the bottom of the white section */}
            <div className="absolute bottom-12 left-0 right-0 h-4 bg-[#e52525] w-[85%]" />
            
            {/* Content inside White Area */}
            <div className="absolute top-[15%] left-[10%] w-[70%] flex flex-col items-start pr-12">
              <div className="border-[4px] border-black px-8 py-3 mb-16 inline-flex items-center gap-4">
                <Download className="w-8 h-8 text-black" />
                <span className="text-4xl font-black text-black tracking-widest">4K</span>
              </div>

              <span className="font-heading font-black text-6xl tracking-tighter uppercase skew-x-[10deg] mb-8">
                <span className="text-black">NCL</span> <span className="text-[#e52525]">Hub</span>
              </span>

              <h1 className="text-black font-black text-7xl tracking-tighter mb-12 uppercase leading-none">
                Shyam<br/>Sunder
              </h1>

              <div className="w-24 h-2 bg-black mb-12" />

              <p className="text-black text-4xl font-bold leading-snug mb-16 max-w-lg">
                Website thoughtfully designed, engineered, and maintained.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-6 text-3xl font-black text-black uppercase tracking-widest">
                  <ExternalLink className="w-8 h-8 text-[#e52525]" />
                  sundxr.dev
                </div>
                <div className="flex items-center gap-6 text-3xl font-black text-black uppercase tracking-widest">
                  <ExternalLink className="w-8 h-8 text-[#e52525]" />
                  linkedin.com/in/sundxrr
                </div>
              </div>

              <div className="mt-32 inline-block px-8 py-4 bg-black text-white text-2xl font-black tracking-widest uppercase">
                System Architect & Lead Developer
              </div>
            </div>
          </div>

          {/* Global Thick Red Border Bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#e52525] z-20" />
          <div className="absolute bottom-[24px] left-0 right-0 h-[8px] bg-[#0a0a0a] z-20" />
        </div>
      </div>
    </div>
  );
}
