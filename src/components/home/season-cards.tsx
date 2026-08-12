"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Calendar, PlayCircle, Users, CheckCircle, Clock, Zap } from "lucide-react";
import { cleanBranding } from "@/lib/utils/branding";

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

import { useRouter } from "next/navigation";

export function SeasonCards({ seasons }: { seasons: any[] }) {
  const router = useRouter();
  if (seasons.length === 0) return null;

  return (
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
                className="group block h-full cursor-pointer"
              >
                <div
                  className={`h-full bg-gradient-to-br ${config.gradient} border-2 ${config.border} hover:border-foreground/50 transition-all duration-300 p-6 relative overflow-hidden group-hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,0.3)]`}
                >
                  {/* Corner accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent" />

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

                  <div 
                    className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground border-t-2 border-border pt-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={`/season/${season.id}/fixtures`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Calendar className="w-3 h-3" /> Fixtures
                    </Link>
                    <Link
                      href={`/season/${season.id}/standings`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Trophy className="w-3 h-3" /> Standings
                    </Link>
                    <Link
                      href={`/season/${season.id}/players`}
                      className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                    >
                      <Users className="w-3 h-3" /> Players
                    </Link>
                    <span className="ml-auto font-black text-foreground group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
