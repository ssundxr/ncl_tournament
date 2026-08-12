"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { getSeasons, getSeasonEnrollments } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { cleanBranding } from "@/lib/utils/branding";

export default function AdminEnrollmentsPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    getSeasons().then((data) => {
      setSeasons(data);
      const active = data.find((s) => s.status === "active");
      if (active) setSelectedSeason(active.id);
      else if (data.length > 0) setSelectedSeason(data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedSeason) return;
    setLoading(true);
    getSeasonEnrollments(selectedSeason)
      .then(setEnrollments)
      .finally(() => setLoading(false));
  }, [selectedSeason]);

  const handleStatusChange = async (playerId: string, newStatus: string) => {
    setActionLoading(playerId);
    try {
      const { error } = await supabase
        .from("season_enrollments")
        .update({ status: newStatus })
        .eq("season_id", selectedSeason)
        .eq("player_id", playerId);
      
      if (error) throw error;
      
      setEnrollments((prev) => 
        prev.map((e) => e.player_id === playerId ? { ...e, status: newStatus } : e)
      );
    } catch (err: any) {
      alert(`Error updating status: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = enrollments.filter(e => e.status === 'pending').length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight uppercase">Payment Verification</h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Manually verify UPI transactions and approve players for the tournament.
          </p>
        </div>
        
        {/* Season Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-background border-2 border-border px-3 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id}>
                {cleanBranding(s.name)} ({s.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card className="bg-card border-2 border-border">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Total Enrollments</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black font-heading">{enrollments.length}</div></CardContent>
        </Card>
        <Card className="bg-card border-2 border-primary/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full z-0" />
          <CardHeader className="pb-2 relative z-10"><CardTitle className="text-xs font-black uppercase tracking-wider text-primary">Pending Verification</CardTitle></CardHeader>
          <CardContent className="relative z-10"><div className="text-3xl font-black font-heading text-primary">{pendingCount}</div></CardContent>
        </Card>
        <Card className="bg-card border-2 border-border">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black font-heading text-success">{enrollments.filter(e => e.status === 'approved').length}</div></CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border text-muted-foreground font-bold uppercase tracking-wider">
          No enrollments found for this season.
        </div>
      ) : (
        <div className="bg-card border-2 border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-xs uppercase font-black tracking-widest text-muted-foreground border-b-2 border-border">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Transaction ID (UTR)</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment) => (
                  <tr key={enrollment.player_id} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-bold uppercase">{enrollment.player?.name}</td>
                    <td className="px-6 py-4 font-mono">{enrollment.phone || "—"}</td>
                    <td className="px-6 py-4 font-mono font-bold">{enrollment.transaction_id || "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-widest border ${
                        enrollment.status === 'approved' ? 'bg-success/10 text-success border-success/30' :
                        enrollment.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {enrollment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-success text-success hover:bg-success hover:text-white uppercase font-black text-[10px]"
                            onClick={() => handleStatusChange(enrollment.player_id, 'approved')}
                            disabled={actionLoading === enrollment.player_id}
                          >
                            {actionLoading === enrollment.player_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 border-destructive text-destructive hover:bg-destructive hover:text-white uppercase font-black text-[10px]"
                            onClick={() => handleStatusChange(enrollment.player_id, 'rejected')}
                            disabled={actionLoading === enrollment.player_id}
                          >
                            <X className="w-3 h-3 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {enrollment.status !== 'pending' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="h-8 uppercase font-black text-[10px] text-muted-foreground"
                          onClick={() => handleStatusChange(enrollment.player_id, 'pending')}
                          disabled={actionLoading === enrollment.player_id}
                        >
                          Revert to Pending
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
