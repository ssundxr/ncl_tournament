"use client";

import { Swords, Target, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface QuickStatsProps {
  totalMatches: number;
  totalGoals: number;
  totalPlayers: number;
}

export function QuickStats({ totalMatches, totalGoals, totalPlayers }: QuickStatsProps) {
  const stats = [
    { label: "Matches Played", value: totalMatches, icon: Swords, suffix: "" },
    { label: "Total Goals", value: totalGoals, icon: Target, suffix: "" },
    { label: "Registered Players", value: totalPlayers, icon: Users, suffix: "" },
    { label: "Seasons", value: "-", icon: Trophy, suffix: "" },
  ];

  return (
    <section className="w-full bg-foreground border-y-4 border-foreground py-6">
      <div className="container mx-auto px-4 md:px-12 lg:px-24 xl:px-32">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x-2 divide-background/20">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex flex-col items-center justify-center py-4 px-4 gap-2"
              >
                <Icon className="w-5 h-5 text-background/60" />
                <p className="text-4xl font-black font-heading text-background tracking-tighter leading-none">
                  {stat.value}
                </p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-background/60">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
