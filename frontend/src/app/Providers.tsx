"use client";

import React from "react";
import { useAdminStore } from "@/store/useAdminStore";

function AppInitializer() {
  React.useEffect(() => {
    useAdminStore.getState().fetchFromServer();
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
