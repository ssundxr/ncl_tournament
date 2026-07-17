"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, CheckCircle2, ShieldAlert, Lock, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Season } from "@/types";
import { load } from '@cashfreepayments/cashfree-js';

function EnrollForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seasonId = searchParams.get("season");
  const paymentStatusParam = searchParams.get("payment");
  const orderIdParam = searchParams.get("order_id");
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [error, setError] = useState("");
  
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("");
  const [generatedRefNo, setGeneratedRefNo] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    favorite_team: "",
    bio: "",
    phone: "",
  });
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Fetch season context
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

  // Handle successful payment redirect
  useEffect(() => {
    if (paymentStatusParam === 'success' && orderIdParam && season) {
      setGeneratedRefNo(orderIdParam);
      setSuccess(true);
      // We could also fetch the player details here based on orderId to populate the receipt,
      // but for simplicity we rely on the state if they didn't refresh, 
      // or just show the reference ID.
    }
  }, [paymentStatusParam, orderIdParam, season]);

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

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.favorite_team || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setSaving(true);
    setPaymentProcessing(true);
    setProcessingText("Initializing secure checkout...");

    try {
      let finalPhotoUrl = "";

      // Handle photo upload
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
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('ncl-media')
              .getPublicUrl(filename);
              
            finalPhotoUrl = publicUrl;
          }
        } catch (err) {
          console.warn("Photo upload exception:", err);
        }
      }

      // Generate unique slug
      const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

      // 1. Create player in database
      const { data: newPlayer, error: playerError } = await supabase
        .from("players")
        .insert({
          name: formData.name,
          slug: slug,
          favorite_team: formData.favorite_team,
          bio: formData.bio,
          photo_url: finalPhotoUrl,
          phone: formData.phone,
          overall_rating: 70
        })
        .select()
        .single();

      if (playerError) throw playerError;

      // 2. Call backend to create Cashfree order
      const returnUrl = `${window.location.origin}/enroll?season=${season?.id}&payment=success&order_id={order_id}`;
      
      const response = await fetch('/api/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: newPlayer.id,
          phone: formData.phone,
          name: formData.name,
          season_id: season?.id,
          return_url: returnUrl
        })
      });

      const orderData = await response.json();
      if (!response.ok) {
        throw new Error(orderData.error || 'Failed to initialize payment');
      }

      // 3. Store pending enrollment
      if (season) {
        await supabase
          .from("season_enrollments")
          .insert({
            season_id: season.id,
            player_id: newPlayer.id,
            payment_status: 'pending', 
            amount_paid: 25,        
            payment_ref: orderData.order_id 
          });
      }

      setGeneratedRefNo(orderData.order_id);
      setProcessingText("Redirecting to Cashfree Payment Gateway...");

      // 4. Open Cashfree Checkout
      const cashfree = await load({ mode: "sandbox" });
      
      cashfree.checkout({
        paymentSessionId: orderData.payment_session_id,
        redirectTarget: "_self", // Or _modal if you prefer, but redirect is more robust for UPI apps
      });
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during enrollment.");
      setPaymentProcessing(false);
    } finally {
      setSaving(false);
    }
  };

  // Format WhatsApp redirect message
  const triggerWhatsAppRedirect = () => {
    const rawMessage = `⚽ *NAMMA FOOTBALL LEAGUE REGISTRATION* ⚽\n` +
      `----------------------------------\n` +
      `*Tournament:* ${season?.tournament?.name || "NFL Championship"}\n` +
      `*Season:* ${season?.name || ""}\n` +
      `*Player Name:* ${formData.name || "Newly Registered Player"}\n` +
      `*Registration Fee:* ₹25.00 (Paid)\n` +
      `*Reference ID:* ${generatedRefNo}\n` +
      `----------------------------------\n` +
      `Please verify and approve my enrollment. See you on the pitch!`;

    const encoded = encodeURIComponent(rawMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
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

  // Enrollment closed
  if (season.status !== 'active' && !success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-6">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <Lock className="w-10 h-10 text-destructive" />
        </div>
        <div>
          <h2 className="text-3xl font-black uppercase text-white tracking-tight mb-2">Enrollment Closed</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Registration for <strong>{season.tournament?.name || "NFL"}: {season.name}</strong> is currently closed. 
            Stay tuned for the next season!
          </p>
        </div>
        <Link href="/">
          <Button size="lg" variant="outline" className="font-bold uppercase tracking-widest border-border text-muted-foreground hover:text-white">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  // Success Layout with receipt & WhatsApp trigger
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4 max-w-lg mx-auto">
        <div className="w-20 h-20 bg-success/15 rounded-full flex items-center justify-center mb-6 animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h2 className="text-3xl font-black uppercase text-white tracking-tight mb-2">Registration Complete!</h2>
        <p className="text-muted-foreground text-center mb-6">
          You are now enrolled in <strong>{season.tournament?.name || "NFL"}: {season.name}</strong>.
        </p>

        {/* Receipt Box */}
        <div className="w-full bg-[#1b1b24] border border-border p-6 rounded-xl space-y-4 shadow-xl mb-6 relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none rounded-xl" />
          <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-border pb-2">NFL Official Receipt</h3>
          <div className="grid grid-cols-2 gap-y-2.5 text-xs">
            {formData.name && (
              <>
                <span className="text-muted-foreground uppercase font-bold">Player Name:</span>
                <span className="text-white text-right font-bold truncate">{formData.name}</span>
              </>
            )}
            
            {formData.phone && (
              <>
                <span className="text-muted-foreground uppercase font-bold">Mobile Number:</span>
                <span className="text-white text-right font-bold">{formData.phone}</span>
              </>
            )}

            <span className="text-muted-foreground uppercase font-bold">Amount Paid:</span>
            <span className="text-white text-right font-black text-sm text-green-400">₹25.00</span>

            <span className="text-muted-foreground uppercase font-bold">Payment Ref:</span>
            <span className="text-white text-right font-bold font-mono text-[10px]">{generatedRefNo}</span>

            <span className="text-muted-foreground uppercase font-bold">Status:</span>
            <span className="text-right"><span className="bg-success/10 border border-success/30 text-success px-2 py-0.5 rounded text-[10px] font-black uppercase">PAID</span></span>
          </div>
        </div>

        <Button 
          onClick={triggerWhatsAppRedirect}
          size="lg" 
          className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold uppercase tracking-widest w-full h-14 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,211,102,0.3)] mb-4"
        >
          <MessageSquare className="w-5 h-5 fill-current" /> Send Confirmation to WhatsApp
        </Button>

        <Link href="/" className="w-full">
          <Button size="lg" variant="outline" className="font-bold uppercase tracking-widest w-full h-12 border-border text-muted-foreground hover:text-white">
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  // Payment Processing Loading State
  if (paymentProcessing) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 shadow-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <h3 className="text-xl font-bold uppercase tracking-tight text-white">Processing Secure Payment</h3>
          <p className="text-muted-foreground text-sm max-w-xs">{processingText}</p>
          <div className="flex items-center gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-wider justify-center mt-4">
            <ShieldAlert className="w-3.5 h-3.5 text-primary" /> Encrypted 256-bit Secure Gateway
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Details Entry Form (avoids cutting off by letting layout height flow)
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-heading uppercase text-white tracking-tight mb-2">Join the Action</h1>
        <p className="text-muted-foreground text-lg">
          Register for <strong>{season.tournament?.name || "NFL"}: {season.name}</strong>
        </p>
      </div>

      {error && (
        <div className="bg-destructive/20 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-6 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-2xl">
        <form onSubmit={handleProceedToPayment} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-background bg-muted mb-4 group cursor-pointer flex items-center justify-center shadow-md">
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
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" 
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
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" 
              placeholder="e.g. Real Madrid, Arsenal"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Mobile Number *</label>
            <input 
              required 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary text-sm" 
              placeholder="e.g. +91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Bio (Optional)</label>
            <textarea 
              name="bio" 
              value={formData.bio} 
              onChange={handleChange} 
              rows={3}
              className="w-full bg-background border border-border rounded-md px-4 py-3 text-white focus:outline-none focus:border-primary resize-none text-sm" 
              placeholder="Tell us about your playstyle..."
            />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={saving}
              size="lg"
              className="w-full bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest h-14 text-xs"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Proceed to Payment"}
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
