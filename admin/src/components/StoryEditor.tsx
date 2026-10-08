'use client';

import React from 'react';
import { useAdminStore } from '@/store/useAdminStore';

export default function StoryEditor() {
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-serif text-gray-900 mb-2">Heritage Story Editor</h2>
        <p className="text-sm text-gray-500 mb-8">
          Manage the brand philosophy section that appears above the footer.
        </p>

        <div className="space-y-8">
          {/* Section Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Show Heritage Section</h3>
              <p className="text-xs text-gray-500 mt-1">Toggle the entire philosophy section on or off</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={(store as any).showStoryEpilogue !== false}
                onChange={(e) => (store as any).setShowStoryEpilogue(e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>

          <div className={`space-y-6 transition-opacity ${(store as any).showStoryEpilogue === false ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Title */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Cursive Signature Title</label>
              <input 
                type="text" 
                value={store.aboutUsTitle}
                onChange={(e) => store.setAboutUsTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-3 transition-colors"
                placeholder="e.g. Our Heritage"
              />
            </div>

            {/* Philosophy Text */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Philosophy Paragraph</label>
              <textarea 
                rows={4}
                value={store.aboutUsText}
                onChange={(e) => store.setAboutUsText(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-3 transition-colors"
                placeholder="Write the brand story..."
              />
            </div>

            {/* Subtitle */}
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Bottom Stamp / Subtitle</label>
              <input 
                type="text" 
                value={(store as any).aboutUsSubtitle}
                onChange={(e) => (store as any).setAboutUsSubtitle(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block p-3 transition-colors"
                placeholder="e.g. Raani Closet Atelier"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
