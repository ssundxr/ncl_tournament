"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, User as UserIcon, Edit, Trash2 } from "lucide-react";
import { Player } from "@/types";

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayers() {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error fetching players:", error);
      } else {
        setPlayers(data as Player[] || []);
      }
      setLoading(false);
    }
    fetchPlayers();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete player "${name}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', id);

      if (error) {
        if (error.code === '23503') { // Postgres foreign key violation
          alert(`Cannot delete player "${name}" because they are currently part of one or more matches, fixtures, or seasonal records.\n\nPlease delete their matches/fixtures first.`);
        } else {
          alert(`Failed to delete player: ${error.message}`);
        }
      } else {
        setPlayers(prev => prev.filter(p => p.id !== id));
      }
    } catch (err: any) {
      console.error(err);
      alert("An unexpected error occurred while deleting the player.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-tight">Players</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage tournament participants</p>
        </div>
        <Link href="/admin/players/new">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide">
            <Plus className="w-4 h-4 mr-2" /> Add Player
          </Button>
        </Link>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr className="font-semibold text-xs uppercase tracking-wider">
                <th className="px-6 py-4">Player</th>
                <th className="px-6 py-4">Favorite Team</th>
                <th className="px-6 py-4">Rating</th>
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
                    Loading players...
                  </td>
                </tr>
              ) : players.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No players found. Click "Add Player" to create one.
                  </td>
                </tr>
              ) : (
                players.map((player) => (
                  <tr key={player.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {player.photo_url ? (
                            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground tracking-tight">{player.name}</span>
                          <span className="text-xs text-muted-foreground">{player.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      {player.favorite_team || "-"}
                    </td>
                    <td className="px-6 py-4 font-bold text-foreground">
                      {player.overall_rating || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/players/${player.id}/edit`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleDelete(player.id, player.name)}
                          disabled={deletingId === player.id}
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
