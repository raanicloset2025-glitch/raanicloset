import React from "react";
import BespokeForm from "@/components/BespokeForm";
import NavbarWrapper from "@/components/NavbarWrapper";
import LuxuryFooter from "@/components/LuxuryFooter";

export default function BespokePage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F9F6F0] selection:bg-[#E0A29C] selection:text-[#1A0B16]">
      <NavbarWrapper />
      
      <section className="flex-grow w-full pt-[85px]">
        <BespokeForm />
      </section>

      <LuxuryFooter />
    </main>
  );
}
