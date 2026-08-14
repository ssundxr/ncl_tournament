import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, BarChart3, Zap } from "lucide-react";

export default function StatisticsComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 py-16 text-center bg-background text-foreground">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 border-2 border-primary text-primary text-xs font-black uppercase tracking-[0.25em] shadow-[4px_4px_0px_0px_rgba(220,38,38,0.5)]">
          <Zap className="w-4 h-4 fill-primary animate-pulse" />
          <span>Advanced Analytics Engine</span>
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter font-heading leading-tight text-foreground drop-shadow-sm">
          Feature <span className="text-primary">Coming Soon</span>
        </h1>

        <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
          Deep player analytics, individual top scorers ranking, assistance tracking, and comprehensive team performance statistics are currently under active development for upcoming NCL tournaments.
        </p>

        <div className="pt-6">
          <Link href="/">
            <Button size="lg" className="h-14 px-8 font-black uppercase tracking-widest bg-foreground text-background border-2 border-foreground hover:bg-primary hover:text-white transition-all rounded-none shadow-[6px_6px_0px_0px_rgba(220,38,38,1)]">
              <ArrowLeft className="mr-2 h-5 w-5" /> Back To Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
