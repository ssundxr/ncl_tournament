"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditTournamentPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "upcoming",
  });

  useEffect(() => {
    async function fetchTournament() {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setFormData({
          name: data.name ?? "",
          slug: data.slug ?? "",
          description: data.description ?? "",
          status: data.status ?? "upcoming",
        });
      }
      setFetching(false);
    }
    if (id) fetchTournament();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("tournaments")
      .update({
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        status: formData.status,
      })
      .eq("id", id);
    setLoading(false);
    if (!error) {
      router.push("/admin/tournaments");
      router.refresh();
    } else {
      alert(error.message);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-60 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/tournaments">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">
            Edit Tournament
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Update tournament details
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Tournament Name *
            </label>
            <input
              required
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Slug *
            </label>
            <input
              required
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary appearance-none"
            >
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary min-h-[100px]"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-foreground font-bold uppercase"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
