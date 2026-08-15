"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", number: 1, tag: "T1" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === "name" && !prev.slug.includes("-")) {
        updated.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      }
      if (name === "number") {
        const numVal = parseInt(value, 10) || 1;
        updated.number = numVal;
        updated.tag = `T${numVal}`;
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("tournaments").insert({
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description,
      number: formData.number || 1,
      tag: formData.tag || `T${formData.number || 1}`
    });
    setLoading(false);
    if (!error) {
      router.push("/admin/tournaments");
      router.refresh();
    } else {
      if (error.code === '23505') {
        alert("A tournament with this name or slug already exists. Please choose a unique name.");
      } else {
        alert(error.message);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tournaments"><Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-6 h-6" /></Button></Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">New Tournament</h1>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Tournament Name *</label>
              <select 
                required 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary appearance-none"
              >
                <option value="">Select a predefined tournament</option>
                <option value="NCL Premier League">NCL Premier League</option>
                <option value="NCL Championship">NCL Championship</option>
                <option value="NCL Super Cup">NCL Super Cup</option>
                <option value="NCL eFootball League">NCL eFootball League</option>
                <option value="Inter Comp">Inter Comp</option>
                <option value="World Cup">World Cup</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Tournament Number / Tag *</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  min="1" 
                  name="number" 
                  value={formData.number} 
                  onChange={handleChange} 
                  className="w-1/2 bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary"
                  placeholder="Number (e.g. 1)"
                />
                <input 
                  type="text" 
                  name="tag" 
                  value={formData.tag} 
                  onChange={handleChange} 
                  className="w-1/2 bg-background border border-border rounded-md px-4 py-3 font-mono font-bold text-primary focus:outline-none focus:border-primary"
                  placeholder="Tag (e.g. T1)"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Slug *</label>
            <input required type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary min-h-[100px]" />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading} className="bg-primary text-foreground font-bold uppercase">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Tournament
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
