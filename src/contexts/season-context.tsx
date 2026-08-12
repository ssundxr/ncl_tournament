"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSeasonById } from "@/lib/supabase/queries";

interface SeasonContextValue {
  season: any | null;
  tournament: any | null;
  isLoading: boolean;
  error: string | null;
}

const SeasonContext = createContext<SeasonContextValue>({
  season: null,
  tournament: null,
  isLoading: true,
  error: null,
});

export function SeasonProvider({
  seasonId,
  children,
}: {
  seasonId: string;
  children: React.ReactNode;
}) {
  const [season, setSeason] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!seasonId) return;
    setIsLoading(true);
    getSeasonById(seasonId)
      .then((data) => {
        setSeason(data);
        setError(null);
      })
      .catch(() => setError("Season not found."))
      .finally(() => setIsLoading(false));
  }, [seasonId]);

  return (
    <SeasonContext.Provider
      value={{
        season,
        tournament: season?.tournament ?? null,
        isLoading,
        error,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  return useContext(SeasonContext);
}
