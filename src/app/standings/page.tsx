"use client";

import { useEffect, useState } from "react";
import { GroupTable } from "@/components/standings/group-table";
import { StandingsRow, Player } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { Trophy, Loader2 } from "lucide-react";

export default function StandingsPage() {
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [knockouts, setKnockouts] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      // Fetch active season
      const { data: sData } = await supabase
        .from('seasons')
        .select('*, tournament:tournaments(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (sData) {
        setSeason(sData);

        // Fetch groups
        const { data: gData } = await supabase
          .from('groups')
          .select('*')
          .eq('season_id', sData.id)
          .order('sort_order');
        setGroups(gData || []);

        // Fetch leaderboards
        const { data: lData } = await supabase
          .from('leaderboards')
          .select('*, player:players(*)')
          .eq('season_id', sData.id)
          .order('points', { ascending: false })
          .order('goal_difference', { ascending: false })
          .order('goals_for', { ascending: false });
        setLeaderboards(lData || []);

        // Fetch knockouts
        const { data: kData } = await supabase
          .from('fixtures')
          .select('*, matches(*), home:players!home_player_id(*), away:players!away_player_id(*)')
          .eq('season_id', sData.id)
          .in('stage', ['semi_final', 'final'])
          .order('created_at');
        setKnockouts(kData || []);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  if (!season) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col text-center space-y-4">
        <Trophy className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-3xl font-black uppercase text-white">No Active Season</h2>
        <p className="text-muted-foreground">There is no active season right now. Check back later!</p>
      </div>
    );
  }

  // Group standings
  const getGroupStandings = (groupId: string): StandingsRow[] => {
    const groupBoards = leaderboards.filter(l => l.group_id === groupId);
    return groupBoards.map(l => ({
      player: l.player,
      played: l.played,
      wins: l.wins,
      draws: l.draws,
      losses: l.losses,
      goalsFor: l.goals_for,
      goalsAgainst: l.goals_against,
      goalDifference: l.goal_difference,
      points: l.points,
      form: l.form || []
    }));
  };

  const semis = knockouts.filter(k => k.stage === 'semi_final');
  const finals = knockouts.filter(k => k.stage === 'final');

  return (
    <div className="container mx-auto px-4 py-12 md:py-20 min-h-screen">
      <div className="flex flex-col mb-12 text-center md:text-left border-l-8 border-primary pl-6">
        <h1 className="text-5xl md:text-7xl font-black font-heading mb-4 text-foreground uppercase tracking-tighter skew-x-[-10deg]">
          <span className="skew-x-[10deg] block md:inline">{season.tournament?.name}</span> <span className="text-primary skew-x-[10deg] block md:inline">STANDINGS</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl font-bold uppercase tracking-widest">
          {season.name} • Official Rankings & Knockouts
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-xl">
          <p className="text-muted-foreground font-bold uppercase tracking-widest">Groups have not been generated yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-16 max-w-5xl mx-auto">
          {groups.map(group => (
            <GroupTable 
              key={group.id} 
              groupName={group.name} 
              standings={getGroupStandings(group.id)} 
            />
          ))}

          {/* Knockout Bracket */}
          {knockouts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-4xl font-black font-heading uppercase text-white mb-8 border-b border-border pb-4">
                Knockout Stage
              </h2>
              <div className="grid md:grid-cols-2 gap-12">
                {/* Semis */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold uppercase text-primary tracking-widest text-center mb-6">Semi-Finals</h3>
                  {semis.map((match, idx) => {
                    const m = match.matches?.[0]; // Relation returns array, but it's 1-to-1 essentially
                    return (
                      <div key={match.id} className="bg-card border border-border rounded-xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-full w-1 bg-primary" />
                        <div className="p-4 flex flex-col gap-4">
                          <div className="flex justify-between items-center text-sm font-bold uppercase text-muted-foreground border-b border-border pb-2">
                            <span>SF {idx + 1}</span>
                            <span className={match.status === 'completed' ? 'text-success' : 'text-primary'}>{match.status}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-white">{match.home?.name || 'TBD'}</span>
                            <span className="font-black text-2xl text-primary">{m?.home_score ?? '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg text-white">{match.away?.name || 'TBD'}</span>
                            <span className="font-black text-2xl text-primary">{m?.away_score ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Finals */}
                <div className="space-y-6 flex flex-col justify-center">
                  <h3 className="text-xl font-bold uppercase text-yellow-500 tracking-widest text-center mb-6">Grand Final</h3>
                  {finals.length > 0 ? finals.map((match) => {
                    const m = match.matches?.[0];
                    return (
                      <div key={match.id} className="bg-card border-2 border-yellow-500/50 rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                        <div className="absolute top-0 left-0 h-full w-2 bg-yellow-500" />
                        <div className="p-6 flex flex-col gap-6">
                          <div className="flex justify-between items-center text-sm font-bold uppercase text-yellow-500/70 border-b border-border pb-2">
                            <span>Championship Match</span>
                            <span className={match.status === 'completed' ? 'text-success' : 'text-yellow-500'}>{match.status}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl text-white">{match.home?.name || 'TBD'}</span>
                            <span className="font-black text-3xl text-yellow-500">{m?.home_score ?? '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xl text-white">{match.away?.name || 'TBD'}</span>
                            <span className="font-black text-3xl text-yellow-500">{m?.away_score ?? '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="bg-card border border-border rounded-xl p-8 text-center border-dashed">
                      <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="font-bold uppercase tracking-widest text-muted-foreground text-sm">Final Matchup TBD</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
