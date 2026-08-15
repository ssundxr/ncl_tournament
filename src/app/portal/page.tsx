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
  Shield,
  Camera,
  Upload,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerTagCard } from "@/components/portal/player-tag-card";
import { logActivity } from "@/lib/activity";

export default function PortalDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");

  // Profile Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editShortTag, setEditShortTag] = useState("IND");
  const [editTeam, setEditTeam] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editError, setEditError] = useState("");

  const router = useRouter();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setEditError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setEditError("Image size must be under 5MB.");
      return;
    }

    setUploadingPhoto(true);
    setEditError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          setEditPhotoUrl(compressedBase64);
        }
        setUploadingPhoto(false);
      };
      img.onerror = () => {
        setEditError("Failed to process selected image.");
        setUploadingPhoto(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setEditError("Failed to read image file.");
      setUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

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
          setEditPhotoUrl(result.data.player.photo_url || "");
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
    logActivity("enroll_click", { season_id: seasonId }, data?.player?.id);
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
            photo_url: editPhotoUrl,
          },
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile");
      }

      setIsEditOpen(false);
      logActivity("profile_update", { fields: ["name", "short_tag", "favorite_team", "bio", "photo_url"] }, data?.player?.id);
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

  const seasonsList = data.allSeasons || data.availableSeasons || [];
  const appliedSeasonIds = (enrollments || []).map((e: any) => e.season_id);

  const getSeasonEffectiveStatus = (s: any) => {
    const now = new Date();
    if (s.status === "completed") return "closed";
    if (s.registration_end && new Date(s.registration_end) < now && s.status !== "active") return "closed";
    if (s.registration_start && new Date(s.registration_start) > now) return "upcoming";
    if (s.registration_status === "open" || s.status === "active") return "active";
    if (s.registration_end && new Date(s.registration_end) >= now) return "active"; // Extended!
    if (s.status === "upcoming") return "upcoming";
    return "closed";
  };

  const filteredSeasons = seasonsList.filter((s: any) => {
    const eff = getSeasonEffectiveStatus(s);
    if (tournamentFilter === "active") return eff === "active";
    if (tournamentFilter === "upcoming") return eff === "upcoming";
    if (tournamentFilter === "closed") return eff === "closed";
    return true;
  });

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
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-background border-2 border-foreground hover:border-primary transition-all text-xs font-mono font-bold tracking-wider group shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Click to copy unique NCL ID"
            >
              <span className="text-muted-foreground text-[10px]">ID:</span>
              <span className="text-primary font-black">{nclId}</span>
              {copiedId ? (
                <Check className="w-3.5 h-3.5 text-green-500 ml-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground ml-1" />
              )}
            </button>
          </div>

          <h1 className="text-3xl md:text-5xl font-black font-heading uppercase tracking-tight text-foreground">
            {player.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {player.favorite_team && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" /> {player.favorite_team}
              </span>
            )}
            {player.short_tag && (
              <span className="px-2 py-0.5 bg-foreground text-background font-mono text-[10px] font-black">
                TAG: {player.short_tag}
              </span>
            )}
            {player.phone && (
              <span>• Phone: {player.phone}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <Button
            onClick={() => setIsEditOpen(true)}
            variant="outline"
            className="flex-1 md:flex-none border-2 border-foreground font-black uppercase tracking-widest text-xs h-11 rounded-none hover:bg-foreground hover:text-background transition-all"
          >
            <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-2 border-foreground text-destructive hover:bg-destructive hover:text-white font-black uppercase tracking-widest text-xs h-11 rounded-none transition-all"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Grid: Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 4K HD Tag Card Preview */}
        <div className="lg:col-span-5 flex flex-col items-center space-y-4">
          <div className="w-full">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" /> Official Pass
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                4K Export Ready
              </span>
            </div>
            
            {/* Tag Card component */}
            <PlayerTagCard player={player} stats={stats} />
          </div>
        </div>

        {/* Right Column: Career Overview & Tournaments Center */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Career Performance Strip */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-foreground pl-3 mb-6">
              Career Statistics
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Goal className="w-5 h-5 text-primary mb-2" />
                <span className="text-3xl font-black font-mono">{stats?.goals_scored || 0}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">Goals</span>
              </div>
              <div className="p-4 bg-muted/40 border-2 border-border flex flex-col items-center justify-center text-center">
                <Trophy className="w-5 h-5 text-yellow-500 mb-2" />
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

          {/* Unified Tournaments & Registration Center */}
          <div className="bg-card border-4 border-foreground p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-black uppercase tracking-widest border-l-4 border-primary pl-3 text-foreground">
                Tournaments & Registrations
              </h3>
              
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "all", label: "All" },
                  { id: "active", label: "Active" },
                  { id: "upcoming", label: "Upcoming" },
                  { id: "closed", label: "Closed" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTournamentFilter(tab.id)}
                    className={`px-3 py-1 text-xs font-black uppercase tracking-widest border transition-all ${
                      tournamentFilter === tab.id
                        ? "bg-foreground text-background border-foreground shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-background text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredSeasons.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-border">
                <Trophy className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No tournaments found for this filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSeasons.map((season: any) => {
                  const isApplied = appliedSeasonIds.includes(season.id);
                  const enrollment = (enrollments || []).find((e: any) => e.season_id === season.id);
                  const effStatus = getSeasonEffectiveStatus(season);
                  const isLiveActive = effStatus === "active";
                  const isUpcoming = effStatus === "upcoming";
                  const isClosed = effStatus === "closed";

                  return (
                    <div
                      key={season.id}
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-background border-2 border-border hover:border-foreground transition-all gap-4 shadow-sm"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {isLiveActive && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Live / Open
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/30 text-[10px] font-black uppercase tracking-widest">
                              <Clock className="w-3 h-3" />
                              Upcoming
                            </span>
                          )}
                          {isClosed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-muted text-muted-foreground border border-border text-[10px] font-black uppercase tracking-widest">
                              Closed
                            </span>
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            {season.tournament?.name}
                          </span>
                        </div>

                        <h4 className="font-black text-xl uppercase tracking-tight text-foreground">
                          {season.name}
                        </h4>

                        {/* Timing & Dates */}
                        {isLiveActive && season.registration_end && (
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Registration closes: {new Date(season.registration_end).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                        )}
                        {isUpcoming && season.registration_start && (
                          <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-blue-500" />
                            <span>Opens on {new Date(season.registration_start).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                          </div>
                        )}
                        {season.start_date && (
                          <p className="text-[11px] font-bold text-muted-foreground">
                            Season Dates: {new Date(season.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                            {season.end_date && ` — ${new Date(season.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}`}
                          </p>
                        )}
                      </div>

                      {/* Action / Application Status */}
                      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        {isApplied ? (
                          <div className="flex items-center gap-2">
                            {enrollment?.status === "approved" && (
                              <span className="px-3.5 py-1.5 bg-green-500/10 text-green-500 border border-green-500/30 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4" /> Enrolled
                              </span>
                            )}
                            {enrollment?.status === "pending" && (
                              <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/30 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-4 h-4" /> Pending Approval
                              </span>
                            )}
                            {enrollment?.status === "rejected" && (
                              <span className="px-3.5 py-1.5 bg-red-500/10 text-red-500 border border-red-500/30 text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                <ShieldAlert className="w-4 h-4" /> Rejected
                              </span>
                            )}
                          </div>
                        ) : isLiveActive ? (
                          <Button
                            onClick={() => handleEnroll(season.id)}
                            className="w-full md:w-auto bg-primary text-white font-black uppercase tracking-widest text-xs py-4 px-6 border-2 border-foreground rounded-none skew-x-[-10deg] hover:bg-primary/90 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            <span className="skew-x-[10deg]">Apply / Enroll Now</span>
                          </Button>
                        ) : isUpcoming ? (
                          <Button
                            onClick={() => router.push(`/season/${season.id}`)}
                            variant="outline"
                            className="w-full md:w-auto border-2 border-foreground font-black uppercase tracking-widest text-xs py-4 px-6 rounded-none hover:bg-foreground hover:text-background"
                          >
                            View Details
                          </Button>
                        ) : (
                          <Button
                            onClick={() => router.push(`/season/${season.id}/standings`)}
                            variant="outline"
                            className="w-full md:w-auto border-2 border-border font-black uppercase tracking-widest text-xs py-4 px-6 rounded-none text-muted-foreground hover:border-foreground"
                          >
                            Standings
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
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
        <div className="mt-6 pt-5 border-t-2 border-border flex flex-wrap gap-3">
          <a href="/contact" className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background font-black uppercase tracking-widest text-xs hover:bg-primary transition-colors border-2 border-foreground">
            <ExternalLink className="w-4 h-4" /> View All Organizers & Contact
          </a>
          <a href="https://chat.whatsapp.com/CYqbdmsPaEpGyfKiRheit0" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-500 transition-colors border-2 border-emerald-700">
            <MessageCircle className="w-4 h-4" /> Join WhatsApp Community
          </a>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tournament Rules", desc: "Match regulations & fair play", href: "/rules", icon: Shield, color: "text-primary", border: "border-primary/30", bg: "bg-primary/5" },
          { label: "Match Center", desc: "Fixtures, results & schedules", href: "/fixtures", icon: Gamepad2, color: "text-blue-500", border: "border-blue-500/30", bg: "bg-blue-500/5" },
          { label: "Standings", desc: "Leaderboard & season points", href: "/standings", icon: Trophy, color: "text-yellow-500", border: "border-yellow-500/30", bg: "bg-yellow-500/5" },
          { label: "All Players", desc: "Browse the player directory", href: "/players", icon: Sparkles, color: "text-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/5" },
        ].map((link) => {
          const Icon = link.icon;
          return (
            <a
              key={link.label}
              href={link.href}
              className={`p-5 ${link.bg} border-2 ${link.border} hover:border-foreground transition-all group flex flex-col gap-3`}
            >
              <Icon className={`w-6 h-6 ${link.color}`} />
              <div>
                <h4 className="font-black uppercase tracking-widest text-xs text-foreground group-hover:text-primary transition-colors">{link.label}</h4>
                <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{link.desc}</p>
              </div>
            </a>
          );
        })}
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
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-4 bg-muted/40 border-2 border-border">
                <div className="relative w-16 h-16 bg-background border-2 border-foreground overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {editPhotoUrl ? (
                    <img src={editPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-heading font-black text-2xl text-muted-foreground uppercase">
                      {editName ? editName.substring(0, 2) : "NCL"}
                    </span>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-foreground block">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background hover:bg-primary hover:text-white transition-colors text-xs font-bold uppercase tracking-wider border border-foreground">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editPhotoUrl ? "Change Photo" : "Upload Photo"}</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {editPhotoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditPhotoUrl("")}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors border border-border"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium">PNG, JPG, WEBP (Max 5MB)</p>
                </div>
              </div>

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
