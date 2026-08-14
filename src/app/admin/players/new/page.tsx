"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ChevronLeft, Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewPlayerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from name if user is typing name and hasn't touched slug
      ...(name === "name" && !prev.slug.includes("-") ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {})
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const withTimeout = <T,>(promise: Promise<T>, ms: number, actionName: string): Promise<T> => {
      return Promise.race([
        promise,
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`${actionName} timed out after ${ms/1000}s`)), ms))
      ]);
    };

    try {
      let finalPhotoUrl = photoUrl;

      // Handle upload if file selected but not uploaded yet
      if (photoFile && !photoUrl) {
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

      console.log("Starting Supabase insert...");
      const insertPromise = supabase.from("players").insert({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        favorite_team: formData.favorite_team,
        overall_rating: formData.overall_rating ? parseInt(formData.overall_rating) : null,
        photo_url: finalPhotoUrl || null,
      });
      
      const { error: insertError } = await withTimeout(insertPromise as unknown as Promise<any>, 15000, "Supabase Insert");

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      console.log("Success! Redirecting...");
      router.push("/admin/players");
      router.refresh();
    } catch (err: any) {
      console.error("Caught error in handleSubmit:", err);
      setError(err.message || "Failed to create player.");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">New Player</h1>
          <p className="text-muted-foreground mt-1">Add a new participant to the tournament</p>
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
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
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
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
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
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
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
                  className="w-full bg-background border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors"
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
              <Button type="button" variant="outline" className="border-border text-foreground hover:bg-white/5">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading || uploading} className="bg-primary text-foreground hover:bg-primary/90 font-bold uppercase tracking-wider">
              {loading || uploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              Save Player
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
