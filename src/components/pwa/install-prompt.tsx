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
    
    if (localStorage.getItem("pwa-prompt-dismissed")) {
      return;
    }

    // Detect iOS
    const isIosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // iOS doesn't support beforeinstallprompt, so we just show the iOS instructions
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // Chrome/Android
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setTimeout(() => setShowPrompt(true), 2000);
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
    localStorage.setItem("pwa-prompt-dismissed", "true");
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-card border-4 border-primary shadow-[8px_8px_0px_0px_rgba(220,38,38,1)] p-6 relative flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
        <button 
          onClick={handleDismiss}
          className="absolute -top-4 -right-4 bg-background border-4 border-foreground rounded-full p-2 hover:bg-muted transition-colors text-foreground shadow-[4px_4px_0px_0px_rgba(17,24,39,1)]"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="w-16 h-16 bg-primary flex items-center justify-center rounded-full mb-4 shadow-lg">
          <Download className="w-8 h-8 text-primary-foreground" />
        </div>
        
        <h3 className="font-heading font-black uppercase text-2xl text-foreground leading-tight mb-2">Install NCL Hub</h3>
        
        {isIOS ? (
          <p className="text-sm font-medium text-muted-foreground mb-4">
            To install this app on your iPhone: tap the <strong className="text-foreground">Share</strong> icon at the bottom of Safari, then select <strong className="text-foreground">Add to Home Screen</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-muted-foreground mb-6">
              Install our app on your device for quick access to the tournament schedule, standings, and instant real-time updates!
            </p>
            {isInstallable && (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-sm h-12 rounded-none shadow-[4px_4px_0px_0px_rgba(17,24,39,1)] hover:shadow-none hover:translate-y-1 hover:translate-x-1 transition-all"
              >
                Install App Now
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
