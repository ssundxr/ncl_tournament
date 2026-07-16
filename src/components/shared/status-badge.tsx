interface StatusBadgeProps {
  status: "scheduled" | "live" | "completed" | "cancelled";
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  switch (status) {
    case "live":
      return (
        <div className={`inline-flex items-center px-2 py-1 bg-destructive/20 border border-destructive/50 rounded-md ${className}`}>
          <div className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-2" />
          <span className="text-[10px] font-bold text-destructive tracking-widest uppercase">Live</span>
        </div>
      );
    case "scheduled":
      return (
        <div className={`inline-flex items-center px-2 py-1 bg-secondary border border-border rounded-md ${className}`}>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Scheduled</span>
        </div>
      );
    case "completed":
      return (
        <div className={`inline-flex items-center px-2 py-1 bg-card border border-border rounded-md ${className}`}>
          <span className="text-[10px] font-bold text-primary tracking-widest uppercase">FT</span>
        </div>
      );
    case "cancelled":
      return (
        <div className={`inline-flex items-center px-2 py-1 bg-muted border border-border rounded-md ${className}`}>
          <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Cancelled</span>
        </div>
      );
    default:
      return null;
  }
}
