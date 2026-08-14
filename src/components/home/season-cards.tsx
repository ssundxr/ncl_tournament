"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Calendar, PlayCircle, Users, CheckCircle, Clock, Zap, X } from "lucide-react";
import { cleanBranding } from "@/lib/utils/branding";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Countdown } from "@/components/ui/countdown";

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ComponentType<any>; gradient: string; accent: string; border: string }
> = {
  active: {
    label: "LIVE SEASON",
    icon: Zap,
    gradient: "from-emerald-950/60 via-card to-card",
    accent: "text-emerald-400",
    border: "border-emerald-500/50",
  },
  upcoming: {
    label: "COMING SOON",
    icon: Clock,
    gradient: "from-blue-950/60 via-card to-card",
    accent: "text-blue-400",
    border: "border-blue-500/50",
  },
  completed: {
    label: "COMPLETED",
    icon: CheckCircle,
    gradient: "from-amber-950/40 via-card to-card",
    accent: "text-amber-400",
    border: "border-amber-500/30",
  },
};

export function SeasonCards({ seasons }: { seasons: any[] }) {
  const router = useRouter();
  const [timerSeason, setTimerSeason] = useState<any>(null);

  if (seasons.length === 0) return null;

  const handleEnrollClick = (e: React.MouseEvent, season: any) => {
    e.stopPropagation(); // prevent card click
    
    if (season.status === "active") {
      router.push(`/season/${season.id}/enroll`);
    } else if (season.status === "upcoming" && season.registration_start) {
      setTimerSeason(season);
    }
  };

  return (
    <>
      <section className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-16">
        <div className="flex items-center gap-3 border-b-2 border-border pb-4 mb-8">
          <div className="w-1.5 h-6 bg-primary" />
          <h2 className="text-2xl font-black uppercase tracking-tight font-heading text-foreground">
            All Seasons
          </h2>
          <span className="ml-auto text-xs font-black uppercase tracking-widest text-muted-foreground">
            {seasons.length} season{seasons.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seasons.map((season, index) => {
            const config = STATUS_CONFIG[season.status] ?? STATUS_CONFIG.completed;
            const Icon = config.icon;

            return (
              <motion.div
                key={season.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07, duration: 0.4 }}
              >
                <div 
                  onClick={() => router.push(`/season/${season.id}`)} 
                  className="group flex flex-col justify-between h-full cursor-pointer bg-gradient-to-br border-2 hover:border-foreground/50 transition-all duration-300 p-6 relative overflow-hidden group-hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,0.3)]"
                  style={{
                    backgroundColor: "hsl(var(--card))",
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent z-0" />

                  <div className="relative z-10 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${config.accent}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </div>
                      {season.status === "active" && (
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      {cleanBranding(season.tournament?.name ?? "")}
                    </p>
                    <h3 className="text-3xl font-black font-heading uppercase tracking-tight text-foreground leading-tight mb-4 group-hover:text-primary transition-colors">
                      {cleanBranding(season.name)}
                    </h3>

                    {season.start_date && (
                      <p className="text-xs font-bold text-muted-foreground mb-6">
                        {new Date(season.start_date).toLocaleDateString("en-IN", {
                          month: "short",
                          year: "numeric",
                        })}
                        {season.end_date &&
                          ` — ${new Date(season.end_date).toLocaleDateString("en-IN", {
                            month: "short",
                            year: "numeric",
                          })}`}
                      </p>
                    )}
                  </div>

                  <div className="relative z-10 mt-auto pt-6 border-t-2 border-border/50 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      {season.season_enrollments?.[0]?.count ?? 0}
                      {season.enrollment_capacity && ` / ${season.enrollment_capacity}`}
                    </div>
                    
                    {/* Enroll Button */}
                    {(season.status === "active" || season.status === "upcoming") && (
                      <div className="ml-auto">
                        <Button 
                          onClick={(e) => handleEnrollClick(e, season)}
                          className={`h-8 px-4 rounded-none border-2 font-black uppercase tracking-widest text-[10px] skew-x-[-10deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${
                            season.status === "active" 
                              ? "bg-primary border-foreground text-white" 
                              : "bg-background border-foreground text-foreground hover:bg-foreground hover:text-background"
                          }`}
                        >
                          <span className="skew-x-[10deg] flex items-center gap-1.5">
                            {season.status === "active" ? "Enroll Now" : "Notify Me"}
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Timer Modal */}
      <AnimatePresence>
        {timerSeason && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setTimerSeason(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card border-4 border-foreground p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
              
              <button 
                onClick={() => setTimerSeason(null)}
                className="absolute top-4 right-4 p-2 bg-background border-2 border-foreground hover:bg-primary hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 text-center space-y-6 pt-4">
                <div className="w-16 h-16 bg-primary text-white mx-auto flex items-center justify-center border-2 border-foreground skew-x-[-10deg]">
                  <Clock className="w-8 h-8 skew-x-[10deg]" />
                </div>
                
                <div>
                  <h3 className="text-3xl font-black font-heading uppercase tracking-tighter text-foreground leading-none mb-2">
                    Opening Soon
                  </h3>
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    {cleanBranding(timerSeason.tournament?.name ?? "Tournament")}: {cleanBranding(timerSeason.name)}
                  </p>
                </div>

                <div className="bg-background border-2 border-border p-6 mt-4">
                  <Countdown targetDate={timerSeason.registration_start} />
                </div>

                <p className="text-xs font-medium text-muted-foreground max-w-sm mx-auto">
                  Registrations are currently closed. Check back when the countdown reaches zero to secure your spot.
                </p>
                
                <Button 
                  onClick={() => setTimerSeason(null)}
                  className="w-full h-12 mt-4 bg-foreground text-background font-black uppercase tracking-widest rounded-none border-2 border-foreground hover:bg-background hover:text-foreground transition-all"
                >
                  Got It
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
