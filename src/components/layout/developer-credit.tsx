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

      {/* Hidden Card for Download (Text only, gradient aesthetic, Apple style) */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden w-0 h-0">
        <div 
          ref={cardRef}
          className="relative w-[1080px] h-[1920px] bg-black flex flex-col items-center justify-center overflow-hidden p-20 text-center"
        >
          {/* Rich Gradient Background */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" />
          <div className="absolute -top-64 -right-64 w-[800px] h-[800px] bg-blue-600/20 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute top-1/3 -left-64 w-[800px] h-[800px] bg-red-600/15 blur-[120px] rounded-full mix-blend-screen" />
          <div className="absolute -bottom-64 right-1/4 w-[800px] h-[800px] bg-purple-600/15 blur-[120px] rounded-full mix-blend-screen" />
          
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

          {/* Giant Aesthetic Background Image */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.15] mix-blend-luminosity overflow-hidden">
            <div className="relative w-[150%] h-[150%] max-w-none ml-[20%] mt-[10%]">
              <img 
                src="/shyam.png" 
                alt="Shyam Sunder" 
                className="w-full h-full object-contain object-right-bottom filter contrast-125 brightness-75 drop-shadow-3xl mask-image-linear"
                style={{ maskImage: "radial-gradient(circle at center, black 40%, transparent 80%)", WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 80%)" }}
              />
            </div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full border border-white/10 rounded-[3rem] bg-black/40 backdrop-blur-[8px] p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
            
            <div className="inline-flex items-center px-6 py-2 rounded-full bg-white/5 border border-white/10 text-xl uppercase tracking-[0.4em] text-white/60 font-semibold mb-8">
              System Architect & Lead Developer
            </div>
            
            <h1 className="text-white font-black text-8xl tracking-tight mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent pb-4">
              Shyam Sunder
            </h1>
            
            <p className="text-zinc-400 text-3xl font-medium max-w-3xl leading-relaxed mb-24">
              Crafting premium, highly-performant web applications. Lead engineer for the NCL Hub architecture, delivering seamless, broadcast-quality digital experiences.
            </p>

            {/* Links Block */}
            <div className="flex flex-col items-center space-y-6 w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-md">
              <div className="flex items-center gap-4 text-3xl font-bold text-white">
                <ExternalLink className="w-8 h-8 text-blue-400" />
                sundxr.dev
              </div>
              <div className="w-full h-px bg-white/10 my-2" />
              <div className="flex items-center gap-4 text-3xl font-bold text-white">
                <ExternalLink className="w-8 h-8 text-blue-400" />
                linkedin.com/in/sundxrr
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-16 flex flex-col items-center">
              <span className="font-heading font-black text-5xl tracking-tighter uppercase skew-x-[10deg]">
                <span className="text-white">NCL</span> <span className="text-red-600">Hub</span>
              </span>
              <p className="text-lg text-zinc-500 font-mono tracking-widest uppercase mt-4">
                Engineered with Precision
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
