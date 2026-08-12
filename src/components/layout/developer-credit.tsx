"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Check, ExternalLink, ShieldCheck, Code } from "lucide-react";

export function DeveloperCredit() {
  const shyamCardRef = useRef<HTMLDivElement>(null);
  const ashwinCardRef = useRef<HTMLDivElement>(null);

  const [downloadingShyam, setDownloadingShyam] = useState(false);
  const [downloadedShyam, setDownloadedShyam] = useState(false);

  const [downloadingAshwin, setDownloadingAshwin] = useState(false);
  const [downloadedAshwin, setDownloadedAshwin] = useState(false);

  const handleDownloadShyam = async () => {
    if (!shyamCardRef.current) return;
    try {
      setDownloadingShyam(true);
      const dataUrl = await toPng(shyamCardRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = "shyam-developer-credit-ncl-hub.png";
      link.href = dataUrl;
      link.click();
      setDownloadedShyam(true);
      setTimeout(() => setDownloadedShyam(false), 2000);
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setDownloadingShyam(false);
    }
  };

  const handleDownloadAshwin = async () => {
    if (!ashwinCardRef.current) return;
    try {
      setDownloadingAshwin(true);
      const dataUrl = await toPng(ashwinCardRef.current, { quality: 1, pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = "ashwin-organiser-credit-ncl-hub.png";
      link.href = dataUrl;
      link.click();
      setDownloadedAshwin(true);
      setTimeout(() => setDownloadedAshwin(false), 2000);
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      setDownloadingAshwin(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t-[3px] border-background/10 flex flex-col items-center text-center">
      {/* Visible Footer Text */}
      <div className="space-y-2 max-w-3xl">
        <p className="text-sm font-medium text-background/60 leading-relaxed">
          Organized & Administered by{" "}
          <span className="inline-flex items-center gap-1">
            <span className="text-background font-bold underline decoration-primary decoration-2 underline-offset-4">
              Ashwin
            </span>
            <button
              onClick={handleDownloadAshwin}
              disabled={downloadingAshwin}
              title="Download Ashwin's 4K Story Card"
              className="p-1 rounded hover:bg-background/20 transition-colors text-background inline-flex items-center justify-center"
            >
              {downloadedAshwin ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Download className="w-3.5 h-3.5" />}
            </button>
          </span>
          . Designed, engineered, and maintained by{" "}
          <span className="inline-flex items-center gap-1">
            <a 
              href="https://www.linkedin.com/in/sundxrr" 
              target="_blank" 
              rel="noreferrer"
              className="text-primary hover:text-primary/80 font-bold transition-colors"
            >
              Shyam Sunder
            </a>
            <button
              onClick={handleDownloadShyam}
              disabled={downloadingShyam}
              title="Download Shyam's 4K Story Card"
              className="p-1 rounded hover:bg-background/20 transition-colors text-background inline-flex items-center justify-center"
            >
              {downloadedShyam ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Download className="w-3.5 h-3.5" />}
            </button>
          </span>
          .{" "}
          <a 
            href="https://sundxr.dev" 
            target="_blank" 
            rel="noreferrer"
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors inline-flex items-center gap-1"
          >
            Explore portfolio <ExternalLink className="w-3.5 h-3.5" />
          </a>.
        </p>
      </div>

      {/* Hidden Container for 4K Cards */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden w-0 h-0">
        
        {/* SHYAM DEVELOPER 4K CARD */}
        <div 
          ref={shyamCardRef}
          className="relative w-[1080px] h-[1920px] bg-white flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[62%] bg-[#0a0a0a] z-0 overflow-hidden">
            <img 
              src="/shyam.png" 
              alt="Shyam Sunder" 
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div 
            className="absolute bottom-0 left-0 right-0 z-10 h-[52%] bg-white flex flex-col justify-between p-16 pt-24 pb-20"
            style={{ clipPath: "polygon(0 6%, 100% 0, 100% 100%, 0 100%)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#e52525]" />

            <div className="flex items-center justify-between w-full pb-4 border-b-2 border-black/10">
              <span className="font-heading font-black text-5xl tracking-tighter uppercase skew-x-[10deg]">
                <span className="text-black">NCL</span> <span className="text-[#e52525]">HUB</span>
              </span>
              <span className="text-xl font-bold uppercase tracking-[0.3em] text-black/50">
                Official Developer Credit
              </span>
            </div>

            <div className="grid grid-cols-12 gap-12 items-start my-auto pt-4">
              <div className="col-span-7 flex flex-col items-start space-y-6">
                <div>
                  <p className="text-lg font-black uppercase tracking-[0.3em] text-[#e52525] mb-2">
                    Lead Engineer
                  </p>
                  <h1 className="text-black font-black text-8xl tracking-tighter uppercase leading-[0.88] font-heading">
                    Shyam<br/>Sunder
                  </h1>
                </div>

                <div className="w-24 h-2 bg-black" />

                <div className="inline-block px-6 py-3 bg-black text-white text-lg font-black tracking-widest uppercase shadow-md">
                  System Architect & Lead Developer
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="px-5 py-2 bg-black/5 border-2 border-black text-black text-sm font-black tracking-widest uppercase">Full Stack</span>
                  <span className="px-5 py-2 bg-[#e52525] text-white text-sm font-black tracking-widest uppercase">DevOps</span>
                </div>
              </div>

              <div className="col-span-5 flex flex-col justify-between space-y-8 pl-4 border-l-4 border-[#e52525]">
                <div>
                  <span className="text-5xl font-serif text-[#e52525] leading-none select-none">“</span>
                  <p className="text-black text-3xl font-bold leading-snug tracking-tight -mt-4">
                    Website thoughtfully designed, engineered, and maintained.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <a 
                    href="https://sundxr.dev"
                    className="flex items-center justify-between p-4 bg-black/5 border-2 border-black text-black group"
                  >
                    <span className="text-xl font-black uppercase tracking-wider">sundxr.dev</span>
                    <ExternalLink className="w-6 h-6 text-[#e52525]" />
                  </a>

                  <a 
                    href="https://www.linkedin.com/in/sundxrr"
                    className="flex items-center justify-between p-4 bg-black/5 border-2 border-black text-black group"
                  >
                    <span className="text-xl font-black uppercase tracking-wider">linkedin.com/in/sundxrr</span>
                    <ExternalLink className="w-6 h-6 text-[#e52525]" />
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/10 flex justify-between items-center text-xs font-mono tracking-widest text-black/40 uppercase">
              <span>NCL Tournament Platform</span>
              <span>© {new Date().getFullYear()} All Rights Reserved</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#e52525] z-30" />
          <div className="absolute bottom-[24px] left-0 right-0 h-[8px] bg-[#0a0a0a] z-30" />
        </div>


        {/* ASHWIN ORGANISER 4K CARD */}
        <div 
          ref={ashwinCardRef}
          className="relative w-[1080px] h-[1920px] bg-white flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-[62%] bg-[#0a0a0a] z-0 overflow-hidden">
            <img 
              src="/ashwin.jpeg" 
              alt="Ashwin" 
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div 
            className="absolute bottom-0 left-0 right-0 z-10 h-[52%] bg-white flex flex-col justify-between p-16 pt-24 pb-20"
            style={{ clipPath: "polygon(0 6%, 100% 0, 100% 100%, 0 100%)" }}
          >
            <div className="absolute top-0 left-0 right-0 h-4 bg-[#e52525]" />

            <div className="flex items-center justify-between w-full pb-4 border-b-2 border-black/10">
              <span className="font-heading font-black text-5xl tracking-tighter uppercase skew-x-[10deg]">
                <span className="text-black">NCL</span> <span className="text-[#e52525]">HUB</span>
              </span>
              <span className="text-xl font-bold uppercase tracking-[0.3em] text-black/50">
                Official Organiser Credit
              </span>
            </div>

            <div className="grid grid-cols-12 gap-12 items-start my-auto pt-4">
              <div className="col-span-7 flex flex-col items-start space-y-6">
                <div>
                  <p className="text-lg font-black uppercase tracking-[0.3em] text-[#e52525] mb-2">
                    Tournament Lead
                  </p>
                  <h1 className="text-black font-black text-8xl tracking-tighter uppercase leading-[0.88] font-heading">
                    Ashwin
                  </h1>
                </div>

                <div className="w-24 h-2 bg-black" />

                <div className="inline-block px-6 py-3 bg-black text-white text-lg font-black tracking-widest uppercase shadow-md">
                  Organiser & Admin
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <span className="px-5 py-2 bg-black/5 border-2 border-black text-black text-sm font-black tracking-widest uppercase">Operations</span>
                  <span className="px-5 py-2 bg-[#e52525] text-white text-sm font-black tracking-widest uppercase">Community Head</span>
                  <span className="px-5 py-2 bg-black/5 border-2 border-black text-black text-sm font-black tracking-widest uppercase">League Admin</span>
                </div>
              </div>

              <div className="col-span-5 flex flex-col justify-between space-y-8 pl-4 border-l-4 border-[#e52525]">
                <div>
                  <span className="text-5xl font-serif text-[#e52525] leading-none select-none">“</span>
                  <p className="text-black text-3xl font-bold leading-snug tracking-tight -mt-4">
                    Powering broadcast-quality eFootball tournaments & community leadership.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between p-4 bg-black/5 border-2 border-black text-black">
                    <span className="text-xl font-black uppercase tracking-wider">Tournament Admin</span>
                    <ShieldCheck className="w-6 h-6 text-[#e52525]" />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/5 border-2 border-black text-black">
                    <span className="text-xl font-black uppercase tracking-wider">NCL League Operations</span>
                    <ShieldCheck className="w-6 h-6 text-[#e52525]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-black/10 flex justify-between items-center text-xs font-mono tracking-widest text-black/40 uppercase">
              <span>NCL Tournament Platform</span>
              <span>© {new Date().getFullYear()} All Rights Reserved</span>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#e52525] z-30" />
          <div className="absolute bottom-[24px] left-0 right-0 h-[8px] bg-[#0a0a0a] z-30" />
        </div>

      </div>
    </div>
  );
}
