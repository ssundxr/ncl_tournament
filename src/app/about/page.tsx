import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, ShieldCheck, Zap, PlayCircle, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0; // Dynamic server fetching for instant CMS updates

async function getAboutContent() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("site_content")
      .select("content")
      .eq("key", "about_ncl")
      .single();
    return data?.content || null;
  } catch {
    return null;
  }
}

export default async function AboutPage() {
  const cmsData = await getAboutContent();

  const title = cmsData?.title || "NAMMA CHAMPIONS LEAGUE";
  const subtitle = cmsData?.subtitle || "The Ultimate eFootball Mobile Tournament Ecosystem";
  const story1 = cmsData?.story1 || "";
  const story2 = cmsData?.story2 || "";

  const image1 = cmsData?.image1 || "";
  const image2 = cmsData?.image2 || "";

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20">
      {/* Hero Header */}
      <div className="w-full bg-card border-b-4 border-foreground py-16 px-4 md:px-12 lg:px-24 xl:px-32 relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest mb-6">
            <Zap className="w-4 h-4" /> Official Competition Ecosystem
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter font-heading text-foreground mb-4 leading-tight">
            {title}
          </h1>
          <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-primary font-heading">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-16 space-y-20">
        {/* Section 1: Left Text, Right Image */}
        {(story1 || image1) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-1.5 h-6 bg-primary inline-block mr-3" />
              <h2 className="text-3xl font-black uppercase tracking-tight font-heading inline-block text-foreground">
                Our Vision & Origin
              </h2>
              {story1 && (
                <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
                  {story1}
                </p>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="border-2 border-border p-4 bg-card">
                  <Trophy className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-black text-xl text-foreground font-heading">PRO BRACKETS</h4>
                  <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Progressive Knockouts</p>
                </div>
                <div className="border-2 border-border p-4 bg-card">
                  <ShieldCheck className="w-6 h-6 text-success mb-2" />
                  <h4 className="font-black text-xl text-foreground font-heading">FAIR PLAY</h4>
                  <p className="text-xs text-muted-foreground font-bold uppercase mt-1">Verified UTR & Scores</p>
                </div>
              </div>
            </div>

            {image1 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-primary translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
                <div className="relative border-4 border-foreground overflow-hidden h-[360px] bg-muted">
                  <img
                    src={image1}
                    alt="NCL Esports Arena"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section 2: Left Image, Right Text */}
        {(story2 || image2) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {image2 && (
              <div className="relative group lg:order-1 order-2">
                <div className="absolute inset-0 bg-foreground translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4" />
                <div className="relative border-4 border-foreground overflow-hidden h-[360px] bg-muted">
                  <img
                    src={image2}
                    alt="Competitive Matches"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            )}

            <div className={`space-y-6 ${image2 ? "lg:order-2 order-1" : ""}`}>
              <div className="w-1.5 h-6 bg-primary inline-block mr-3" />
              <h2 className="text-3xl font-black uppercase tracking-tight font-heading inline-block text-foreground">
                Peak Competition Engine
              </h2>
              {story2 && (
                <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
                  {story2}
                </p>
              )}
              <div className="pt-4">
                <Link href="/fixtures">
                  <Button size="lg" className="h-14 px-8 font-black uppercase tracking-widest bg-primary text-white border-2 border-primary hover:bg-primary/90 transition-all rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <PlayCircle className="mr-2 h-6 w-6" /> Explore Match Center
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
