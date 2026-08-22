import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { News, NewsCategory } from "../lib/types";
import NewsCard from "../components/NewsCard";
import NewsForm from "../components/NewsForm";
import { Newspaper, Plus, Minus, Loader2 } from "lucide-react";

export default function NewsPage() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<NewsCategory | "all">("all");

  useEffect(() => { fetchNews(); }, []);

  async function fetchNews() {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }

  // ซ่อนข่าวหมดอายุ
  const notExpired = news.filter((n) => !n.expires_at || new Date(n.expires_at) > new Date());
  const filtered = filter === "all" ? notExpired : notExpired.filter((n) => n.category === filter);

  const catLabels: Record<NewsCategory | "all", string> = {
    all: "ทั้งหมด", pr: "ประชาสัมพันธ์", congratulations: "แสดงความยินดี", condolence: "สูญเสีย", other: "อื่นๆ",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Newspaper className="text-[#c9a227]" size={32} />
            ข่าวสาร
          </h1>
          <p className="mt-1 text-[#64748b] text-sm">ข่าวประชาสัมพันธ์ของรุ่น 1333</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors flex items-center gap-2"
        >
          {showForm ? <Minus size={16} /> : <Plus size={16} />}
          {showForm ? "ซ่อน" : "แจ้งข่าว"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <NewsForm onAdded={() => { fetchNews(); setShowForm(false); }} />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "pr", "congratulations", "condolence", "other"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === c ? "bg-[#1e3a5f] text-white" : "bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1]"
            }`}
          >
            {catLabels[c]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
          <Newspaper className="mx-auto text-[#cbd5e1] mb-3" size={48} />
          <p className="text-[#64748b]">ยังไม่มีข่าวสาร</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((n) => <NewsCard key={n.id} item={n} />)}
        </div>
      )}
    </div>
  );
}
