"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Gamepad2 } from "lucide-react";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !team) {
      setError("Name, Phone, and Favorite Team are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const res = await fetch("/api/portal/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          action: "create",
          profileData: {
            name,
            phone,
            favorite_team: team,
            bio,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create profile");
      }

      // Success, redirect to portal dashboard
      router.push("/portal");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:py-24 max-w-2xl">
      <div className="bg-card border-4 border-foreground p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-primary flex items-center justify-center border-2 border-foreground skew-x-[-10deg]">
            <Gamepad2 className="w-8 h-8 text-white skew-x-[10deg]" />
          </div>
          <div>
            <h1 className="text-3xl font-black font-heading uppercase tracking-tighter">Claim Your Tag</h1>
            <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs mt-1">Player Profile Setup</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive text-destructive-foreground font-bold uppercase tracking-wider text-sm border-2 border-foreground">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-foreground">In-Game Name / Tag *</label>
              <input
                type="text"
                required
                placeholder="e.g. Faker"
                className="w-full bg-background border-2 border-border p-3 font-medium focus:outline-none focus:border-primary transition-colors"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-foreground">WhatsApp Number *</label>
              <input
                type="tel"
                required
                placeholder="+91..."
                className="w-full bg-background border-2 border-border p-3 font-medium focus:outline-none focus:border-primary transition-colors"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Favorite Team *</label>
            <input
              type="text"
              required
              placeholder="e.g. Manchester United, Real Madrid"
              className="w-full bg-background border-2 border-border p-3 font-medium focus:outline-none focus:border-primary transition-colors"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-foreground">Bio (Optional)</label>
            <textarea
              placeholder="Tell us about your playstyle..."
              className="w-full bg-background border-2 border-border p-3 font-medium focus:outline-none focus:border-primary transition-colors h-24 resize-none"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white border-2 border-foreground rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
