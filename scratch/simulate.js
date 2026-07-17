const groupA_initial = [
  { name: 'Newmon', pts: 7, gd: 8, gf: 14, ga: 6, remaining: ['Ashwin'] },
  { name: 'Suriya', pts: 6, gd: 2, gf: 6, ga: 4, remaining: ['Ashwin', 'Lakshin'] },
  { name: 'Ashwin', pts: 3, gd: 2, gf: 3, ga: 1, remaining: ['Lakshin', 'Suriya', 'Newmon'] },
  { name: 'Lakshin', pts: 1, gd: 0, gf: 3, ga: 3, remaining: ['Ashwin', 'Suriya', 'Rahul'] },
  { name: 'Rahul', pts: 0, gd: -12, gf: 2, ga: 14, remaining: ['Lakshin'] }
];

const groupB_initial = [
  { name: 'Jeswin', pts: 9, gd: 21, gf: 23, ga: 2, remaining: ['Abith'] },
  { name: 'Alfy', pts: 6, gd: 16, gf: 21, ga: 5, remaining: ['Abith'] },
  { name: 'Abith', pts: 3, gd: 10, gf: 10, ga: 0, remaining: ['Jeswin', 'Alfy', 'Surya'] },
  { name: 'Surya', pts: 3, gd: -16, gf: 4, ga: 20, remaining: ['Abith'] },
  { name: 'Shyam', pts: 0, gd: -31, gf: 0, ga: 31, remaining: [] }
];

// Remaining matches to simulate:
// Group A:
// 1. Ashwin vs Lakshin
// 2. Ashwin vs Suriya
// 3. Ashwin vs Newmon
// 4. Lakshin vs Suriya
// 5. Lakshin vs Rahul
const matchesA = [
  { home: 'Ashwin', away: 'Lakshin' },
  { home: 'Ashwin', away: 'Suriya' },
  { home: 'Ashwin', away: 'Newmon' },
  { home: 'Lakshin', away: 'Suriya' },
  { home: 'Lakshin', away: 'Rahul' }
];

// Group B:
// 1. Alfy vs Abith
// 2. Abith vs Jeswin
// 3. Abith vs Surya
const matchesB = [
  { home: 'Alfy', away: 'Abith' },
  { home: 'Abith', away: 'Jeswin' },
  { home: 'Abith', away: 'Surya' }
];

function simulate(initialPlayers, matches) {
  const stats = {};
  initialPlayers.forEach(p => {
    stats[p.name] = { qualifyCount: 0, totalScenarios: 0 };
  });

  // Generate all possible match outcomes (3^N)
  // Outcomes: 0 (Home Win), 1 (Draw), 2 (Away Win)
  const outcomesCount = Math.pow(3, matches.length);
  
  for (let i = 0; i < outcomesCount; i++) {
    // Clone players
    const players = initialPlayers.map(p => ({ ...p }));
    
    let temp = i;
    for (let mIdx = 0; mIdx < matches.length; mIdx++) {
      const match = matches[mIdx];
      const outcome = temp % 3;
      temp = Math.floor(temp / 3);

      const homePlayer = players.find(p => p.name === match.home);
      const awayPlayer = players.find(p => p.name === match.away);

      if (outcome === 0) {
        // Home Win (we assume a nominal 1-0 win for GD/GF updates)
        homePlayer.pts += 3;
        homePlayer.gd += 1;
        homePlayer.gf += 1;
        awayPlayer.gd -= 1;
        awayPlayer.ga += 1;
      } else if (outcome === 1) {
        // Draw (0-0)
        homePlayer.pts += 1;
        awayPlayer.pts += 1;
      } else {
        // Away Win (0-1)
        awayPlayer.pts += 3;
        awayPlayer.gd += 1;
        awayPlayer.gf += 1;
        homePlayer.gd -= 1;
        homePlayer.ga += 1;
      }
    }

    // Sort standings: Points -> GD -> GF
    players.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.gd !== a.gd) return b.gd - a.gd;
      return b.gf - a.gf;
    });

    // Top 2 qualify
    const qualified = [players[0].name, players[1].name];
    qualified.forEach(name => {
      stats[name].qualifyCount++;
    });
    initialPlayers.forEach(p => {
      stats[p.name].totalScenarios++;
    });
  }

  // Calculate percentages
  const results = [];
  initialPlayers.forEach(p => {
    const pct = ((stats[p.name].qualifyCount / stats[p.name].totalScenarios) * 100).toFixed(1);
    results.push({ name: p.name, pct: parseFloat(pct), count: stats[p.name].qualifyCount, total: stats[p.name].totalScenarios });
  });

  results.sort((a, b) => b.pct - a.pct);
  return results;
}

console.log('Group A Simulation Results (chance to finish in top 2):');
console.log(simulate(groupA_initial, matchesA));

console.log('\nGroup B Simulation Results (chance to finish in top 2):');
console.log(simulate(groupB_initial, matchesB));
