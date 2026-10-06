"use client";

import React, { useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import ImageUploadGroup from "./ImageUploadGroup";
import VideoUploadGroup from "./VideoUploadGroup";

function InputGroup({ label, value, onChange, placeholder = "" }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] tracking-[0.2em] text-[#1A0B16]/60 uppercase font-semibold">
        {label}
      </label>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="border border-[#EAEAEA] bg-[#FAFAFA] rounded-md px-4 py-3 text-xs text-[#1A0B16] focus:outline-none focus:border-[#CBA153] focus:bg-white transition-colors"
      />
    </div>
  );
}

export default function VideosEditor() {
  const [activeTab, setActiveTab] = useState<"clothing" | "jewelry">("jewelry");

  const clothingVideos = useAdminStore((s: any) => s.clothingVideos);
  const setClothingVideos = useAdminStore((s: any) => s.setClothingVideos);
  const jewelryVideos = useAdminStore((s: any) => s.jewelryVideos);
  const setJewelryVideos = useAdminStore((s: any) => s.setJewelryVideos);

  const videos = (activeTab === "clothing" ? clothingVideos : jewelryVideos) || [];
  const setVideos = activeTab === "clothing" ? setClothingVideos : setJewelryVideos;

  const videoCarouselEyebrow = useAdminStore((s: any) => s.videoCarouselEyebrow);
  const setVideoCarouselEyebrow = useAdminStore((s: any) => s.setVideoCarouselEyebrow);
  
  const clothingVideoHeading = useAdminStore((s: any) => s.clothingVideoHeading);
  const setClothingVideoHeading = useAdminStore((s: any) => s.setClothingVideoHeading);
  
  const jewelryVideoHeading = useAdminStore((s: any) => s.jewelryVideoHeading);
  const setJewelryVideoHeading = useAdminStore((s: any) => s.setJewelryVideoHeading);

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = videos.map((v: any) => (v.id === id ? { ...v, [field]: value } : v));
    setVideos(updated);
  };

  const handleAdd = () => {
    const newVideo = {
      id: Date.now().toString(),
      video: "",
      poster: "",
      title: "New Video",
      no: "Nº 05",
    };
    setVideos([...videos, newVideo]);
  };

  const handleDelete = (id: string) => {
    setVideos(videos.filter((v: any) => v.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-serif text-[#1A0B16]">Video Carousel Editor</h2>
          <p className="text-xs text-[#888] mt-1">Manage the cinematic videos for clothing and jewelry</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center bg-[#F5F5F5] p-1 rounded-lg border border-[#EAEAEA]">
          <button
            onClick={() => setActiveTab("clothing")}
            className={`px-6 py-2 rounded-md text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
              activeTab === "clothing" ? "bg-white text-[#1A0B16] shadow-sm" : "text-[#888] hover:text-[#1A0B16]"
            }`}
          >
            Clothing
          </button>
          <button
            onClick={() => setActiveTab("jewelry")}
            className={`px-6 py-2 rounded-md text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
              activeTab === "jewelry" ? "bg-[#1A0B16] text-[#CBA153] shadow-sm" : "text-[#888] hover:text-[#1A0B16]"
            }`}
          >
            Jewelry
          </button>
        </div>
      </div>

      {/* Global Headings Section */}
      <div className="bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">Global Section Headings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputGroup
            label="Eyebrow Text (Both)"
            value={videoCarouselEyebrow}
            onChange={(e: any) => setVideoCarouselEyebrow(e.target.value)}
          />
          {activeTab === "clothing" ? (
            <InputGroup
              label="Clothing Title"
              value={clothingVideoHeading}
              onChange={(e: any) => setClothingVideoHeading(e.target.value)}
            />
          ) : (
            <InputGroup
              label="Jewelry Title"
              value={jewelryVideoHeading}
              onChange={(e: any) => setJewelryVideoHeading(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3]">Video Cards</h3>
        <button
          onClick={handleAdd}
          className="bg-[#1A0B16] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#2A1825] transition-colors"
        >
          + Add New Video
        </button>
      </div>

      <div className="space-y-6">
        {videos.map((vid: any) => (
          <div key={vid.id} className="bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm relative group transition-all hover:border-[#D4D4D4]">
            <button
              onClick={() => handleDelete(vid.id)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left: Text Details */}
              <div className="lg:col-span-5 space-y-4">
                <InputGroup
                  label="Title (e.g. Mastercraft Zardozi)"
                  value={vid.title}
                  onChange={(e: any) => handleUpdate(vid.id, "title", e.target.value)}
                />
                <InputGroup
                  label="Chapter Number (e.g. Nº 02)"
                  value={vid.no}
                  onChange={(e: any) => handleUpdate(vid.id, "no", e.target.value)}
                />
              </div>

              {/* Right: Media */}
              <div className="lg:col-span-7 grid grid-cols-2 gap-4">
                <ImageUploadGroup
                  label="Poster / Thumbnail"
                  value={vid.poster}
                  fallbackImage="/placeholder-image.jpg"
                  onChange={(url) => handleUpdate(vid.id, "poster", url)}
                />
                
                <VideoUploadGroup
                  label="Cinematic Video (MP4/WebM)"
                  value={vid.video}
                  onChange={(url) => handleUpdate(vid.id, "video", url)}
                />
              </div>
            </div>
          </div>
        ))}
        {videos.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-xs text-gray-500">No videos found for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
