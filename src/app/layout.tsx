import type { Metadata } from "next";
import { Barlow, Barlow_Condensed, Bebas_Neue } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";

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

export const metadata: Metadata = {
  title: "Namma Football League",
  description: "The premium tournament ecosystem for eFootball Mobile competitions.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/logo_nfl.png",
  },
};

export const viewport = {
  themeColor: "#0F0F0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${barlow.variable} ${barlowCondensed.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-primary/30 selection:text-primary">
        <Header />
        <main className="flex-1 flex flex-col w-full">{children}</main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
