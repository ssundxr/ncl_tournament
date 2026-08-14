"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { 
  Loader2, 
  Trophy, 
  Gamepad2, 
  Goal, 
  Target, 
  ShieldAlert,
  CheckCircle2,
  Clock,
  LogOut,
  HelpCircle,
  MessageCircle,
  Code
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const router = useRouter();

  const fetchDashboard = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const res = await fetch("/api/portal/dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid }),
      });
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We already have a layout checking auth, so currentUser should be ready shortly.
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchDashboard();
    });

    // Real-time listener for season status changes
    const channel = supabase
      .channel('portal-seasons-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'seasons' }, () => {
        if (auth.currentUser) fetchDashboard();
      })
      .subscribe();

    return () => {
      unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  const handleEnroll = (seasonId: string) => {
    router.push(`/season/${seasonId}/enroll`);
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!data?.player) return null;

  const { player, stats, enrollments, availableSeasons } = data;
  const points = stats ? (stats.matches_won * 3) + (stats.matches_drawn * 1) : 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl flex flex-col min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter text-foreground skew-x-[-5deg]">
            Player <span className="text-primary">Portal</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm mt-2">
            Welcome back to the arena.
          </p>
        </div>
        <Button 
          onClick={handleLogout}
          variant="outline" 
          className="border-2 border-foreground text-xs font-black uppercase tracking-widest skew-x-[-10deg] hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
        >
          <span className="skew-x-[10deg] flex items-center gap-2">
            <LogOut className="w-4 h-4" /> Sign Out
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Gamer Card & Stats */}
        <div className="space-y-8">
          
          {/* Gamer Card */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-colors"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-20 h-20 bg-muted border-2 border-foreground overflow-hidden skew-x-[-10deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {player.photo_url ? (
                  <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover skew-x-[10deg] scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-foreground text-background skew-x-[10deg]">
                    <Gamepad2 className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight">{player.name}</h2>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                  {player.favorite_team}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center border-t-2 border-border pt-4">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Overall Rating</span>
              <span className="text-3xl font-black font-mono text-primary">{player.overall_rating || 70}</span>
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="bg-background border-2 border-border p-6 shadow-sm">
            <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-3 mb-6">
              Career Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted/30 border-2 border-border flex flex-col items-center justify-center text-center">
                <Goal className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-2xl font-black font-mono">{stats?.goals_scored || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Total Goals</span>
              </div>
              <div className="p-4 bg-muted/30 border-2 border-border flex flex-col items-center justify-center text-center">
                <Trophy className="w-6 h-6 text-primary mb-2" />
                <span className="text-2xl font-black font-mono">{points}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Points</span>
              </div>
              <div className="p-4 bg-muted/30 border-2 border-border flex flex-col items-center justify-center text-center">
                <Trophy className="w-6 h-6 text-primary mb-2" />
                <span className="text-2xl font-black font-mono">{stats?.matches_won || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Wins</span>
              </div>
              <div className="p-4 bg-muted/30 border-2 border-border flex flex-col items-center justify-center text-center">
                <Gamepad2 className="w-6 h-6 text-muted-foreground mb-2" />
                <span className="text-2xl font-black font-mono">{stats?.matches_played || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Played</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Applications & Available */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Applications */}
          <div className="bg-card border-4 border-foreground p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-black uppercase tracking-widest border-l-4 border-foreground pl-3 mb-6">
              My Applications
            </h3>
            
            {enrollments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border">
                <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  No active applications.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((app: any) => (
                  <div key={app.season_id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 border-border bg-background gap-4">
                    <div>
                      <h4 className="font-black text-lg uppercase">{app.seasons?.name}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {app.seasons?.tournament?.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {app.status === "approved" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-success/10 text-success border border-success/30 text-xs font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </div>
                      )}
                      {app.status === "pending" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-warning/10 text-warning border border-warning/30 text-xs font-black uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> Pending
                        </div>
                      )}
                      {app.status === "rejected" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-destructive/10 text-destructive border border-destructive/30 text-xs font-black uppercase tracking-widest">
                          <ShieldAlert className="w-4 h-4" /> Rejected
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Tournaments */}
          <div className="bg-primary/5 border-4 border-primary p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_var(--theme-primary)]">
            <h3 className="text-xl font-black uppercase tracking-widest border-l-4 border-primary pl-3 mb-6 text-foreground relative z-10">
              Available Tournaments
            </h3>

            {availableSeasons.length === 0 ? (
              <div className="text-center py-8 relative z-10">
                <Trophy className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  No open tournaments right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {availableSeasons.map((season: any) => (
                  <div key={season.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-background border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all gap-4">
                    <div>
                      <h4 className="font-black text-xl uppercase tracking-tight">{season.name}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {season.tournament?.name}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleEnroll(season.id)}
                      className="w-full sm:w-auto bg-primary text-white font-black uppercase tracking-widest text-xs py-5 px-6 border-2 border-foreground rounded-none skew-x-[-10deg] hover:bg-primary/90 hover:scale-105 transition-all"
                    >
                      <span className="skew-x-[10deg] flex items-center gap-2">
                        <>Enter <span className="hidden sm:inline">Tournament</span></>
                      </span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Contact & Support Section */}
      <div className="mt-12 bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-2xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary" /> Need Help?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/30 border-2 border-border flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-none border-2 border-primary skew-x-[-10deg]">
              <MessageCircle className="w-6 h-6 text-primary skew-x-[10deg]" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-1">Administration & Community</h4>
              <p className="text-xs text-muted-foreground font-medium mb-3">For tournament rules, match disputes, and community queries.</p>
              <p className="text-sm font-bold uppercase text-foreground">Contact: <span className="text-primary">Ashwin</span></p>
            </div>
          </div>
          <div className="p-6 bg-muted/30 border-2 border-border flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 flex items-center justify-center rounded-none border-2 border-blue-500 skew-x-[-10deg]">
              <Code className="w-6 h-6 text-blue-500 skew-x-[10deg]" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-1">Website & Technical Issues</h4>
              <p className="text-xs text-muted-foreground font-medium mb-3">For bugs, payment gateway issues, or portal errors.</p>
              <p className="text-sm font-bold uppercase text-foreground">Contact: <span className="text-blue-500">Shyam</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
