"use client";

import { use, useState, Suspense, useEffect } from "react";
import { useSeason } from "@/contexts/season-context";
import { Button } from "@/components/ui/button";
import {
  Loader2, UserPlus, CheckCircle2, Copy, AlertTriangle, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { Countdown } from "@/components/ui/countdown";
import { useToast } from "@/components/ui/toast";
import { paymentSubmissionSchema } from "@/lib/validations";
import { supabase } from "@/lib/supabase/client";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

function EnrollContent({ seasonId }: { seasonId: string }) {
  const { season, tournament, isLoading: seasonLoading } = useSeason();
  const { toast } = useToast();
  const router = useRouter();

  const [authChecking, setAuthChecking] = useState(true);
  const [playerPrefilled, setPlayerPrefilled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "", favorite_team: "", bio: "", phone: "", transaction_id: "", photo_url: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Enforce Portal Login
        router.push(`/auth/login?redirect=/season/${seasonId}/enroll`);
        return;
      }
      
      try {
        const res = await fetch("/api/portal/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, action: "get" })
        });
        const data = await res.json();
        if (data.success && data.data) {
          setFormData(prev => ({
            ...prev,
            name: data.data.name || "",
            phone: data.data.phone || "",
            favorite_team: data.data.favorite_team || "",
            bio: data.data.bio || "",
            photo_url: data.data.photo_url || ""
          }));
          setPlayerPrefilled(true);
        } else {
          // If they haven't onboarded in portal, force them to do so first
          router.push("/portal/onboarding");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setAuthChecking(false);
      }
    });
    return () => unsub();
  }, [seasonId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      setSaving(true);
      
      // Use the new portal enroll API directly
      const res = await fetch("/api/portal/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user.uid,
          season_id: seasonId,
          phone: formData.phone // Pass phone in case needed
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Registration failed");
      }

      setEnrollmentId(data.data?.enrollmentId || null);
      setStep(2);
      toast({ variant: "success", title: "Details Confirmed", description: "Please complete payment to finish enrollment." });
      
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message || "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        enrollment_season_id: seasonId,
        enrollment_phone: formData.phone,
        transaction_id: formData.transaction_id
      };
      
      const parsed = paymentSubmissionSchema.safeParse(payload);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        const issues = parsed.error?.issues || [];
        issues.forEach((e: any) => {
          if (e.path && e.path[0]) errors[e.path[0].toString()] = e.message;
        });
        setFormErrors(errors);
        toast({ variant: "error", title: "Validation Error", description: "Please check the payment details." });
        return;
      }

      setFormErrors({});
      setSaving(true);

      const res = await fetch("/api/enrollment/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Payment submission failed");
      }

      setStep(3);
      toast({ variant: "success", title: "Success", description: "Payment submitted for verification!" });
      
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message || "An unexpected error occurred." });
    } finally {
      setSaving(false);
    }
  };

  const copyUpiId = () => {
    if (season?.upi_id) {
      navigator.clipboard.writeText(season.upi_id);
      toast({ variant: "info", title: "Copied!", description: "UPI ID copied to clipboard." });
    }
  };

  if (seasonLoading || authChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!season) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">Season Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="font-bold">Go Home</Button>
        </Link>
      </div>
    );
  }

  // Window Check
  const now = new Date();
  const isEarly = season.registration_start ? now < new Date(season.registration_start) : false;
  const isLate = season.registration_end ? now > new Date(season.registration_end) : false;
  const isFull = season.registration_status === "full";

  if (season.status !== "active" || isEarly || isLate || isFull) {
    let message = "Registration is not active for this season.";
    if (isEarly) {
      message = `Registration opens on ${new Date(season.registration_start!).toLocaleString()}`;
    } else if (isLate) {
      message = "Registration for this season has closed.";
    } else if (isFull) {
      message = "Registration is currently full.";
    } else if (season.status === 'upcoming') {
      message = "Registration for this season has not opened yet.";
    } else if (season.status === 'completed') {
      message = "Registration for this season has closed.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4 max-w-3xl mx-auto py-12">
        <h2 className="text-5xl font-black uppercase tracking-tighter text-foreground font-heading">Stay Tuned!</h2>
        
        <p className="text-xl text-muted-foreground font-medium mb-2">
          {message}
        </p>
        
        {isEarly && season.registration_start && (season.status === 'upcoming' || season.status === 'active') && (
          <div className="w-full bg-card border-4 border-border p-8 mt-2 rounded-2xl shadow-xl">
            <h3 className="text-primary font-black uppercase tracking-widest text-lg mb-6">Registration Opens In</h3>
            <Countdown targetDate={season.registration_start} />
          </div>
        )}
        
        <Link href={`/season/${seasonId}`} className="mt-8">
          <Button variant="outline" className="font-black uppercase tracking-widest px-8">Back to Season</Button>
        </Link>
      </div>
    );
  }

  const upiId = season.upi_id || "ashwinfejl357@oksbi";
  const fee = season.fee_amount || 30;
  const payeeName = tournament?.name || "NCL Tournament";
  const upiIntentUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${fee}&cu=INR&tn=Registration`;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Wizard Header */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-foreground mb-3">Join the Action</h1>
          <p className="text-muted-foreground text-lg font-medium">
            Register for <strong className="text-foreground">{tournament?.name ?? "NCL"}: {season.name}</strong>
          </p>
        </div>
        
        {/* Progress Tracker */}
        <div className="flex items-center justify-center max-w-md mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-border -z-10 -translate-y-1/2"></div>
          <div className="absolute top-1/2 left-0 h-1 bg-primary -z-10 -translate-y-1/2 transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }}></div>
          
          <div className="flex justify-between w-full">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border-2 border-border"
              }`}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between max-w-md mx-auto mt-2 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          <span className={step >= 1 ? "text-foreground" : ""}>Details</span>
          <span className={step >= 2 ? "text-foreground" : ""}>Payment</span>
          <span className={step >= 3 ? "text-foreground" : ""}>Done</span>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-card border-2 border-border p-6 md:p-8">
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-background bg-secondary flex items-center justify-center shadow-md">
                {formData.photo_url ? (
                  <img src={formData.photo_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mt-3 text-muted-foreground">Linked Portal Profile</p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Player Name", name: "name", type: "text" },
                { label: "Favorite Team", name: "favorite_team", type: "text" },
                { label: "Mobile Number", name: "phone", type: "tel" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">
                    {field.label}
                  </label>
                  <div className="w-full bg-muted/50 border-2 border-border px-4 py-3 text-foreground font-bold tracking-tight rounded-md">
                    {(formData as any)[field.name]}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t-2 border-border mt-8">
              <Button type="submit" disabled={saving} size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-14 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
                {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm Details & Pay"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="bg-card border-2 border-border p-6 md:p-8 space-y-8 text-center">
          <div>
            <h3 className="text-2xl font-heading font-black uppercase mb-2">Complete Payment</h3>
            <p className="text-muted-foreground text-sm font-medium">Registration fee: <strong className="text-foreground text-lg">₹{fee}</strong></p>
          </div>

          <div className="flex flex-col items-center gap-6 py-6 border-y-2 border-border border-dashed">
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-4 border-muted">
              <QRCodeSVG value={upiIntentUrl} size={180} />
            </div>

            {/* Direct Pay Instructions */}
            <div className="w-full space-y-3">
              <div className="bg-muted/50 p-4 text-sm text-foreground font-medium text-left border-2 border-border">
                <span className="font-bold text-foreground block mb-2 text-lg text-center uppercase tracking-wider text-primary">How to Pay</span>
                <ul className="list-decimal pl-5 space-y-2 text-muted-foreground font-bold">
                  <li>Scan QR or copy the UPI ID below.</li>
                  <li>Pay exactly <strong className="text-foreground">₹{fee}</strong> via any UPI app.</li>
                  <li>Copy the 12-digit Transaction ID (UTR) and paste it below.</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground font-bold bg-background border-2 border-border px-4 py-2 rounded-md">
              <span>{upiId}</span>
              <button onClick={copyUpiId} type="button" className="p-2 hover:text-primary transition-colors">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleStep2Submit} className="space-y-6 pt-4 text-left">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-1.5">
                Transaction ID (UTR) *
              </label>
              <p className="text-xs text-muted-foreground mb-3 font-medium">Enter the 12-digit UTR after successful payment.</p>
              <input
                required
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleChange}
                className={`w-full bg-background border-2 px-4 py-3 text-foreground focus:outline-none transition-colors font-mono tracking-widest text-center text-lg ${
                  formErrors.transaction_id ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                }`}
                placeholder="e.g. 312456789012"
              />
              {formErrors.transaction_id && (
                <p className="text-xs text-destructive mt-1.5 font-bold flex items-center gap-1 justify-center">
                  <AlertTriangle className="w-3 h-3" /> {formErrors.transaction_id}
                </p>
              )}
            </div>

            <Button type="submit" disabled={saving} size="lg" className="w-full font-black uppercase tracking-widest h-14 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify Payment"}
            </Button>
            
            <p className="text-center text-xs text-muted-foreground font-medium mt-4">
              Having trouble? Contact support or check your enrollment status later using your mobile number.
            </p>
          </form>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center justify-center py-8 gap-6 text-center">
          <div className="w-20 h-20 bg-success/15 flex items-center justify-center rounded-full border-4 border-success/30">
            <CheckCircle2 className="w-10 h-10 text-success" />
          </div>
          <h2 className="text-3xl font-black font-heading uppercase text-foreground">Application Received</h2>
          <p className="text-muted-foreground font-medium">
            Your payment details have been submitted. Your enrollment is currently <strong className="text-yellow-500 uppercase">Pending Verification</strong>.
          </p>
          
          <div className="w-full bg-card border-2 border-border p-6 space-y-4 text-left shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-2">Registration Details</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Player</span>
              <span className="text-right font-black uppercase">{formData.name}</span>
              
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">Mobile</span>
              <span className="text-right font-bold">{formData.phone}</span>
              
              <span className="text-muted-foreground font-medium uppercase text-[10px] tracking-widest">UTR</span>
              <span className="text-right font-mono text-xs">{formData.transaction_id}</span>
            </div>
          </div>

          {/* WhatsApp Community Join Banner */}
          <div className="w-full bg-emerald-950/40 border-2 border-emerald-500 p-6 rounded-none text-center space-y-3 shadow-[6px_6px_0px_0px_rgba(16,185,129,0.3)]">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-none mb-1">
              <span>⚡ Quick Updates</span>
            </div>
            <h3 className="text-xl font-black font-heading uppercase text-emerald-400">Join Official WhatsApp Community</h3>
            <p className="text-xs text-emerald-200/80 font-medium max-w-md mx-auto">
              Get instant match schedules, fixture updates, opponent contacts, and tournament announcements directly on WhatsApp!
            </p>
            <a 
              href="https://chat.whatsapp.com/CYqbdmsPaEpGyfKiRheit0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all rounded-none mt-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black hover:translate-y-1 hover:translate-x-1 hover:shadow-none"
            >
              Join WhatsApp Community
            </a>
          </div>

          <div className="flex flex-col gap-3 w-full mt-4">
            <Link href="/portal" className="w-full">
              <Button className="w-full h-14 bg-primary text-white font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-foreground hover:translate-y-1 hover:translate-x-1 hover:shadow-none rounded-none">Go to Player Portal</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SeasonEnrollPage({
  params,
}: {
  params: Promise<{ seasonId: string }>;
}) {
  const { seasonId } = use(params);
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <EnrollContent seasonId={seasonId} />
    </Suspense>
  );
}
