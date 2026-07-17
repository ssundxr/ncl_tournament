import { Trophy, Users, Swords, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        <h1 className="text-4xl font-black font-heading uppercase text-white tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Overview of the Namma Football League operations.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="bg-card border-border border transition-colors hover:border-primary/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="w-5 h-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card border-border border">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white uppercase tracking-wider">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <a href="/admin/matches" className="text-sm text-primary hover:underline font-bold">Start Next Match</a>
              <a href="/admin/players/new" className="text-sm text-white hover:text-primary transition-colors">Add New Player</a>
              <a href="/admin/tournaments" className="text-sm text-white hover:text-primary transition-colors">Manage Tournaments</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
