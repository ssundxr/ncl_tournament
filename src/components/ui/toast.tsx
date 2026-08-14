"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (opts: Omit<Toast, "id">) => void;
}

const ToastContext = createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
  },
  error: {
    icon: XCircle,
    bg: "bg-destructive/10",
    border: "border-destructive/30",
    text: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    text: "text-yellow-500",
  },
  info: {
    icon: Info,
    bg: "bg-primary/10",
    border: "border-primary/30",
    text: "text-primary",
  },
};

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const config = variantConfig[t.variant];
  const Icon = config.icon;
  const duration = t.duration ?? 4000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
      className={`relative flex items-start gap-3 p-4 ${config.bg} border-2 ${config.border} w-full max-w-sm overflow-hidden shadow-lg`}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: "linear" }}
        className={`absolute bottom-0 left-0 right-0 h-0.5 ${config.text} bg-current origin-left`}
        onAnimationComplete={() => onDismiss(t.id)}
      />

      <Icon className={`w-5 h-5 ${config.text} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-black uppercase tracking-wider text-foreground">
          {t.title}
        </p>
        {t.description && (
          <p className="text-xs text-muted-foreground font-medium mt-1 leading-relaxed">
            {t.description}
          </p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((opts: Omit<Toast, "id">) => {
    counterRef.current += 1;
    const id = `toast-${counterRef.current}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { ...opts, id }]); // Keep max 5
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none md:bottom-6 md:right-6">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
