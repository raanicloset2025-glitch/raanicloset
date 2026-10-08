"use client";

import React from "react";
import { useAdminStore } from "@/store/useAdminStore";

import { useStore } from "@/store/useStore";

function AppInitializer() {
  React.useEffect(() => {
    useAdminStore.getState().fetchFromServer();
    useStore.getState().initAuth();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppInitializer />
      {children}
    </>
  );
}
