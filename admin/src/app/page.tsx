"use client";

import React, { useState } from "react";
import HeroEditor from "@/components/HeroEditor";
import BespokeEditor from "@/components/BespokeEditor";
import FooterEditor from "@/components/FooterEditor";
import StoryEditor from "@/components/StoryEditor";
import ReviewsEditor from "@/components/ReviewsEditor";
import VideosEditor from "@/components/VideosEditor";
import ClientDiariesEditor from "@/components/ClientDiariesEditor";
import CategoryProductEditor from "@/components/CategoryProductEditor";
import SearchEditor from "@/components/SearchEditor";
import NavbarEditor from "@/components/NavbarEditor";
import { useAdminStore } from "@/store/useAdminStore";
import { Eye, Check, Menu, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";

const InstallAppButton = dynamic(() => import("@/components/InstallAppButton"), { ssr: false });

const ALLOWED_ADMINS = (
  process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'raanicloset2025@gmail.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

function isAllowedAdmin(email?: string | null): boolean {
  if (!email) return false;
  return ALLOWED_ADMINS.includes(email.trim().toLowerCase());
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("categories");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const router = useRouter();

  // Protect route client-side with robust PKCE & OAuth support
  React.useEffect(() => {
    let isMounted = true;

    // 1. Check URL parameters for OAuth errors
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get('error_description') || params.get('error');
      if (authError) {
        router.push(`/login?error=${encodeURIComponent(authError)}`);
        return;
      }
    }

    // 2. Set up auth state change listener (PKCE code exchange fires SIGNED_IN)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'SIGNED_OUT') {
          router.push("/login");
          return;
        }

        if (session) {
          const email = session.user?.email;
          if (!isAllowedAdmin(email)) {
            await supabase.auth.signOut();
            router.push("/login?error=unauthorized");
          } else {
            setIsAuthChecking(false);
            // Clean up OAuth query parameters from URL
            if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
              window.history.replaceState({}, document.title, window.location.pathname);
            }
          }
        }
      }
    );

    // 3. Inspect existing session
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!isMounted) return;

        // If URL contains an auth code or hash, wait for onAuthStateChange to exchange it
        if (
          typeof window !== 'undefined' &&
          (window.location.search.includes('code=') || window.location.hash.includes('access_token'))
        ) {
          return;
        }

        if (session) {
          const email = session.user?.email;
          if (!isAllowedAdmin(email)) {
            await supabase.auth.signOut();
            router.push("/login?error=unauthorized");
          } else {
            setIsAuthChecking(false);
          }
        } else {
          router.push("/login");
        }
      })
      .catch((err) => {
        console.error("[Admin] Session check failed:", err);
        if (isMounted) router.push("/login");
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);



  // State for Logos & Videos
  const [clothingVideo, setClothingVideo] = useState<string>("");
  const [jewelryVideo, setJewelryVideo] = useState<string>("");
  const [clothingSubtext, setClothingSubtext] = useState("Boutique");
  const [jewelrySubtext, setJewelrySubtext] = useState("High Jewels");

  const tabTitles: Record<string, string> = {
    dashboard: "Atelier Dashboard",
    navbar: "1. Navigation & Identity",
    hero: "2. Hero Canvas Editor",
    categories: "3. Categories & Catalog",
    videos: "4. Cinematic Videos Editor",
    bespoke: "5. Bespoke Atelier Editor",
    reviews: "6. Patron Reviews Editor",
    clientdiaries: "7. Client Diaries Archives",
    story: "8. Heritage Story Editor",
    footer: "9. Concierge & Footer Editor",
    search: "10. Search & Discovery",
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setPublishMessage(null);
    try {
      // Exclude functions and internal state from payload
      const stateObj = useAdminStore.getState() as any;
      const payload = Object.fromEntries(
        Object.entries(stateObj).filter(([_, v]) => typeof v !== 'function')
      );

      const res = await fetch("/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setPublishMessage("✓ Changes Published & Synced to Frontend!");
      } else {
        setPublishMessage("⚠ Failed to publish changes.");
      }
    } catch (e) {
      setPublishMessage("⚠ Network error publishing changes.");
    } finally {
      setIsPublishing(false);
      setTimeout(() => setPublishMessage(null), 4000);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("[Admin] Logout error:", e);
    } finally {
      router.push("/login");
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F0F0]">
        <div className="w-8 h-8 animate-spin rounded-full border-b-2 border-[#CBA153]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#1A1A1A] flex flex-col md:flex-row font-sans selection:bg-[#E0A29C] selection:text-white overflow-hidden">
      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#EAEAEA] flex flex-col shadow-2xl transition-transform duration-300 md:relative md:translate-x-0 shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 md:p-8 border-b border-[#EAEAEA]/50 flex justify-between items-center md:block md:text-center">
          <div>
            <h1 className="text-xl md:text-2xl font-serif tracking-[0.2em] text-[#1A0B16] uppercase font-bold">
              Raani
            </h1>
            <p className="text-[8px] tracking-[0.3em] uppercase text-[#CBA153] mt-1 md:mt-2 font-semibold">
              Atelier Command
            </p>
          </div>
          <button
            className="md:hidden text-[#1A0B16] p-2 hover:bg-[#F0F0F0] rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <SidebarButton active={activeTab === "navbar"} onClick={() => { setActiveTab("navbar"); setMobileMenuOpen(false); }} label="1. Navigation" />
          <SidebarButton active={activeTab === "hero"} onClick={() => { setActiveTab("hero"); setMobileMenuOpen(false); }} label="2. Hero Canvas" />
          <SidebarButton active={activeTab === "categories"} onClick={() => { setActiveTab("categories"); setMobileMenuOpen(false); }} label="3. Categories & Catalog" />
          <SidebarButton active={activeTab === "videos"} onClick={() => { setActiveTab("videos"); setMobileMenuOpen(false); }} label="4. Cinematic Videos" />
          <SidebarButton active={activeTab === "bespoke"} onClick={() => { setActiveTab("bespoke"); setMobileMenuOpen(false); }} label="5. Bespoke Atelier" />
          <SidebarButton active={activeTab === "reviews"} onClick={() => { setActiveTab("reviews"); setMobileMenuOpen(false); }} label="6. Patron Reviews" />
          <SidebarButton active={activeTab === "clientdiaries"} onClick={() => { setActiveTab("clientdiaries"); setMobileMenuOpen(false); }} label="7. Client Diaries" />
          <SidebarButton active={activeTab === "story"} onClick={() => { setActiveTab("story"); setMobileMenuOpen(false); }} label="8. Heritage Story" />
          <SidebarButton active={activeTab === "footer"} onClick={() => { setActiveTab("footer"); setMobileMenuOpen(false); }} label="9. Concierge & Footer" />
          <SidebarButton active={activeTab === "search"} onClick={() => { setActiveTab("search"); setMobileMenuOpen(false); }} label="10. Search & Discovery" />
          
          <div className="pt-4 mt-4 border-t border-[#EAEAEA]/50">
            <InstallAppButton variant="secondary" className="w-full text-xs" />
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative bg-[#FAFAFA] min-w-0">
        {/* Mobile Header for Admin Panel */}
        <div className="md:hidden bg-white border-b border-[#EAEAEA] p-4 flex justify-between items-center shrink-0 shadow-sm z-30">
          <div className="font-serif text-lg tracking-[0.2em] uppercase text-[#1A0B16] font-bold">Raani</div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="text-[10px] uppercase tracking-[0.2em] font-semibold border border-[#EAEAEA] px-3.5 py-1.5 rounded shadow-sm hover:bg-[#FAFAFA] transition-colors flex items-center gap-1.5"
          >
            <Menu size={14} /> Menu
          </button>
        </div>

        {/* ─── UNIFIED TOP ACTION BAR (COMMON FOR ALL SECTIONS) ─────────────────── */}
        <div className="py-3 md:h-20 border-b border-[#EAEAEA] bg-white flex flex-wrap md:flex-nowrap items-center justify-between px-4 lg:px-10 shrink-0 shadow-xs z-30 gap-3">
          <div>
            <h2 className="text-base md:text-xl font-serif text-[#1A0B16] font-bold">
              {tabTitles[activeTab] || "Atelier Command"}
            </h2>
            <p className="text-[#888] text-[9px] tracking-wide font-medium uppercase mt-0.5">
              Draft Mode · Live Sync Ready
            </p>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 w-full sm:w-auto">
            <InstallAppButton 
              variant="secondary" 
              className="flex-1 sm:flex-none justify-center px-4 lg:px-6 py-2.5 border border-[#CBA153] text-[#CBA153] text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold rounded-lg hover:bg-[#CBA153] hover:text-[#1A0B16] transition-colors flex items-center gap-2 shadow-2xs" 
            />

            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none justify-center px-4 lg:px-6 py-2.5 border border-[#EAEAEA] text-[#888] text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold rounded-lg hover:bg-[#F5F5F5] hover:text-[#1A0B16] transition-colors flex items-center gap-2 shadow-2xs"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => window.open("http://localhost:3000?preview=true", "_blank")}
              className="flex-1 sm:flex-none justify-center px-4 lg:px-6 py-2.5 border border-[#1A0B16] text-[#1A0B16] text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold rounded-lg hover:bg-[#F5F5F5] transition-colors flex items-center gap-2 shadow-2xs"
            >
              <Eye size={14} />
              <span>View Preview</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex-1 sm:flex-none justify-center px-5 lg:px-7 py-2.5 bg-[#1A0B16] text-white text-[9px] lg:text-[10px] tracking-[0.2em] uppercase font-semibold rounded-lg hover:bg-[#CBA153] hover:text-[#1A0B16] transition-colors shadow-sm flex items-center gap-2"
            >
              <Check size={14} />
              <span>{isPublishing ? "Publishing..." : "Publish"}</span>
            </button>
          </div>
        </div>

        {/* PUBLISH TOAST NOTIFICATION */}
        {publishMessage && (
          <div className="bg-[#1A0B16] text-[#CBA153] border-b border-[#CBA153]/30 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-center shadow-md animate-bounce">
            {publishMessage}
          </div>
        )}

        {/* ─── TAB CONTENT PANELS ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "categories" && <CategoryProductEditor />}

          {activeTab === "navbar" && <NavbarEditor />}

          {activeTab === "hero" && <div className="h-full overflow-y-auto"><HeroEditor /></div>}
          {activeTab === "bespoke" && <div className="h-full overflow-y-auto"><BespokeEditor /></div>}
          {activeTab === "story" && <div className="h-full overflow-y-auto pt-6"><StoryEditor /></div>}
          {activeTab === "videos" && <div className="h-full overflow-y-auto pt-6"><VideosEditor /></div>}
          {activeTab === "clientdiaries" && <div className="h-full overflow-y-auto pt-6 p-6"><ClientDiariesEditor /></div>}
          {activeTab === "reviews" && <div className="h-full overflow-y-auto pt-6"><ReviewsEditor /></div>}
          {activeTab === "search" && <div className="h-full overflow-y-auto"><SearchEditor /></div>}
          {activeTab === "footer" && <div className="h-full overflow-y-auto"><FooterEditor /></div>}
        </div>
      </main>
    </div>
  );
}

function SidebarButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-between ${
        active
          ? "bg-[#1A0B16] text-[#CBA153] shadow-md font-bold"
          : "text-[#666] hover:bg-[#F5F5F5] hover:text-[#1A0B16]"
      }`}
    >
      <span>{label}</span>
      {active && <span className="w-1.5 h-1.5 rounded-full bg-[#CBA153]" />}
    </button>
  );
}
