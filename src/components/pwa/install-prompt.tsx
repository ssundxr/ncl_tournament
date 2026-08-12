"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if it's already installed or if we shouldn't show the prompt
    if (window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }
    


    // Detect Mobile (iOS or Android)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    if (isMobile) {
      // Enforce the prompt to show on mobile after 2 seconds
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // Chrome/Android
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pb-safe animate-in slide-in-from-bottom-full duration-700 ease-out">
      <div className="max-w-md mx-auto bg-background/60 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl rounded-3xl p-5 relative flex items-start gap-5 overflow-hidden">
        {/* Aesthetic Background Accents */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
        
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 backdrop-blur-md rounded-full p-1.5 transition-all text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="w-14 h-14 bg-gradient-to-br from-primary to-rose-700 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
          <Download className="w-7 h-7 text-white" />
        </div>
        
        <div className="flex-1 pr-6 relative z-10">
          <h3 className="font-heading font-black uppercase text-xl text-foreground leading-tight tracking-wide">Install NCL Hub</h3>
          
          {isIOS ? (
            <p className="text-sm font-medium text-muted-foreground mt-1.5 leading-snug">
              For the best experience, tap the <strong className="text-foreground">Share</strong> icon below, then select <strong className="text-foreground">Add to Home Screen</strong>.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium text-muted-foreground mt-1.5 mb-4 leading-snug">
                Install our app on your device for quick access and native performance!
              </p>
              {isInstallable ? (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs h-10 rounded-xl shadow-lg transition-all"
                >
                  Install App Now
                </Button>
              ) : (
                <p className="text-xs font-medium text-muted-foreground italic">
                  Tap the menu icon (⋮) and select "Install app" or "Add to Home screen".
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
