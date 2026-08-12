"use client";

import { use, useState, Suspense } from "react";
import { useSeason } from "@/contexts/season-context";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Loader2, UserPlus, CheckCircle2, Lock, ShieldAlert, Copy, ExternalLink, QrCode
} from "lucide-react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";

const UPI_ID = "ashwinfejl357@oksbi";
const AMOUNT = "30.00";
const PAYEE_NAME = "NCL Tournament";

function EnrollContent({ seasonId }: { seasonId: string }) {
  const { season, tournament, isLoading: seasonLoading } = useSeason();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [paymentStep, setPaymentStep] = useState(false);

  const [formData, setFormData] = useState({
    name: "", favorite_team: "", bio: "", phone: "", transaction_id: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const upiIntentUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${AMOUNT}&cu=INR&tn=Tournament%20Registration`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.favorite_team || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setPaymentStep(true);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transaction_id || formData.transaction_id.length < 8) {
      setError("Please enter a valid 12-digit UTR/Transaction ID.");
      return;
    }

    setError("");
    setSaving(true);

    try {
      let finalPhotoUrl = "";
      if (photoFile) {
        const timestamp = Date.now();
        const ext = photoFile.name.split(".").pop();
        const filename = `players/public_${timestamp}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("ncl-media")
          .upload(filename, photoFile);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("ncl-media")
            .getPublicUrl(filename);
          finalPhotoUrl = publicUrl;
        }
      }

      const slug =
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") +
        "-" +
        Math.floor(Math.random() * 1000);

      const { data: newPlayer, error: playerErr } = await supabase
        .from("players")
        .insert({
          name: formData.name,
          slug,
          favorite_team: formData.favorite_team,
          bio: formData.bio,
          photo_url: finalPhotoUrl,
          overall_rating: 70,
        })
        .select()
        .single();
      if (playerErr) throw playerErr;

      const { error: enrollErr } = await supabase
        .from("season_enrollments")
        .insert({ 
          season_id: seasonId, 
          player_id: newPlayer.id,
          phone: formData.phone,
          transaction_id: formData.transaction_id,
          status: 'pending' 
        });
        
      if (enrollErr) throw enrollErr;

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during enrollment.");
    } finally {
      setSaving(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    alert("UPI ID copied to clipboard!");
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold uppercase tracking-widest text-muted-foreground">Season Not Found</h2>
        <Link href="/">
          <Button variant="outline" className="font-bold">Go Home</Button>
        </Link>
      </div>
    );
  }

  const now = new Date();
  const isEarly = season.registration_start ? now < new Date(season.registration_start) : false;
  const isLate = season.registration_end ? now > new Date(season.registration_end) : false;

  if (season.status !== "active" || isEarly || isLate) {
    let message = "Registration is not active for this season.";
    if (isEarly) {
      message = `Registration opens on ${new Date(season.registration_start!).toLocaleString()}`;
    } else if (isLate) {
      message = "Registration for this season has closed.";
    } else if (season.status === 'upcoming') {
      message = "Registration for this season has not opened yet.";
    } else if (season.status === 'completed') {
      message = "Registration for this season has closed.";
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-muted-foreground" />
        <div className="space-y-2 max-w-md">
          <h2 className="text-3xl font-black font-heading uppercase tracking-tighter">Registration Closed</h2>
          <p className="text-muted-foreground font-medium">{message}</p>
        </div>
        <Link href={`/season/${seasonId}`}>
          <Button variant="outline" className="w-full font-black uppercase tracking-widest">Back to Season</Button>
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 max-w-lg mx-auto gap-6 text-center">
        <div className="w-20 h-20 bg-success/15 flex items-center justify-center rounded-full">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-3xl font-black font-heading uppercase text-foreground">Application Received</h2>
        <p className="text-muted-foreground font-medium">
          We have received your payment details. Your enrollment is currently <strong>Pending Verification</strong>.
        </p>
        
        <div className="w-full bg-card border-2 border-border p-6 space-y-4 text-left">
          <h3 className="text-xs font-black uppercase tracking-wider text-primary border-b border-border pb-2">Registration Details</h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm">
            <span className="text-muted-foreground font-medium">Player</span><span className="text-right font-bold">{formData.name}</span>
            <span className="text-muted-foreground font-medium">Mobile</span><span className="text-right font-bold">{formData.phone}</span>
            <span className="text-muted-foreground font-medium">Status</span><span className="text-yellow-500 text-right font-bold uppercase">Pending</span>
            <span className="text-muted-foreground font-medium">UTR</span><span className="text-right font-mono text-xs">{formData.transaction_id}</span>
          </div>
        </div>

        <Link href={`/season/${seasonId}/enrollment-status`} className="w-full">
          <Button className="w-full h-14 font-black uppercase tracking-widest text-lg">Check Status</Button>
        </Link>
        <a href="https://chat.whatsapp.com/CYqbdmsPaEpGyfKiRheit0" target="_blank" rel="noreferrer" className="w-full">
          <Button className="w-full h-14 font-black uppercase tracking-widest text-lg bg-[#25D366] text-white hover:bg-[#128C7E] flex items-center gap-2 justify-center">
            Join WhatsApp Group
          </Button>
        </a>
        <Link href={`/season/${seasonId}`} className="w-full">
          <Button variant="outline" className="w-full font-black uppercase tracking-widest">Back to Season</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-foreground mb-3">Join the Action</h1>
        <p className="text-muted-foreground text-lg font-medium">
          Register for <strong className="text-foreground">{tournament?.name ?? "NCL"}: {season.name}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 mb-6 text-sm font-bold flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> {error}
        </div>
      )}

      {!paymentStep ? (
        <div className="bg-card border-2 border-border p-6 md:p-8">
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            {/* Photo */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-secondary mb-4 group cursor-pointer flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <UserPlus className="w-12 h-12 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-xs font-bold uppercase text-foreground">Upload</span>
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">Player Photo</p>
            </div>

            <div className="space-y-4">
              {[
                { label: "Player Name *", name: "name", type: "text", placeholder: "Your gaming alias" },
                { label: "Favorite Team *", name: "favorite_team", type: "text", placeholder: "e.g. Real Madrid, Arsenal" },
                { label: "Mobile Number *", name: "phone", type: "tel", placeholder: "Used to check your status" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-1.5">{field.label}</label>
                  <input
                    required
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-background border-2 border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors text-sm font-medium"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-1.5">Bio (Optional)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-background border-2 border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors resize-none text-sm font-medium"
                  placeholder="Tell us about your playstyle..."
                />
              </div>
            </div>

            <div className="pt-6 border-t-2 border-border mt-8">
              <Button type="submit" size="lg" className="w-full font-black uppercase tracking-widest h-14 rounded-none">
                Proceed to Payment →
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-card border-2 border-border p-6 md:p-8 space-y-8 text-center">
          
          <div>
            <h3 className="text-2xl font-heading font-black uppercase mb-2">Complete Payment</h3>
            <p className="text-muted-foreground text-sm font-medium">Scan the QR code or tap the button to pay via any UPI app.</p>
          </div>

          <div className="flex flex-col items-center gap-6 py-6 border-y-2 border-border border-dashed">
            
            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-4 border-muted">
              <QRCodeSVG value={upiIntentUrl} size={180} />
            </div>

            {/* Direct Pay Instructions */}
            <div className="w-full space-y-3">
              <div className="bg-muted/50 p-4 text-sm text-foreground font-medium text-left border-2 border-border">
                <span className="font-bold text-foreground block mb-2 text-lg text-center uppercase tracking-wider text-primary">How to Pay ₹{AMOUNT}</span>
                <ul className="list-decimal pl-5 space-y-2 text-muted-foreground font-bold">
                  <li>Copy the UPI ID below (or take a screenshot of the QR code).</li>
                  <li>Open <strong className="text-foreground">Google Pay</strong> (or any UPI app).</li>
                  <li>Pay exactly <strong className="text-foreground">₹{AMOUNT}</strong> manually.</li>
                  <li>Copy the 12-digit Transaction ID (UTR) and paste it below.</li>
                </ul>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground font-bold">
              <span>UPI ID: {UPI_ID}</span>
              <button onClick={copyUpiId} className="p-2 hover:bg-muted rounded-md transition-colors text-foreground">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmitFinal} className="space-y-6 pt-4 text-left">
            <div>
              <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-1.5">
                Transaction ID (UTR) *
              </label>
              <p className="text-xs text-muted-foreground mb-3 font-medium">After paying, enter the 12-digit transaction ID here to verify your payment.</p>
              <input
                required
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleChange}
                className="w-full bg-background border-2 border-border px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-colors font-mono tracking-widest text-center text-lg"
                placeholder="e.g. 312456789012"
              />
            </div>

            <Button type="submit" disabled={saving} size="lg" className="w-full font-black uppercase tracking-widest h-14 rounded-none">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify & Submit Application"}
            </Button>
            
            <button 
              type="button" 
              onClick={() => setPaymentStep(false)}
              className="w-full text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground mt-4"
            >
              ← Back to edit details
            </button>
          </form>

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
