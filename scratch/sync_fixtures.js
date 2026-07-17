require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function syncFixtures() {
  console.log('Wiping current fixtures...');
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('fixtures').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Fetching Season, Groups and Players...');
  const { data: sData } = await supabase.from('seasons').select('id').single();
  const { data: gData } = await supabase.from('groups').select('*');
  const { data: pData } = await supabase.from('players').select('*');

  const groupA = gData.find(g => g.name === 'Group A').id;
  const groupB = gData.find(g => g.name === 'Group B').id;
  const playerIds = {};
  pData.forEach(p => playerIds[p.name] = p.id);

  const fixturesToInsert = [];

  const addMatch = (home, away, groupId, matchday) => {
    fixturesToInsert.push({
      season_id: sData.id,
      group_id: groupId,
      stage: 'group',
      home_player_id: playerIds[home],
      away_player_id: playerIds[away],
      matchday: matchday,
      status: 'scheduled'
    });
  };

  // Day 1 - Group A
  addMatch('Ashwin', 'Lakshin', groupA, 1);
  addMatch('Rahul', 'Suriya', groupA, 1);
  addMatch('Ashwin', 'Rahul', groupA, 1);
  addMatch('Lakshin', 'Newmon', groupA, 1);
  addMatch('Suriya', 'Newmon', groupA, 1);

  // Day 1 - Group B
  addMatch('Alfy', 'Abith', groupB, 1);
  addMatch('Surya', 'Jeswin', groupB, 1);
  addMatch('Alfy', 'Surya', groupB, 1);
  addMatch('Abith', 'Shyam', groupB, 1);
  addMatch('Jeswin', 'Shyam', groupB, 1);

  // Day 2 - Group A
  addMatch('Ashwin', 'Suriya', groupA, 2);
  addMatch('Rahul', 'Newmon', groupA, 2);
  addMatch('Ashwin', 'Newmon', groupA, 2);
  addMatch('Lakshin', 'Suriya', groupA, 2);
  addMatch('Lakshin', 'Rahul', groupA, 2);

  // Day 2 - Group B
  addMatch('Alfy', 'Jeswin', groupB, 2);
  addMatch('Surya', 'Shyam', groupB, 2);
  addMatch('Alfy', 'Shyam', groupB, 2);
  addMatch('Abith', 'Jeswin', groupB, 2);
  addMatch('Abith', 'Surya', groupB, 2);

  console.log('Inserting exactly', fixturesToInsert.length, 'fixtures...');
  const { error } = await supabase.from('fixtures').insert(fixturesToInsert);
  if (error) {
    console.error('Error inserting fixtures:', error);
  } else {
    console.log('SUCCESS! Fixtures are perfectly synced with the graphic.');
  }
}
syncFixtures().catch(console.error);
