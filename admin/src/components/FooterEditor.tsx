'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  Building2, 
  MapPin, 
  Smartphone, 
  Scale, 
  Crown,
  Link as LinkIcon,
  MessageCircle,
  Phone,
  Mail,
  
  
  
} from 'lucide-react';

const TABS = [
  { id: 'concierge', label: 'Concierge (Narrative)', icon: Crown },
  { id: 'app', label: 'Pocket Atelier (App)', icon: Smartphone },
  { id: 'directory', label: 'Boutiques & Comms', icon: MapPin },
  { id: 'socials', label: 'Social Echo', icon: Building2 },
  { id: 'legal', label: 'Legal & Bottom', icon: Scale }
] as const;

export default function FooterEditor() {
    const [store, setStore] = React.useState<any>({});
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setStore(useAdminStore.getState());
    
    useAdminStore.getState().fetchFromServer?.().then(() => {
      setStore(useAdminStore.getState());
    });

    const unsub = useAdminStore.subscribe((state: any) => {
      setStore(state);
    });
    return unsub;
  }, []);

  if (!mounted || !store.setBrandName) return null;
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('concierge');

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* 1. Editor Header & Segmented Control */}
      <div className="border-b border-gray-100 p-6 bg-gray-50/50">
        <h2 className="text-xl font-light text-gray-900 tracking-wide mb-6">Imperial Footer Configuration</h2>
        
        <div className="flex bg-gray-100/50 p-1 rounded-xl w-fit border border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Scrollable Configuration Pane */}
      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
        <div className="max-w-3xl mx-auto space-y-8 pb-32">

          {/* TAB 1: CONCIERGE (NARRATIVE) */}
          {activeTab === 'concierge' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Concierge Section</h3>
                  <p className="text-xs text-gray-500 mt-1">Display the entire narrative block</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={(store as any).showFooterConcierge !== false}
                    onChange={(e) => (store as any).setShowFooterConcierge(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className={`space-y-6 transition-opacity ${(store as any).showFooterConcierge === false ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Glassmorphic Logo Emblem</h3>
                  <p className="text-xs text-gray-500 mt-1">Show the logo inside a glassmorphic circle</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={(store as any).footerShowCrown}
                    onChange={(e) => (store as any).setFooterShowCrown(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Narrative Eyebrow</label>
                  <input
                    type="text"
                    value={store.footerConciergeEyebrow}
                    onChange={(e) => store.setFooterConciergeEyebrow(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Main Title</label>
                  <input
                    type="text"
                    value={store.footerConciergeTitle}
                    onChange={(e) => store.setFooterConciergeTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description Paragraph</label>
                  <textarea
                    value={store.footerConciergeText}
                    onChange={(e) => store.setFooterConciergeText(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Primary CTA</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Label</label>
                      <input
                        type="text"
                        value={(store as any).footerCta1Text}
                        onChange={(e) => (store as any).setFooterCta1Text(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Link Path</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={(store as any).footerCta1Link}
                          onChange={(e) => (store as any).setFooterCta1Link(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-100 pb-2">Secondary CTA</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Label</label>
                      <input
                        type="text"
                        value={(store as any).footerCta2Text}
                        onChange={(e) => (store as any).setFooterCta2Text(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Link Path</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={(store as any).footerCta2Link}
                          onChange={(e) => (store as any).setFooterCta2Link(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 2: POCKET ATELIER (APP) */}
          {activeTab === 'app' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show App Download Section</h3>
                  <p className="text-xs text-gray-500 mt-1">If turned off, the right side expands</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={store.showAppDownload !== false}
                    onChange={(e) => store.setShowAppDownload(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 transition-opacity ${store.showAppDownload === false ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Section Eyebrow</label>
                  <input
                    type="text"
                    value={(store as any).footerAppEyebrow}
                    onChange={(e) => (store as any).setFooterAppEyebrow(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={(store as any).footerAppTitle}
                    onChange={(e) => (store as any).setFooterAppTitle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={(store as any).footerAppText}
                    onChange={(e) => (store as any).setFooterAppText(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">App Link</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={(store as any).footerAppLink}
                        onChange={(e) => (store as any).setFooterAppLink(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Badge Title</label>
                    <input
                      type="text"
                      value={(store as any).footerAppDownloadTitle}
                      onChange={(e) => (store as any).setFooterAppDownloadTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BOUTIQUES & DIRECTORY */}
          {activeTab === 'directory' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Directory Section</h3>
                  <p className="text-xs text-gray-500 mt-1">Display the boutiques and contact info</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={(store as any).showFooterDirectory !== false}
                    onChange={(e) => (store as any).setShowFooterDirectory(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className={`space-y-6 transition-opacity ${(store as any).showFooterDirectory === false ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Directory Eyebrow</label>
                    <input
                      type="text"
                      value={(store as any).footerDirectoryEyebrow}
                      onChange={(e) => (store as any).setFooterDirectoryEyebrow(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Directory Title</label>
                    <input
                      type="text"
                      value={(store as any).footerDirectoryTitle}
                      onChange={(e) => (store as any).setFooterDirectoryTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Boutiques */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">Boutique 1 (Jaipur)</h4>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Title / Location Name</label>
                    <input
                      type="text"
                      value={(store as any).addressJaipurTitle}
                      onChange={(e) => (store as any).setAddressJaipurTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Full Address</label>
                    <textarea
                      value={store.addressJaipur}
                      onChange={(e) => store.setAddressJaipur(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300 resize-none"
                    />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                  <h4 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">Boutique 2 (Delhi)</h4>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Title / Location Name</label>
                    <input
                      type="text"
                      value={(store as any).addressDelhiTitle}
                      onChange={(e) => (store as any).setAddressDelhiTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Full Address</label>
                    <textarea
                      value={store.addressDelhi}
                      onChange={(e) => store.setAddressDelhi(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Direct Contact Lines</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={store.contactPhone}
                        onChange={(e) => store.setContactPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={store.supportEmail}
                        onChange={(e) => store.setSupportEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">VIP Phone Number</label>
                    <input
                      type="text"
                      className="w-full bg-[#111111] border border-gray-800 rounded px-4 py-2 text-white focus:outline-none focus:border-[#CBA153] mb-4"
                      value={store.contactPhone || ''}
                      onChange={(e) => store.setContactPhone(e.target.value)}
                    />
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">WhatsApp Number</label>
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25D366]" />
                      <input
                        type="text"
                        value={store.whatsappNumber}
                        onChange={(e) => store.setWhatsappNumber(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">WhatsApp Label</label>
                    <input
                      type="text"
                      value={(store as any).footerWhatsappLabel}
                      onChange={(e) => (store as any).setFooterWhatsappLabel(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL ECHO */}
          {activeTab === 'socials' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Social Links</h3>
                  <p className="text-xs text-gray-500 mt-1">Display social media icons in the bottom bar</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={store.showSocialLinks !== false}
                    onChange={(e) => store.setShowSocialLinks(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5 transition-opacity ${store.showSocialLinks === false ? 'opacity-50 pointer-events-none' : ''}`}>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Instagram URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E1306C]" />
                    <input
                      type="text"
                      value={store.instagramUrl}
                      onChange={(e) => store.setInstagramUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Facebook URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1877F2]" />
                    <input
                      type="text"
                      value={store.facebookUrl}
                      onChange={(e) => store.setFacebookUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"> YouTube URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#FF0000]" />
                    <input
                      type="text"
                      value={store.youtubeUrl}
                      onChange={(e) => store.setYoutubeUrl(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: LEGAL & BOTTOM */}
          {activeTab === 'legal' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

              <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Show Legal Links</h3>
                  <p className="text-xs text-gray-500 mt-1">Display the legal links in the bottom bar</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={(store as any).showFooterLegal !== false}
                    onChange={(e) => (store as any).setShowFooterLegal(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                </label>
              </div>

              <div className={`transition-opacity ${(store as any).showFooterLegal === false ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Copyright Notice</label>
                  <input
                    type="text"
                    value={store.copyrightText}
                    onChange={(e) => store.setCopyrightText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-300 transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-2">Example: Â© 2026 Maison Raani. All Rights Reserved.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Privacy Policy</h4>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Label</label>
                      <input
                        type="text"
                        value={(store as any).privacyText}
                        onChange={(e) => (store as any).setPrivacyText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Link Path</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={(store as any).privacyLink}
                          onChange={(e) => (store as any).setPrivacyLink(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Terms of Service</h4>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Label</label>
                      <input
                        type="text"
                        value={(store as any).termsText}
                        onChange={(e) => (store as any).setTermsText(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Link Path</label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={(store as any).termsLink}
                          onChange={(e) => (store as any).setTermsLink(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-gray-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


