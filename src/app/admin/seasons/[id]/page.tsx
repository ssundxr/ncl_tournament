"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Calendar, Trophy, ChevronLeft, Shuffle, User } from "lucide-react";
import Link from "next/link";
import { Season, Player } from "@/types";

export default function SeasonControlPanel() {
  const params = useParams();
  const router = useRouter();
  const seasonId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [enrolledPlayers, setEnrolledPlayers] = useState<Player[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // 1. Fetch Season
      const { data: sData } = await supabase
        .from("seasons")
        .select("*, tournament:tournaments(*)")
        .eq("id", seasonId)
        .single();
      
      setSeason(sData as Season);

      // 2. Fetch Enrollments
      const { data: eData } = await supabase
        .from("season_enrollments")
        .select("player:players(*)")
        .eq("season_id", seasonId);
      
      if (eData) {
        setEnrolledPlayers(eData.map(e => e.player as unknown as Player));
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
      alert("Not enough players enrolled to generate fixtures.");
      return;
    }

    if (!confirm("Are you sure? This will lock enrollment and generate all groups and matches.")) {
      return;
    }

    setGenerating(true);

    try {
      // Shuffle players
      const shuffled = [...enrolledPlayers].sort(() => 0.5 - Math.random());
      
      // Divide into groups of 5 (or remainder)
      const groupSize = 5;
      const chunks = [];
      for (let i = 0; i < shuffled.length; i += groupSize) {
        chunks.push(shuffled.slice(i, i + groupSize));
      }

      const allFixtures = [];
      const leaderboardsToInsert = [];

      // Create groups
      for (let i = 0; i < chunks.length; i++) {
        const groupName = `Group ${String.fromCharCode(65 + i)}`; // Group A, Group B...
        const players = chunks[i];

        // 1. Insert Group
        const { data: newGroup, error: groupError } = await supabase
          .from("groups")
          .insert({
            season_id: seasonId,
            name: groupName,
            sort_order: i
          })
          .select()
          .single();

        if (groupError) throw groupError;

        // 2. Insert Group Players & Leaderboards
        for (const p of players) {
          await supabase.from("group_players").insert({
            group_id: newGroup.id,
            player_id: p.id
          });

          leaderboardsToInsert.push({
            season_id: seasonId,
            group_id: newGroup.id,
            player_id: p.id
          });
        }

        // 3. Generate Round Robin Fixtures for this group
        const isOdd = players.length % 2 !== 0;
        const pArr = [...players];
        if (isOdd) pArr.push(null as any); // Dummy for byes
        const n = pArr.length;

        for (let round = 0; round < n - 1; round++) {
          for (let j = 0; j < n / 2; j++) {
            const home = pArr[j];
            const away = pArr[n - 1 - j];
            
            if (home && away) {
              allFixtures.push({
                season_id: seasonId,
                group_id: newGroup.id,
                home_player_id: home.id,
                away_player_id: away.id,
                matchday: round + 1,
                stage: "group",
                status: "scheduled"
              });
            }
          }
          // Rotate for next round
          pArr.splice(1, 0, pArr.pop()!);
        }
      }

      // Bulk insert leaderboards
      if (leaderboardsToInsert.length > 0) {
        await supabase.from("leaderboards").insert(leaderboardsToInsert);
      }

      // Bulk insert fixtures
      if (allFixtures.length > 0) {
        await supabase.from("fixtures").insert(allFixtures);
      }

      // Update Season status to in_progress
      await supabase.from("seasons").update({ status: "in_progress" }).eq("id", seasonId);

      alert("Groups and Fixtures successfully generated!");
      router.refresh();
      window.location.reload();

    } catch (error: any) {
      console.error(error);
      alert("Error generating fixtures: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const generateKnockouts = async () => {
    if (!confirm("Generate Semi-Finals based on current group standings? This will lock the group stage.")) return;
    setGenerating(true);
    try {
      // Fetch leaderboards to get top 2 from each group
      const { data: boards } = await supabase
        .from("leaderboards")
        .select("*, group:groups(*)")
        .eq("season_id", seasonId)
        .order("points", { ascending: false })
        .order("goal_difference", { ascending: false })
        .order("goals_for", { ascending: false });

      if (!boards || boards.length < 4) {
        alert("Not enough players in leaderboards to generate semi-finals.");
        return;
      }

      const uniqueGroups = Array.from(new Set(boards.map(b => b.group.id)))
        .map(id => boards.find(b => b.group.id === id)!.group)
        .sort((a, b) => a.sort_order - b.sort_order);

      const groupA = boards.filter(b => b.group.id === uniqueGroups[0]?.id).slice(0, 2);
      const groupB = boards.filter(b => b.group.id === uniqueGroups[1]?.id).slice(0, 2);

      if (groupA.length < 2 || groupB.length < 2) {
        alert("Not enough players in Group A or Group B to form semi-finals.");
        return;
      }

      const semis = [
        {
          season_id: seasonId,
          home_player_id: groupA[0].player_id,
          away_player_id: groupB[1].player_id,
          matchday: 100, // Arbitrary high number for knockouts
          stage: "semi_final",
          status: "scheduled"
        },
        {
          season_id: seasonId,
          home_player_id: groupB[0].player_id,
          away_player_id: groupA[1].player_id,
          matchday: 100,
          stage: "semi_final",
          status: "scheduled"
        }
      ];

      const { error } = await supabase.from("fixtures").insert(semis);
      if (error) throw error;
      
      alert("Semi-Finals generated successfully!");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;
  if (!season) return <div className="p-12 text-center text-muted-foreground">Season not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/seasons"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white"><ChevronLeft className="w-6 h-6" /></Button></Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-white tracking-tight">Season Control</h1>
          <p className="text-muted-foreground">{(season as any).tournament?.name}: {season.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
          <Users className="w-8 h-8 text-primary mb-2" />
          <h3 className="font-bold text-xl uppercase">{enrolledPlayers.length}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Enrolled Players</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
          <Trophy className="w-8 h-8 text-success mb-2" />
          <h3 className="font-bold text-xl uppercase">{groups.length}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Generated Groups</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center">
          <Calendar className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-bold text-xl uppercase">{season.status}</h3>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-black uppercase tracking-tight text-xl">Actions</h2>
        </div>

        <div className="mb-8 p-4 bg-muted border border-border rounded-lg">
          <h3 className="font-bold uppercase tracking-tight text-sm mb-3">Registration Window (Optional)</h3>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Opens</label>
              <input 
                type="datetime-local" 
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]"
                value={season.registration_start ? new Date(new Date(season.registration_start).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSeason({...season, registration_start: e.target.value ? new Date(e.target.value).toISOString() : null} as any)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Closes</label>
              <input 
                type="datetime-local" 
                className="bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary [color-scheme:dark]"
                value={season.registration_end ? new Date(new Date(season.registration_end).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ""}
                onChange={(e) => setSeason({...season, registration_end: e.target.value ? new Date(e.target.value).toISOString() : null} as any)}
              />
            </div>
            <Button 
              onClick={async () => {
                const { error } = await supabase.from("seasons").update({
                  registration_start: season.registration_start,
                  registration_end: season.registration_end
                }).eq("id", seasonId);
                if (error) alert(error.message);
                else alert("Registration window saved!");
              }}
              className="bg-primary hover:bg-primary/90 text-white text-xs font-bold uppercase"
            >
              Save Times
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {season.status === 'upcoming' && (
            <Button 
              onClick={async () => {
                if (confirm("Open registration for this season?")) {
                  await supabase.from("seasons").update({ status: "active" }).eq("id", seasonId);
                  alert("Registration is now open! Players can enroll on the homepage.");
                  window.location.reload();
                }
              }}
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider"
            >
              <Calendar className="w-5 h-5 mr-2" /> Open Registration
            </Button>
          )}

          {season.status === 'active' && (
            <Button 
              onClick={async () => {
                if (confirm("Close enrollment for this season? Players will no longer be able to register.")) {
                  await supabase.from("seasons").update({ status: "completed" }).eq("id", seasonId);
                  alert("Enrollment is now closed.");
                  window.location.reload();
                }
              }}
              size="lg"
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive/10 font-bold uppercase tracking-wider"
            >
              <Users className="w-5 h-5 mr-2" /> Close Enrollment
            </Button>
          )}

          {(season.status === 'active' || season.status === 'completed') && groups.length === 0 && (
            <Button 
              onClick={generateGroupsAndFixtures} 
              disabled={generating || enrolledPlayers.length < 2}
              size="lg" 
              className="bg-success hover:bg-success/90 text-white font-bold uppercase tracking-wider"
            >
              {generating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Shuffle className="w-5 h-5 mr-2" />}
              Generate Groups & Fixtures
            </Button>
          )}

          {groups.length > 0 && (
            <div className="space-y-4 w-full">
              <div className="bg-success/10 border border-success/20 text-success p-4 rounded-md">
                <strong>Groups Generated!</strong> The round-robin fixtures are now live.
              </div>
              <Button 
                onClick={generateKnockouts}
                size="lg" 
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 font-bold uppercase tracking-wider"
              >
                <Trophy className="w-5 h-5 mr-2" /> Generate Semi-Finals
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map(g => (
          <div key={g.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h3 className="font-bold text-sm uppercase tracking-widest">{g.name}</h3>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {g.leaderboards?.map((lb: any) => (
                  <li key={lb.player.id} className="flex items-center gap-3 text-sm font-medium">
                    <div className="w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden">
                      {lb.player.photo_url ? <img src={lb.player.photo_url} className="w-full h-full object-cover" /> : <User className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    {lb.player.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
