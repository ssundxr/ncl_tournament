"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase/client";
import { getSeasons } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Search, Filter, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cleanBranding } from "@/lib/utils/branding";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { Enrollment } from "@/types";

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    getSeasons().then((data) => {
      setSeasons(data);
      const active = data.find((s) => s.status === "active");
      if (active) setSelectedSeason(active.id);
      else if (data.length > 0) setSelectedSeason(data[0].id);
    });
  }, []);

  const loadEnrollments = async () => {
    if (!selectedSeason) return;
    setLoading(true);
    
    try {
      const res = await fetch(`/api/admin/enrollment/list?season_id=${selectedSeason}`);
      const data = await res.json();
      if (data.success && data.data) {
        setEnrollments(data.data as Enrollment[]);
      } else {
        setEnrollments([]);
      }
    } catch (err) {
      console.error("Failed to load enrollments", err);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnrollments();
    setSelectedIds(new Set());
  }, [selectedSeason]);

  const filteredEnrollments = useMemo(() => {
    return enrollments.filter(e => {
      // Name from player or registration_data
      const name = (e.player?.name || e.registration_data?.name || "").toLowerCase();
      const phone = (e.phone || "").toLowerCase();
      const utr = (e.transaction_id || "").toLowerCase();
      
      const matchesSearch = name.includes(search.toLowerCase()) || 
                           phone.includes(search.toLowerCase()) || 
                           utr.includes(search.toLowerCase());
                           
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "pending_payment" && e.status === "pending" && e.payment_status === "pending") ||
                           (statusFilter === "pending_approval" && e.status === "pending" && e.payment_status === "submitted") ||
                           e.status === statusFilter;
                           
      return matchesSearch && matchesStatus;
    });
  }, [enrollments, search, statusFilter]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredEnrollments.filter(e => e.status === 'pending').length && selectedIds.size > 0) {
      setSelectedIds(new Set());
    } else {
      const pendingIds = filteredEnrollments
        .filter(e => e.status === 'pending' && e.id)
        .map(e => e.id);
      setSelectedIds(new Set(pendingIds));
    }
  };

  const handleApprove = async (ids: string[]) => {
    if (ids.length === 0) return;
    
    const ok = await confirm({
      title: "Approve Enrollments",
      description: `Are you sure you want to approve ${ids.length} enrollment(s)? This will verify payment and finalize their tournament registration.`,
    });
    
    if (!ok) return;

    const isBulk = ids.length > 1;
    if (isBulk) setBulkLoading(true);
    else setActionLoading(ids[0]);

    try {
      const res = await fetch("/api/admin/enrollment/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_id: selectedSeason,
          enrollment_ids: ids,
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to approve enrollments");
      }

      toast({ variant: "success", title: "Approved", description: data.message || "Enrollment(s) approved successfully." });
      setSelectedIds(new Set());
      loadEnrollments();
      
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    } finally {
      setBulkLoading(false);
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Enter rejection reason (optional):");
    if (reason === null) return; // Cancelled

    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/enrollment/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          season_id: selectedSeason,
          phone: id, // Pass enrollment ID directly
          reason
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to reject enrollment");
      }

      toast({ variant: "success", title: "Rejected", description: "Enrollment rejected successfully." });
      loadEnrollments();
      
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingVerificationCount = enrollments.filter(e => e.status === 'pending' && e.payment_status === 'submitted').length;
  const approvedCount = enrollments.filter(e => e.status === 'approved').length;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-foreground tracking-tight uppercase">Enrollments</h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Manage registrations, verify payments, and approve players.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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
          <CardContent><div className="text-3xl font-black font-heading text-foreground">{enrollments.length}</div></CardContent>
        </Card>
        <Card className="bg-card border-2 border-yellow-500/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-500/10 rounded-bl-full z-0" />
          <CardHeader className="pb-2 relative z-10"><CardTitle className="text-xs font-black uppercase tracking-wider text-yellow-500">Needs Verification (UTR Submitted)</CardTitle></CardHeader>
          <CardContent className="relative z-10"><div className="text-3xl font-black font-heading text-yellow-500">{pendingVerificationCount}</div></CardContent>
        </Card>
        <Card className="bg-card border-2 border-border">
          <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-wider text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-black font-heading text-success">{approvedCount}</div></CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 border border-border rounded-lg">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search name, phone, UTR..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:border-primary"
            />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-background border border-border rounded-md px-3 py-2 text-sm font-bold uppercase tracking-wider focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="pending_payment">Pending (No UTR)</option>
            <option value="pending_approval">Pending (UTR Submitted)</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-muted-foreground">{selectedIds.size} selected</span>
            <Button 
              onClick={() => handleApprove(Array.from(selectedIds))}
              disabled={bulkLoading}
              className="bg-success hover:bg-success/90 text-black font-bold uppercase tracking-wider"
            >
              {bulkLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
              Bulk Approve
            </Button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredEnrollments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border text-muted-foreground font-bold uppercase tracking-wider rounded-lg">
          No enrollments match your filters.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted text-xs uppercase font-black tracking-widest text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.size > 0 && selectedIds.size === filteredEnrollments.filter(e => e.status === 'pending').length}
                      onChange={toggleAll}
                      className="rounded border-border"
                    />
                  </th>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">UTR / Payment</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((enrollment) => {
                  const id = enrollment.id;
                  const phone = enrollment.phone || "—";
                  const isSelected = selectedIds.has(id);
                  const name = enrollment.player?.name || enrollment.registration_data?.name || "Unknown";
                  const team = enrollment.player?.favorite_team || enrollment.registration_data?.favorite_team;
                  
                  return (
                    <tr key={id} className={`border-b border-border last:border-0 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <td className="px-4 py-3">
                        {enrollment.status === 'pending' && (
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => toggleSelection(id)}
                            className="rounded border-border"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold uppercase">
                        <div>
                          <span>{name}</span>
                          {team && <span className="block text-[10px] text-muted-foreground">{team}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">{phone}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold">{enrollment.transaction_id || "—"}</span>
                          <span className={`text-[10px] uppercase font-black tracking-widest ${
                            enrollment.payment_status === 'verified' ? 'text-success' : 
                            enrollment.payment_status === 'submitted' ? 'text-yellow-500' : 
                            'text-muted-foreground'
                          }`}>
                            {enrollment.payment_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(enrollment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-black uppercase tracking-widest border rounded-sm ${
                          enrollment.status === 'approved' ? 'bg-success/10 text-success border-success/30' :
                          enrollment.status === 'rejected' ? 'bg-destructive/10 text-destructive border-destructive/30' :
                          'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                        }`}>
                          {enrollment.status === 'pending' && enrollment.payment_status === 'submitted' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {enrollment.status === 'pending' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-success text-success hover:bg-success hover:text-black uppercase font-black text-[10px]"
                              onClick={() => handleApprove([id])}
                              disabled={actionLoading === id || bulkLoading}
                            >
                              {actionLoading === id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3 mr-1" />} Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 border-destructive text-destructive hover:bg-destructive hover:text-foreground uppercase font-black text-[10px]"
                              onClick={() => handleReject(id)}
                              disabled={actionLoading === id || bulkLoading}
                            >
                              <X className="w-3 h-3 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {enrollment.status === 'rejected' && (
                          <div className="text-[10px] text-muted-foreground max-w-[150px] truncate" title={enrollment.rejection_reason || "No reason"}>
                            {enrollment.rejection_reason || "No reason"}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

