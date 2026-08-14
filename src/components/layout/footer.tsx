"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeveloperCredit } from "./developer-credit";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="w-full bg-foreground border-t-8 border-primary mt-auto pb-16 md:pb-0 text-background print:hidden">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-4xl font-black font-heading text-background tracking-tighter uppercase skew-x-[10deg]"><span className="text-ncl-brand">NCL</span> <span className="text-primary">Hub</span></h3>
            <p className="text-sm text-background/60 font-medium">
              The premium tournament ecosystem for eFootball Mobile competitions.
              Experience broadcast-quality tournaments.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-black text-xl mb-4 text-background uppercase tracking-widest">Competitions</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/standings" className="text-background/60 hover:text-primary transition-colors">Current Season</Link></li>
              <li><Link href="/standings?tab=knockout" className="text-background/60 hover:text-primary transition-colors">Knockout Stage</Link></li>
              <li><Link href="/fixtures" className="text-background/60 hover:text-primary transition-colors">All Fixtures</Link></li>
              <li><Link href="/fixtures?status=completed" className="text-background/60 hover:text-primary transition-colors">Match Results</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-black text-xl mb-4 text-background uppercase tracking-widest">Stats</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/statistics" className="text-background/60 hover:text-primary transition-colors">Top Scorers</Link></li>
              <li><Link href="/statistics" className="text-background/60 hover:text-primary transition-colors">Most Assists</Link></li>
              <li><Link href="/players" className="text-background/60 hover:text-primary transition-colors">Player Directory</Link></li>
              <li><Link href="/statistics" className="text-background/60 hover:text-primary transition-colors">Team Stats</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-black text-xl mb-4 text-background uppercase tracking-widest">About</h4>
            <ul className="space-y-3 text-sm font-bold">
              <li><Link href="/about" className="text-background/60 hover:text-primary transition-colors">About NCL</Link></li>
              <li><Link href="/rules" className="text-background/60 hover:text-primary transition-colors">Tournament Rules</Link></li>
              <li><Link href="/contact" className="text-background/60 hover:text-primary transition-colors">Contact Organizers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t-[3px] border-background/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-background/40 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Namma Football League. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs font-bold text-background/40 uppercase tracking-widest">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
        <DeveloperCredit />
      </div>
    </footer>
  );
}
