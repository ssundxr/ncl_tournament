"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, CalendarDays, Edit, Trash2 } from "lucide-react";
import { Season, Tournament } from "@/types";

interface SeasonWithTournament extends Season {
  tournament: Tournament;
}

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<SeasonWithTournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSeasons() {
      const { data, error } = await supabase
        .from('seasons')
        .select(`
          *,
          tournament:tournaments(*)
        `)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setSeasons(data as any);
      }
      setLoading(false);
    }
    fetchSeasons();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-white tracking-tight">Seasons</h1>
          <p className="text-muted-foreground mt-1">Manage tournament seasons</p>
        </div>
        <Link href="/admin/seasons/new">
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider">
            <Plus className="w-5 h-5 mr-2" /> Create Season
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-background text-muted-foreground border-b border-border">
              <tr className="font-bold text-sm uppercase tracking-widest">
                <th className="px-6 py-4">Tournament</th>
                <th className="px-6 py-4">Season</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Loading...</td>
                </tr>
              ) : seasons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No seasons found.</td>
                </tr>
              ) : (
                seasons.map((s) => (
                  <tr key={s.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {s.tournament?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <CalendarDays className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{s.name}</span>
                          <span className="text-xs text-muted-foreground">Season {s.number}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${s.status === 'active' ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <Link href={`/admin/seasons/${s.id}`}>
                        <Button variant="ghost" size="icon" className="text-primary hover:text-primary hover:bg-primary/10">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this season?")) {
                            await supabase.from('seasons').delete().eq('id', s.id);
                            setSeasons(seasons.filter(season => season.id !== s.id));
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
