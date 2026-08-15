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
  ShieldAlert,
  CheckCircle2,
  Clock,
  LogOut,
  HelpCircle,
  MessageCircle,
  Code,
  Copy,
  Check,
  Edit3,
  X,
  Sparkles,
  ExternalLink,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerTagCard } from "@/components/portal/player-tag-card";

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  // Profile Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editShortTag, setEditShortTag] = useState("IND");
  const [editTeam, setEditTeam] = useState("");
  const [editBio, setEditBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");

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
      if (result.success) {
        setData(result.data);
        if (result.data?.player) {
          setEditName(result.data.player.name || "");
          setEditShortTag(result.data.player.short_tag || "IND");
          setEditTeam(result.data.player.favorite_team || "");
          setEditBio(result.data.player.bio || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchDashboard();
    });

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

  const handleCopyId = () => {
    if (!data?.player?.ncl_id) return;
    navigator.clipboard.writeText(data.player.ncl_id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    setSavingProfile(true);
    setEditError("");

    try {
      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          action: "update",
          profileData: {
            name: editName,
            short_tag: editShortTag,
            favorite_team: editTeam,
            bio: editBio,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      setIsEditOpen(false);
      fetchDashboard();
    } catch (err: any) {
      setEditError(err.message || "Failed to save changes");
    } finally {
      setSavingProfile(false);
    }
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
  const points = stats ? (stats.matches_won * 3) + (stats.matches_drawn || 0 * 1) : 0;
  const nclId = player.ncl_id || `NCL-${player.id.substring(0, 5).toUpperCase()}`;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl flex flex-col min-h-screen space-y-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card border-4 border-foreground p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-20 translate-x-20 pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-foreground skew-x-[-10deg]">
              <span className="skew-x-[10deg]">Official Competitor</span>
            </div>
            {/* Unique NCL ID Badge with Copy Button */}
            <button
              onClick={handleCopyId}
              className="bg-background border-2 border-foreground px-3 py-1 text-xs font-mono font-bold flex items-center gap-2 hover:bg-muted transition-colors cursor-pointer"
              title="Click to copy unique NCL ID"
            >
              <span className="text-primary font-black">{nclId}</span>
              {copiedId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
          </div>

          <h1 className="text-4xl md:text-5xl font-black font-heading uppercase tracking-tighter text-foreground">
            {player.name} <span className="text-primary font-mono text-2xl md:text-3xl">[{player.short_tag || "IND"}]</span>
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            {player.favorite_team || "Independent"} Competitor &bull; {nclId}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="border-2 border-foreground text-xs font-black uppercase tracking-widest skew-x-[-10deg] hover:bg-secondary hover:text-foreground transition-colors"
          >
            <span className="skew-x-[10deg] flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Edit Profile
            </span>
          </Button>
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
      </div>

      {/* Main Grid: Tag Card Exporter & Career Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Official 4K Tag Card Exporter (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border-4 border-foreground p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between border-b-2 border-border pb-4 mb-6">
              <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Official Tag Card
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-0.5">
                4K HD Ready
              </span>
            </div>

            {/* Renderable 4K Player Tag Card */}
            <PlayerTagCard player={player} stats={stats} rankNumber={1} />
          </div>

          {/* Quick Profile Link Box */}
          <div className="bg-background border-2 border-border p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-foreground">Public Player Page</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">/players/{player.ncl_id || player.slug}</p>
            </div>
            <Button
              onClick={() => router.push(`/players/${player.ncl_id || player.slug}`)}
              size="sm"
              variant="outline"
              className="border-2 border-foreground text-xs font-black uppercase tracking-widest"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" /> View Page
            </Button>
          </div>
        </div>

        {/* Right Column: Lifetime Stats, Applications & Tournaments (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Career Performance Cards */}
          <div className="bg-background border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-3 mb-6">
              Career Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Goal className="w-5 h-5 text-primary mb-2" />
                <span className="text-3xl font-black font-mono">{stats?.goals_scored || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Goals</span>
              </div>
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Trophy className="w-5 h-5 text-primary mb-2" />
                <span className="text-3xl font-black font-mono">{stats?.matches_won || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Wins</span>
              </div>
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Gamepad2 className="w-5 h-5 text-muted-foreground mb-2" />
                <span className="text-3xl font-black font-mono">{stats?.matches_played || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Matches</span>
              </div>
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Shield className="w-5 h-5 text-primary mb-2" />
                <span className="text-3xl font-black font-mono text-primary">{points}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Points</span>
              </div>
            </div>
          </div>

          {/* Active Applications */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-foreground pl-3 mb-6">
              My Applications
            </h3>
            
            {enrollments.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-border">
                <ShieldAlert className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No active season applications found.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((app: any) => (
                  <div key={app.season_id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-2 border-border bg-background gap-4">
                    <div>
                      <h4 className="font-black text-base uppercase">{app.seasons?.name}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {app.seasons?.tournament?.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {app.status === "approved" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/30 text-xs font-black uppercase tracking-widest">
                          <CheckCircle2 className="w-4 h-4" /> Approved
                        </div>
                      )}
                      {app.status === "pending" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-black uppercase tracking-widest">
                          <Clock className="w-4 h-4" /> Pending Approval
                        </div>
                      )}
                      {app.status === "rejected" && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-black uppercase tracking-widest">
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
          <div className="bg-primary/5 border-4 border-primary p-6 relative overflow-hidden shadow-[6px_6px_0px_0px_var(--theme-primary)]">
            <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-3 mb-6 text-foreground relative z-10">
              Open Tournaments
            </h3>

            {availableSeasons.length === 0 ? (
              <div className="text-center py-8 relative z-10">
                <Trophy className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No open tournament registrations at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4 relative z-10">
                {availableSeasons.map((season: any) => (
                  <div key={season.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 bg-background border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all gap-4">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight">{season.name}</h4>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {season.tournament?.name}
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleEnroll(season.id)}
                      className="w-full sm:w-auto bg-primary text-white font-black uppercase tracking-widest text-xs py-4 px-6 border-2 border-foreground rounded-none skew-x-[-10deg] hover:bg-primary/90 transition-all"
                    >
                      <span className="skew-x-[10deg]">Enter Tournament</span>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Support & Admin Contact Section */}
      <div className="bg-card border-4 border-foreground p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-xl font-black uppercase tracking-widest mb-6 flex items-center gap-3">
          <HelpCircle className="w-6 h-6 text-primary" /> Tournament Support & Helpdesk
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-muted/30 border-2 border-border flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-none border-2 border-primary skew-x-[-10deg] shrink-0">
              <MessageCircle className="w-6 h-6 text-primary skew-x-[10deg]" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-1">Administration & Disputes</h4>
              <p className="text-xs text-muted-foreground font-medium mb-3">For rules, schedule changes, match disputes, and tournament operations.</p>
              <p className="text-sm font-bold uppercase text-foreground">Contact: <span className="text-primary font-mono font-black">Ashwin</span></p>
            </div>
          </div>
          <div className="p-6 bg-muted/30 border-2 border-border flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500/20 flex items-center justify-center rounded-none border-2 border-blue-500 skew-x-[-10deg] shrink-0">
              <Code className="w-6 h-6 text-blue-500 skew-x-[10deg]" />
            </div>
            <div>
              <h4 className="font-black uppercase tracking-widest mb-1">Technical & Website Support</h4>
              <p className="text-xs text-muted-foreground font-medium mb-3">For account setup, payment verification issues, or bug reports.</p>
              <p className="text-sm font-bold uppercase text-foreground">Contact: <span className="text-blue-500 font-mono font-black">Shyam</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border-4 border-foreground w-full max-w-lg p-6 md:p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative">
            <button
              onClick={() => setIsEditOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 border border-border"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-2xl font-black font-heading uppercase tracking-tight mb-6">
              Update Profile & Tag
            </h3>

            {editError && (
              <div className="mb-4 p-3 bg-destructive/20 border border-destructive/50 text-destructive text-xs font-bold uppercase">
                {editError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-foreground">Player Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-background border-2 border-border p-3 text-sm font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground">Short Tag (3-4 Letters)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={editShortTag}
                    onChange={(e) => setEditShortTag(e.target.value.toUpperCase())}
                    className="w-full bg-background border-2 border-border p-3 text-sm font-mono font-black uppercase text-primary focus:outline-none focus:border-primary"
                    placeholder="CMD, IND..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground">Favorite Team</label>
                  <input
                    type="text"
                    required
                    value={editTeam}
                    onChange={(e) => setEditTeam(e.target.value)}
                    className="w-full bg-background border-2 border-border p-3 text-sm font-bold focus:outline-none focus:border-primary"
                    placeholder="Manchester United"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-foreground">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full bg-background border-2 border-border p-3 text-sm font-medium focus:outline-none focus:border-primary h-20 resize-none"
                  placeholder="Playstyle & tactics..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditOpen(false)}
                  className="border-2 border-foreground font-bold uppercase text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-primary text-white font-black uppercase text-xs px-6 border-2 border-foreground"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
