import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { News, NewsCategory, NewsImage } from "../lib/types";
import { Link } from "react-router-dom";
import { Megaphone, Heart, Flower2, Newspaper, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import ShareButton from "./ShareButton";

const categoryConfig: Record<NewsCategory, { label: string; color: string; icon: typeof Newspaper }> = {
  pr: { label: "ประชาสัมพันธ์", color: "bg-blue-100 text-blue-700", icon: Megaphone },
  congratulations: { label: "แสดงความยินดี", color: "bg-yellow-100 text-yellow-700", icon: Heart },
  condolence: { label: "สูญเสีย", color: "bg-purple-100 text-purple-700", icon: Flower2 },
  other: { label: "อื่นๆ", color: "bg-gray-100 text-gray-600", icon: Newspaper },
};

export default function NewsCard({ item }: { item: News }) {
  const cfg = categoryConfig[item.category] || categoryConfig.other;
  const CatIcon = cfg.icon;
  const [images, setImages] = useState<NewsImage[]>([]);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("news_images").select("*").eq("news_id", item.id).order("sort_order");
      if (data) setImages(data);
    }
    load();
  }, [item.id]);

  const allImages: string[] = images.map((i) => i.image_url);

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Image Gallery */}
      {allImages.length > 0 && (
        <div className="relative bg-gray-100">
          <div className="aspect-video overflow-hidden">
            <img
              src={allImages[currentImage]}
              alt={`${item.title} รูป ${currentImage + 1}`}
              className="w-full h-full object-cover"
            />
          </div>

          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {allImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImage(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentImage ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {allImages.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              {currentImage + 1}/{allImages.length}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-[#1e3a5f] leading-tight">{item.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton title={item.title} description={item.content || undefined} />
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
              <CatIcon size={14} />
              {cfg.label}
            </span>
          </div>
        </div>
        {item.content && (
          <p className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed line-clamp-3">{item.content}</p>
        )}
        <div className="mt-3 flex items-center justify-between text-xs text-[#94a3b8]">
          <span>โดย {item.created_by}</span>
          <span>{new Date(item.created_at).toLocaleDateString("th-TH")}</span>
        </div>
        <Link
          to={`/news/${item.id}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] hover:text-[#c9a227] transition-colors"
        >
          ดูรายละเอียด <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
