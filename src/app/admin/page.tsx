import { Trophy, Users, Swords, Activity, ArrowRight, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const stats = [
    {
      title: "Active Tournaments",
      value: "1",
      icon: Trophy,
      description: "2026 Season 1 is active",
    },
    {
      title: "Total Players",
      value: "16",
      icon: Users,
      description: "+2 from last season",
    },
    {
      title: "Pending Matches",
      value: "4",
      icon: Swords,
      description: "Next match starts today",
    },
    {
      title: "System Status",
      value: "Online",
      icon: Activity,
      description: "All services operational",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground font-medium mt-1 text-sm">
          Overview of the Namma Football League operations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card border-border shadow-sm transition-colors hover:border-primary/50 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-heading text-foreground tracking-tight">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">Quick Actions</CardTitle>
            <CardDescription>Shortcuts to common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/matches" className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group">
              <span className="text-sm font-semibold text-foreground">Start Next Match</span>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/admin/players" className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group">
              <span className="text-sm font-semibold text-foreground">Manage Players</span>
              <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/admin/tournaments" className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors group">
              <span className="text-sm font-semibold text-foreground">Manage Tournaments</span>
              <Trophy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
