"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    favorite_team: "",
    overall_rating: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadPlayer() {
      if (!playerId) return;

      try {
        const { data, error: fetchErr } = await supabase
          .from("players")
          .select("*")
          .eq("id", playerId)
          .single();

        if (fetchErr) throw fetchErr;

        if (data) {
          setFormData({
            name: data.name || "",
            slug: data.slug || "",
            favorite_team: data.favorite_team || "",
            overall_rating: data.overall_rating ? String(data.overall_rating) : "",
          });
          setPhotoUrl(data.photo_url || "");
        }
      } catch (err: any) {
        console.error("Error loading player:", err);
        setError("Failed to load player data: " + err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlayer();
  }, [playerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const withTimeout = <T,>(promise: Promise<T>, ms: number, actionName: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${actionName} timed out after ${ms/1000}s`)), ms))
      ]);
    };

    try {
      let finalPhotoUrl = photoUrl;

      // Handle upload if file selected
      if (photoFile) {
        setUploading(true);
        try {
          console.log("Starting upload to Supabase Storage...");
          const fileName = `players/${formData.slug || 'player'}_${Date.now()}`;
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('ncl-media')
            .upload(fileName, photoFile);
            
          if (uploadErr) {
            throw uploadErr;
          }
          
          console.log("Upload complete, getting download URL...");
          const { data: { publicUrl } } = supabase.storage
            .from('ncl-media')
            .getPublicUrl(fileName);
            
          finalPhotoUrl = publicUrl;
          console.log("Download URL:", finalPhotoUrl);
        } catch (uploadErr: any) {
          console.error("Upload error:", uploadErr);
          throw new Error(`Failed to upload photo: ${uploadErr.message}`);
        }
      }

      console.log("Starting Supabase update...");
      const updatePromise = supabase
        .from("players")
        .update({
          name: formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          favorite_team: formData.favorite_team,
          overall_rating: formData.overall_rating ? parseInt(formData.overall_rating) : null,
          photo_url: finalPhotoUrl || null,
        })
        .eq("id", playerId);
      
      const { error: updateError } = await withTimeout(updatePromise as unknown as Promise<any>, 15000, "Supabase Update");

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }

      console.log("Success! Redirecting...");
      router.push("/admin/players");
      router.refresh();
    } catch (err: any) {
      console.error("Caught error in handleSubmit:", err);
      setError(err.message || "Failed to update player.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center flex-col gap-4 text-muted-foreground">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-bold uppercase tracking-wider text-sm">Loading Player Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-white tracking-tight">Edit Player</h1>
          <p className="text-muted-foreground mt-1">Modify player details and rating</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {error && (
          <div className="p-4 mb-6 bg-destructive/20 border border-destructive/50 text-destructive rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Player Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Slug (URL friendly) *
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g. john-doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Favorite Team
                </label>
                <input
                  type="text"
                  name="favorite_team"
                  value={formData.favorite_team}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. Real Madrid"
                />
              </div>
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Overall Rating
                </label>
                <input
                  type="number"
                  name="overall_rating"
                  min="1"
                  max="99"
                  value={formData.overall_rating}
                  onChange={handleChange}
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                  placeholder="e.g. 85"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Player Photo
              </label>
              <div className="flex gap-4">
                <div className="w-24 h-24 bg-background border border-border rounded-md overflow-hidden flex items-center justify-center shrink-0">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-center space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      setPhotoFile(e.target.files?.[0] || null);
                      setPhotoUrl(""); // reset url if they pick a new file
                    }}
                    className="text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"
                  />
                  <p className="text-xs text-muted-foreground">Upload a square image for best results.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end gap-4">
            <Link href="/admin/players">
              <Button type="button" variant="outline" className="border-border text-white hover:bg-white/5">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving || uploading} className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider">
              {saving || uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
