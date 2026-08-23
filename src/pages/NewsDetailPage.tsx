import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { News, NewsCategory, NewsImage } from "../lib/types";
import {
  ArrowLeft, Megaphone, Heart, Flower2, Newspaper,
  ChevronLeft, ChevronRight, Clock,
} from "lucide-react";
import ShareButton from "../components/ShareButton";

const categoryConfig: Record<NewsCategory, { label: string; color: string; icon: typeof Newspaper }> = {
  pr: { label: "ประชาสัมพันธ์", color: "bg-blue-100 text-blue-700", icon: Megaphone },
  congratulations: { label: "แสดงความยินดี", color: "bg-yellow-100 text-yellow-700", icon: Heart },
  condolence: { label: "สูญเสีย", color: "bg-purple-100 text-purple-700", icon: Flower2 },
  other: { label: "อื่นๆ", color: "bg-gray-100 text-gray-600", icon: Newspaper },
};

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<News | null>(null);
  const [images, setImages] = useState<NewsImage[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("news").select("*").eq("id", id).single(),
      supabase.from("news_images").select("*").eq("news_id", id).order("sort_order"),
    ]).then(([newsRes, imgRes]) => {
      setItem(newsRes.data);
      if (imgRes.data) setImages(imgRes.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[#64748b]">ไม่พบข่าวนี้</p>
        <Link to="/news" className="mt-4 inline-flex items-center gap-2 text-[#1e3a5f] hover:underline">
          <ArrowLeft size={16} /> กลับไปหน้าข่าวสาร
        </Link>
      </div>
    );
  }

  const cfg = categoryConfig[item.category] || categoryConfig.other;
  const CatIcon = cfg.icon;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/news" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1e3a5f] mb-6 transition-colors">
        <ArrowLeft size={16} /> กลับไปหน้าข่าวสาร
      </Link>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="relative bg-gray-100">
            <img
              src={images[currentImage].image_url}
              alt={`${item.title} รูป ${currentImage + 1}`}
              className="w-full max-h-[500px] object-contain"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentImage ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
            {images.length > 1 && (
              <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                {currentImage + 1}/{images.length}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] leading-tight">{item.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <ShareButton title={item.title} description={item.content || undefined} />
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                <CatIcon size={14} />
                {cfg.label}
              </span>
            </div>
          </div>

          {item.content && (
            <div className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed mt-6 bg-[#f8fafc] p-5 rounded-xl border border-[#e2e8f0]">
              {item.content}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#94a3b8]">
            <span>โดย {item.created_by}</span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(item.created_at).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
