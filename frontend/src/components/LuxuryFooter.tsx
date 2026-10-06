'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  QrCode, 
  Globe
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { useAdminStore } from '@/store/useAdminStore';


// Custom SVGs to avoid Lucide version issues
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
);

export default function LuxuryFooter() {

  const isJewelry = useStore((state) => state.isJewelry);
  const setJewelryMode = useStore((state) => state.setJewelryMode);
  
  // Safe hydration for large Zustand store
  const [adminStore, setAdminStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setAdminStore(useAdminStore.getState());
    
    // Fetch latest from server on mount
    useAdminStore.getState().fetchFromServer().then(() => {
      setAdminStore(useAdminStore.getState());
    });

    // Subscribe to store changes
    const unsub = useAdminStore.subscribe((state) => {
      setAdminStore(state);
    });
    return unsub;
  }, []);

  // --- 1. MEMOIZED & SANITIZED CONFIGURATION ---
  const config = useMemo(() => {
    // Tier 1: Narrative & Fallbacks
    const showCrown = (adminStore as any).footerShowCrown !== false;
    const showConcierge = (adminStore as any).showFooterConcierge !== false;
    const showDirectory = (adminStore as any).showFooterDirectory !== false;
    const showLegal = (adminStore as any).showFooterLegal !== false;
    const eyebrow = adminStore.footerConciergeEyebrow?.trim() || "The Digital Sanctuary";
    const title = adminStore.footerConciergeTitle?.trim() || "Imperial Concierge";
    const text = adminStore.footerConciergeText?.trim() || 
      "An exclusive enclave dedicated to the preservation of Indian royal heritage. From bespoke zardozi bridal trousseaus to archival polki jewelry, Raani Closet offers private commissions and digital styling engagements for the modern aristocrat.";

    // Action CTAs
    const cta1 = {
      label: (adminStore as any).footerCta1Text?.trim() || "CLOTHING",
      href: (adminStore as any).footerCta1Link?.trim() || "#clothing",
    };
    const cta2 = {
      label: (adminStore as any).footerCta2Text?.trim() || "JEWELRY",
      href: (adminStore as any).footerCta2Link?.trim() || "#jewelry",
    };
    const hasCta1 = Boolean(cta1.label);
    const hasCta2 = Boolean(cta2.label);

    // Tier 2 & 3: Pocket Atelier (App)
    const showApp = adminStore.showAppDownload !== false;
    const appEyebrow = (adminStore as any).footerAppEyebrow?.trim() || "Pocket Atelier";
    const appTitle = (adminStore as any).footerAppTitle?.trim() || "Raani Couture App";
    const appText = (adminStore as any).footerAppText?.trim() || 
      "Experience augmented 3D silhouette fitting, track handloom timelines, and connect instantly with your assigned master artisan.";
    const appBadgeText = (adminStore as any).footerAppDownloadTitle?.trim() || "Download";
    const appSubtext = (adminStore as any).footerAppDownloadSubtext?.trim() || "Scan for private access";
    const appUrl = (adminStore as any).footerAppLink?.trim() || "#";

    // Boutiques & Channels
    const dirEyebrow = (adminStore as any).footerDirectoryEyebrow?.trim() || "Direct Channels";
    const dirTitle = (adminStore as any).footerDirectoryTitle?.trim() || "Atelier Directory";

    const boutiqueJaipur = adminStore.addressJaipur?.trim() ? {
      title: (adminStore as any).addressJaipurTitle?.trim() || "Flagship (Jaipur)",
      address: adminStore.addressJaipur.trim()
    } : null;

    const boutiqueDelhi = adminStore.addressDelhi?.trim() ? {
      title: (adminStore as any).addressDelhiTitle?.trim() || "Salon Privé (New Delhi)",
      address: adminStore.addressDelhi.trim()
    } : null;

    // Contact link sanitation
    const phone = adminStore.contactPhone?.trim() || "+91 141 256 7890";
    const phoneHref = phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : null;

    const whatsapp = adminStore.whatsappNumber?.trim() || "919876543210";
    const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null;
    const whatsappLabel = (adminStore as any).footerWhatsappLabel?.trim() || "VIP WhatsApp Line";

    const email = adminStore.supportEmail?.trim() || "concierge@raanicloset.com";
    const emailHref = email ? `mailto:${email}` : null;

    // Social Media Links (Sanitized)
    const showSocials = adminStore.showSocialLinks !== false;
    const socials = [
      { key: 'instagram', url: adminStore.instagramUrl?.trim(), icon: InstagramIcon },
      { key: 'facebook', url: adminStore.facebookUrl?.trim(), icon: FacebookIcon },
      { key: 'youtube', url: adminStore.youtubeUrl?.trim(), icon: YoutubeIcon }
    ].filter(s => Boolean(s.url));

    // Bottom Bar
    const copyright = adminStore.copyrightText?.trim() || "© 2026 Maison Raani. All Rights Reserved.";
    const privacy = {
      label: (adminStore as any).privacyText?.trim() || "Privacy",
      href: (adminStore as any).privacyLink?.trim() || "/privacy"
    };
    const terms = {
      label: (adminStore as any).termsText?.trim() || "Terms",
      href: (adminStore as any).termsLink?.trim() || "/terms"
    };

    return {
      showCrown, showConcierge, showDirectory, showLegal, eyebrow, title, text,
      cta1, cta2, hasCta1, hasCta2,
      showApp, appEyebrow, appTitle, appText, appBadgeText, appSubtext, appUrl,
      dirEyebrow, dirTitle, boutiqueJaipur, boutiqueDelhi,
      phone, phoneHref, whatsappHref, whatsappLabel, email, emailHref,
      showSocials, socials, copyright, privacy, terms
    };
  }, [adminStore]);

  return (
    <footer className="relative w-full bg-[#050102] text-[#E8E0D0] overflow-hidden">
      
      <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b ${isJewelry ? 'from-[#050102]' : 'from-[#F9F6F0]'} to-[#050102] pointer-events-none z-10 transition-colors duration-1000`} />

      
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1200px] pointer-events-none opacity-20 blur-[150px]"
        style={{ background: 'radial-gradient(ellipse, #CBA153 0%, transparent 70%)' }}
      />

      <div className="max-w-7xl mx-auto relative z-20 px-6 sm:px-10 lg:px-16 pt-64 pb-24">
        
        
        {config.showConcierge && (
          <div className="max-w-4xl mx-auto text-center mb-32">
            {config.showCrown && (
              <div className="flex justify-center mb-10">
                <div className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center bg-white/5 backdrop-blur-md shadow-[0_0_40px_rgba(203,161,83,0.15)] overflow-hidden">
                  <img src="/raani-logo-new.png" alt="Raani Logo" className="w-16 h-auto opacity-90" />
                </div>
              </div>
            )}
            
            <span className="font-royal text-[11px] tracking-[0.4em] uppercase text-[#CBA153] block mb-6">
              {config.eyebrow}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-[#E8E0D0] tracking-wide mb-8">
              {config.title}
            </h2>
            <p className="font-sans font-light text-[13px] md:text-sm leading-loose text-[#E8E0D0]/70 max-w-2xl mx-auto mb-12">
              {config.text}
            </p>

            
            {(config.hasCta1 || config.hasCta2) && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {config.hasCta1 && (
                  <button 
                    onClick={() => { if(config.cta1.href==='#clothing') { setJewelryMode(false); window.scrollTo({top:0, behavior:'smooth'}); } else { window.location.href=config.cta1.href; } }} 
                    className={`group relative flex items-center justify-between gap-6 py-4 px-8 rounded-2xl transition-all duration-700 hover:-translate-y-1 overflow-hidden
                      ${isJewelry 
                        ? "bg-white/95 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_white] hover:shadow-[0_15px_40px_rgba(203,161,83,0.25)] text-[#1A1A1A] backdrop-blur-2xl" 
                        : "bg-[#FDFBF7] shadow-[2px_6px_20px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-[#E8E2D5] hover:shadow-[4px_10px_25px_rgba(203,161,83,0.15)] text-[#1A1A1A]"
                      }`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-12 z-0" />
                    
                    <div className="relative w-10 h-10 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-700 z-10 mix-blend-multiply">
                      <img src="/icons/icon_mannequin.jpg" alt="Tailoring" className="w-full h-full object-contain" />
                    </div>
                    
                    <span className="font-serif text-[12px] md:text-[14px] font-medium uppercase tracking-[0.2em] leading-tight z-10 group-hover:text-[#CBA153] transition-colors duration-500">
                      {config.cta1.label}
                    </span>
                  </button>
                )}
                {config.hasCta2 && (
                  <button 
                    onClick={() => { if(config.cta2.href==='#jewelry') { setJewelryMode(true); window.scrollTo({top:0, behavior:'smooth'}); } else { window.location.href=config.cta2.href; } }} 
                    className={`group relative flex items-center justify-between gap-6 py-4 px-8 rounded-2xl transition-all duration-700 hover:-translate-y-1 overflow-hidden
                      ${isJewelry 
                        ? "bg-white/95 border border-white shadow-[0_10px_40px_rgba(0,0,0,0.8),inset_0_1px_2px_white] hover:shadow-[0_15px_40px_rgba(203,161,83,0.25)] text-[#1A1A1A] backdrop-blur-2xl" 
                        : "bg-[#FDFBF7] shadow-[2px_6px_20px_rgba(0,0,0,0.06),inset_0_1px_2px_rgba(255,255,255,1)] border border-[#E8E2D5] hover:shadow-[4px_10px_25px_rgba(203,161,83,0.15)] text-[#1A1A1A]"
                      }`}
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-12 z-0" />
                    
                    <div className="relative w-10 h-10 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 z-10 mix-blend-multiply">
                      <img src="/icons/icon_velvetbox.jpg" alt="Jewelry Vault" className="w-full h-full object-contain" />
                    </div>
                    
                    <span className="font-serif text-[12px] md:text-[14px] font-medium uppercase tracking-[0.2em] leading-tight z-10 group-hover:text-[#CBA153] transition-colors duration-500">
                      {config.cta2.label}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        
        <div className={`pt-20 border-t border-[#CBA153]/20 ${
          (config.showApp && config.showDirectory) 
            ? 'grid grid-cols-1 md:grid-cols-2 gap-20 items-start' 
            : 'flex flex-col items-center text-center max-w-2xl mx-auto'
        }`}>
          
          
          {config.showApp && (
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="font-royal text-[10px] tracking-[0.3em] text-[#CBA153] uppercase block mb-4">
                {config.appEyebrow}
              </span>
              <h3 className="font-serif text-2xl text-[#E8E0D0] tracking-wide mb-4">
                {config.appTitle}
              </h3>
              <p className="font-sans font-light text-sm text-[#E8E0D0]/60 leading-relaxed mb-8 max-w-sm">
                {config.appText}
              </p>
              
              <Link href={config.appUrl} className="flex items-center gap-6 group">
                <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center text-[#050102] group-hover:scale-105 transition-transform shadow-[0_0_30px_rgba(203,161,83,0.1)]">
                  <QrCode className="w-10 h-10" />
                </div>
                <div className="text-left">
                  <span className="font-royal text-xs tracking-widest text-[#E8E0D0] uppercase block mb-1">
                    {config.appBadgeText}
                  </span>
                  <span className="font-sans font-light text-[11px] text-[#CBA153]">
                    {config.appSubtext}
                  </span>
                </div>
              </Link>
            </div>
          )}

          
          {config.showDirectory && (
            <div className={`flex flex-col w-full ${
              config.showApp 
                ? 'items-center md:items-end text-center md:text-right' 
                : 'items-center text-center'
            }`}>
              <span className="font-royal text-[10px] tracking-[0.3em] text-[#CBA153] uppercase block mb-4">
                {config.dirEyebrow}
              </span>
              <h3 className="font-serif text-2xl text-[#E8E0D0] tracking-wide mb-8">
                {config.dirTitle}
              </h3>

              
              {(config.boutiqueJaipur || config.boutiqueDelhi) && (
                <div className={`space-y-6 mb-10 w-full max-w-sm flex flex-col ${
                  config.showApp ? 'items-center md:items-end' : 'items-center'
                }`}>
                  {config.boutiqueJaipur && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(config.boutiqueJaipur.address)}`} target="_blank" rel="noopener noreferrer" className={`flex flex-col ${config.showApp ? 'md:flex-row' : ''} items-center gap-4 group cursor-pointer`}>
                      <MapPin className="w-5 h-5 text-[#CBA153] group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5 hidden md:block" />
                      <div>
                        <span className="font-sans text-[12px] tracking-widest text-[#E8E0D0] uppercase block mb-1 group-hover:text-[#CBA153] transition-colors">
                          {config.boutiqueJaipur.title}
                        </span>
                        <span className="font-sans font-light text-[12px] text-[#E8E0D0]/50 leading-relaxed whitespace-pre-line group-hover:text-[#E8E0D0]/80 transition-colors">
                          {config.boutiqueJaipur.address}
                        </span>
                      </div>
                    </a>
                  )}
                  {config.boutiqueDelhi && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(config.boutiqueDelhi.address)}`} target="_blank" rel="noopener noreferrer" className={`flex flex-col ${config.showApp ? 'md:flex-row' : ''} items-center gap-4 group cursor-pointer`}>
                      <MapPin className="w-5 h-5 text-[#E0A29C] group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5 hidden md:block" />
                      <div>
                        <span className="font-sans text-[12px] tracking-widest text-[#E8E0D0] uppercase block mb-1 group-hover:text-[#E0A29C] transition-colors">
                          {config.boutiqueDelhi.title}
                        </span>
                        <span className="font-sans font-light text-[12px] text-[#E8E0D0]/50 leading-relaxed whitespace-pre-line group-hover:text-[#E8E0D0]/80 transition-colors">
                          {config.boutiqueDelhi.address}
                        </span>
                      </div>
                    </a>
                  )}
                </div>
              )}

              
              <div className={`flex flex-col gap-4 w-full max-w-sm ${
                config.showApp ? 'items-center md:items-end' : 'items-center'
              }`}>
                {config.phoneHref && (
                  <a href={config.phoneHref} className="flex items-center gap-4 group">
                    <span className="font-sans font-light text-[13px] text-[#E8E0D0]/80 group-hover:text-[#CBA153] transition-colors">
                      {config.phone}
                    </span>
                    <Phone className="w-4 h-4 text-[#CBA153] group-hover:text-white transition-colors hidden md:block" />
                  </a>
                )}
                {config.whatsappHref && (
                  <a href={config.whatsappHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 group">
                    <span className="font-sans font-light text-[13px] text-[#E8E0D0]/80 group-hover:text-[#CBA153] transition-colors">
                      {config.whatsappLabel}
                    </span>
                    <MessageCircle className="w-4 h-4 text-[#CBA153] group-hover:text-white transition-colors hidden md:block" />
                  </a>
                )}
                {config.emailHref && (
                  <a href={config.emailHref} className="flex items-center gap-4 group">
                    <span className="font-sans font-light text-[13px] text-[#E8E0D0]/80 group-hover:text-[#CBA153] transition-colors">
                      {config.email}
                    </span>
                    <Mail className="w-4 h-4 text-[#CBA153] group-hover:text-white transition-colors hidden md:block" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
        
        
        <div className="mt-24 pt-8 border-t border-[#CBA153]/20 grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          
          <div className="flex items-center justify-center md:justify-start gap-6">
            {config.showSocials && config.socials.map((social) => {
              const Icon = social.icon;
              return (
                <a 
                  key={social.key} 
                  href={social.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#E8E0D0]/50 hover:text-[#CBA153] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
          
          
          <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#E8E0D0]/40 text-center">
            {config.copyright}
          </p>
          
          
          {config.showLegal && (
            <div className="flex items-center justify-center md:justify-end gap-8 font-sans text-[10px] uppercase tracking-[0.2em] text-[#E8E0D0]/40">
              <Link href={config.privacy.href} className="hover:text-[#CBA153] transition-colors">
                {config.privacy.label}
              </Link>
              <Link href={config.terms.href} className="hover:text-[#CBA153] transition-colors">
                {config.terms.label}
              </Link>
            </div>
          )}
        </div>

      </div>
    </footer>
  );
}

