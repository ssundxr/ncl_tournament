"use client";

import { useEffect, useState } from "react";
import { Trophy, Users, Swords, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function AdminDashboardPage() {
  const [liveStats, setLiveStats] = useState({
    activeTournaments: "—",
    totalPlayers: "—",
    pendingMatches: "—",
    recentEnrollments: "—",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const [
        { count: activeTournaments },
        { count: totalPlayers },
        { count: pendingMatches },
        { count: recentEnrollments },
      ] = await Promise.all([
        supabase.from("tournaments").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("players").select("*", { count: "exact", head: true }),
        supabase.from("fixtures").select("*", { count: "exact", head: true }).not("status", "eq", "completed"),
        supabase.from("season_enrollments").select("*", { count: "exact", head: true }),
      ]);
      setLiveStats({
        activeTournaments: String(activeTournaments ?? 0),
        totalPlayers: String(totalPlayers ?? 0),
        pendingMatches: String(pendingMatches ?? 0),
        recentEnrollments: String(recentEnrollments ?? 0),
      });
      setLoading(false);
    }
    loadStats();
  }, []);

  const stats = [
    {
      title: "Active Tournaments",
      value: liveStats.activeTournaments,
      icon: Trophy,
      description: "Currently running tournaments",
    },
    {
      title: "Total Players",
      value: liveStats.totalPlayers,
      icon: Users,
      description: "Registered across all seasons",
    },
    {
      title: "Pending Matches",
      value: liveStats.pendingMatches,
      icon: Swords,
      description: "Scheduled or live fixtures",
    },
    {
      title: "Total Enrollments",
      value: liveStats.recentEnrollments,
      icon: Activity,
      description: "Season registration records",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-black text-foreground tracking-tight uppercase">Dashboard</h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm">
          Live overview of the Namma Football League operations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card border-2 border-border transition-colors hover:border-primary/50 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black font-heading text-foreground tracking-tight">
                  {loading ? "—" : stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-2 border-border">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Manage Matches", href: "/admin/matches" },
              { label: "Manage Players", href: "/admin/players" },
              { label: "Manage Tournaments", href: "/admin/tournaments" },
              { label: "Manage Seasons", href: "/admin/seasons" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between p-3 border-2 border-border bg-muted/50 hover:bg-muted hover:border-primary/50 transition-colors group"
              >
                <span className="text-sm font-black uppercase tracking-wide text-foreground">{action.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
