"use client";

import { use, useState } from "react";
import { useSeason } from "@/contexts/season-context";
import { Button } from "@/components/ui/button";
import { Loader2, Search, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

export default function EnrollmentStatusPage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = use(params);
  const { season, tournament } = useSeason();
  const { toast } = useToast();

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusData, setStatusData] = useState<any>(null);

  const checkStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast({ variant: "error", title: "Invalid Input", description: "Please enter a valid 10-digit mobile number." });
      return;
    }

    setLoading(true);
    setStatusData(null);
    try {
      const res = await fetch(`/api/enrollment/status?season_id=${seasonId}&phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      setStatusData(data.data);
    } catch (err: any) {
      toast({ variant: "error", title: "Not Found", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black font-heading uppercase tracking-tighter text-foreground mb-3">Check Status</h1>
        <p className="text-muted-foreground text-lg font-medium">
          Track your enrollment for {tournament?.name}: {season?.name}
        </p>
      </div>

      <div className="bg-card border-2 border-border p-6 md:p-8 shadow-xl">
        <form onSubmit={checkStatus} className="space-y-6">
          <div>
            <label className="block text-sm font-black uppercase tracking-wider text-foreground mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 15))}
                placeholder="Enter registered number"
                className="w-full bg-background border-2 border-border pl-12 pr-4 py-3 text-lg font-bold tracking-widest text-foreground focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} size="lg" className="w-full font-black uppercase tracking-widest h-14 rounded-none">
            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Check Status"}
          </Button>
        </form>

        {statusData && (
          <div className="mt-8 pt-8 border-t-2 border-border animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Registration Details</h3>
            
            <div className={`p-6 border-2 flex flex-col items-center text-center ${
              statusData.status === 'approved' ? 'bg-success/10 border-success/30' :
              statusData.status === 'rejected' ? 'bg-destructive/10 border-destructive/30' :
              'bg-yellow-500/10 border-yellow-500/30'
            }`}>
              
              {statusData.status === 'approved' && <CheckCircle2 className="w-12 h-12 text-success mb-4" />}
              {statusData.status === 'rejected' && <XCircle className="w-12 h-12 text-destructive mb-4" />}
              {statusData.status === 'pending' && <Clock className="w-12 h-12 text-yellow-500 mb-4" />}

              <h4 className="text-2xl font-black uppercase tracking-tight text-foreground mb-2">
                {statusData.status === 'pending' && statusData.payment_status === 'submitted' ? 'Verification Pending' :
                 statusData.status === 'pending' && statusData.payment_status === 'pending' ? 'Payment Pending' :
                 statusData.status}
              </h4>
              
              <p className="text-sm font-medium text-muted-foreground">
                {statusData.status === 'approved' ? 'Congratulations! You are officially enrolled in the tournament.' :
                 statusData.status === 'rejected' ? `Your application was rejected. Reason: ${statusData.rejection_reason || 'Not specified'}` :
                 statusData.payment_status === 'submitted' ? 'We have received your UTR. An admin will verify it shortly.' :
                 'Please complete your payment to finalize registration.'}
              </p>

              {statusData.status === 'pending' && statusData.payment_status === 'pending' && (
                <Link href={`/season/${seasonId}/enroll`} className="mt-6 w-full">
                  <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-600 font-black uppercase tracking-widest">
                    Complete Payment
                  </Button>
                </Link>
              )}

              <a 
                href="https://chat.whatsapp.com/CYqbdmsPaEpGyfKiRheit0" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest transition-all rounded-none shadow-md"
              >
                Join Official WhatsApp Community
              </a>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-8">
        <Link href={`/season/${seasonId}`}>
          <Button variant="ghost" className="font-bold uppercase tracking-wider text-muted-foreground">
            ← Back to Season
          </Button>
        </Link>
      </div>
    </div>
  );
}
