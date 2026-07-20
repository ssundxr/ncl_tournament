"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlayCircle, CheckCircle2, Clock, Shield } from "lucide-react";
import { Fixture, Player } from "@/types";

interface FixtureWithPlayers extends Fixture {
  home_player: Player;
  away_player: Player;
}

export default function AdminMatchesPage() {
  const [fixtures, setFixtures] = useState<FixtureWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFixtures() {
      const { data, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          home_player:players!home_player_id(*),
          away_player:players!away_player_id(*)
        `)
        .order('matchday', { ascending: true });
      
      if (error) {
        console.error("Error fetching fixtures:", error);
      } else {
        setFixtures(data as any || []);
      }
      setLoading(false);
    }
    fetchFixtures();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live": return <PlayCircle className="w-4 h-4 text-primary animate-pulse" />;
      case "completed": return <CheckCircle2 className="w-4 h-4 text-success" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">Match Control</h1>
          <p className="text-muted-foreground mt-1">Manage auto-generated live matches and upload results</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background text-muted-foreground border-b border-border">
              <tr className="font-bold text-sm uppercase tracking-widest">
                <th className="px-6 py-4">Matchday</th>
                <th className="px-6 py-4">Matchup</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex justify-center mb-2">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                    Loading fixtures...
                  </td>
                </tr>
              ) : fixtures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No fixtures found. Create a tournament season and generate fixtures first.
                  </td>
                </tr>
              ) : (
                fixtures.map((fixture) => (
                  <tr key={fixture.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-muted-foreground">
                      MD {fixture.matchday || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground text-right w-32 truncate">{fixture.home_player?.name || 'TBD'}</span>
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {fixture.home_player?.photo_url ? (
                            <img src={fixture.home_player.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="text-xs font-black text-muted-foreground uppercase px-2">VS</span>
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {fixture.away_player?.photo_url ? (
                            <img src={fixture.away_player.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Shield className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <span className="font-bold text-foreground w-32 truncate">{fixture.away_player?.name || 'TBD'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fixture.status)}
                        <span className="font-bold text-sm uppercase tracking-wider text-foreground">
                          {fixture.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/matches/${fixture.id}`}>
                        <Button variant={fixture.status === 'live' ? 'default' : 'outline'} className="font-bold uppercase tracking-wider">
                          Manage Match
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
