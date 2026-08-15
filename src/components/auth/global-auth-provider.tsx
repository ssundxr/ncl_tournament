"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

interface GlobalAuthContextType {
  user: User | null;
  loading: boolean;
}

const GlobalAuthContext = createContext<GlobalAuthContextType>({
  user: null,
  loading: true,
});

/**
 * GlobalAuthProvider — wraps the entire app to provide auth state.
 * Does NOT gate access. Does NOT sign anyone out.
 * Simply tracks whether a Firebase user is logged in.
 */
export function GlobalAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <GlobalAuthContext.Provider value={{ user, loading }}>
      {children}
    </GlobalAuthContext.Provider>
  );
}

/**
 * Hook to access the global auth state from any component.
 * Returns { user, loading }.
 */
export const useGlobalAuth = () => useContext(GlobalAuthContext);
