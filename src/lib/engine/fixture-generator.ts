import type {
  Player,
  FixtureGenerationConfig,
  GeneratedGroup,
  GeneratedFixture,
  FixtureGenerationResult,
} from "@/types";

/**
 * NCL Fixture Generation Engine
 *
 * Generates groups and round-robin fixtures for a season.
 * Supports any number of players (4–100+) with configurable group sizes.
 *
 * Algorithm:
 * 1. Shuffle players (seeded or random)
 * 2. Divide into balanced groups
 * 3. Generate round-robin fixtures per group using the circle method
 * 4. Return all data for bulk insertion
 */

// ─── Seeded Random (Mulberry32) ─────────────────────────────────────────────

function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(arr: T[], randomFn: () => number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─── Group Assignment ───────────────────────────────────────────────────────

/**
 * Divides players into balanced groups.
 *
 * Strategy: Distribute players as evenly as possible.
 * Example: 13 players with groupSize=5 → 3 groups of 4 + 0 groups of 5?
 * No — we want: 2 groups of 5 + 1 group of 3 (fill groups to target size first)
 *
 * Actually the best strategy: numberOfGroups = ceil(total / groupSize)
 * Then distribute players round-robin across groups for even distribution.
 */
function assignGroups(
  players: Player[],
  groupSize: number
): GeneratedGroup[] {
  const numGroups = Math.ceil(players.length / groupSize);
  const groups: GeneratedGroup[] = [];

  for (let i = 0; i < numGroups; i++) {
    groups.push({
      name: `Group ${String.fromCharCode(65 + i)}`, // A, B, C, ...
      sortOrder: i,
      players: [],
    });
  }

  // Round-robin distribution for balance
  players.forEach((player, idx) => {
    groups[idx % numGroups].players.push(player);
  });

  return groups;
}

// ─── Round-Robin Fixture Generation (Circle Method) ─────────────────────────

/**
 * Generates round-robin fixtures for a group of players.
 * Uses the circle/polygon scheduling algorithm.
 *
 * For n players (or n+1 if odd, with a bye slot):
 * - Fix player[0] in position
 * - Rotate the rest n-2 positions per round
 * - Each round produces n/2 matches
 */
function generateRoundRobin(
  players: Player[],
  seasonId: string,
  groupIndex: number,
  matchdayOffset: number
): { fixtures: GeneratedFixture[]; nextMatchday: number } {
  const fixtures: GeneratedFixture[] = [];

  // If odd number, add a null placeholder for byes
  const isOdd = players.length % 2 !== 0;
  const slots: (Player | null)[] = [...players];
  if (isOdd) slots.push(null);

  const n = slots.length;
  const totalRounds = n - 1;

  for (let round = 0; round < totalRounds; round++) {
    for (let j = 0; j < n / 2; j++) {
      const home = slots[j];
      const away = slots[n - 1 - j];

      // Skip bye matches
      if (home && away) {
        fixtures.push({
          seasonId,
          groupIndex,
          homePlayerId: home.id,
          awayPlayerId: away.id,
          matchday: matchdayOffset + round + 1,
          stage: "group",
        });
      }
    }

    // Rotate: fix slots[0], rotate the rest
    const last = slots.pop()!;
    slots.splice(1, 0, last);
  }

  return {
    fixtures,
    nextMatchday: matchdayOffset + totalRounds,
  };
}

// ─── Validation ─────────────────────────────────────────────────────────────

function validateResult(
  players: Player[],
  result: FixtureGenerationResult
): string[] {
  const errors: string[] = [];

  // Every player should be in exactly one group
  const allGroupedPlayerIds = new Set<string>();
  for (const group of result.groups) {
    for (const p of group.players) {
      if (allGroupedPlayerIds.has(p.id)) {
        errors.push(`Player ${p.name} appears in multiple groups`);
      }
      allGroupedPlayerIds.add(p.id);
    }
  }

  for (const p of players) {
    if (!allGroupedPlayerIds.has(p.id)) {
      errors.push(`Player ${p.name} not assigned to any group`);
    }
  }

  // Check no player plays themselves
  for (const f of result.fixtures) {
    if (f.homePlayerId === f.awayPlayerId) {
      errors.push(`Fixture has player playing against themselves`);
    }
  }

  // Check expected fixture count per group
  for (let gi = 0; gi < result.groups.length; gi++) {
    const gPlayers = result.groups[gi].players.length;
    const expectedFixtures = (gPlayers * (gPlayers - 1)) / 2;
    const actualFixtures = result.fixtures.filter(
      (f) => f.groupIndex === gi
    ).length;
    if (actualFixtures !== expectedFixtures) {
      errors.push(
        `Group ${result.groups[gi].name}: expected ${expectedFixtures} fixtures, got ${actualFixtures}`
      );
    }
  }

  return errors;
}

// ─── Main Engine ────────────────────────────────────────────────────────────

export function generateFixtures(
  config: FixtureGenerationConfig
): FixtureGenerationResult {
  const { seasonId, players, groupSize, seed } = config;

  if (players.length < 2) {
    throw new Error("At least 2 players are required to generate fixtures");
  }

  if (groupSize < 3) {
    throw new Error("Group size must be at least 3");
  }

  if (groupSize > players.length) {
    throw new Error(
      `Group size (${groupSize}) cannot exceed total players (${players.length})`
    );
  }

  // 1. Shuffle
  const randomFn =
    seed !== undefined
      ? createSeededRandom(seed)
      : () => Math.random();

  const shuffled = shuffleArray(players, randomFn);

  // 2. Assign groups
  const groups = assignGroups(shuffled, groupSize);

  // 3. Generate fixtures per group with sequential matchdays
  const allFixtures: GeneratedFixture[] = [];
  let matchdayOffset = 0;

  for (let gi = 0; gi < groups.length; gi++) {
    const { fixtures, nextMatchday } = generateRoundRobin(
      groups[gi].players,
      seasonId,
      gi,
      matchdayOffset
    );
    allFixtures.push(...fixtures);
    matchdayOffset = nextMatchday;
  }

  const result: FixtureGenerationResult = {
    groups,
    fixtures: allFixtures,
    totalFixtures: allFixtures.length,
    totalGroups: groups.length,
  };

  // 4. Validate
  const errors = validateResult(players, result);
  if (errors.length > 0) {
    throw new Error(
      `Fixture generation validation failed:\n${errors.join("\n")}`
    );
  }

  return result;
}

// ─── Knockout Bracket Generation ────────────────────────────────────────────

export type KnockoutMatchup = {
  homeGroupIndex: number;
  homePosition: number; // 1-indexed (1 = group winner)
  awayGroupIndex: number;
  awayPosition: number;
  stage: "quarter_final" | "semi_final" | "final";
};

/**
 * Generates knockout bracket matchups based on number of groups.
 *
 * 2 groups → Semi-finals: A1 vs B2, B1 vs A2
 * 4 groups → Quarter-finals: A1 vs B2, C1 vs D2, B1 vs A2, D1 vs C2
 * Other → Semi-finals from top 2 per group (dynamic)
 */
export function generateKnockoutBracket(
  numGroups: number
): KnockoutMatchup[] {
  if (numGroups === 2) {
    return [
      {
        homeGroupIndex: 0,
        homePosition: 1,
        awayGroupIndex: 1,
        awayPosition: 2,
        stage: "semi_final",
      },
      {
        homeGroupIndex: 1,
        homePosition: 1,
        awayGroupIndex: 0,
        awayPosition: 2,
        stage: "semi_final",
      },
    ];
  }

  if (numGroups === 4) {
    return [
      {
        homeGroupIndex: 0,
        homePosition: 1,
        awayGroupIndex: 1,
        awayPosition: 2,
        stage: "quarter_final",
      },
      {
        homeGroupIndex: 2,
        homePosition: 1,
        awayGroupIndex: 3,
        awayPosition: 2,
        stage: "quarter_final",
      },
      {
        homeGroupIndex: 1,
        homePosition: 1,
        awayGroupIndex: 0,
        awayPosition: 2,
        stage: "quarter_final",
      },
      {
        homeGroupIndex: 3,
        homePosition: 1,
        awayGroupIndex: 2,
        awayPosition: 2,
        stage: "quarter_final",
      },
    ];
  }

  // Default: take top 2 from first N groups, generate semis
  // Cross-match: group[0] 1st vs group[last] 2nd, etc.
  const matchups: KnockoutMatchup[] = [];
  const halfGroups = Math.floor(numGroups / 2);

  for (let i = 0; i < Math.min(halfGroups, 4); i++) {
    matchups.push({
      homeGroupIndex: i,
      homePosition: 1,
      awayGroupIndex: numGroups - 1 - i,
      awayPosition: 2,
      stage: numGroups > 4 ? "quarter_final" : "semi_final",
    });
  }

  return matchups;
}
