import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { InstallPrompt } from "@/components/pwa/install-prompt";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

const barlow = Barlow({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-fifa",
  subsets: ["latin"],
  weight: ["400"],
});

import { Quantico } from "next/font/google";
const quanticoFont = Quantico({
  variable: "--font-ncl",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Namma Football League",
  description: "The premium tournament ecosystem for eFootball Mobile competitions.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable} ${quanticoFont.variable}`}>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-1 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileNav />
        <InstallPrompt />
      </body>
    </html>
  );
}
