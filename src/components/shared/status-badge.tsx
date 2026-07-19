import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "scheduled" | "live" | "completed" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "live":
      return (
        <div className={cn("inline-flex items-center px-2.5 py-1 bg-destructive/10 border border-destructive/20 rounded-full", className)}>
          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse mr-1.5" />
          <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider">Live</span>
        </div>
      );
    case "scheduled":
      return (
        <div className={cn("inline-flex items-center px-2.5 py-1 bg-secondary border border-border rounded-full", className)}>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Scheduled</span>
        </div>
      );
    case "completed":
      return (
        <div className={cn("inline-flex items-center px-2.5 py-1 bg-card border border-border shadow-sm rounded-full", className)}>
          <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">FT</span>
        </div>
      );
    case "cancelled":
      return (
        <div className={cn("inline-flex items-center px-2.5 py-1 bg-muted/50 border border-border rounded-full", className)}>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Cancelled</span>
        </div>
      );
    default:
      return null;
  }
}
