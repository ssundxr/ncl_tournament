interface LiveBadgeProps {
  className?: string;
  pulse?: boolean;
}

export function LiveBadge({ className = "", pulse = true }: LiveBadgeProps) {
  return (
    <div className={`inline-flex items-center px-2 py-1 bg-destructive/20 border border-destructive/50 rounded-md ${className}`}>
      {pulse && <div className="w-2 h-2 rounded-full bg-destructive animate-pulse mr-2" />}
      <span className="text-[10px] font-bold text-destructive tracking-widest uppercase">Live</span>
    </div>
  );
}
