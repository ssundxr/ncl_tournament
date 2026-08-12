"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, User, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cleanBranding } from "@/lib/utils/branding";
import { useState, useEffect } from "react";

export function HeroSection({ seasons }: { seasons: any[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (seasons.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % seasons.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [seasons]);

  const currentSeason = seasons[activeIndex];
  if (!currentSeason) return null;

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500",
    upcoming: "bg-blue-500",
    completed: "bg-amber-500",
  };

  return (
    <section className="relative w-full h-[75vh] flex items-end overflow-hidden bg-background border-b-4 border-foreground">
      <div className="absolute inset-0 bg-[url('/bg_banner1.png')] bg-cover bg-center opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
      <div className="absolute inset-0 grunge-overlay z-10 opacity-60" />

      <div className="relative z-20 w-full px-4 md:px-12 lg:px-24 xl:px-32 pb-20 h-full flex flex-col justify-end">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSeason.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col md:flex-row items-end justify-between gap-8 w-full"
          >
            <div className="flex flex-col items-start max-w-4xl">
              <div className={`inline-flex items-center px-4 py-1.5 text-white border-2 border-foreground mb-6 font-black text-xs uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] ${statusColors[currentSeason.status] ?? "bg-muted"}`}>
                {currentSeason.status === "active" && <span className="w-2 h-2 bg-white animate-pulse mr-2" />}
                {currentSeason.status}
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-[80px] tracking-normal mb-4 text-foreground leading-[0.85] font-fifa uppercase drop-shadow-sm">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                  {currentSeason.tournament?.name ?? "NAMMA CHAMPIONS LEAGUE"}
                </span>:
                <br />
                <span className="text-primary">{cleanBranding(currentSeason.name)}</span>
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80 mb-8 max-w-2xl font-bold tracking-tight">
                Experience the ultimate eFootball mobile tournament. Track standings, fixtures, and check results dynamically.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href={`/season/${currentSeason.id}/fixtures`}>
                  <Button size="lg" className="rounded-none px-8 h-14 border-2 border-foreground brutal-shadow-hover font-black uppercase tracking-widest bg-foreground text-background transition-all">
                    <PlayCircle className="mr-2 h-6 w-6" /> View Fixtures
                  </Button>
                </Link>
                {currentSeason.status === "active" && (
                  <Link href={`/season/${currentSeason.id}/enroll`}>
                    <Button size="lg" className="rounded-none px-8 h-14 bg-primary text-white border-2 border-primary brutal-shadow-hover font-black uppercase tracking-widest transition-all">
                      <User className="mr-2 h-6 w-6" /> Enroll Now
                    </Button>
                  </Link>
                )}
                <Link href={`/season/${currentSeason.id}/standings`}>
                  <Button size="lg" variant="outline" className="rounded-none px-8 h-14 font-black uppercase tracking-widest bg-white border-2 border-foreground brutal-shadow-hover text-foreground transition-all">
                    Standings <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="hidden md:flex flex-shrink-0 items-center justify-center pointer-events-none">
              <img src="/logo_ncl.png" alt="NCL Logo" className="w-[300px] lg:w-[380px] h-auto object-contain drop-shadow-2xl opacity-90 hover:scale-105 transition-transform duration-700" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination */}
      {seasons.length > 1 && (
        <>
          <div className="absolute bottom-6 left-6 md:left-12 lg:left-24 z-30 flex items-center gap-1.5">
            {seasons.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${i === activeIndex ? "bg-primary w-6" : "bg-white/40 hover:bg-white/70 w-2.5"}`}
              />
            ))}
          </div>
          <div className="absolute bottom-6 right-6 md:right-12 z-30 flex gap-2">
            <button
              onClick={() => setActiveIndex((prev) => (prev - 1 + seasons.length) % seasons.length)}
              className="w-10 h-10 rounded-full border border-white/20 bg-background/30 hover:bg-background/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev + 1) % seasons.length)}
              className="w-10 h-10 rounded-full border border-white/20 bg-background/30 hover:bg-background/80 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
