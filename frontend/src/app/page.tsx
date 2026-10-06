import NavbarWrapper from "@/components/NavbarWrapper";
import HeroSection from "@/components/HeroSection";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import BespokeBanner from "@/components/BespokeBanner";
import RoyalVitrineReviews from "@/components/RoyalVitrineReviews";
import VideoCarousel from "@/components/VideoCarousel";
import ClientDiaries from "@/components/ClientDiaries";
import MaisonDelivery from "@/components/MaisonDelivery";
import StoryEpilogue from "@/components/StoryEpilogue";
import LuxuryFooter from "@/components/LuxuryFooter";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col selection:bg-[#E0A29C] selection:text-[#1A0B16]">
      
      {/* --- RESPONSIVE NAVBAR WRAPPER --- */}
      <NavbarWrapper />

      {/* Main Content Area */}
      <section className="flex-grow w-full pt-[85px] pb-0 flex flex-col">
        <HeroSection />
        <CategoryCarousel />
        <ProductGrid isHomePage={true} />
        <VideoCarousel />
        <BespokeBanner />
        <RoyalVitrineReviews />
        <ClientDiaries />
        <StoryEpilogue />
      </section>

      {/* Footer Area */}
      <LuxuryFooter />

    </main>
  );
}
