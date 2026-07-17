"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Play, Square, Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";

export default function MatchControlPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [fixture, setFixture] = useState<any>(null);
  const [matchData, setMatchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [homeScore, setHomeScore] = useState<number>(0);
  const [awayScore, setAwayScore] = useState<number>(0);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      // Fetch fixture details
      const { data: fixData, error: fixError } = await supabase
        .from('fixtures')
        .select('*, home_player:players!home_player_id(*), away_player:players!away_player_id(*)')
        .eq('id', unwrappedParams.id)
        .single();
      
      if (fixData) {
        setFixture(fixData);
        // Fetch existing match data if any
        const { data: mData } = await supabase
          .from('matches')
          .select('*')
          .eq('fixture_id', fixData.id)
          .single();
        
        if (mData) {
          setMatchData(mData);
          setHomeScore(mData.home_score || 0);
          setAwayScore(mData.away_score || 0);
          setScreenshotUrl(mData.screenshot_url || "");
        }
      }
      setLoading(false);
    }
    fetchData();
  }, [unwrappedParams.id]);

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    await supabase.from('fixtures').update({ status: newStatus }).eq('id', fixture.id);
    setFixture({ ...fixture, status: newStatus });
    
    // If starting a match, create a match record if it doesn't exist
    if (newStatus === 'live' && !matchData) {
      const { data } = await supabase.from('matches').insert({
        fixture_id: fixture.id,
        started_at: new Date().toISOString()
      }).select().single();
      if (data) setMatchData(data);
    }
    setSaving(false);
  };

  const handleUploadScreenshot = async () => {
    if (!screenshotFile || !matchData) return;
    setUploading(true);
    try {
      const fileName = `screenshots/match_${matchData.id}_${Date.now()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('ncl-media')
        .upload(fileName, screenshotFile);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('ncl-media')
        .getPublicUrl(fileName);
        
      setScreenshotUrl(publicUrl);
      
      // Update DB
      await supabase.from('matches').update({ screenshot_url: publicUrl }).eq('id', matchData.id);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload screenshot. Please make sure the 'ncl-media' bucket exists and is public in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveResult = async () => {
    setSaving(true);
    try {
      // 1. Save match score
      let matchId = matchData?.id;
      if (!matchData) {
        const { data: newMatch } = await supabase.from('matches').insert({
          fixture_id: fixture.id,
          home_score: homeScore,
          away_score: awayScore,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          status: 'completed'
        }).select().single();
        if (newMatch) matchId = newMatch.id;
      } else {
        await supabase.from('matches').update({
          home_score: homeScore,
          away_score: awayScore,
          ended_at: new Date().toISOString()
        }).eq('id', matchData.id);
      }
      
      // 2. Mark fixture as completed
      await supabase.from('fixtures').update({ status: 'completed' }).eq('id', fixture.id);
      
      // 3. Auto-recalculate standings for the entire season from scratch (group stage)
      if (fixture.stage === 'group') {
        const { data: leaderboards } = await supabase
          .from('leaderboards')
          .select('*')
          .eq('season_id', fixture.season_id);

        if (leaderboards && leaderboards.length > 0) {
          const boardMap: Record<string, any> = {};
          leaderboards.forEach(b => {
            boardMap[`${b.player_id}_${b.group_id}`] = {
              id: b.id,
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goals_for: 0,
              goals_against: 0,
              points: 0,
              form: []
            };
          });

          // Fetch all completed group stage fixtures for this season
          const { data: fixturesList } = await supabase
            .from('fixtures')
            .select('*')
            .eq('season_id', fixture.season_id)
            .eq('status', 'completed')
            .eq('stage', 'group');

          // Fetch all match scores
          const { data: matchesList } = await supabase
            .from('matches')
            .select('*');

          if (fixturesList && matchesList) {
            const matchMap: Record<string, any> = {};
            matchesList.forEach(m => {
              matchMap[m.fixture_id] = m;
            });

            fixturesList.forEach(f => {
              const match = matchMap[f.id];
              if (!match) return;

              const homeBoard = boardMap[`${f.home_player_id}_${f.group_id}`];
              const awayBoard = boardMap[`${f.away_player_id}_${f.group_id}`];

              if (homeBoard && awayBoard) {
                const hs = match.home_score ?? 0;
                const as = match.away_score ?? 0;

                homeBoard.played++;
                awayBoard.played++;
                homeBoard.goals_for += hs;
                homeBoard.goals_against += as;
                awayBoard.goals_for += as;
                awayBoard.goals_against += hs;

                if (hs > as) {
                  homeBoard.wins++;
                  homeBoard.points += 3;
                  homeBoard.form.push('W');

                  awayBoard.losses++;
                  awayBoard.form.push('L');
                } else if (as > hs) {
                  awayBoard.wins++;
                  awayBoard.points += 3;
                  awayBoard.form.push('W');

                  homeBoard.losses++;
                  homeBoard.form.push('L');
                } else {
                  homeBoard.draws++;
                  homeBoard.points += 1;
                  homeBoard.form.push('D');

                  awayBoard.draws++;
                  awayBoard.points += 1;
                  awayBoard.form.push('D');
                }
              }
            });

            // Write updates back to Supabase
            for (const key of Object.keys(boardMap)) {
              const b = boardMap[key];
              await supabase
                .from('leaderboards')
                .update({
                  played: b.played,
                  wins: b.wins,
                  draws: b.draws,
                  losses: b.losses,
                  goals_for: b.goals_for,
                  goals_against: b.goals_against,
                  points: b.points,
                  form: b.form.slice(-5)
                })
                .eq('id', b.id);
            }
          }
        }
      }

      alert("Result saved and standings updated successfully!");
      router.push('/admin/matches');
    } catch (err) {
      console.error(err);
      alert("Failed to save result.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-white p-8">Loading match data...</div>;
  if (!fixture) return <div className="text-white p-8">Match not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/matches">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
            <ChevronLeft className="w-6 h-6" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-black font-heading uppercase text-white tracking-tight">Match Control</h1>
          <p className="text-muted-foreground mt-1">MD {fixture.matchday} • {fixture.stage}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Main Scoreboard Control */}
          <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
            <div className="flex justify-between items-center mb-8">
              <span className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Live Score</span>
              <div className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                fixture.status === 'live' ? 'bg-primary text-white animate-pulse' : 
                fixture.status === 'completed' ? 'bg-success text-black' : 'bg-muted text-white'
              }`}>
                {fixture.status}
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col items-center flex-1">
                <span className="font-black text-2xl text-white uppercase text-center">{fixture.home_player?.name}</span>
                <input 
                  type="number" 
                  min="0"
                  value={homeScore}
                  onChange={e => setHomeScore(parseInt(e.target.value) || 0)}
                  disabled={fixture.status === 'scheduled'}
                  className="mt-4 w-24 h-24 bg-background border-2 border-border rounded-xl text-5xl font-black text-center text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xl font-black text-muted-foreground uppercase">VS</span>
              </div>
              <div className="flex flex-col items-center flex-1">
                <span className="font-black text-2xl text-white uppercase text-center">{fixture.away_player?.name}</span>
                <input 
                  type="number" 
                  min="0"
                  value={awayScore}
                  onChange={e => setAwayScore(parseInt(e.target.value) || 0)}
                  disabled={fixture.status === 'scheduled'}
                  className="mt-4 w-24 h-24 bg-background border-2 border-border rounded-xl text-5xl font-black text-center text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-6 border-t border-border">
              {fixture.status === 'scheduled' && (
                <Button 
                  onClick={() => handleStatusChange('live')}
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider w-full max-w-xs"
                >
                  <Play className="w-5 h-5 mr-2" /> Start Match
                </Button>
              )}
              {fixture.status === 'live' && (
                <Button 
                  onClick={handleSaveResult}
                  disabled={saving}
                  className="bg-success text-black hover:bg-success/90 font-bold uppercase tracking-wider w-full max-w-xs"
                >
                  <Square className="w-5 h-5 mr-2" /> End Match & Save
                </Button>
              )}
              {fixture.status === 'completed' && (
                <Button 
                  onClick={handleSaveResult}
                  disabled={saving}
                  className="bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-wider w-full max-w-xs"
                >
                  <Save className="w-5 h-5 mr-2" /> Update Result
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Screenshot Upload */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">Post-Match Screenshot</h3>
            
            {screenshotUrl ? (
              <div className="space-y-4">
                <div className="w-full aspect-video bg-background border border-border rounded-md overflow-hidden">
                  <img src={screenshotUrl} alt="Match Screenshot" className="w-full h-full object-cover" />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setScreenshotUrl("")}
                  className="w-full border-border text-white hover:bg-white/5 uppercase font-bold text-xs"
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-full aspect-video bg-background border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center p-4">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground text-center mb-4">
                    Upload end-of-match screenshot for AI processing
                  </p>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setScreenshotFile(e.target.files?.[0] || null)}
                    className="text-xs w-full max-w-[200px] text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary/90"
                  />
                </div>
                <Button 
                  onClick={handleUploadScreenshot}
                  disabled={!screenshotFile || uploading || !matchData}
                  className="w-full bg-primary text-white font-bold uppercase text-xs"
                >
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                  Upload Screenshot
                </Button>
                {!matchData && (
                  <p className="text-[10px] text-destructive text-center mt-2">Start the match first to upload.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
