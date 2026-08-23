import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Survey, SurveyOption, SurveyVote, SurveyImage } from "../lib/types";
import {
  ArrowLeft, BarChart3, Clock, CheckCircle2, Send, Loader2,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import ShareButton from "../components/ShareButton";
import { ClickableImage } from "../components/ImageLightbox";

export default function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [options, setOptions] = useState<SurveyOption[]>([]);
  const [votes, setVotes] = useState<SurveyVote[]>([]);
  const [extraImages, setExtraImages] = useState<SurveyImage[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voterName, setVoterName] = useState("");
  const [voting, setVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from("surveys").select("*").eq("id", id).single(),
      supabase.from("survey_options").select("*").eq("survey_id", id).order("sort_order"),
      supabase.from("survey_votes").select("*").eq("survey_id", id),
      supabase.from("survey_images").select("*").eq("survey_id", id).order("sort_order"),
    ]).then(([surveyRes, optRes, voteRes, imgRes]) => {
      setSurvey(surveyRes.data);
      if (optRes.data) setOptions(optRes.data);
      if (voteRes.data) setVotes(voteRes.data);
      if (imgRes.data) setExtraImages(imgRes.data);
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

  if (!survey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[#64748b]">ไม่พบแบบสำรวจ</p>
        <Link to="/surveys" className="mt-4 inline-flex items-center gap-2 text-[#1e3a5f] hover:underline">
          <ArrowLeft size={16} /> กลับไปหน้าโหวต
        </Link>
      </div>
    );
  }

  // eslint-disable-next-line -- survey ไม่ possibly null แล้ว (early return ด้านบน)
  const s: Survey = survey!;

  const allImages: string[] = [
    ...(s.image_url ? [s.image_url] : []),
    ...extraImages.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url),
  ];

  const isClosed = new Date(s.close_date) < new Date();
  const daysLeft = Math.ceil((new Date(s.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const totalVotes = votes.length;

  function getVoteCount(optionId: string) {
    return votes.filter((v) => v.option_id === optionId).length;
  }

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOption || !voterName.trim()) return;
    setVoting(true);
    const { error } = await supabase.from("survey_votes").insert({
      survey_id: s.id,
      option_id: selectedOption,
      voter_name: voterName.trim(),
    });
    if (!error) {
      setHasVoted(true);
      const { data } = await supabase.from("survey_votes").select("*").eq("survey_id", s.id);
      if (data) setVotes(data);
    }
    setVoting(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/surveys" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1e3a5f] mb-6 transition-colors">
        <ArrowLeft size={16} /> กลับไปหน้าโหวต
      </Link>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Image Gallery */}
        {allImages.length > 0 && (
          <div className="bg-gray-100">
            <ClickableImage
              src={allImages[currentImage]}
              alt={`${s.title} รูป ${currentImage + 1}`}
              allImages={allImages}
              className="w-full"
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentImage((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
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
            {allImages.length > 1 && (
              <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full">
                {currentImage + 1}/{allImages.length}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] leading-tight">{s.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <ShareButton title={s.title} description={s.description || undefined} />
              {isClosed ? (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                  <CheckCircle2 size={14} /> ปิดโหวตแล้ว
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  <Clock size={14} /> เหลือ {daysLeft} วัน
                </span>
              )}
            </div>
          </div>

          {s.description && (
            <p className="text-sm text-[#64748b] whitespace-pre-wrap leading-relaxed mb-6 bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
              {s.description}
            </p>
          )}

          {/* Results */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-[#1e3a5f] mb-3 flex items-center gap-2">
              <BarChart3 size={16} /> ผลโหวต ({totalVotes} โหวต)
            </h3>
            <div className="space-y-2">
              {options.length === 0 ? (
                <p className="text-xs text-[#94a3b8] text-center py-4">ยังไม่มีตัวเลือก</p>
              ) : options.map((opt) => {
                const count = getVoteCount(opt.id);
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                return (
                  <div key={opt.id} className="relative bg-[#f8fafc] rounded-xl overflow-hidden border border-[#e2e8f0]">
                    <div
                      className="absolute inset-0 bg-[#1e3a5f]/10 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                    <div className="relative px-4 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-[#1e3a5f]">{opt.label}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#64748b]">{count} โหวต</span>
                        <span className="text-sm font-bold text-[#1e3a5f] bg-white px-2 py-0.5 rounded-lg">{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vote form */}
          {!isClosed && !hasVoted && (
            <form onSubmit={handleVote} className="space-y-4 p-5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
              <h3 className="text-sm font-bold text-[#1e3a5f]">เลือกตัวเลือกของคุณ</h3>
              <div className="space-y-2">
                {options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm ${
                      selectedOption === opt.id
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/30"
                        : "border-[#e2e8f0] hover:border-[#cbd5e1] bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`survey-${s.id}`}
                      value={opt.id}
                      checked={selectedOption === opt.id}
                      onChange={() => setSelectedOption(opt.id)}
                      className="accent-[#1e3a5f]"
                    />
                    <span className="text-[#1e3a5f] font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  placeholder="ชื่อ-สกุล"
                  required
                  className="flex-1 px-4 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none"
                />
                <button
                  type="submit"
                  disabled={voting || !selectedOption || !voterName.trim()}
                  className="px-6 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {voting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                  โหวต
                </button>
              </div>
            </form>
          )}

          {hasVoted && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
              <CheckCircle2 size={18} /> โหวตเรียบร้อยแล้ว! ขอบคุณครับ
            </div>
          )}

          {isClosed && (
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <CheckCircle2 size={18} /> ปิดโหวตแล้ว — ดูผลโหวตได้ด้านบน
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#94a3b8]">
            <span>สร้างโดย: {s.created_by}</span>
            <span>ปิดโหวต: {new Date(s.close_date).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
