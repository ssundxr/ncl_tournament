"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { Tournament } from "@/types";

export default function NewSeasonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [formData, setFormData] = useState({ 
    tournament_id: "", name: "", number: "1", registration_start: "", registration_end: "" 
  });

  useEffect(() => {
    async function loadTournaments() {
      const { data } = await supabase.from("tournaments").select("*").order("name");
      if (data) setTournaments(data as Tournament[]);
    }
    loadTournaments();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload: any = {
      tournament_id: formData.tournament_id,
      name: formData.name,
      number: parseInt(formData.number)
    };
    if (formData.registration_start) payload.registration_start = new Date(formData.registration_start).toISOString();
    if (formData.registration_end) payload.registration_end = new Date(formData.registration_end).toISOString();
    
    const { error } = await supabase.from("seasons").insert(payload);
    setLoading(false);
    if (!error) {
      router.push("/admin/seasons");
      router.refresh();
    } else {
      alert(error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/seasons"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-6 h-6" /></Button></Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">New Season</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Tournament *</label>
            <select required name="tournament_id" value={formData.tournament_id} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary">
              <option value="">Select a tournament</option>
              {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Season Name *</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary" placeholder="e.g. 2026 Season 1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Season Number *</label>
              <input required type="number" name="number" min="1" value={formData.number} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border mt-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Registration Opens</label>
              <input type="datetime-local" name="registration_start" value={formData.registration_start} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Registration Closes</label>
              <input type="datetime-local" name="registration_end" value={formData.registration_end} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading || !formData.tournament_id} className="bg-primary text-white font-bold uppercase">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Season
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
