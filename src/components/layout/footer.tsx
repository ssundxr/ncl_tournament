import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full glass border-t border-border mt-auto pb-16 md:pb-0">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-bold font-heading text-primary">NFL Hub</h3>
            <p className="text-sm text-muted-foreground">
              The premium tournament ecosystem for eFootball Mobile competitions.
              Experience broadcast-quality tournaments.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">Competitions</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/standings" className="hover:text-primary">Current Season</Link></li>
              <li><Link href="/bracket" className="hover:text-primary">Knockout Stage</Link></li>
              <li><Link href="/fixtures" className="hover:text-primary">All Fixtures</Link></li>
              <li><Link href="/results" className="hover:text-primary">Match Results</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">Players & Stats</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/statistics" className="hover:text-primary">Top Scorers</Link></li>
              <li><Link href="/statistics" className="hover:text-primary">Most Assists</Link></li>
              <li><Link href="/players" className="hover:text-primary">Player Directory</Link></li>
              <li><Link href="/statistics" className="hover:text-primary">Team Stats</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold mb-4 text-foreground">About</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary">About NFL</Link></li>
              <li><Link href="/rules" className="hover:text-primary">Tournament Rules</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Organizers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Namma Football League. All rights reserved.
          </p>
          <div className="flex space-x-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
