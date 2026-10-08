import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

let inFlightFetchPromise: Promise<void> | null = null;

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 1. Supporting Domain Models ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

export interface ProductCraftSpec {
  label: string; // e.g. "Material", "Origin", "Care", "Craftsmanship", "Technique"
  value: string; // e.g. "Pure Hand-Loomed Chanderi Silk", "Jaipur Atelier", "Dry Clean Only"
}

export interface Product {
  id: string; // e.g. "c1", "j1"
  title: string;
  category: string;
  type: 'clothing' | 'jewelry';
  imageSrc: string; // Primary vitrine image
  images: string[]; // Multi-angle gallery for FloatingImageGallery (minimum 3 images)
  description: string; // Editorial description on PDP
  story?: string; // Deep heritage narrative behind this piece
  craftTitle?: string; // PDP Craft section heading (default: "The Craft")
  craftText?: string; // PDP Craft section description
  craftSpecs?: ProductCraftSpec[]; // Key-value artisan specifications
  tags?: string[]; // e.g. ["Bridal", "Zari", "Handloom", "Heirloom"]
  relatedProductIds?: string[]; // Manually curated pairings (if empty, falls back to automatic by category)
  isFeatured?: boolean;
  isStarred?: boolean;   // Whether shown in homepage Signature Collection (max 4)
  starredAt?: number;    // Timestamp used to sort starred products
  isCategoryFeatured?: boolean; // Shown when its category is clicked on homepage (max 4 per category) — independent of Signature star
  categoryFeaturedAt?: number;  // Timestamp used to sort category-featured products
}

export interface CategoryItem {
  id: string;
  title: string;
  image: string;
  tagline?: string;
}

export interface VideoCard {
  id: string | number;
  video: string;
  poster: string;
  title: string;
  no: string;
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 2. Full Admin Store Interface ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

export interface AdminState {
  // --- G. About Us & Marquee ---
  showStoryEpilogue: boolean;
  setShowStoryEpilogue: (v: boolean) => void;
  aboutUsSubtitle: string;
  setAboutUsSubtitle: (v: string) => void;
  aboutUsTitle: string;
  setAboutUsTitle: (v: string) => void;
  aboutUsText: string;
  setAboutUsText: (v: string) => void;
  marqueeTextClothing: string;
  setMarqueeTextClothing: (v: string) => void;
  marqueeTextJewelry: string;
  setMarqueeTextJewelry: (v: string) => void;

  // --- A. System & Admin UI ---
  isEditMode: boolean;
  setEditMode: (v: boolean) => void;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (v: boolean) => void;
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  // --- B. Brand & Global Identity ---
  brandName: string;
  setBrandName: (v: string) => void;
  clothingToggleName: string;
  setClothingToggleName: (v: string) => void;
  jewelryToggleName: string;
  setJewelryToggleName: (v: string) => void;
  clothingLogoSubtext: string;
  setClothingLogoSubtext: (v: string) => void;
  jewelryLogoSubtext: string;
  setJewelryLogoSubtext: (v: string) => void;
  askStylistText: string;
  setAskStylistText: (v: string) => void;
  reserveText: string;
  setReserveText: (v: string) => void;
  clothingLogoUrl: string;
  setClothingLogoUrl: (v: string) => void;
  jewelryLogoUrl: string;
  setJewelryLogoUrl: (v: string) => void;
  tabLogoUrl: string | null;
  setTabLogoUrl: (v: string | null) => void;
  whatsappNumber: string;
  setWhatsappNumber: (v: string) => void;
  supportEmail: string;
  setSupportEmail: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  instagramUrl: string;
  setInstagramUrl: (v: string) => void;
  facebookUrl: string;
  setFacebookUrl: (v: string) => void;
  youtubeUrl: string;
  setYoutubeUrl: (v: string) => void;
  showSocialLinks: boolean;
  setShowSocialLinks: (v: boolean) => void;
  showAppDownload: boolean;
  setShowAppDownload: (v: boolean) => void;

  // --- C. Scene 1: Hero Section ---
  clothingHeroVideo: string;
  setClothingHeroVideo: (v: string) => void;
  clothingHeroFallbackImage: string;
  setClothingHeroFallbackImage: (v: string) => void;
  clothingHeroBg: string;
  setClothingHeroBg: (v: string) => void;
  clothingHeroLine1: string;
  setClothingHeroLine1: (v: string) => void;
  clothingHeroCursive: string;
  setClothingHeroCursive: (v: string) => void;
  clothingHeroLine3: string;
  setClothingHeroLine3: (v: string) => void;
  clothingHeroSubtext: string;
  setClothingHeroSubtext: (v: string) => void;
  clothingHeroButtonText: string;
  setClothingHeroButtonText: (v: string) => void;
  clothingHeroTitle: string; // Compatibility alias
  setClothingHeroTitle: (v: string) => void;
  clothingHeroSubtitle: string; // Compatibility alias
  setClothingHeroSubtitle: (v: string) => void;

  jewelryHeroVideo: string;
  setJewelryHeroVideo: (v: string) => void;
  jewelryHeroFallbackImage: string;
  setJewelryHeroFallbackImage: (v: string) => void;
  jewelryHeroBg: string;
  setJewelryHeroBg: (v: string) => void;
  jewelryHeroLine1: string;
  setJewelryHeroLine1: (v: string) => void;
  jewelryHeroCursive: string;
  setJewelryHeroCursive: (v: string) => void;
  jewelryHeroLine3: string;
  setJewelryHeroLine3: (v: string) => void;
  jewelryHeroSubtext: string;
  setJewelryHeroSubtext: (v: string) => void;
  jewelryHeroButtonText: string;
  setJewelryHeroButtonText: (v: string) => void;
  jewelryHeroTitle: string; // Compatibility alias
  setJewelryHeroTitle: (v: string) => void;
  jewelryHeroSubtitle: string; // Compatibility alias
  setJewelryHeroSubtitle: (v: string) => void;

  // --- D. Scene 2: Category Carousel & Collection Header ---
  clothingCategoryHeading: string;
  setClothingCategoryHeading: (v: string) => void;
  jewelryCategoryHeading: string;
  setJewelryCategoryHeading: (v: string) => void;
  clothingCollectionTitle: string;
  setClothingCollectionTitle: (v: string) => void;
  jewelryCollectionTitle: string;
  setJewelryCollectionTitle: (v: string) => void;
  clothingCategories: CategoryItem[];
  setClothingCategories: (v: CategoryItem[]) => void;
  jewelryCategories: CategoryItem[];
  setJewelryCategories: (v: CategoryItem[]) => void;
  addCategory: (item: Omit<CategoryItem, 'id'> & { id?: string }, type: 'clothing' | 'jewelry') => void;
  updateCategory: (id: string, updates: Partial<CategoryItem>, type: 'clothing' | 'jewelry') => void;
  deleteCategory: (id: string, type: 'clothing' | 'jewelry') => void;

  // --- E. Scene 3: Products Catalog & PDP Detail Manager ---
  products: Product[];
  setProducts: (v: Product[]) => void;
  addProduct: (product: Omit<Product, 'id'> & { id?: string }) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  starProduct: (id: string) => { success: boolean; message: string }; // Toggle star; max 4 limit
  unstarProduct: (id: string) => void;
  getSignatureProducts: () => Product[]; // Returns max 4 starred products sorted by starredAt desc

  // --- F. Scene 4: Bespoke Atelier ---
  bespokeEyebrow: string;
  setBespokeEyebrow: (v: string) => void;
  clothingBespokeTitle: string;
  setClothingBespokeTitle: (v: string) => void;
  jewelryBespokeTitle: string;
  setJewelryBespokeTitle: (v: string) => void;
  clothingBespokeSubtitle: string;
  setClothingBespokeSubtitle: (v: string) => void;
  jewelryBespokeSubtitle: string;
  setJewelryBespokeSubtitle: (v: string) => void;
  
  clothingBespokeVideo: string;
  setClothingBespokeVideo: (v: string) => void;
  clothingBespokeFallbackImage: string;
  setClothingBespokeFallbackImage: (v: string) => void;
  clothingBespokeBg: string;
  setClothingBespokeBg: (v: string) => void;
  
  jewelryBespokeVideo: string;
  setJewelryBespokeVideo: (v: string) => void;
  jewelryBespokeFallbackImage: string;
  setJewelryBespokeFallbackImage: (v: string) => void;
  jewelryBespokeBg: string;
  setJewelryBespokeBg: (v: string) => void;
  
  bespokeButtonText: string;
  setBespokeButtonText: (v: string) => void;
  bespokeHeading: string; // Compatibility alias
  setBespokeHeading: (v: string) => void;
  bespokeText: string; // Compatibility alias
  setBespokeText: (v: string) => void;
  bespokeHeroTitle: string;
  setBespokeHeroTitle: (v: string) => void;
  bespokeHeroSubtitle: string;
  setBespokeHeroSubtitle: (v: string) => void;
  bespokeHeroBg: string;
  setBespokeHeroBg: (v: string) => void;

  // --- G. Scene 5: Video Carousel / Cinematic Archives ---
  videoCarouselEyebrow: string;
  setVideoCarouselEyebrow: (v: string) => void;
  clothingVideoHeading: string;
  setClothingVideoHeading: (v: string) => void;
  jewelryVideoHeading: string;
  setJewelryVideoHeading: (v: string) => void;
  clothingVideos: VideoCard[];
  setClothingVideos: (v: VideoCard[]) => void;
  jewelryVideos: VideoCard[];
  setJewelryVideos: (v: VideoCard[]) => void;
  updateVideoCard: (id: string | number, updates: Partial<VideoCard>, type: 'clothing' | 'jewelry') => void;

  // --- H. Scene 6: Story, Craft & Epilogue ---
  storyHeading: string;
  setStoryHeading: (v: string) => void;
  storyText: string;
  setStoryText: (v: string) => void;
  clothingCraftText: string;
  setClothingCraftText: (v: string) => void;
  jewelryCraftText: string;
  setJewelryCraftText: (v: string) => void;
  storyEpilogueQuote: string;
  setStoryEpilogueQuote: (v: string) => void;
  storyEpilogueSignature: string;
  setStoryEpilogueSignature: (v: string) => void;
  storyEpilogueSubtext: string;
  setStoryEpilogueSubtext: (v: string) => void;

  // --- I. Scene 7: Imperial Concierge & Footer ---
  showFooterConcierge: boolean;
  setShowFooterConcierge: (v: boolean) => void;
  showFooterDirectory: boolean;
  setShowFooterDirectory: (v: boolean) => void;
  showFooterLegal: boolean;
  setShowFooterLegal: (v: boolean) => void;
  footerShowCrown: boolean;
  setFooterShowCrown: (v: boolean) => void;
  footerConciergeEyebrow: string;
  setFooterConciergeEyebrow: (v: string) => void;
  footerConciergeTitle: string;
  setFooterConciergeTitle: (v: string) => void;
  footerConciergeText: string;
  setFooterConciergeText: (v: string) => void;
  footerCta1Text: string;
  setFooterCta1Text: (v: string) => void;
  footerCta1Link: string;
  setFooterCta1Link: (v: string) => void;
  footerCta2Text: string;
  setFooterCta2Text: (v: string) => void;
  footerCta2Link: string;
  setFooterCta2Link: (v: string) => void;

  // --- L. Scene 8: Royal Patron Reviews ---
  reviewsEyebrow: string;
  setReviewsEyebrow: (v: string) => void;
  reviewsTitleNormal: string;
  setReviewsTitleNormal: (v: string) => void;
  reviewsTitleItalic: string;
  setReviewsTitleItalic: (v: string) => void;
  
  clothingReviews: any[];

  clientDiariesClothing: string[];
  setClientDiariesClothing: (urls: string[]) => void;
  clientDiariesJewelry: string[];
  setClientDiariesJewelry: (urls: string[]) => void;
  setClothingReviews: (v: any[]) => void;
  jewelryReviews: any[];
  setJewelryReviews: (v: any[]) => void;

  // Pocket Atelier / App
  footerAppEyebrow: string;
  setFooterAppEyebrow: (v: string) => void;
  footerAppTitle: string;
  setFooterAppTitle: (v: string) => void;
  footerAppText: string;
  setFooterAppText: (v: string) => void;
  qrCodeImage: string;
  setQrCodeImage: (v: string) => void;
  footerAppLink: string;
  setFooterAppLink: (v: string) => void;
  footerAppDownloadTitle: string;
  setFooterAppDownloadTitle: (v: string) => void;
  footerAppDownloadSubtext: string;
  setFooterAppDownloadSubtext: (v: string) => void;

  // Atelier Directory & Contact Channels
  footerDirectoryEyebrow: string;
  setFooterDirectoryEyebrow: (v: string) => void;
  footerDirectoryTitle: string;
  setFooterDirectoryTitle: (v: string) => void;
  addressJaipurTitle: string;
  setAddressJaipurTitle: (v: string) => void;
  addressJaipur: string;
  setAddressJaipur: (v: string) => void;
  addressDelhiTitle: string;
  setAddressDelhiTitle: (v: string) => void;
  addressDelhi: string;
  setAddressDelhi: (v: string) => void;
  footerWhatsappLabel: string;
  setFooterWhatsappLabel: (v: string) => void;

  // Bottom Legal & Copyright
  copyrightText: string;
  setCopyrightText: (v: string) => void;
  privacyText: string;
  setPrivacyText: (v: string) => void;
  privacyLink: string;
  setPrivacyLink: (v: string) => void;
  termsText: string;
  setTermsText: (v: string) => void;
  termsLink: string;
  setTermsLink: (v: string) => void;
  // --- J. Search & Discovery ---
  trendingSearchesClothing: string[];
  setTrendingSearchesClothing: (v: string[]) => void;
  trendingSearchesJewelry: string[];
  setTrendingSearchesJewelry: (v: string[]) => void;
  searchSynonyms: { [key: string]: string };
  setSearchSynonyms: (v: { [key: string]: string }) => void;

  searchCollectionsClothing: string[];
  setSearchCollectionsClothing: (v: string[]) => void;
  searchCollectionsJewelry: string[];
  setSearchCollectionsJewelry: (v: string[]) => void;
  searchSignatureClothing: string[];
  setSearchSignatureClothing: (v: string[]) => void;
  searchSignatureJewelry: string[];
  setSearchSignatureJewelry: (v: string[]) => void;

  // --- L. Admin Reset & Factory Defaults ---
  resetToDefaults: () => void;
  exportConfig: () => string;
  importConfig: (json: string) => boolean;
  fetchFromServer: () => Promise<void>;
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 3. Canonical 14 Default Masterpieces ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const defaultProducts: Product[] = [
  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Clothing (8 Pieces) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  {
    id: "c1",
    title: "Ivory Chanderi Kurta",
    category: "Simple Suits",
    type: "clothing",
    imageSrc: "/categories/simple_suit.jpg",
    images: ["/categories/simple_suit.jpg", "/categories/simple_suit.jpg", "/categories/simple_suit.jpg"],
    description: "Spun from pure hand-loomed Chanderi silk. Quiet gold thread along the neckline, crafted for daytime celebrations.",
    story: "Woven in the historic weavers' colony of Chanderi, this kurta represents understated Mughal elegance. The hand-spun silk is kissed with delicate gold zari embroidery that catches sunlight with sublime subtlety.",
    craftTitle: "The Craft",
    craftText: "Rooted in centuries of heritage, every thread tells a story of dedication, carrying the weight of tradition and the lightness of modern elegance.",
    craftSpecs: [
      { label: "Material", value: "Pure Hand-Loomed Chanderi Silk" },
      { label: "Origin", value: "Woven in Madhya Pradesh" },
      { label: "Care", value: "Dry Clean Only" },
      { label: "Technique", value: "Fine Zari Thread Weave" }
    ],
    tags: ["Chanderi", "Silk", "Heritage", "Ivory"],
    isFeatured: true
  },
  {
    id: "c2",
    title: "Mustard Chanderi Suit",
    category: "Simple Suits",
    type: "clothing",
    imageSrc: "/categories/simple_suit.jpg",
    images: ["/categories/simple_suit.jpg", "/categories/simple_suit.jpg", "/categories/simple_suit.jpg"],
    description: "Bright mustard chanderi silk. Soft, breathable, made to celebrate milestones with elegant gold work.",
    story: "A radiant festive hue inspired by golden mustard fields of Punjab. Tailored with relaxed luxury for daytime celebrations and celebratory sangeets.",
    craftTitle: "The Craft",
    craftText: "Hand-spun silk yarn dipped in botanical turmeric dyes, interwoven with pure metallic threads.",
    craftSpecs: [
      { label: "Material", value: "Chanderi Silk & Mulmul Lining" },
      { label: "Origin", value: "Handcrafted in Rajasthan" },
      { label: "Care", value: "Dry Clean Only" },
      { label: "Weave", value: "Fine Sheer Texture" }
    ],
    tags: ["Mustard", "Festive", "Chanderi"],
    isFeatured: true
  },
  {
    id: "a1",
    title: "Emerald Silk Anarkali",
    category: "Party Wear Suits",
    type: "clothing",
    imageSrc: "/categories/party_wear.jpg",
    images: ["/categories/party_wear.jpg", "/categories/party_wear.jpg", "/categories/party_wear.jpg"],
    description: "Rich emerald green silk anarkali. Traditional golden zardozi embroidery that lingers in memory.",
    story: "Drawing from Awadhi court costumes, the 32-kali flare creates a dramatic sweep of movement. The neckline is heavily hand-embroidered in real metallic sequins and copper dabka.",
    craftTitle: "The Craft",
    craftText: "Over 180 hours of meticulous zardozi hand embroidery executed on a classic wooden adda frame.",
    craftSpecs: [
      { label: "Material", value: "Pure Banarasi Silk & Organza" },
      { label: "Origin", value: "Embroidered in Old Delhi" },
      { label: "Care", value: "Dry Clean in Protective Muslin" },
      { label: "Embroidery", value: "Copper Dabka & Zardozi" }
    ],
    tags: ["Anarkali", "Emerald", "Zardozi", "Party Wear"],
    isFeatured: true
  },
  {
    id: "a2",
    title: "Midnight Velvet Lehenga",
    category: "Party Wear Suits",
    type: "clothing",
    imageSrc: "/categories/party_wear.jpg",
    images: ["/categories/party_wear.jpg", "/categories/party_wear.jpg", "/categories/party_wear.jpg"],
    description: "Deep midnight blue velvet lehenga. Heavy golden work, perfect for weddings and royal celebrations.",
    story: "Rich silk velvet dyed to the deep obsidian of Rajasthan's midnight desert skies. Adorned with antique gold kasab and micro-pearl borders.",
    craftTitle: "The Craft",
    craftText: "Heavyweight plush silk-velvet structured with stiffened canvas interlining for a majestic silhouette.",
    craftSpecs: [
      { label: "Material", value: "Silk Velvet with Silk Lining" },
      { label: "Origin", value: "Jaipur Atelier" },
      { label: "Care", value: "Specialist Dry Clean" },
      { label: "Silhouette", value: "Full Flare Regal Lehenga" }
    ],
    tags: ["Velvet", "Lehenga", "Midnight", "Royal"],
    isFeatured: true
  },
  {
    id: "a3",
    title: "Crimson Bridal Lehenga",
    category: "Party Wear Suits",
    type: "clothing",
    imageSrc: "/categories/party_wear.jpg",
    images: ["/categories/party_wear.jpg", "/categories/party_wear.jpg", "/categories/party_wear.jpg"],
    description: "A magnificent crimson lehenga woven for the most sacred of celebrations. Intricate gold zari throughout.",
    story: "The crown jewel of our bridal trousseau. Crafted over four months by generational artisans, each motif symbolizes eternity and auspicious beginnings.",
    craftTitle: "The Craft",
    craftText: "Master craftsmen spend 300+ hours weaving real gold-plated silver zari into pure crimson silk.",
    craftSpecs: [
      { label: "Material", value: "Pure Mulberry Silk & Gold Zari" },
      { label: "Origin", value: "Varanasi Heritage Looms" },
      { label: "Care", value: "Store in Archival Cotton Box" },
      { label: "Motif", value: "Traditional Mayur & Floral Jaal" }
    ],
    tags: ["Bridal", "Crimson", "Zari", "Trousseau"],
    isFeatured: true
  },
  {
    id: "v1",
    title: "Rose Silk Kurti",
    category: "Kurtis",
    type: "clothing",
    imageSrc: "/categories/kurti.jpg",
    images: ["/categories/kurti.jpg", "/categories/kurti.jpg", "/categories/kurti.jpg"],
    description: "Soft rose pink silk kurti with minimal elegant details. A quiet luxury piece for effortless daily grace.",
    story: "A study in minimalist poise. Soft powder-pink raw silk tailored into a relaxed silhouette with mother-of-pearl button detailing.",
    craftTitle: "The Craft",
    craftText: "Woven on small-batch pit looms to achieve a tactile raw slub texture that breathes effortlessly.",
    craftSpecs: [
      { label: "Material", value: "Raw Mulberry Silk" },
      { label: "Origin", value: "Bengaluru Looms" },
      { label: "Care", value: "Gentle Hand Wash or Dry Clean" },
      { label: "Fit", value: "Straight Atelier Cut" }
    ],
    tags: ["Kurti", "Rose Pink", "Quiet Luxury"],
    isFeatured: true
  },
  {
    id: "v2",
    title: "Maroon Velvet Kurti",
    category: "Kurtis",
    type: "clothing",
    imageSrc: "/categories/kurti.jpg",
    images: ["/categories/kurti.jpg", "/categories/kurti.jpg", "/categories/kurti.jpg"],
    description: "Premium maroon velvet kurti. Rich, tactile fabric that stands out purely through its quiet elegance.",
    story: "An opulent deep garnet kurti with a tailored mandarin collar and discreet gold cord piping along the cuffs.",
    craftTitle: "The Craft",
    craftText: "Pure plush velvet accented with antique copper wire work along the side slits.",
    craftSpecs: [
      { label: "Material", value: "Plush Velvet" },
      { label: "Origin", value: "Jaipur Atelier" },
      { label: "Care", value: "Dry Clean Only" },
      { label: "Detailing", value: "Hand Cord Piping" }
    ],
    tags: ["Kurti", "Maroon", "Velvet"],
    isFeatured: false
  },
  {
    id: "c3",
    title: "Pastel Georgette Suit",
    category: "Simple Suits",
    type: "clothing",
    imageSrc: "/categories/simple_suit.jpg",
    images: ["/categories/simple_suit.jpg", "/categories/simple_suit.jpg", "/categories/simple_suit.jpg"],
    description: "Delicate pastel georgette with hand-embroidered yoke. Light as a summer breeze, made for gentle occasions.",
    story: "Airy pure viscose georgette dyed in a soothing sage pastel hue, accented with delicate chikankari-inspired shadow work.",
    craftTitle: "The Craft",
    craftText: "Lightweight, breathable weave finished with scalloped hand-cut lace borders.",
    craftSpecs: [
      { label: "Material", value: "Pure Viscose Georgette" },
      { label: "Origin", value: "Lucknow & Jaipur" },
      { label: "Care", value: "Gentle Dry Clean" },
      { label: "Weave", value: "Featherlight Georgette" }
    ],
    tags: ["Pastel", "Georgette", "Summer", "Chikankari"],
    isFeatured: false
  },

  // ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Jewelry (6 Pieces) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
  {
    id: "j1",
    title: "Kundan Choker Set",
    category: "Polki Sets",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
    images: [
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
      "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg"
    ],
    description: "An opulent Kundan choker featuring uncut diamonds set in 22K gold. Paired with matching jhumkas and a delicate maang tikka.",
    story: "Preserved through centuries of royal patronage, this choker showcases Jaipur's signature Meenakari enamel on the reverse and uncut Polki on the obverse.",
    craftTitle: "The Craft",
    craftText: "Each piece is an act of devotion. Our master craftsmen spend weeks perfecting the placement of each stone, preserving an art form that has graced the necks of queens.",
    craftSpecs: [
      { label: "Material", value: "22K Gold & Uncut Polki Diamonds" },
      { label: "Origin", value: "Handcrafted in Johari Bazaar, Jaipur" },
      { label: "Care", value: "Store in Velvet Pouch away from moisture" },
      { label: "Setting", value: "Traditional Jadau Setting with Emerald Drops" }
    ],
    tags: ["Kundan", "Polki", "Choker", "Bridal"],
    isFeatured: true
  },
  {
    id: "j2",
    title: "Polki Diamond Rani Haar",
    category: "Polki Sets",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Magnificent polki diamond rani haar with natural uncut stones. A heirloom piece that carries generations of royal elegance.",
    story: "Worn over heavy bridal silhouettes, this tiered necklace cascades gracefully across the collarbone, anchored by Colombian emerald droplets.",
    craftTitle: "The Craft",
    craftText: "Master craftsmen spend over 200 hours carving fine gold foils to hold syndicate polki diamonds in place without prongs.",
    craftSpecs: [
      { label: "Material", value: "22K Hallmarked Gold, Uncut Diamonds" },
      { label: "Origin", value: "Bikaner Royal Court Tradition" },
      { label: "Care", value: "Wipe gently with micro-suede after wear" },
      { label: "Gemstones", value: "Colombian Emerald Droplets" }
    ],
    tags: ["Rani Haar", "Polki", "Heirloom"],
    isFeatured: true
  },
  {
    id: "j3",
    title: "Emerald Jadau Bangles",
    category: "Diamond Chokers",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Hand-crafted jadau bangles set with natural emeralds and 22K gold. The jadau technique requires 40+ hours of master craftsmanship.",
    story: "Classic elephant-head finials with ruby eyes, interlocking seamlessly for an ergonomic wrist fit.",
    craftTitle: "The Craft",
    craftText: "Chased and repoussÃƒÆ’Ã‚Â©d 22K gold with closed-back foil-set gemstones.",
    craftSpecs: [
      { label: "Material", value: "22K Gold, Natural Emeralds, Rubies" },
      { label: "Origin", value: "Jaipur Jewels" },
      { label: "Care", value: "Store in custom suede box" },
      { label: "Clasp", value: "Concealed Screw Lock Mechanism" }
    ],
    tags: ["Jadau", "Bangles", "Emerald"],
    isFeatured: true
  },
  {
    id: "j4",
    title: "Pearl Mathapatti",
    category: "Diamond Chokers",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Cascading pearl mathapatti with gold findings. Drapes gracefully across the forehead, completing a bridal look with quiet grandeur.",
    story: "Inspired by Rajput maharanis, this headpiece balances multi-strand Basra pearls with a central polki crescent crest.",
    craftTitle: "The Craft",
    craftText: "Hand-strung with pure silk thread using micro-drilled saltwater pearls.",
    craftSpecs: [
      { label: "Material", value: "Saltwater Pearls & 22K Gold Foil" },
      { label: "Origin", value: "Hyderabad & Jaipur Guilds" },
      { label: "Care", value: "Keep away from perfumes and hairsprays" },
      { label: "Drape", value: "Three-Tiered Bridal Arch" }
    ],
    tags: ["Mathapatti", "Pearl", "Bridal", "Headpiece"],
    isFeatured: false
  },
  {
    id: "j5",
    title: "Gold Filigree Earrings",
    category: "Temple Jewelry",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Delicate 22K gold filigree jhumkas with turquoise accents. Lightweight yet impactful, crafted in the Rajasthani tradition.",
    story: "Pliable gold threads twisted and soldered into lace-like filigree bells that chime with every movement.",
    craftTitle: "The Craft",
    craftText: "Ancient filigree wire drawing requiring 0.2mm gold threads shaped entirely by tweezers.",
    craftSpecs: [
      { label: "Material", value: "22K Yellow Gold, Persian Turquoise" },
      { label: "Origin", value: "Cuttack & Jaipur Guilds" },
      { label: "Care", value: "Store individually in air-tight pouch" },
      { label: "Weight", value: "Featherlight Atelier Design" }
    ],
    tags: ["Filigree", "Earrings", "Jhumka", "Temple Jewelry"],
    isFeatured: false
  },
  {
    id: "j6",
    title: "Antique Chandbali Set",
    category: "Temple Jewelry",
    type: "jewelry",
    imageSrc: "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: [
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800",
      "https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800"
    ],
    description: "Statement antique gold chandbali earrings with real ruby drops. Inspired by Mughal court jewellery traditions.",
    story: "The crescent moon motif, a symbol of royal grace, adorned with uncut diamonds and cluster seed pearl fringe.",
    craftTitle: "The Craft",
    craftText: "RepoussÃƒÆ’Ã‚Â© worked gold with antique hand-patination and micro-claw set Burmese rubies.",
    craftSpecs: [
      { label: "Material", value: "22K Antique Patinated Gold, Natural Rubies" },
      { label: "Origin", value: "Jaipur Heritage Vault" },
      { label: "Care", value: "Avoid contact with water and abrasives" },
      { label: "Motif", value: "Crescent Moon Chandbali" }
    ],
    tags: ["Chandbali", "Ruby", "Antique", "Mughal"],
    isFeatured: true
  }
];

const defaultClothingCategories: CategoryItem[] = [
  { id: '1', title: 'Simple Suits', image: '/categories/simple_suit.jpg', tagline: 'Chanderi & Organza Silhouettes' },
  { id: '2', title: 'Party Wear Suits', image: '/categories/party_wear.jpg', tagline: 'Zardozi & Silk Anarkalis' },
  { id: '3', title: 'Kurtis', image: '/categories/kurti.jpg', tagline: 'Everyday Atelier Grace' }
];

const defaultJewelryCategories: CategoryItem[] = [
  { id: '1', title: 'Polki Sets', image: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg', tagline: 'Uncut Syndicate Diamonds' },
  { id: '2', title: 'Diamond Chokers', image: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg', tagline: 'High Jewel Collars' },
  { id: '3', title: 'Temple Jewelry', image: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg', tagline: '22K Antique Filigree' }
];

const defaultClothingVideos: VideoCard[] = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/bespoke_bg.jpg', title: 'The Royal Drape', no: 'NÃƒâ€šÃ‚Âº 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-suit.jpg', title: 'Mastercraft Zardozi', no: 'NÃƒâ€šÃ‚Âº 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: '/hero-rose-pink.jpg', title: 'Heirloom Trousseau', no: 'NÃƒâ€šÃ‚Âº 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1113554/pexels-photo-1113554.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'The Loom Heritage', no: 'NÃƒâ€šÃ‚Âº 04' }
];

const defaultJewelryVideos: VideoCard[] = [
  { id: 1, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Polki Diamonds', no: 'J 01' },
  { id: 2, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Ruby Choker', no: 'J 02' },
  { id: 3, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Emerald Cascade', no: 'J 03' },
  { id: 4, video: 'https://www.w3schools.com/html/mov_bbb.mp4', poster: 'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800', title: 'Kundan Heritage', no: 'J 04' }
];

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ 4. Zustand Store Creation ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬

const defaultClothingReviews = [
  {
    id: "rev-c1",
    patron: "Maharani Gayatri D.",
    city: "Jaipur & London",
    role: "Bespoke Bridal Patron",
    bespokeOrder: "Heirloom Raw Silk Lehenga",
    date: "Autumn Couture",
    rating: 5,
    quote: "The craftsmanship felt less like tailoring and more like an archival restoration of royal heritage.",
    testimony: "Wearing the 24-karat gold dipped zardozi embroidery for my wedding felt historic. The drape of the Chanderi silk and the weight of the hand-spun borders were extraordinary. Truly a museum-worthy creation.",
    monogram: "GD",
    profilePhoto: "",
  },
  {
    id: "rev-c2",
    patron: "Dr. Rohini Sen",
    city: "Kolkata & Paris",
    role: "Private Client",
    bespokeOrder: "Sindoor Crimson Velvet Sherwani",
    date: "Spring Soirée",
    rating: 5,
    quote: "An impeccable silhouette that commands reverence without ever whispering a word.",
    testimony: "Every seam is lined with mulberry silk, and the hand-embroidered peacocks along the sleeve cuffs caught every ray of gallery light. The fitting session in the bespoke atelier set a new standard of luxury.",
    monogram: "RS",
    profilePhoto: "",
  },
  {
    id: "rev-c3",
    patron: "Devika Somani",
    city: "Lake Como",
    role: "Trousseau Collector",
    bespokeOrder: "Ivory Zardozi Kalidar",
    date: "Winter Gala",
    rating: 5,
    quote: "Under the arches of Villa d’Este, the antique dabka work glowed in breath-taking unison.",
    testimony: "It is extraordinarily rare for a maison to master the loom with such aristocratic pedigree. Raani Closet does not create seasonal couture—they craft living heirlooms to be passed between generations.",
    monogram: "DS",
    profilePhoto: "",
  },
  {
    id: "rev-c4",
    patron: "Nawabzadi Shireen B.",
    city: "New Delhi",
    role: "Heritage Commission",
    bespokeOrder: "Bespoke Heirloom Trousseau",
    date: "Summer Gala",
    rating: 5,
    quote: "The bespoke journey felt like an intimate royal ceremony from the first sketch.",
    testimony: "From our inaugural sketches in the private salon to the final knot hand-stitched by fifth-generation Jaipur karigars. They immortalized our family’s memoirs in silk and quiet opulence.",
    monogram: "SB",
    profilePhoto: "",
  },
];

const defaultJewelryReviews = [
  {
    id: "rev-j1",
    patron: "Aanya Singhania",
    city: "Mumbai & Dubai",
    role: "High Jewelry Collector",
    bespokeOrder: "Basra Pearl Polki Choker",
    date: "Winter Gala",
    rating: 5,
    quote: "The vitrine packaging was breathless; the jewelry itself captured centuries of Mewar artistry.",
    testimony: "The polki stones possess an untreated, luminous glow that synthetic modern jewelry cannot recreate. The custom velvet case and hand-written atelier certificate made the commissioning unforgettable.",
    monogram: "AS",
    profilePhoto: "",
  },
  {
    id: "rev-j2",
    patron: "Priya Rajawat",
    city: "Rajasthan",
    role: "Bridal Patron",
    bespokeOrder: "Archival Jadau Matha Patti",
    date: "Autumn Wedding",
    rating: 5,
    quote: "Wearing Raani Closet high jewelry is not an adornment; it is carrying sovereign grace.",
    testimony: "Each uncut diamond sits cradled in pure 22-karat jadau foil, anchored by deep Zambian emerald drops that feel plucked from an imperial treasury. Absolute perfection in every facet.",
    monogram: "PR",
    profilePhoto: "",
  },
  {
    id: "rev-j3",
    patron: "Lady Mehra",
    city: "London",
    role: "Private Vault Client",
    bespokeOrder: "Vintage Emerald Cascade",
    date: "Spring Soirée",
    rating: 5,
    quote: "Quiet luxury at its highest echelon. Every raw emerald droplet speaks of generational mastery.",
    testimony: "The bespoke consultation process was discreet, deeply knowledgeable, and highly personalized. The final necklace is the crown jewel of our family estate.",
    monogram: "LM",
    profilePhoto: "",
  },
  {
    id: "rev-j4",
    patron: "Tara Jaiswal",
    city: "Jaipur",
    role: "Heritage Commission",
    bespokeOrder: "Royal Nizam Polki Set",
    date: "Summer Gala",
    rating: 5,
    quote: "The uncut syndicate Polki commands the room with subtle, commanding fire.",
    testimony: "Flawless setting and museum-grade finishing. The artisans truly understand how to marry antique Kundan techniques with a modern, breathable silhouette that rests perfectly on the collarbone.",
    monogram: "TJ",
    profilePhoto: "",
  },
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // --- L. Scene 8: Royal Patron Reviews ---
      reviewsEyebrow: 'The Patron Chronicles',
      setReviewsEyebrow: (v) => set({ reviewsEyebrow: v, hasUnsavedChanges: true }),
      reviewsTitleNormal: 'Voices of the',
      setReviewsTitleNormal: (v) => set({ reviewsTitleNormal: v, hasUnsavedChanges: true }),
      reviewsTitleItalic: 'Royal Patrons',
      setReviewsTitleItalic: (v) => set({ reviewsTitleItalic: v, hasUnsavedChanges: true }),
      
      clothingReviews: defaultClothingReviews,

      clientDiariesClothing: [
        '/hero-suit.jpg',
        '/bespoke_bg.jpg',
        'https://images.pexels.com/photos/1035683/pexels-photo-1035683.jpeg?auto=compress&cs=tinysrgb&w=800',
        '/hero-rose-pink.jpg'
      ],
      setClientDiariesClothing: (v) => set({ clientDiariesClothing: v, hasUnsavedChanges: true }),
      clientDiariesJewelry: [
        'https://images.pexels.com/photos/1454171/pexels-photo-1454171.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=800',
        'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=800'
      ],
      setClientDiariesJewelry: (v) => set({ clientDiariesJewelry: v, hasUnsavedChanges: true }),
      setClothingReviews: (v) => set({ clothingReviews: v, hasUnsavedChanges: true }),
      jewelryReviews: defaultJewelryReviews,
      setJewelryReviews: (v) => set({ jewelryReviews: v, hasUnsavedChanges: true }),

      // --- G. About Us & Marquee ---
      showStoryEpilogue: true,
        setShowStoryEpilogue: (v) => set({ showStoryEpilogue: v, hasUnsavedChanges: true }),
        aboutUsSubtitle: 'Raani Closet Atelier',
        setAboutUsSubtitle: (v) => set({ aboutUsSubtitle: v, hasUnsavedChanges: true }),
        aboutUsTitle: 'Our Heritage',
      setAboutUsTitle: (v) => set({ aboutUsTitle: v, hasUnsavedChanges: true }),
      aboutUsText: 'Since our inception, we have been committed to preserving the royal heritage of Indian craftsmanship. Every piece is an act of devotion, meticulously created by master artisans.',
      setAboutUsText: (v) => set({ aboutUsText: v, hasUnsavedChanges: true }),
      marqueeTextClothing: 'ROYAL ELEGANCE ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ MASTER CRAFTED ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ BESPOKE SILHOUETTES',
      setMarqueeTextClothing: (v) => set({ marqueeTextClothing: v, hasUnsavedChanges: true }),
      marqueeTextJewelry: 'POLKI HERITAGE ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ SYNDICATE DIAMONDS ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ ROYAL HEIRLOOMS',
      setMarqueeTextJewelry: (v) => set({ marqueeTextJewelry: v, hasUnsavedChanges: true }),

      // --- A. System & Admin UI ---
      isEditMode: false,
      setEditMode: (v) => set({ isEditMode: v }),
      hasUnsavedChanges: false,
      setHasUnsavedChanges: (v) => set({ hasUnsavedChanges: v }),
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      // --- B. Brand & Global Identity ---
      brandName: 'Raani Closet',
      setBrandName: (v) => set({ brandName: v, hasUnsavedChanges: true }),
      clothingToggleName: 'Boutique',
      setClothingToggleName: (v) => set({ clothingToggleName: v, hasUnsavedChanges: true }),
      jewelryToggleName: 'Jewelry',
      setJewelryToggleName: (v) => set({ jewelryToggleName: v, hasUnsavedChanges: true }),
      clothingLogoSubtext: 'Boutique',
      setClothingLogoSubtext: (v) => set({ clothingLogoSubtext: v, hasUnsavedChanges: true }),
      jewelryLogoSubtext: 'High Jewels',
      setJewelryLogoSubtext: (v) => set({ jewelryLogoSubtext: v, hasUnsavedChanges: true }),
      askStylistText: 'Ask Stylist on WhatsApp',
      setAskStylistText: (v) => set({ askStylistText: v, hasUnsavedChanges: true }),
      reserveText: 'Reserve',
      setReserveText: (v) => set({ reserveText: v, hasUnsavedChanges: true }),
      clothingLogoUrl: '/raani-logo-new.png',
      setClothingLogoUrl: (v) => set({ clothingLogoUrl: v, hasUnsavedChanges: true }),
      jewelryLogoUrl: '/raani-logo-new.png',
      setJewelryLogoUrl: (v) => set({ jewelryLogoUrl: v, hasUnsavedChanges: true }),
      tabLogoUrl: null,
      setTabLogoUrl: (v) => set({ tabLogoUrl: v, hasUnsavedChanges: true }),
      whatsappNumber: '919876543210',
      setWhatsappNumber: (v) => set({ whatsappNumber: v, hasUnsavedChanges: true }),
      supportEmail: 'concierge@raanicloset.com',
      setSupportEmail: (v) => set({ supportEmail: v, hasUnsavedChanges: true }),
      contactPhone: '+91 141 256 7890',
      setContactPhone: (v) => set({ contactPhone: v, hasUnsavedChanges: true }),
      instagramUrl: 'https://instagram.com',
      setInstagramUrl: (v) => set({ instagramUrl: v, hasUnsavedChanges: true }),
      facebookUrl: 'https://facebook.com',
      setFacebookUrl: (v) => set({ facebookUrl: v, hasUnsavedChanges: true }),
      youtubeUrl: 'https://youtube.com',
      setYoutubeUrl: (v) => set({ youtubeUrl: v, hasUnsavedChanges: true }),
      showSocialLinks: true,
      setShowSocialLinks: (v) => set({ showSocialLinks: v, hasUnsavedChanges: true }),
      showAppDownload: true,
      setShowAppDownload: (v) => set({ showAppDownload: v, hasUnsavedChanges: true }),

      // --- C. Scene 1: Hero Section ---
      clothingHeroVideo: '',
      setClothingHeroVideo: (v) => set({ clothingHeroVideo: v, hasUnsavedChanges: true }),
      clothingHeroFallbackImage: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',
      setClothingHeroFallbackImage: (v) => set({ clothingHeroFallbackImage: v, clothingHeroBg: v, hasUnsavedChanges: true }),
      clothingHeroBg: 'https://images.pexels.com/photos/291762/pexels-photo-291762.jpeg',
      setClothingHeroBg: (v) => set({ clothingHeroBg: v, clothingHeroFallbackImage: v, hasUnsavedChanges: true }),
      clothingHeroLine1: 'Where Elegance',
      setClothingHeroLine1: (v) => set({ clothingHeroLine1: v, clothingHeroTitle: v, hasUnsavedChanges: true }),
      clothingHeroCursive: 'Meets Tradition',
      setClothingHeroCursive: (v) => set({ clothingHeroCursive: v, clothingHeroSubtitle: v, hasUnsavedChanges: true }),
      clothingHeroLine3: 'Royal Heritage Collection',
      setClothingHeroLine3: (v) => set({ clothingHeroLine3: v, hasUnsavedChanges: true }),
      clothingHeroSubtext: 'Building Communities. Not Just Clients.',
      setClothingHeroSubtext: (v) => set({ clothingHeroSubtext: v, hasUnsavedChanges: true }),
      clothingHeroButtonText: 'Book Custom',
      setClothingHeroButtonText: (v) => set({ clothingHeroButtonText: v, hasUnsavedChanges: true }),
      clothingHeroTitle: 'Where Elegance',
      setClothingHeroTitle: (v) => set({ clothingHeroTitle: v, clothingHeroLine1: v, hasUnsavedChanges: true }),
      clothingHeroSubtitle: 'Meets Tradition',
      setClothingHeroSubtitle: (v) => set({ clothingHeroSubtitle: v, clothingHeroCursive: v, hasUnsavedChanges: true }),

      jewelryHeroVideo: 'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4',
      setJewelryHeroVideo: (v) => set({ jewelryHeroVideo: v, hasUnsavedChanges: true }),
      jewelryHeroFallbackImage: 'https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg',
      setJewelryHeroFallbackImage: (v) => set({ jewelryHeroFallbackImage: v, jewelryHeroBg: v, hasUnsavedChanges: true }),
      jewelryHeroBg: 'https://assets.mixkit.co/videos/preview/mixkit-sparkling-jewelry-on-a-black-background-34354-large.mp4',
      setJewelryHeroBg: (v) => set({ jewelryHeroBg: v, jewelryHeroFallbackImage: v, hasUnsavedChanges: true }),
      jewelryHeroLine1: 'High Jewels',
      setJewelryHeroLine1: (v) => set({ jewelryHeroLine1: v, jewelryHeroTitle: v, hasUnsavedChanges: true }),
      jewelryHeroCursive: 'The Art of Adornment',
      setJewelryHeroCursive: (v) => set({ jewelryHeroCursive: v, jewelryHeroSubtitle: v, hasUnsavedChanges: true }),
      jewelryHeroLine3: 'Imperial Vault Edition',
      setJewelryHeroLine3: (v) => set({ jewelryHeroLine3: v, hasUnsavedChanges: true }),
      jewelryHeroSubtext: 'Heirlooms Crafted for Eternity.',
      setJewelryHeroSubtext: (v) => set({ jewelryHeroSubtext: v, hasUnsavedChanges: true }),
      jewelryHeroButtonText: 'Explore Vault',
      setJewelryHeroButtonText: (v) => set({ jewelryHeroButtonText: v, hasUnsavedChanges: true }),
      jewelryHeroTitle: 'High Jewels',
      setJewelryHeroTitle: (v) => set({ jewelryHeroTitle: v, jewelryHeroLine1: v, hasUnsavedChanges: true }),
      jewelryHeroSubtitle: 'The Art of Adornment',
      setJewelryHeroSubtitle: (v) => set({ jewelryHeroSubtitle: v, jewelryHeroCursive: v, hasUnsavedChanges: true }),

      // --- D. Scene 2: Category Carousel & Collection Header ---
      clothingCategoryHeading: 'Suit',
      setClothingCategoryHeading: (v) => set({ clothingCategoryHeading: v, hasUnsavedChanges: true }),
      jewelryCategoryHeading: 'Jewels',
      setJewelryCategoryHeading: (v) => set({ jewelryCategoryHeading: v, hasUnsavedChanges: true }),
      clothingCollectionTitle: 'Curated Silhouettes',
      setClothingCollectionTitle: (v) => set({ clothingCollectionTitle: v, hasUnsavedChanges: true }),
      jewelryCollectionTitle: 'The Jewel Vault',
      setJewelryCollectionTitle: (v) => set({ jewelryCollectionTitle: v, hasUnsavedChanges: true }),
      clothingCategories: defaultClothingCategories,
      setClothingCategories: (v) => set({ clothingCategories: v, hasUnsavedChanges: true }),
      jewelryCategories: defaultJewelryCategories,
      setJewelryCategories: (v) => set({ jewelryCategories: v, hasUnsavedChanges: true }),

      addCategory: (item, type) => set((state) => {
        const newCat = { ...item, id: item.id || `cat_${Date.now()}` };
        return type === 'clothing'
          ? { clothingCategories: [...state.clothingCategories, newCat], hasUnsavedChanges: true }
          : { jewelryCategories: [...state.jewelryCategories, newCat], hasUnsavedChanges: true };
      }),
      updateCategory: (id, updates, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingCategories' : 'jewelryCategories';
        const arr = state[key];
        const index = arr.findIndex(c => c.id === id);
        
        if (index > -1) {
          const oldTitle = arr[index].title;
          const newArr = [...arr];
          newArr[index] = { ...newArr[index], ...updates };

          let newProds = state.products;
          if (updates.title && updates.title !== oldTitle) {
            newProds = state.products.map(p => 
              (p.type === type && p.category === oldTitle) 
                ? { ...p, category: updates.title as string } 
                : p
            );
          }

          return {
            [key]: newArr,
            products: newProds,
            hasUnsavedChanges: true,
          };
        }
        return state;
      }),
      deleteCategory: (id, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingCategories' : 'jewelryCategories';
        return {
          [key]: state[key].filter((c) => c.id !== id),
          hasUnsavedChanges: true,
        };
      }),

      // --- E. Scene 3: Products Catalog & PDP Detail Manager ---
      products: defaultProducts,
      setProducts: (v) => set({ products: v, hasUnsavedChanges: true }),
      addProduct: (product) => set((state) => {
        const newProd: Product = {
          ...product,
          id: product.id || `prod_${Date.now()}`,
          images: product.images && product.images.length > 0 ? product.images : [product.imageSrc, product.imageSrc, product.imageSrc],
        };
        return { products: [newProd, ...state.products], hasUnsavedChanges: true };
      }),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        hasUnsavedChanges: true,
      })),
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        hasUnsavedChanges: true,
      })),
      getProductById: (id) => get().products.find((p) => p.id === id),

      starProduct: (id) => {
        const state = get();
        const product = state.products.find((p) => p.id === id);
        if (!product) return { success: false, message: 'Product not found' };
        const starredCount = state.products.filter((p) => p.isStarred && p.type === product.type).length;
        if (product.isStarred) {
          // Toggle off
          set((s) => ({
            products: s.products.map((p) => p.id === id ? { ...p, isStarred: false, starredAt: undefined } : p),
            hasUnsavedChanges: true,
          }));
          return { success: true, message: 'Removed from Signature Collection' };
        }
        if (starredCount >= 4) {
          return { success: false, message: 'Limit reached (max 4). Remove another to add this one.' };
        }
        set((s) => ({
          products: s.products.map((p) => p.id === id ? { ...p, isStarred: true, starredAt: Date.now() } : p),
          hasUnsavedChanges: true,
        }));
        return { success: true, message: 'Added to Signature Collection!' };
      },
      unstarProduct: (id) => set((state) => ({
        products: state.products.map((p) => p.id === id ? { ...p, isStarred: false, starredAt: undefined } : p),
        hasUnsavedChanges: true,
      })),
      getSignatureProducts: () => {
        return get().products
          .filter((p) => p.isStarred)
          .sort((a, b) => (b.starredAt ?? 0) - (a.starredAt ?? 0))
          .slice(0, 4);
      },

      // --- F. Scene 4: Bespoke Atelier ---
      bespokeEyebrow: 'The Atelier',
      setBespokeEyebrow: (v) => set({ bespokeEyebrow: v, hasUnsavedChanges: true }),
      clothingBespokeTitle: 'Bespoke Tailoring',
      setClothingBespokeTitle: (v) => set({ clothingBespokeTitle: v, bespokeHeading: v, hasUnsavedChanges: true }),
      jewelryBespokeTitle: 'Bespoke Jewelry',
      setJewelryBespokeTitle: (v) => set({ jewelryBespokeTitle: v, hasUnsavedChanges: true }),
      clothingBespokeSubtitle: 'Commission Your Custom Design',
      setClothingBespokeSubtitle: (v) => set({ clothingBespokeSubtitle: v, bespokeText: v, hasUnsavedChanges: true }),
      jewelryBespokeSubtitle: 'Commission Your Heritage Piece',
      setJewelryBespokeSubtitle: (v) => set({ jewelryBespokeSubtitle: v, hasUnsavedChanges: true }),
      clothingBespokeVideo: '',
      setClothingBespokeVideo: (v) => set({ clothingBespokeVideo: v, hasUnsavedChanges: true }),
      clothingBespokeFallbackImage: '',
      setClothingBespokeFallbackImage: (v) => set({ clothingBespokeFallbackImage: v, hasUnsavedChanges: true }),
      jewelryBespokeVideo: '',
      setJewelryBespokeVideo: (v) => set({ jewelryBespokeVideo: v, hasUnsavedChanges: true }),
      jewelryBespokeFallbackImage: '',
      setJewelryBespokeFallbackImage: (v) => set({ jewelryBespokeFallbackImage: v, hasUnsavedChanges: true }),
      clothingBespokeBg: '/bespoke_bg.jpg',
      setClothingBespokeBg: (v) => set({ clothingBespokeBg: v, hasUnsavedChanges: true }),
      jewelryBespokeBg: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=1200',
      setJewelryBespokeBg: (v) => set({ jewelryBespokeBg: v, hasUnsavedChanges: true }),
      bespokeButtonText: 'Begin Your Journey',
      setBespokeButtonText: (v) => set({ bespokeButtonText: v, hasUnsavedChanges: true }),
      bespokeHeading: 'Bespoke Tailoring',
      setBespokeHeading: (v) => set({ bespokeHeading: v, clothingBespokeTitle: v, hasUnsavedChanges: true }),
      bespokeText: 'Commission Your Custom Design',
      setBespokeText: (v) => set({ bespokeText: v, clothingBespokeSubtitle: v, hasUnsavedChanges: true }),
      bespokeHeroTitle: 'The Atelier Experience',
      setBespokeHeroTitle: (v) => set({ bespokeHeroTitle: v, hasUnsavedChanges: true }),
      bespokeHeroSubtitle: 'Where your imagination meets our master craftsmanship.',
      setBespokeHeroSubtitle: (v) => set({ bespokeHeroSubtitle: v, hasUnsavedChanges: true }),
      bespokeHeroBg: '/bespoke_bg.jpg',
      setBespokeHeroBg: (v) => set({ bespokeHeroBg: v, hasUnsavedChanges: true }),

      // --- G. Scene 5: Video Carousel / Cinematic Archives ---
      videoCarouselEyebrow: 'Cinematic Archives',
      setVideoCarouselEyebrow: (v) => set({ videoCarouselEyebrow: v, hasUnsavedChanges: true }),
      clothingVideoHeading: 'The Living Atelier',
      setClothingVideoHeading: (v) => set({ clothingVideoHeading: v, hasUnsavedChanges: true }),
      jewelryVideoHeading: 'The High Jewels',
      setJewelryVideoHeading: (v) => set({ jewelryVideoHeading: v, hasUnsavedChanges: true }),
      clothingVideos: defaultClothingVideos,
      setClothingVideos: (v) => set({ clothingVideos: v, hasUnsavedChanges: true }),
      jewelryVideos: defaultJewelryVideos,
      setJewelryVideos: (v) => set({ jewelryVideos: v, hasUnsavedChanges: true }),
      updateVideoCard: (id, updates, type) => set((state) => {
        const key = type === 'clothing' ? 'clothingVideos' : 'jewelryVideos';
        return {
          [key]: state[key].map((card) => (card.id === id ? { ...card, ...updates } : card)),
          hasUnsavedChanges: true,
        };
      }),

      // --- H. Scene 6: Story, Craft & Epilogue ---
      storyHeading: 'The Imperial Archive & Heritage',
      setStoryHeading: (v) => set({ storyHeading: v, hasUnsavedChanges: true }),
      storyText: 'Rooted in the royal courtyards of Rajputana and the poetic looms of Chanderi, Raani Closet is an ode to timeless Indian aristocracies. Every creation is an intimate dialogue between master weavers, zardozi artisans, and modern silhouettesÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âmeticulously hand-crafted over hundreds of patient hours. We do not mass-produce; we curate living heirlooms meant to be cherished across generations.',
      setStoryText: (v) => set({ storyText: v, hasUnsavedChanges: true }),
      clothingCraftText: 'Rooted in centuries of royal Rajasthani heritage, every thread tells a tale of devotion. Hand-loomed in pure Chanderi silk, enriched with real gold and silver zari, and crowned with hand-appliquÃƒÆ’Ã‚Â©d dabka embroidery that whispers quiet majesty.',
      setClothingCraftText: (v) => set({ clothingCraftText: v, hasUnsavedChanges: true }),
      jewelryCraftText: 'Each piece is an act of high reverence. Our Jaipur master craftsmen spend weeks perfecting the setting of each uncut Polki diamond within 22K hallmarked gold foil, accented by Zambian emerald drops and Basra seed pearls that have adorned royalty for centuries.',
      setJewelryCraftText: (v) => set({ jewelryCraftText: v, hasUnsavedChanges: true }),
      storyEpilogueQuote: 'Preserving the royal threads of Rajasthan, one bespoke silhouette at a time.',
      setStoryEpilogueQuote: (v) => set({ storyEpilogueQuote: v, hasUnsavedChanges: true }),
      storyEpilogueSignature: 'The Master Artisans',
      setStoryEpilogueSignature: (v) => set({ storyEpilogueSignature: v, hasUnsavedChanges: true }),
      storyEpilogueSubtext: 'Raani Closet Atelier ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Jaipur & New Delhi',
      setStoryEpilogueSubtext: (v) => set({ storyEpilogueSubtext: v, hasUnsavedChanges: true }),

      // --- I. Scene 7: Imperial Concierge & Footer ---

        showFooterConcierge: true,
        setShowFooterConcierge: (v) => set({ showFooterConcierge: v, hasUnsavedChanges: true }),
        showFooterDirectory: true,
        setShowFooterDirectory: (v) => set({ showFooterDirectory: v, hasUnsavedChanges: true }),
        showFooterLegal: true,
        setShowFooterLegal: (v) => set({ showFooterLegal: v, hasUnsavedChanges: true }),
        footerShowCrown: true,
        setFooterShowCrown: (v) => set({ footerShowCrown: v, hasUnsavedChanges: true }),
        footerConciergeEyebrow: 'The Digital Sanctuary',
        setFooterConciergeEyebrow: (v) => set({ footerConciergeEyebrow: v, hasUnsavedChanges: true }),
        footerConciergeTitle: 'Imperial Concierge',
        setFooterConciergeTitle: (v) => set({ footerConciergeTitle: v, hasUnsavedChanges: true }),
        footerConciergeText: 'An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat.',
        setFooterConciergeText: (v) => set({ footerConciergeText: v, hasUnsavedChanges: true }),
        footerCta1Text: 'CLOTHING',
        setFooterCta1Text: (v) => set({ footerCta1Text: v, hasUnsavedChanges: true }),
        footerCta1Link: '#clothing',
        setFooterCta1Link: (v) => set({ footerCta1Link: v, hasUnsavedChanges: true }),
        footerCta2Text: 'JEWELRY',
        setFooterCta2Text: (v) => set({ footerCta2Text: v, hasUnsavedChanges: true }),
        footerCta2Link: '/collection',
        setFooterCta2Link: (v) => set({ footerCta2Link: v, hasUnsavedChanges: true }),

        footerAppEyebrow: 'Pocket Atelier',
        setFooterAppEyebrow: (v) => set({ footerAppEyebrow: v, hasUnsavedChanges: true }),
        footerAppTitle: 'Raani Couture App',
        setFooterAppTitle: (v) => set({ footerAppTitle: v, hasUnsavedChanges: true }),
        footerAppText: 'Experience augmented 3D silhouette fitting, track handloom timelines, and connect instantly with your assigned master artisan.',
        setFooterAppText: (v) => set({ footerAppText: v, hasUnsavedChanges: true }),
        qrCodeImage: '',
        setQrCodeImage: (v) => set({ qrCodeImage: v, hasUnsavedChanges: true }),
        footerAppLink: '#',
        setFooterAppLink: (v) => set({ footerAppLink: v, hasUnsavedChanges: true }),
        footerAppDownloadTitle: 'Download',
        setFooterAppDownloadTitle: (v) => set({ footerAppDownloadTitle: v, hasUnsavedChanges: true }),
        footerAppDownloadSubtext: 'Scan for private access',
        setFooterAppDownloadSubtext: (v) => set({ footerAppDownloadSubtext: v, hasUnsavedChanges: true }),

        footerDirectoryEyebrow: 'Direct Channels',
        setFooterDirectoryEyebrow: (v) => set({ footerDirectoryEyebrow: v, hasUnsavedChanges: true }),
        footerDirectoryTitle: 'Atelier Directory',
        setFooterDirectoryTitle: (v) => set({ footerDirectoryTitle: v, hasUnsavedChanges: true }),
        addressJaipurTitle: 'Flagship (Jaipur)',
        setAddressJaipurTitle: (v) => set({ addressJaipurTitle: v, hasUnsavedChanges: true }),
        addressJaipur: 'Narain Niwas Palace Courtyard, C-Scheme, Rajasthan',
        setAddressJaipur: (v) => set({ addressJaipur: v, hasUnsavedChanges: true }),
        addressDelhiTitle: 'Salon Privé (New Delhi)',
        setAddressDelhiTitle: (v) => set({ addressDelhiTitle: v, hasUnsavedChanges: true }),
        addressDelhi: 'The Crescent at Qutab, Mehrauli Heritage Quarter',
        setAddressDelhi: (v) => set({ addressDelhi: v, hasUnsavedChanges: true }),
        footerWhatsappLabel: 'VIP WhatsApp Line',
        setFooterWhatsappLabel: (v) => set({ footerWhatsappLabel: v, hasUnsavedChanges: true }),

        copyrightText: '© 2026 Maison Raani. All Rights Reserved.',
        setCopyrightText: (v) => set({ copyrightText: v, hasUnsavedChanges: true }),
        privacyText: 'Privacy',
        setPrivacyText: (v) => set({ privacyText: v, hasUnsavedChanges: true }),
        privacyLink: '/privacy',
        setPrivacyLink: (v) => set({ privacyLink: v, hasUnsavedChanges: true }),
        termsText: 'Terms',
        setTermsText: (v) => set({ termsText: v, hasUnsavedChanges: true }),
        termsLink: '/terms',
        setTermsLink: (v) => set({ termsLink: v, hasUnsavedChanges: true }),

      // --- K. Search & Discovery ---
      trendingSearchesClothing: ['Bridal Lehenga', 'Silk Kurti', 'Chanderi Suit', 'Velvet Anarkali', 'Georgette Dupatta'],
      setTrendingSearchesClothing: (v) => set({ trendingSearchesClothing: v, hasUnsavedChanges: true }),
      trendingSearchesJewelry: ['Kundan Choker', 'Polki Haar', 'Jadau Bangles', 'Pearl Mathapatti', 'Chandbali Earrings'],
      setTrendingSearchesJewelry: (v) => set({ trendingSearchesJewelry: v, hasUnsavedChanges: true }),
      searchSynonyms: { "red": "crimson", "green": "emerald", "blue": "sapphire" },
      setSearchSynonyms: (v) => set({ searchSynonyms: v, hasUnsavedChanges: true }),
      
      searchCollectionsClothing: ['1', '2'],
      setSearchCollectionsClothing: (v) => set({ searchCollectionsClothing: v, hasUnsavedChanges: true }),
      searchCollectionsJewelry: ['1', '2'],
      setSearchCollectionsJewelry: (v) => set({ searchCollectionsJewelry: v, hasUnsavedChanges: true }),
      searchSignatureClothing: ['c1', 'c2'],
      setSearchSignatureClothing: (v) => set({ searchSignatureClothing: v, hasUnsavedChanges: true }),
      searchSignatureJewelry: ['j1', 'j2'],
      setSearchSignatureJewelry: (v) => set({ searchSignatureJewelry: v, hasUnsavedChanges: true }),

      // --- K. Admin Reset & Factory Defaults ---
      resetToDefaults: () => {
        set({
          brandName: 'Raani Closet',
          whatsappNumber: '919876543210',
          supportEmail: 'concierge@raanicloset.com',
          contactPhone: '+91 141 256 7890',
          instagramUrl: 'https://instagram.com',
          facebookUrl: 'https://facebook.com',
          youtubeUrl: 'https://youtube.com',
          clothingHeroVideo: '/clothing_hero_new.mp4',
          clothingHeroFallbackImage: '/hero_mock_3.jpg',
          clothingHeroBg: '/hero_mock_3.jpg',
          clothingHeroLine1: 'THE ROYAL HEIRLOOMS',
          clothingHeroCursive: 'Raani Closet',
          clothingHeroLine3: 'Velvet & Zari Heritage',
          clothingHeroSubtext: 'Handcrafted in the heart of Rajputana.',
          clothingHeroButtonText: 'Explore Collection',
          clothingHeroTitle: 'The Royal Heirlooms',
          clothingHeroSubtitle: 'Raani Closet',
          jewelryHeroVideo: '/jewelry_hero.mp4',
          jewelryHeroFallbackImage: '/hero-rose-pink.jpg',
          jewelryHeroBg: '/hero-rose-pink.jpg',
          jewelryHeroLine1: 'High Jewels',
          jewelryHeroCursive: 'The Imperial Vault',
          jewelryHeroLine3: 'Polki & Uncut Diamonds',
          jewelryHeroSubtext: 'Heirlooms Crafted for Eternity.',
          jewelryHeroButtonText: 'Enter Vault',
          jewelryHeroTitle: 'High Jewels',
          jewelryHeroSubtitle: 'The Imperial Vault',
          clothingCategoryHeading: 'Suit',
          jewelryCategoryHeading: 'Jewels',
          clothingCollectionTitle: 'Curated Silhouettes',
          jewelryCollectionTitle: 'The Jewel Vault',
          clothingCategories: defaultClothingCategories,
          jewelryCategories: defaultJewelryCategories,
          products: defaultProducts,
          bespokeEyebrow: 'The Atelier',
          clothingBespokeTitle: 'Bespoke Tailoring',
          jewelryBespokeTitle: 'Bespoke Jewelry',
          clothingBespokeSubtitle: 'Commission Your Custom Design',
          jewelryBespokeSubtitle: 'Commission Your Heritage Piece',
          clothingBespokeVideo: '',
          clothingBespokeFallbackImage: '',
          jewelryBespokeVideo: '',
          jewelryBespokeFallbackImage: '',
          clothingBespokeBg: '/bespoke_bg.jpg',
          jewelryBespokeBg: 'https://images.pexels.com/photos/1454174/pexels-photo-1454174.jpeg?auto=compress&cs=tinysrgb&w=1200',
          bespokeButtonText: 'Begin Your Journey',
          bespokeHeading: 'Bespoke Tailoring',
          bespokeText: 'Commission Your Custom Design',
          bespokeHeroTitle: 'The Atelier Experience',
          bespokeHeroSubtitle: 'Where your imagination meets our master craftsmanship.',
          bespokeHeroBg: '/bespoke_bg.jpg',
          videoCarouselEyebrow: 'Cinematic Archives',
          clothingVideoHeading: 'The Living Atelier',
          jewelryVideoHeading: 'The High Jewels',
          clothingVideos: defaultClothingVideos,
          jewelryVideos: defaultJewelryVideos,
          storyHeading: 'The Imperial Archive & Heritage',
          storyText: 'Rooted in the royal courtyards of Rajputana and the poetic looms of Chanderi, Raani Closet is an ode to timeless Indian aristocracies. Every creation is an intimate dialogue between master weavers, zardozi artisans, and modern silhouettesÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Âmeticulously hand-crafted over hundreds of patient hours. We do not mass-produce; we curate living heirlooms meant to be cherished across generations.',
          clothingCraftText: 'Rooted in centuries of royal Rajasthani heritage, every thread tells a tale of devotion. Hand-loomed in pure Chanderi silk, enriched with real gold and silver zari, and crowned with hand-appliquÃƒÆ’Ã‚Â©d dabka embroidery that whispers quiet majesty.',
          jewelryCraftText: 'Each piece is an act of high reverence. Our Jaipur master craftsmen spend weeks perfecting the setting of each uncut Polki diamond within 22K hallmarked gold foil, accented by Zambian emerald drops and Basra seed pearls that have adorned royalty for centuries.',
          storyEpilogueQuote: 'Preserving the royal threads of Rajasthan, one bespoke silhouette at a time.',
          storyEpilogueSignature: 'The Master Artisans',
          storyEpilogueSubtext: 'Raani Closet Atelier ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢ Jaipur & New Delhi',
          footerConciergeEyebrow: 'The Digital Sanctuary',
          footerConciergeTitle: 'Imperial Concierge',
          footerConciergeText: 'An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat.',
          addressJaipur: 'Narain Niwas Palace Courtyard, C-Scheme, Rajasthan',
          addressDelhi: 'The Crescent at Qutab, Mehrauli Heritage Quarter',
          copyrightText: 'Ãƒâ€šÃ‚Â© 2026 Maison Raani. All Rights Reserved.',
          trendingSearchesClothing: ['Bridal Lehenga', 'Silk Kurti', 'Chanderi Suit', 'Velvet Anarkali', 'Georgette Dupatta'],
          trendingSearchesJewelry: ['Kundan Choker', 'Polki Haar', 'Jadau Bangles', 'Pearl Mathapatti', 'Chandbali Earrings'],
          searchSynonyms: { "red": "crimson", "green": "emerald", "blue": "sapphire" },
          searchCollectionsClothing: ['1', '2'],
          searchCollectionsJewelry: ['1', '2'],
          searchSignatureClothing: ['c1', 'c2'],
          searchSignatureJewelry: ['j1', 'j2'],
          hasUnsavedChanges: false,
        });
      },

      exportConfig: () => {
        const state = get();
        return JSON.stringify(state, null, 2);
      },

      importConfig: (json: string) => {
        try {
          const parsed = JSON.parse(json);
          set({ ...parsed, hasUnsavedChanges: true });
          return true;
        } catch {
          return false;
        }
      },

      fetchFromServer: async () => {
        if (inFlightFetchPromise) {
          return inFlightFetchPromise;
        }

        inFlightFetchPromise = (async () => {
          try {
            const res = await fetch('/api/store', {
              cache: 'no-store',
              headers: { 'Accept': 'application/json' },
            });
            if (res.ok) {
              const contentType = res.headers.get('content-type') || '';
              if (contentType.includes('application/json')) {
                const data = await res.json();
                if (data && typeof data === 'object' && !data.error && Object.keys(data).length > 0) {
                  set({ ...data, hasUnsavedChanges: false });
                }
              }
            }
          } catch (e) {
            console.error("Failed to fetch server state:", e);
          } finally {
            inFlightFetchPromise = null;
          }
        })();

        return inFlightFetchPromise;
      },
    }),
    {
      name: 'raani-admin-store-v4',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
        // Automatically fetch from server on load
        if (state?.fetchFromServer) {
          state.fetchFromServer();
        }
      },
    }
  )
);
