/**
 * Generates deterministic Match Codes for NCL Hub matches.
 * Format: NCL + T{tournament_number} + S{season_number} + {match_index_3_digits} + {stage_code}
 * Examples:
 * - NCLT1S2001G    (NCL Tournament 1, Season 2, Match 001, Group Stage)
 * - NCLT1S2002R16  (NCL Tournament 1, Season 2, Match 002, Round of 16)
 * - NCLT1S2001QF   (NCL Tournament 1, Season 2, Match 001, Quarter Final)
 * - NCLT1S2001SF   (NCL Tournament 1, Season 2, Match 001, Semi Final)
 * - NCLT1S2001F    (NCL Tournament 1, Season 2, Match 001, Final)
 */
export function generateMatchCode(fixture: {
  match_code?: string | null;
  season?: {
    number?: number | null;
    tournament?: {
      number?: number | null;
      tag?: string | null;
    } | null;
  } | null;
  season_number?: number | null;
  tournament_number?: number | null;
  matchday?: number | null;
  match_number?: number | null;
  stage?: string | null;
  id?: string | null;
}): string {
  // If match_code already exists, return it
  if (fixture.match_code) {
    return fixture.match_code;
  }

  // 1. Tournament Tag (e.g. T1, T2)
  const tNum = fixture.tournament_number || fixture.season?.tournament?.number || 1;
  const tTag = fixture.season?.tournament?.tag || `T${tNum}`;

  // 2. Season Part (e.g. S2)
  const sNum = fixture.season_number || fixture.season?.number || 2;
  const sTag = `S${sNum}`;

  // 3. Match Number (e.g. 001, 002)
  let mIndex = fixture.match_number || fixture.matchday || 1;
  if (!mIndex && fixture.id) {
    // Fallback hash index from ID if matchday not set
    mIndex = (Math.abs(fixture.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 99) + 1;
  }
  const mPadded = String(mIndex).padStart(3, "0");

  // 4. Stage Code (e.g. G, R16, QF, SF, F)
  let stageCode = "G";
  const stage = (fixture.stage || "").toLowerCase();

  if (stage.includes("quarter") || stage === "qf") {
    stageCode = "QF";
  } else if (stage.includes("semi") || stage === "sf") {
    stageCode = "SF";
  } else if (stage.includes("final") || stage === "f") {
    stageCode = "F";
  } else if (stage.includes("16") || stage.includes("round_of_16") || stage === "r16") {
    stageCode = "R16";
  } else if (stage.includes("knockout") || stage === "ko") {
    stageCode = "KO";
  } else {
    stageCode = "G";
  }

  return `NCL${tTag}${sTag}${mPadded}${stageCode}`;
}
