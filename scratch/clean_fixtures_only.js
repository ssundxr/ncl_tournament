require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function rebuild() {
  console.log('Wiping database...');
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

  console.log('Creating Groups & Leaderboards (0 Points)...');
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

  console.log('Generating Scheduled Fixtures...');
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
  
  await supabase.from('fixtures').insert(fixturesToInsert);

  console.log('SUCCESS! Database is perfectly reset with Scheduled Fixtures only.');
}
rebuild().catch(console.error);
