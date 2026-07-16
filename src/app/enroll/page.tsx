"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Season } from "@/types";

function EnrollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonId = searchParams.get("season");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    favorite_team: "",
    bio: "",
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSeason() {
      if (!seasonId) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("seasons")
        .select("*, tournament:tournaments(*)")
        .eq("id", seasonId)
        .single();
        
      if (error) {
        console.error(error);
      } else {
        setSeason(data as Season);
      }
      setLoading(false);
    }
    
    fetchSeason();
  }, [seasonId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let finalPhotoUrl = "";

      if (photoFile) {
        try {
          const timestamp = Date.now();
          const extension = photoFile.name.split('.').pop();
          const filename = `players/public_${timestamp}.${extension}`;
          
          const { error: uploadError } = await supabase.storage
            .from('ncl-media')
            .upload(filename, photoFile);
            
          if (uploadError) {
            console.warn("Photo upload failed:", uploadError);
            alert("Warning: Could not upload photo (it might be too large or bucket permissions issue). We will create your profile without a photo.");
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('ncl-media')
              .getPublicUrl(filename);
              
            finalPhotoUrl = publicUrl;
          }
        } catch (err) {
          console.warn("Photo upload exception:", err);
          alert("Warning: Photo upload failed. Proceeding without photo.");
        }
      }

      // Create slug
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

      // 1. Create Player
      const { data: newPlayer, error: playerError } = await supabase
        .from("players")
        .insert({
          name: formData.name,
          slug: slug,
          favorite_team: formData.favorite_team,
          bio: formData.bio,
          photo_url: finalPhotoUrl,
          overall_rating: 70 // default rating
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // 2. Enroll Player in Season
      if (season) {
        const { error: enrollError } = await supabase
          .from("season_enrollments")
          .insert({
            season_id: season.id,
            player_id: newPlayer.id
          });
          
        if (enrollError) throw enrollError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during enrollment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-black uppercase text-white">Season Not Found</h2>
        <p className="text-muted-foreground">The season you are trying to enroll in does not exist or has ended.</p>
        <Link href="/">
          <Button className="mt-4">Return Home</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 max-w-md mx-auto">
        <div className="w-24 h-24 bg-success/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-success" />
        </div>
        <h2 className="text-3xl font-black uppercase text-white tracking-tight">Enrollment Successful!</h2>
        <p className="text-muted-foreground text-lg">
          You are now registered for <strong>{(season as any).tournament?.name}: {season.name}</strong>.
        </p>
        <p className="text-sm text-muted-foreground border border-border bg-background p-4 rounded-lg">
          Once the registration period ends, the groups and fixtures will be generated automatically. Keep an eye on the standings!
        </p>
        <Link href="/">
          <Button size="lg" className="mt-4 bg-primary text-white font-bold uppercase tracking-widest w-full">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-heading uppercase text-white tracking-tight mb-2">Join the Action</h1>
        <p className="text-muted-foreground text-lg">
          Register for <strong>{(season as any).tournament?.name}: {season.name}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted mb-4 group cursor-pointer flex items-center justify-center">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-12 h-12 text-muted-foreground group-hover:text-white transition-colors" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-xs font-bold uppercase text-white">Upload</span>
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoChange} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Player Photo</p>
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Player Name *</label>
            <input 
              required 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary" 
              placeholder="Your gaming alias"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Favorite Team *</label>
            <input 
              required 
              type="text" 
              name="favorite_team" 
              value={formData.favorite_team} 
              onChange={handleChange} 
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary" 
              placeholder="e.g. Real Madrid, Arsenal"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio (Optional)</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows={3}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary resize-none" 
              placeholder="Tell us about your playstyle..."
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving} 
              size="lg"
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest h-14"
            >
              {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : "Complete Registration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EnrollPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <EnrollForm />
    </Suspense>
  );
}
