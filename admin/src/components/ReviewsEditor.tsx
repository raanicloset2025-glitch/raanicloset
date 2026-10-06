import React, { useState } from "react";
import { useAdminStore } from "@/store/useAdminStore";
import ImageUploadGroup from "./ImageUploadGroup";

function InputGroup({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="group mb-4">
      <label className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-[#1A0B16] mb-2">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={onChange}
          rows={3}
          className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded px-3 py-2.5 text-xs text-[#333] transition-all focus:outline-none focus:border-[#CBA153] focus:bg-white focus:ring-1 focus:ring-[#CBA153]"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded px-3 py-2.5 text-xs text-[#333] transition-all focus:outline-none focus:border-[#CBA153] focus:bg-white focus:ring-1 focus:ring-[#CBA153]"
        />
      )}
    </div>
  );
}

export default function ReviewsEditor() {
  const clothingReviews = useAdminStore((s: any) => s.clothingReviews);
  const setClothingReviews = useAdminStore((s: any) => s.setClothingReviews);
  const jewelryReviews = useAdminStore((s: any) => s.jewelryReviews);
  const setJewelryReviews = useAdminStore((s: any) => s.setJewelryReviews);

  const [activeTab, setActiveTab] = useState<"clothing" | "jewelry">("jewelry");

  const reviews = (activeTab === "clothing" ? clothingReviews : jewelryReviews) || [];
  const setReviews = activeTab === "clothing" ? setClothingReviews : setJewelryReviews;

  const reviewsEyebrow = useAdminStore((s: any) => s.reviewsEyebrow);
  const setReviewsEyebrow = useAdminStore((s: any) => s.setReviewsEyebrow);
  const reviewsTitleNormal = useAdminStore((s: any) => s.reviewsTitleNormal);
  const setReviewsTitleNormal = useAdminStore((s: any) => s.setReviewsTitleNormal);
  const reviewsTitleItalic = useAdminStore((s: any) => s.reviewsTitleItalic);
  const setReviewsTitleItalic = useAdminStore((s: any) => s.setReviewsTitleItalic);

  const handleUpdate = (id: string, field: string, value: any) => {
    const updated = reviews.map((r: any) => (r.id === id ? { ...r, [field]: value } : r));
    setReviews(updated);
  };

  const handleAdd = () => {
    const newReview = {
      id: "rev-" + Date.now(),
      patron: "New Patron",
      city: "City",
      role: "Role",
      bespokeOrder: "Bespoke Order",
      date: "Date",
      rating: 5,
      quote: "Short quote...",
      testimony: "Full testimony...",
      monogram: "NP",
      profilePhoto: "",
    };
    setReviews([newReview, ...reviews]);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this review?")) {
      setReviews(reviews.filter((r: any) => r.id !== id));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif text-[#1A0B16] mb-2">Reviews Configuration</h2>
          <p className="text-sm text-[#888]">Manage client testimonials for both collections.</p>
        </div>
        <div className="flex bg-[#EAEAEA] rounded-lg p-1">
          <button
            onClick={() => setActiveTab("clothing")}
            className={"px-6 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors " + (activeTab === "clothing" ? "bg-white text-[#1A0B16] shadow-sm" : "text-[#888] hover:text-[#1A0B16]")}
          >
            Clothing Reviews
          </button>
          <button
            onClick={() => setActiveTab("jewelry")}
            className={"px-6 py-2 rounded-md text-xs font-semibold tracking-wider uppercase transition-colors " + (activeTab === "jewelry" ? "bg-white text-[#1A0B16] shadow-sm" : "text-[#888] hover:text-[#1A0B16]")}
          >
            Jewelry Reviews
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3] mb-6">Global Section Headings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup
            label="Eyebrow Text"
            value={reviewsEyebrow}
            onChange={(e: any) => setReviewsEyebrow(e.target.value)}
          />
          <InputGroup
            label="Title (Normal)"
            value={reviewsTitleNormal}
            onChange={(e: any) => setReviewsTitleNormal(e.target.value)}
          />
          <InputGroup
            label="Title (Italic)"
            value={reviewsTitleItalic}
            onChange={(e: any) => setReviewsTitleItalic(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A3A3A3]">Review Cards</h3>
        <button
          onClick={handleAdd}
          className="bg-[#1A0B16] text-white px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-[#2A1825] transition-colors"
        >
          + Add New Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review: any) => (
          <div key={review.id} className="bg-white border border-[#EAEAEA] rounded-xl p-6 shadow-sm relative">
            <button
              onClick={() => handleDelete(review.id)}
              className="absolute top-6 right-6 text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-widest"
            >
              Delete
            </button>
            <h3 className="text-lg font-serif text-[#1A0B16] mb-6">Edit Review ({review.id})</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <InputGroup
                  label="Patron Name"
                  value={review.patron}
                  onChange={(e: any) => handleUpdate(review.id, "patron", e.target.value)}
                />
                <InputGroup
                  label="Monogram (Optional)"
                  value={review.monogram}
                  onChange={(e: any) => handleUpdate(review.id, "monogram", e.target.value)}
                />
                <InputGroup
                  label="City/Location"
                  value={review.city}
                  onChange={(e: any) => handleUpdate(review.id, "city", e.target.value)}
                />
                <InputGroup
                  label="Role/Title"
                  value={review.role}
                  onChange={(e: any) => handleUpdate(review.id, "role", e.target.value)}
                />
                <InputGroup
                  label="Bespoke Order Item"
                  value={review.bespokeOrder}
                  onChange={(e: any) => handleUpdate(review.id, "bespokeOrder", e.target.value)}
                />
                <InputGroup
                  label="Date/Season"
                  value={review.date}
                  onChange={(e: any) => handleUpdate(review.id, "date", e.target.value)}
                />
                <InputGroup
                  label="Rating (1-5)"
                  value={review.rating}
                  type="number"
                  onChange={(e: any) => handleUpdate(review.id, "rating", parseInt(e.target.value) || 5)}
                />
                <div className="col-span-2">
                  <InputGroup
                    label="Quote (Short)"
                    value={review.quote}
                    type="textarea"
                    onChange={(e: any) => handleUpdate(review.id, "quote", e.target.value)}
                  />
                  <InputGroup
                    label="Testimony (Full)"
                    value={review.testimony}
                    type="textarea"
                    onChange={(e: any) => handleUpdate(review.id, "testimony", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <ImageUploadGroup
                  label="Profile Photo"
                  value={review.profilePhoto || null}
                  fallbackImage=""
                  onChange={(val: string) => handleUpdate(review.id, "profilePhoto", val)}
                />
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-[#888] text-sm py-12 border-2 border-dashed border-[#EAEAEA] rounded-xl">
            No reviews added yet.
          </p>
        )}
      </div>
    </div>
  );
}
