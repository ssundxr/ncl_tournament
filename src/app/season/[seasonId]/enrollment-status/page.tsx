"use client";

import { use, useState, Suspense } from "react";
import { useSeason } from "@/contexts/season-context";
import { checkEnrollmentStatus } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2, Clock, XCircle } from "lucide-react";
import Link from "next/link";
import { cleanBranding } from "@/lib/utils/branding";

function EnrollmentStatusContent({ seasonId }: { seasonId: string }) {
  const { season, tournament, isLoading: seasonLoading } = useSeason();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");
    setLoading(true);
    setSearched(true);
    try {
      const data = await checkEnrollmentStatus(seasonId, phone);
      if (!data) {
        setResult(null);
        setError("No enrollment found for this phone number in the current season.");
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error(err);
      setError("An error occurred while checking status.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  if (seasonLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <h2 className="text-2xl font-black uppercase text-foreground">Season Not Found</h2>
        <Link href="/"><Button>Return Home</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-foreground mb-3">Check Status</h1>
        <p className="text-muted-foreground text-lg font-medium">
          Verify your registration for <strong className="text-foreground">{cleanBranding(season.name)}</strong>
        </p>
      </div>

      <div className="bg-card border-2 border-border p-6 md:p-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your registered mobile number..."
              className="w-full bg-background border-2 border-border px-4 h-12 text-foreground focus:outline-none focus:border-primary transition-colors font-medium text-sm"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-12 px-6 font-black uppercase tracking-widest rounded-none">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </Button>
        </form>

        {error && (
          <div className="mt-6 text-center text-destructive font-bold text-sm bg-destructive/10 py-3 border border-destructive/20">
            {error}
          </div>
        )}

        {searched && !loading && result && (
          <div className="mt-8 pt-8 border-t-2 border-border border-dashed">
            <div className="flex flex-col items-center text-center gap-4">
              
              {result.status === 'approved' && (
                <>
                  <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center text-success">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-heading uppercase text-foreground">Registration Approved</h3>
                    <p className="text-muted-foreground font-medium text-sm mt-1">You are officially in the tournament.</p>
                  </div>
                </>
              )}

              {result.status === 'pending' && (
                <>
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-heading uppercase text-foreground">Payment Under Review</h3>
                    <p className="text-muted-foreground font-medium text-sm mt-1">We are verifying your transaction ID ({result.transaction_id}). This usually takes a few hours.</p>
                  </div>
                </>
              )}

              {result.status === 'rejected' && (
                <>
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center text-destructive">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-heading uppercase text-foreground">Registration Rejected</h3>
                    <p className="text-muted-foreground font-medium text-sm mt-1">There was an issue with your payment verification. Please contact support.</p>
                  </div>
                </>
              )}

              <div className="w-full bg-muted/50 border-2 border-border p-4 text-left mt-4">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Player</span>
                  <span className="text-right font-black uppercase">{result.player?.name}</span>
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Team</span>
                  <span className="text-right font-bold">{result.player?.favorite_team}</span>
                  <span className="text-muted-foreground font-bold uppercase tracking-wider text-xs">Registered</span>
                  <span className="text-right font-medium">{new Date(result.created_at).toLocaleDateString()}</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      
      <div className="mt-8 text-center">
         <Link href={`/season/${seasonId}`}>
            <Button variant="ghost" className="font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
              ← Back to Season
            </Button>
         </Link>
      </div>
    </div>
  );
}

export default function EnrollmentStatusPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <EnrollmentStatusContent seasonId={seasonId} />
    </Suspense>
  );
}
