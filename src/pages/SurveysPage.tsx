import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Survey } from "../lib/types";
import SurveyCard from "../components/SurveyCard";
import SurveyForm from "../components/SurveyForm";
import { BarChart3, Plus, Minus, Loader2 } from "lucide-react";

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  useEffect(() => { fetchSurveys(); }, []);

  async function fetchSurveys() {
    setLoading(true);
    const { data } = await supabase.from("surveys").select("*").order("created_at", { ascending: false });
    if (data) setSurveys(data);
    setLoading(false);
  }

  const filtered = surveys.filter((s) => {
    const isClosed = new Date(s.close_date) < new Date();
    if (filter === "open") return !isClosed;
    if (filter === "closed") return isClosed;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <BarChart3 className="text-[#c9a227]" size={32} />
            สำรวจ/โหวต
          </h1>
          <p className="mt-1 text-[#64748b] text-sm">ร่วมโหวตและแสดงความคิดเห็น</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors flex items-center gap-2"
        >
          {showForm ? <Minus size={16} /> : <Plus size={16} />}
          {showForm ? "ซื่อน" : "ตั้งหัวข้อ"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <SurveyForm
            onAdded={() => { fetchSurveys(); setShowForm(false); }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {(["all", "open", "closed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === f ? "bg-[#1e3a5f] text-white" : "bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1]"
            }`}
          >
            {f === "all" ? "ทั้งหมด" : f === "open" ? "เปิดรับโหวต" : "ปิดโหวตแล้ว"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
          <BarChart3 className="mx-auto text-[#cbd5e1] mb-3" size={48} />
          <p className="text-[#64748b]">ยังไม่มีแบบสำรวจ</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <SurveyCard key={s.id} survey={s} onVoted={fetchSurveys} />
          ))}
        </div>
      )}
    </div>
  );
}
