"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Calendar, Trophy, ChevronLeft, Shuffle, User, Check } from "lucide-react";
import Link from "next/link";
import { Season, Player } from "@/types";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";

export default function SeasonControlPanel({ params }: { params: Promise<{ id: string }> }) {
  const { id: seasonId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [enrolledPlayers, setEnrolledPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  // Config State
  const [groupSize, setGroupSize] = useState(5);
  const [targetBracketSize, setTargetBracketSize] = useState<number | null>(null);
  
  const [statusSelect, setStatusSelect] = useState<Season['status']>('upcoming');

  useEffect(() => {
    async function loadData() {
      // 1. Fetch Season
      const { data: sData } = await supabase
        .from("seasons")
        .select("*, tournament:tournaments(*)")
        .eq("id", seasonId)
        .single();
      
      setSeason(sData as Season);
      setStatusSelect((sData as Season).status);

      // 2. Fetch Enrollments (only approved)
      const { data: eData } = await supabase
        .from("season_enrollments")
        .select("player:players(*)")
        .eq("season_id", seasonId)
        .eq("status", "approved");
      
      if (eData) {
        setEnrolledPlayers(eData.map(e => e.player as unknown as Player).filter(Boolean));
      }

      // 3. Fetch Existing Groups
      const { data: gData } = await supabase
        .from("groups")
        .select("*, leaderboards(player:players(*))")
        .eq("season_id", seasonId)
        .order("sort_order");
        
      setGroups(gData || []);
      setLoading(false);
    }
    
    if (seasonId) loadData();
  }, [seasonId]);

  const generateGroupsAndFixtures = async () => {
    if (enrolledPlayers.length < 2) {
      toast({ variant: "error", title: "Error", description: "Not enough approved players to generate fixtures." });
      return;
    }

    const ok = await confirm({
      title: "Generate Fixtures?",
      description: "Are you sure? This will lock enrollment and generate all groups and matches using the NCL Engine.",
      variant: "destructive"
    });

    if (!ok) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/admin/season/generate-fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_id: seasonId,
          group_size: groupSize,
        })
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Generation failed");
      }

      await supabase.from("seasons").update({ status: "in_progress" }).eq("id", seasonId);

      toast({ variant: "success", title: "Success", description: data.message });
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      toast({ variant: "error", title: "Error", description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const generateKnockouts = async () => {
    const ok = await confirm({
      title: "Generate Knockouts?",
      description: "Generate the knockout bracket based on current group standings? This will lock the group stage."
    });
    
    if (!ok) return;
    
    setGenerating(true);
    try {
      const res = await fetch("/api/admin/season/generate-knockouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season_id: seasonId, target_bracket_size: targetBracketSize })
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      toast({ variant: "success", title: "Success", description: data.message });
      router.refresh();
    } catch (error: any) {
      toast({ variant: "error", title: "Error", description: error.message });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!season) return <div className="p-12 text-center text-muted-foreground">Season not found</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/admin/seasons">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">Season Control</h1>
          <p className="text-muted-foreground font-medium">{(season as any).tournament?.name}: {season.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border-2 border-border p-6 flex flex-col items-center text-center shadow-sm">
          <Users className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-black text-2xl uppercase text-foreground">{enrolledPlayers.length}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Approved Players</p>
        </div>
        <div className="bg-card border-2 border-border p-6 flex flex-col items-center text-center shadow-sm">
          <Trophy className="w-8 h-8 text-success mb-2" />
          <h3 className="font-black text-2xl uppercase text-foreground">{groups.length}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">Generated Groups</p>
        </div>
        <div className="bg-card border-2 border-border p-6 flex flex-col items-center text-center shadow-sm">
          <Calendar className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-black text-xl uppercase text-foreground mt-1">{season.status.replace('_', ' ')}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">Status</p>
        </div>
      </div>

      <div className="bg-card border-2 border-border p-6 md:p-8 shadow-sm">
        <div className="flex justify-between items-center mb-6 border-b-2 border-border pb-4">
          <h2 className="font-black uppercase tracking-tight text-xl text-foreground">Actions & Settings</h2>
        </div>

        <div className="mb-8 p-5 bg-muted/50 border-2 border-border relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <h3 className="font-black uppercase tracking-tight text-sm mb-4 text-foreground">Registration Window</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">Opens At</label>
              <input 
                type="datetime-local" 
                className="w-full bg-background border-2 border-border px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                value={season.registration_start ? new Date(new Date(season.registration_start).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSeason({...season, registration_start: e.target.value ? new Date(e.target.value).toISOString() : null} as any)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">Closes At</label>
              <input 
                type="datetime-local" 
                className="w-full bg-background border-2 border-border px-4 py-2.5 text-sm font-medium text-foreground focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                value={season.registration_end ? new Date(new Date(season.registration_end).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSeason({...season, registration_end: e.target.value ? new Date(e.target.value).toISOString() : null} as any)}
              />
            </div>
            <Button 
              onClick={async () => {
                try {
                  const res = await fetch("/api/admin/season/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      season_id: seasonId,
                      registration_start: season.registration_start,
                      registration_end: season.registration_end,
                    })
                  });
                  const data = await res.json();
                  if (!data.success) throw new Error(data.error);
                  toast({ variant: "success", title: "Saved", description: "Registration window updated!" });
                } catch (err: any) {
                  toast({ variant: "error", title: "Error", description: err.message || "Failed to save times" });
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-black uppercase h-11 px-6 rounded-none"
            >
              Save Times
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between p-4 border-2 border-border bg-background">
            <div>
              <h4 className="font-black uppercase text-foreground">Season Status</h4>
              <p className="text-sm text-muted-foreground font-medium mt-1">Manage the lifecycle state of this season.</p>
            </div>
            <div className="flex gap-4">
              <select
                value={statusSelect}
                onChange={(e) => setStatusSelect(e.target.value as any)}
                className="bg-background border-2 border-primary text-foreground px-4 py-2 font-bold text-sm outline-none"
              >
                <option value="upcoming">Upcoming (Draft)</option>
                <option value="active">Active (Open)</option>
                <option value="maintenance">Maintenance (Frozen)</option>
                <option value="completed">Completed (Closed)</option>
              </select>
              <Button 
                onClick={async () => {
                  const ok = await confirm({ title: "Update Status?" });
                  if (ok) {
                    try {
                      const res = await fetch("/api/admin/season/update", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          season_id: seasonId,
                          status: statusSelect,
                        })
                      });
                      const data = await res.json();
                      if (!data.success) throw new Error(data.error);
                      toast({ variant: "success", title: "Success", description: "Season status updated!" });
                      router.refresh();
                      window.location.reload();
                    } catch (err: any) {
                      toast({ variant: "error", title: "Error", description: err.message || "Failed to update status" });
                    }
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider rounded-none"
              >
                Save
              </Button>
            </div>
          </div>

          {(season.status === 'active' || season.status === 'completed') && groups.length === 0 && (
            <div className="p-6 border-2 border-primary/30 bg-primary/5 space-y-4">
              <div>
                <h4 className="font-black text-lg uppercase text-foreground">NCL Fixture Engine</h4>
                <p className="text-sm text-muted-foreground font-medium mt-1">Automatically balance and generate round-robin groups based on approved players.</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-foreground">Group Size:</label>
                  <select 
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    className="bg-background border-2 border-border px-3 py-1.5 text-sm font-bold uppercase outline-none focus:border-primary"
                  >
                    {[3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} Players</option>)}
                  </select>
                </div>
                
                <Button 
                  onClick={generateGroupsAndFixtures} 
                  disabled={generating || enrolledPlayers.length < 2}
                  className="bg-success hover:bg-success/90 text-black font-black uppercase tracking-wider rounded-none ml-auto"
                >
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shuffle className="w-4 h-4 mr-2" />}
                  Run Engine
                </Button>
              </div>
            </div>
          )}

          {groups.length > 0 && (
            <div className="flex items-center justify-between p-4 border-2 border-success/30 bg-success/5">
              <div>
                <h4 className="font-black uppercase text-success flex items-center gap-2">
                  <Check className="w-5 h-5" /> Tournament Engine Live
                </h4>
                <p className="text-sm text-success/80 font-medium mt-1">Once a stage is completed, click to generate the next knockout round (R16, Quarters, Semis, etc).</p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <select 
                  className="bg-background border-2 border-primary text-foreground px-3 py-2 font-bold text-sm outline-none"
                  value={targetBracketSize || ""}
                  onChange={(e) => setTargetBracketSize(e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">Auto Bracket Size</option>
                  <option value="16">Round of 16 (16 Players)</option>
                  <option value="8">Quarter-Finals (8 Players)</option>
                  <option value="4">Semi-Finals (4 Players)</option>
                </select>
                <Button 
                  onClick={generateKnockouts}
                  disabled={generating}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 font-black uppercase tracking-wider rounded-none"
                >
                  {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trophy className="w-4 h-4 mr-2" />}
                  Generate / Progress Knockouts
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {groups.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {groups.map(g => (
            <div key={g.id} className="bg-card border-2 border-border rounded-none shadow-sm">
              <div className="bg-muted/50 px-5 py-4 border-b-2 border-border">
                <h3 className="font-black text-lg uppercase tracking-widest text-foreground">{g.name}</h3>
              </div>
              <div className="p-0">
                <ul className="divide-y-2 divide-border">
                  {g.leaderboards?.map((lb: any, idx: number) => (
                    <li key={lb.player.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <span className="text-xs font-black text-muted-foreground w-4">{idx + 1}</span>
                      <div className="w-8 h-8 bg-background border-2 border-border flex items-center justify-center overflow-hidden shrink-0">
                        {lb.player.photo_url ? <img src={lb.player.photo_url} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      <span className="text-sm font-bold uppercase text-foreground truncate">{lb.player.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
