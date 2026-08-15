"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save, FileText, Users, ShieldCheck, Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { supabase } from "@/lib/supabase/client";
import { getSeasons } from "@/lib/supabase/queries";

const PRESET_CATEGORIES = [
  "MATCH REGULATIONS",
  "DISCONNECTION POLICIES",
  "SQUAD & PLAYER ELIGIBILITY",
  "SCORING & POINTS SYSTEM",
  "OTHER"
];

export default function AdminCMSPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"about" | "rules" | "organizers">("about");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [seasons, setSeasons] = useState<any[]>([]);

  // About CMS State
  const [aboutData, setAboutData] = useState({
    title: "NAMMA CHAMPIONS LEAGUE",
    subtitle: "The Ultimate eFootball Mobile Tournament Ecosystem",
    story1: "Founded with a passion for competitive mobile esports, Namma Champions League (NCL) brings broadcast-quality, high-stakes eFootball mobile tournaments to players across India.",
    story2: "Every match counts. From group stage battles to the high-pressure Grand Finals, NCL provides transparency, instant score verifications, and fair play enforcement.",
    image1: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200",
    image2: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200",
  });

  // Organizers State
  const [organizers, setOrganizers] = useState<any[]>([]);
  const [newOrg, setNewOrg] = useState({
    name: "",
    role: "Organizer",
    photo_url: "",
    bio: "",
    email: "",
    whatsapp_number: "",
  });

  // Rules State
  const [rules, setRules] = useState<any[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("MATCH REGULATIONS");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [newRule, setNewRule] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    async function loadCMSData() {
      try {
        const sData = await getSeasons();
        setSeasons(sData);
        if (sData.length > 0) setSelectedSeasonId(sData[0].id);

        // Load About CMS
        const { data: aData } = await supabase
          .from("site_content")
          .select("content")
          .eq("key", "about_ncl")
          .single();
        if (aData?.content) setAboutData((prev) => ({ ...prev, ...aData.content }));

        // Load Organizers
        const { data: oData } = await supabase.from("organizers").select("*").order("sort_order");
        if (oData) setOrganizers(oData);

        // Load Rules via API
        const rulesRes = await fetch("/api/rules?tournament_id=all&season_id=all");
        const rulesResult = await rulesRes.json();
        if (rulesResult.success && rulesResult.data) {
          setRules(rulesResult.data);
        }
      } catch (err) {
        console.error("Error loading CMS:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCMSData();
  }, []);

  // Convert File to Base64 Data URL for local uploads
  const handleFileUpload = (file: File, callback: (url: string) => void) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "error", title: "File too large", description: "Please upload an image smaller than 5MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        callback(e.target.result as string);
        toast({ variant: "success", title: "Image Uploaded", description: "Local image attached successfully!" });
      }
    };
    reader.readAsDataURL(file);
  };

  // Save About Page
  const handleSaveAbout = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "about_ncl", content: aboutData }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast({ variant: "success", title: "Saved!", description: "About NCL page updated." });
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Add Organizer
  const handleAddOrganizer = async () => {
    if (!newOrg.name) {
      toast({ variant: "error", title: "Validation Error", description: "Organizer name is required." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/organizer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrg),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrganizers([...organizers, data.data]);
      setNewOrg({ name: "", role: "Organizer", photo_url: "", bio: "", email: "", whatsapp_number: "" });
      toast({ variant: "success", title: "Success", description: "Organizer added." });
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Delete Organizer
  const handleDeleteOrganizer = async (id: string) => {
    if (!confirm("Are you sure you want to delete this organizer?")) return;
    try {
      const res = await fetch("/api/admin/cms/organizer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setOrganizers(organizers.filter((o) => o.id !== id));
      toast({ variant: "success", title: "Deleted", description: "Organizer removed." });
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    }
  };

  // Add Rule
  const handleAddRule = async () => {
    const finalCategory = selectedCategory === "OTHER" ? customCategory : selectedCategory;
    if (!finalCategory || !newRule.title || !newRule.content) {
      toast({ variant: "error", title: "Validation Error", description: "Category, Title, and Content are required." });
      return;
    }
    const targetSeason = seasons.find((s) => s.id === selectedSeasonId);

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/rule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: finalCategory,
          title: newRule.title,
          content: newRule.content,
          season_id: selectedSeasonId === "all" ? null : selectedSeasonId,
          tournament_id: targetSeason?.tournament_id || null,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRules([...rules, data.data]);
      setNewRule({ title: "", content: "" });
      toast({ variant: "success", title: "Success", description: "Rule added." });
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    } finally {
      setSaving(false);
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id: string) => {
    if (!confirm("Delete this rule?")) return;
    try {
      const res = await fetch("/api/admin/cms/rule/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRules(rules.filter((r) => r.id !== id));
      toast({ variant: "success", title: "Deleted", description: "Rule removed." });
    } catch (err: any) {
      toast({ variant: "error", title: "Error", description: err.message });
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredRules = rules.filter(
    (r) => selectedSeasonId === "all" || r.season_id === selectedSeasonId || !r.season_id
  );

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black font-heading uppercase text-foreground tracking-tight">
          CMS Control Panel
        </h1>
        <p className="text-muted-foreground font-medium">
          Manage dynamic story content, tournament rules by season, and organizers from local storage.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b-2 border-border pb-4">
        <button
          onClick={() => setActiveTab("about")}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeTab === "about"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-foreground"
          }`}
        >
          <FileText className="w-4 h-4" /> About NCL Editor
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeTab === "rules"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-foreground"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Rules Manager (Per Season)
        </button>
        <button
          onClick={() => setActiveTab("organizers")}
          className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest border-2 transition-all flex items-center gap-2 ${
            activeTab === "organizers"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-muted-foreground border-border hover:border-foreground"
          }`}
        >
          <Users className="w-4 h-4" /> Organizers Manager
        </button>
      </div>

      {/* About Tab */}
      {activeTab === "about" && (
        <div className="bg-card border-2 border-border p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b-2 border-border pb-4">
            <h2 className="font-black uppercase tracking-tight text-xl text-foreground">
              About NCL Content (/about)
            </h2>
            <Button
              onClick={handleSaveAbout}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider rounded-none px-6"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Title</label>
              <input
                type="text"
                value={aboutData.title}
                onChange={(e) => setAboutData({ ...aboutData, title: e.target.value })}
                className="w-full bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Subtitle</label>
              <input
                type="text"
                value={aboutData.subtitle}
                onChange={(e) => setAboutData({ ...aboutData, subtitle: e.target.value })}
                className="w-full bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Story Paragraph 1</label>
              <textarea
                rows={3}
                value={aboutData.story1}
                onChange={(e) => setAboutData({ ...aboutData, story1: e.target.value })}
                className="w-full bg-background border-2 border-border p-4 text-sm text-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">Story Paragraph 2</label>
              <textarea
                rows={3}
                value={aboutData.story2}
                onChange={(e) => setAboutData({ ...aboutData, story2: e.target.value })}
                className="w-full bg-background border-2 border-border p-4 text-sm text-foreground"
              />
            </div>
          </div>

          {/* Media Images with Local Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-border">
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Section 1 Media Image (Local Upload)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, (url) => setAboutData({ ...aboutData, image1: url }));
                  }}
                  className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:border-2 file:border-primary file:text-xs file:font-black file:uppercase file:bg-primary file:text-white"
                />
              </div>
              {aboutData.image1 && (
                <div className="w-32 h-20 border-2 border-border overflow-hidden bg-muted">
                  <img src={aboutData.image1} alt="Preview 1" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Section 2 Media Image (Local Upload)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, (url) => setAboutData({ ...aboutData, image2: url }));
                  }}
                  className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:border-2 file:border-primary file:text-xs file:font-black file:uppercase file:bg-primary file:text-white"
                />
              </div>
              {aboutData.image2 && (
                <div className="w-32 h-20 border-2 border-border overflow-hidden bg-muted">
                  <img src={aboutData.image2} alt="Preview 2" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === "rules" && (
        <div className="space-y-6">
          <div className="bg-card border-2 border-border p-6 space-y-6">
            <h2 className="font-black uppercase tracking-tight text-xl text-foreground border-b-2 border-border pb-3">
              Add Tournament Rule (Linked to Season)
            </h2>

            {/* Season Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Select Season & Tournament *
                </label>
                <select
                  value={selectedSeasonId}
                  onChange={(e) => setSelectedSeasonId(e.target.value)}
                  className="w-full bg-background border-2 border-primary px-4 py-2.5 text-sm font-bold text-foreground outline-none"
                >
                  <option value="all">Global (All Seasons)</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.tournament?.name || "Tournament"} - {s.name} (S{s.number})
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Rule Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-background border-2 border-primary px-4 py-2.5 text-sm font-bold text-foreground outline-none"
                >
                  {PRESET_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedCategory === "OTHER" && (
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Custom Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. DISCIPLINARY & PENALTIES"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value.toUpperCase())}
                  className="w-full bg-background border-2 border-border px-4 py-2 text-sm font-bold text-foreground"
                />
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Rule Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Match Duration & Settings"
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  className="w-full bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground mb-1.5">
                  Rule Description & Details *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Standard match duration is set to 10 minutes with Extra Time and Penalties enabled..."
                  value={newRule.content}
                  onChange={(e) => setNewRule({ ...newRule, content: e.target.value })}
                  className="w-full bg-background border-2 border-border p-4 text-sm font-medium text-foreground"
                />
              </div>
            </div>

            <Button onClick={handleAddRule} disabled={saving} className="font-black uppercase tracking-wider bg-primary text-white h-12 px-6">
              <Plus className="w-4 h-4 mr-2" /> Add Rule To Season
            </Button>
          </div>

          {/* Rules List Filtered by Season */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Configured Rules ({filteredRules.length})
              </h3>
            </div>

            {filteredRules.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-border text-center text-muted-foreground font-medium text-sm">
                No custom rules added for the selected season yet. (Public website will display standard rulebook default).
              </div>
            ) : (
              filteredRules.map((r) => (
                <div key={r.id} className="bg-card border-2 border-border p-5 flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase bg-primary text-white px-2 py-0.5">
                        {r.category}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {r.season_id ? "Season Specific" : "Global Rule"}
                      </span>
                    </div>
                    <h4 className="font-black text-lg uppercase tracking-tight text-foreground font-heading">
                      {r.title}
                    </h4>
                    <p className="text-sm text-muted-foreground font-medium">{r.content}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteRule(r.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Organizers Tab */}
      {activeTab === "organizers" && (
        <div className="space-y-6">
          <div className="bg-card border-2 border-border p-6 space-y-4">
            <h2 className="font-black uppercase tracking-tight text-xl text-foreground border-b-2 border-border pb-3">
              Add New Organizer
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name *"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                className="bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
              <input
                type="text"
                placeholder="Role (e.g. Lead Tournament Admin)"
                value={newOrg.role}
                onChange={(e) => setNewOrg({ ...newOrg, role: e.target.value })}
                className="bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
              <input
                type="text"
                placeholder="Email Address"
                value={newOrg.email}
                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                className="bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
              <input
                type="text"
                placeholder="WhatsApp Number (with country code, e.g. 919876543210)"
                value={newOrg.whatsapp_number}
                onChange={(e) => setNewOrg({ ...newOrg, whatsapp_number: e.target.value })}
                className="bg-background border-2 border-border px-4 py-2.5 text-sm font-bold text-foreground"
              />
            </div>

            {/* Organizer Photo Local Upload */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-black uppercase tracking-wider text-muted-foreground">
                Organizer Photo (Upload from Local Storage)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, (url) => setNewOrg({ ...newOrg, photo_url: url }));
                }}
                className="text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:border-2 file:border-primary file:text-xs file:font-black file:uppercase file:bg-primary file:text-white"
              />
              {newOrg.photo_url && (
                <div className="w-16 h-16 border-2 border-border overflow-hidden bg-muted mt-2">
                  <img src={newOrg.photo_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <textarea
              rows={2}
              placeholder="Short Bio / Responsibilities"
              value={newOrg.bio}
              onChange={(e) => setNewOrg({ ...newOrg, bio: e.target.value })}
              className="w-full bg-background border-2 border-border p-3 text-sm text-foreground"
            />

            <Button onClick={handleAddOrganizer} disabled={saving} className="font-black uppercase tracking-wider bg-primary text-white h-12 px-6">
              <Plus className="w-4 h-4 mr-2" /> Add Organizer Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {organizers.map((org) => (
              <div key={org.id} className="bg-card border-2 border-border p-5 flex justify-between items-start gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-muted border-2 border-border overflow-hidden flex-shrink-0">
                    {org.photo_url ? (
                      <img src={org.photo_url} alt={org.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-black text-muted-foreground">NO IMG</div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase bg-primary text-white px-2 py-0.5">{org.role}</span>
                    <h4 className="font-black text-lg uppercase tracking-tight text-foreground font-heading">{org.name}</h4>
                    <p className="text-xs text-muted-foreground font-medium">{org.bio}</p>
                    <p className="text-[10px] font-mono text-muted-foreground pt-1">WA: {org.whatsapp_number || "None"} | Email: {org.email || "None"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteOrganizer(org.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
