"use client";

import React, { useState } from 'react';
import { useAdminStore } from '@/store/useAdminStore';
import CropModal from './CropModal';
import { Upload, Trash2, Plus, Image as ImageIcon } from 'lucide-react';

export default function ClientDiariesEditor() {
  const [activeTab, setActiveTab] = useState<'clothing' | 'jewelry'>('clothing');
  
  const clothingPhotos = useAdminStore((s: any) => s.clientDiariesClothing || []);
  const setClothingPhotos = useAdminStore((s: any) => s.setClientDiariesClothing);
  
  const jewelryPhotos = useAdminStore((s: any) => s.clientDiariesJewelry || []);
  const setJewelryPhotos = useAdminStore((s: any) => s.setClientDiariesJewelry);

  const activePhotos = activeTab === 'clothing' ? clothingPhotos : jewelryPhotos;
  const setPhotos = activeTab === 'clothing' ? setClothingPhotos : setJewelryPhotos;

  const [cropperState, setCropperState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    targetIndex: number | null;
  }>({
    isOpen: false,
    imageSrc: "",
    targetIndex: null,
  });

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>, targetIndex?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropperState({
      isOpen: true,
      imageSrc: url,
      targetIndex: targetIndex !== undefined ? targetIndex : null,
    });
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    if (cropperState.targetIndex !== null) {
      const newPhotos = [...activePhotos];
      newPhotos[cropperState.targetIndex] = croppedDataUrl;
      setPhotos(newPhotos);
    } else {
      setPhotos([...activePhotos, croppedDataUrl]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...activePhotos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden font-sans">
      <div className="p-6 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 font-serif">Client Diaries Archives</h2>
          <p className="text-sm text-gray-500 mt-1">
            Upload & crop archive photos. Top 4 appear in Homepage White Glass grid; full list in immersive gallery.
          </p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('clothing')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'clothing' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Clothing Mode
          </button>
          <button 
            onClick={() => setActiveTab('jewelry')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'jewelry' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Jewelry Mode
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activePhotos.map((photo: string, index: number) => (
            <div key={index} className={`p-4 border rounded-xl relative ${index < 4 ? 'border-[#CBA153] bg-[#CBA153]/5' : 'border-gray-200 bg-gray-50'}`}>
              
              {/* Badge for Top 4 */}
              {index < 4 ? (
                <div className="absolute -top-3 left-4 bg-[#CBA153] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Homepage Preview {index + 1}
                </div>
              ) : (
                <div className="absolute -top-3 left-4 bg-gray-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                  Gallery Only
                </div>
              )}

              <div className="flex gap-4 mt-2 items-center">
                {/* Image Preview & Upload Trigger */}
                <label className="w-24 h-32 relative rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-300 group cursor-pointer shadow-sm">
                  {photo ? (
                    <img src={photo} alt={`Diary ${index}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span>Upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs transition-opacity font-medium">
                    <Upload size={16} />
                    <span>Change & Crop</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSelectFile(e, index)}
                  />
                </label>

                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">Photo Options</label>
                  
                  <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                    <Upload size={14} className="text-[#CBA153]" /> Replace & Recrop Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleSelectFile(e, index)}
                    />
                  </label>

                  <div>
                    <button 
                      onClick={() => handleRemovePhoto(index)}
                      className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 font-medium mt-1"
                    >
                      <Trash2 size={12} /> Remove Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Archive Photo Button */}
        <label className="w-full py-8 border-2 border-dashed border-gray-300 hover:border-[#CBA153] rounded-xl flex flex-col items-center justify-center text-gray-500 hover:text-[#CBA153] transition-colors cursor-pointer bg-gray-50/50 hover:bg-[#CBA153]/5">
          <Plus size={24} className="mb-2" />
          <span className="text-sm font-semibold uppercase tracking-wider">Upload New Client Diary Photo</span>
          <span className="text-xs text-gray-400 mt-1">Select an image to crop and add to archive</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleSelectFile(e)}
          />
        </label>
      </div>

      {/* Cropper Modal */}
      {cropperState.isOpen && (
        <CropModal
          imageSrc={cropperState.imageSrc}
          aspect={3 / 4}
          title="Crop Client Diary Archive Photo"
          onCropComplete={handleCropComplete}
          onClose={() => setCropperState((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
