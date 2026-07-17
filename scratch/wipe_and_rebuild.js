require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function rebuild() {
  console.log('Wiping database...');
  // Wipe everything in order (due to foreign keys, or just delete tournaments and cascade takes care of it? No, players are separate)
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('fixtures').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leaderboards').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('season_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('groups').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('seasons').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tournaments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Creating Tournament & Season...');
  const { data: tData } = await supabase.from('tournaments').insert({
    name: 'Namma Champions League',
    slug: 'ncl',
    description: 'The premium tournament ecosystem for eFootball Mobile competitions.',
    status: 'active'
  }).select().single();
  
  const { data: sData } = await supabase.from('seasons').insert({
    tournament_id: tData.id,
    name: 'NCL Season 1',
    number: 1,
    status: 'active',
    start_date: new Date().toISOString()
  }).select().single();

  const playersGroupA = ['Newmon', 'Suriya', 'Ashwin', 'Lakshin', 'Rahul'];
  const playersGroupB = ['Jeswin', 'Abith', 'Shyam', 'Surya', 'Alfy'];
  const playerIds = {};

  console.log('Creating Players...');
  for (const name of [...playersGroupA, ...playersGroupB]) {
    const { data: pData, error: pErr } = await supabase.from('players').insert({
      name: name,
      slug: name.toLowerCase().replace(/\\s+/g, '-'),
    }).select().single();
    if (pErr) console.error('Error creating player', name, pErr);
    playerIds[name] = pData.id;

    await supabase.from('season_enrollments').insert({ season_id: sData.id, player_id: pData.id });
  }

  console.log('Creating Groups & Leaderboards...');
  const { data: gaData } = await supabase.from('groups').insert({ season_id: sData.id, name: 'Group A', sort_order: 1 }).select().single();
  const { data: gbData } = await supabase.from('groups').insert({ season_id: sData.id, name: 'Group B', sort_order: 2 }).select().single();

  const leaderboards = [];
  for (const name of playersGroupA) {
    leaderboards.push({ season_id: sData.id, group_id: gaData.id, player_id: playerIds[name], played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 });
  }
  for (const name of playersGroupB) {
    leaderboards.push({ season_id: sData.id, group_id: gbData.id, player_id: playerIds[name], played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 });
  }
  await supabase.from('leaderboards').insert(leaderboards);

  console.log('Generating Fixtures...');
  const fixturesToInsert = [];
  function generateRoundRobin(playersArr, groupId) {
      if (playersArr.length % 2 !== 0) playersArr.push(null);
      const rounds = playersArr.length - 1;
      const matchesPerRound = playersArr.length / 2;
      for (let round = 0; round < rounds; round++) {
          for (let match = 0; match < matchesPerRound; match++) {
              const home = playersArr[match];
              const away = playersArr[playersArr.length - 1 - match];
              if (home !== null && away !== null) {
                  fixturesToInsert.push({
                      season_id: sData.id,
                      group_id: groupId,
                      stage: 'group',
                      home_player_id: playerIds[home],
                      away_player_id: playerIds[away],
                      round: 'Group Stage',
                      matchday: round + 1,
                      status: 'scheduled'
                  });
              }
          }
          playersArr.splice(1, 0, playersArr.pop());
      }
  }
  generateRoundRobin([...playersGroupA], gaData.id);
  generateRoundRobin([...playersGroupB], gbData.id);
  
  const { data: fixData } = await supabase.from('fixtures').insert(fixturesToInsert).select();

  console.log('Recording Match Results...');
  const matches = [
    { home: 'Suriya', away: 'Rahul', hs: 3, as: 1 },
    { home: 'Newmon', away: 'Rahul', hs: 8, as: 0 },
    { home: 'Abith', away: 'Shyam', hs: 10, as: 0 },
    { home: 'Lakshin', away: 'Newmon', hs: 3, as: 3 },
    { home: 'Ashwin', away: 'Rahul', hs: 3, as: 1 },
    { home: 'Jeswin', away: 'Surya', hs: 15, as: 1 },
    { home: 'Shyam', away: 'Jeswin', hs: 0, as: 4 }
  ];

  for (const m of matches) {
    const homeId = playerIds[m.home];
    const awayId = playerIds[m.away];
    
    let fix = fixData.find(f => f.home_player_id === homeId && f.away_player_id === awayId);
    let isReversed = false;
    if (!fix) {
      fix = fixData.find(f => f.home_player_id === awayId && f.away_player_id === homeId);
      isReversed = true;
    }
    
    if (fix) {
      const hs = isReversed ? m.as : m.hs;
      const as = isReversed ? m.hs : m.as;
      
      await supabase.from('fixtures').update({ status: 'completed', home_score: hs, away_score: as }).eq('id', fix.id);
      await supabase.from('matches').insert({
        fixture_id: fix.id,
        home_player_id: fix.home_player_id,
        away_player_id: fix.away_player_id,
        home_score: hs,
        away_score: as,
        status: 'completed',
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString()
      });
    }
  }

  console.log('Recalculating Leaderboards...');
  const { data: updatedFix } = await supabase.from('fixtures').select('*').eq('status', 'completed');
  const { data: currentBoards } = await supabase.from('leaderboards').select('*');

  const newBoards = {};
  for (const b of currentBoards) {
    newBoards[b.id] = { ...b, played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0 };
  }

  for (const f of updatedFix) {
    const hBoard = Object.values(newBoards).find(b => b.player_id === f.home_player_id);
    const aBoard = Object.values(newBoards).find(b => b.player_id === f.away_player_id);
    
    if (hBoard && aBoard) {
      hBoard.played++; aBoard.played++;
      hBoard.goals_for += f.home_score; hBoard.goals_against += f.away_score;
      aBoard.goals_for += f.away_score; aBoard.goals_against += f.home_score;
      
      if (f.home_score > f.away_score) {
        hBoard.wins++; hBoard.points += 3;
        aBoard.losses++;
      } else if (f.home_score < f.away_score) {
        aBoard.wins++; aBoard.points += 3;
        hBoard.losses++;
      } else {
        hBoard.draws++; hBoard.points += 1;
        aBoard.draws++; aBoard.points += 1;
      }
    }
  }

  for (const b of Object.values(newBoards)) {
    await supabase.from('leaderboards').update({
      played: b.played,
      wins: b.wins,
      draws: b.draws,
      losses: b.losses,
      goals_for: b.goals_for,
      goals_against: b.goals_against,
      points: b.points
    }).eq('id', b.id);
  }

  console.log('SUCCESS! Database is perfectly rebuilt.');
}
rebuild().catch(console.error);
