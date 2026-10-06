"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/store/useAdminStore";

export default function DynamicFavicon() {
  const tabLogoUrl = useAdminStore((state: any) => state.tabLogoUrl);
  const clothingLogoUrl = useAdminStore((state: any) => state.clothingLogoUrl);

  useEffect(() => {
    // Priority: Tab Logo > Clothing Logo > Default
    const iconUrl = tabLogoUrl || clothingLogoUrl || "/favicon.ico";
    
    // Find the existing favicon link or create a new one
    let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    
    // Update the href
    link.href = iconUrl;
  }, [tabLogoUrl, clothingLogoUrl]);

  return null;
}
