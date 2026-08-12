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
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pb-safe animate-in slide-in-from-bottom-full duration-500">
      <div className="max-w-md mx-auto bg-card border-2 border-primary shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] p-4 relative flex items-start gap-4">
        <button 
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 bg-card border-2 border-border rounded-full p-1 hover:bg-muted transition-colors text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="w-12 h-12 bg-primary flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-primary-foreground" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-heading font-black uppercase text-lg text-foreground leading-tight">Install NCL Hub</h3>
          
          {isIOS ? (
            <p className="text-xs font-medium text-muted-foreground mt-1">
              To install this app on your iPhone: tap the <strong className="text-foreground">Share</strong> icon below, then select <strong className="text-foreground">Add to Home Screen</strong>.
            </p>
          ) : (
            <>
              <p className="text-xs font-medium text-muted-foreground mt-1 mb-3">
                Install our app on your device for quick access to the tournament!
              </p>
              {isInstallable && (
                <Button 
                  onClick={handleInstallClick}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-xs h-9 rounded-none"
                >
                  Install App Now
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
