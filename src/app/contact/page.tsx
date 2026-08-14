import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail, User, Shield, MessageCircle, AlertCircle } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0; // Dynamic server fetching for real-time CMS sync

async function getOrganizers() {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("organizers")
      .select("*")
      .order("sort_order", { ascending: true });
    return data || [];
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const organizers = await getOrganizers();

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <div className="w-full bg-card border-b-4 border-foreground py-16 px-4 md:px-12 lg:px-24 xl:px-32">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest mb-4">
            <Shield className="w-4 h-4" /> Tournament Support & Management
          </div>
          <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter font-heading text-foreground mb-4">
            Contact Organizers
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            Have questions about registration, match schedules, score verification, or tournament rules? Reach out directly to our tournament organizers.
          </p>
        </div>
      </div>

      {/* Organizers Grid */}
      <div className="w-full px-4 md:px-12 lg:px-24 xl:px-32 py-16">
        {organizers.length === 0 ? (
          <div className="max-w-xl mx-auto py-16 text-center border-4 border-dashed border-border p-8 bg-card">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase font-heading text-foreground mb-2">
              No Organizers Listed
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              Organizers have not been added in the Admin CMS yet. Please check back soon or contact support.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl">
            {organizers.map((org: any) => (
              <div
                key={org.id}
                className="bg-card border-4 border-foreground relative group transition-all duration-300 hover:border-primary hover:shadow-[12px_12px_0px_0px_rgba(220,38,38,1)] flex flex-col justify-between overflow-hidden"
              >
                {/* Big Hero Image Container */}
                <div>
                  <div className="w-full h-80 sm:h-96 relative border-b-4 border-foreground overflow-hidden bg-muted">
                    {org.photo_url ? (
                      <img
                        src={org.photo_url}
                        alt={org.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-muted/60 text-muted-foreground">
                        <User className="w-16 h-16 mb-2" />
                        <span className="text-xs font-black uppercase tracking-widest">No Portrait Uploaded</span>
                      </div>
                    )}

                    {/* Role Badge Overlay */}
                    <div className="absolute top-4 left-4 bg-primary text-primary-foreground font-black px-3.5 py-1.5 text-xs uppercase tracking-widest border-2 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      {org.role || "Organizer"}
                    </div>
                  </div>

                  {/* Details Body */}
                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="text-3xl font-black uppercase tracking-tight text-foreground font-heading">
                      {org.name}
                    </h3>

                    {org.bio && (
                      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        {org.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-6 sm:p-8 pt-0 space-y-3">
                  <div className="border-t-2 border-border pt-6 space-y-3">
                    {org.whatsapp_number && (
                      <a
                        href={`https://wa.me/${org.whatsapp_number.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        <MessageCircle className="w-5 h-5 fill-black" />
                        Chat on WhatsApp
                      </a>
                    )}

                    {org.email && (
                      <a
                        href={`mailto:${org.email}`}
                        className="flex items-center justify-center gap-2 w-full h-14 bg-background border-2 border-foreground hover:bg-foreground hover:text-background text-foreground font-black uppercase tracking-widest text-xs transition-all shadow-[4px_4px_0px_0px_rgba(220,38,38,1)]"
                      >
                        <Mail className="w-4 h-4" />
                        Send Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
