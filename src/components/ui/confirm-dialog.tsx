"use client";

import { useState, createContext, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
}

interface ConfirmContextType {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
});

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dialog, setDialog] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog(opts);
    });
  }, []);

  const handleClose = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  };

  const isDestructive = dialog?.variant === "destructive";

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {dialog && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
              onClick={() => handleClose(false)}
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[90vw] max-w-md"
            >
              <div className="bg-card border-2 border-border p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                  {isDestructive && (
                    <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-black uppercase tracking-tight text-foreground">
                      {dialog.title}
                    </h3>
                    {dialog.description && (
                      <p className="text-sm text-muted-foreground font-medium mt-2 leading-relaxed">
                        {dialog.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => handleClose(false)}
                    className="font-bold uppercase tracking-wider text-xs"
                  >
                    {dialog.cancelLabel ?? "Cancel"}
                  </Button>
                  <Button
                    onClick={() => handleClose(true)}
                    className={`font-bold uppercase tracking-wider text-xs ${
                      isDestructive
                        ? "bg-destructive hover:bg-destructive/90 text-white"
                        : ""
                    }`}
                  >
                    {dialog.confirmLabel ?? "Confirm"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
