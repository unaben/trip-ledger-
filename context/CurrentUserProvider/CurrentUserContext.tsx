"use client";

import { createContext, useContext } from "react";

export interface CurrentUser {
  id: string;
  email: string;
  role: "admin" | "user";
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: CurrentUser | null;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  const user = useContext(CurrentUserContext);
  return { user, isAdmin: user?.role === "admin" };
}
