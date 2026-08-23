import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Survey, SurveyOption, SurveyVote, SurveyImage } from "../lib/types";
import { Link } from "react-router-dom";
import { BarChart3, Clock, CheckCircle2, Send, Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import ShareButton from "./ShareButton";
import { ClickableImage } from "./ImageLightbox";

interface Props {
  survey: Survey;
  onVoted?: () => void;
}

export default function SurveyCard({ survey, onVoted }: Props) {
  const [options, setOptions] = useState<SurveyOption[]>([]);
  const [votes, setVotes] = useState<SurveyVote[]>([]);
  const [extraImages, setExtraImages] = useState<SurveyImage[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [voterName, setVoterName] = useState("");
  const [voting, setVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const isClosed = new Date(survey.close_date) < new Date();

  // รวมรูปทั้งหมด: image_url หลัก + รูปเพิ่มเติม
  const allImages: string[] = [
    ...(survey.image_url ? [survey.image_url] : []),
    ...extraImages.sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url),
  ];

  useEffect(() => {
    fetchData();
  }, [survey.id]);

  async function fetchData() {
    const [optRes, voteRes, imgRes] = await Promise.all([
      supabase.from("survey_options").select("*").eq("survey_id", survey.id).order("sort_order"),
      supabase.from("survey_votes").select("*").eq("survey_id", survey.id),
      supabase.from("survey_images").select("*").eq("survey_id", survey.id).order("sort_order"),
    ]);
    if (optRes.data) setOptions(optRes.data);
    if (voteRes.data) setVotes(voteRes.data);
    if (imgRes.data) setExtraImages(imgRes.data);
  }

  function getVoteCount(optionId: string) {
    return votes.filter((v) => v.option_id === optionId).length;
  }

  function getTotalVotes() {
    return votes.length;
  }

  async function handleVote(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOption || !voterName.trim()) return;
    setVoting(true);
    const { error } = await supabase.from("survey_votes").insert({
      survey_id: survey.id,
      option_id: selectedOption,
      voter_name: voterName.trim(),
    });
    if (!error) {
      setHasVoted(true);
      setShowResults(true);
      await fetchData();
      onVoted?.();
    }
    setVoting(false);
  }

  const daysLeft = Math.ceil((new Date(survey.close_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
      {/* Image Gallery */}
      {allImages.length > 0 && (
        <div className="relative bg-gray-100">
          <ClickableImage
            src={allImages[currentImage]}
            alt={`${survey.title} รูป ${currentImage + 1}`}
            allImages={allImages}
            className="w-full max-h-[300px]"
          />

          {/* Navigation arrows */}
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

          {/* Dots */}
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

          {/* Image counter */}
          {allImages.length > 1 && (
            <span className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
              {currentImage + 1}/{allImages.length}
            </span>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-[#1e3a5f] leading-tight">{survey.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton title={survey.title} description={survey.description || undefined} />
            {isClosed ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-600">
                <CheckCircle2 size={14} /> ปิดโหวตแล้ว
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                <Clock size={14} /> เหลือ {daysLeft} วัน
              </span>
            )}
          </div>
        </div>

        {survey.description && (
          <p className="text-sm text-[#64748b] mb-4 whitespace-pre-wrap">{survey.description}</p>
        )}

        {/* Results toggle */}
        <button
          onClick={() => setShowResults(!showResults)}
          className="flex items-center gap-1.5 text-xs text-[#1e3a5f] font-medium hover:underline mb-3"
        >
          <BarChart3 size={14} />
          {showResults ? "ซ่อนผลโหวต" : `ดูผลโหวต (${getTotalVotes()} โหวต)`}
        </button>

        {/* Results */}
        {showResults && (
          <div className="space-y-2 mb-4 p-3 bg-[#f8fafc] rounded-xl">
            {options.length === 0 ? (
              <p className="text-xs text-[#94a3b8] text-center py-2">ยังไม่มีตัวเลือก</p>
            ) : options.map((opt) => {
              const count = getVoteCount(opt.id);
              const pct = getTotalVotes() > 0 ? Math.round((count / getTotalVotes()) * 100) : 0;
              return (
                <div key={opt.id} className="relative">
                  <div className="absolute inset-0 rounded-lg bg-[#1e3a5f]/10" style={{ width: `${pct}%` }} />
                  <div className="relative px-3 py-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1e3a5f]">{opt.label}</span>
                    <span className="text-xs text-[#64748b] font-semibold">{count} โหวต ({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Vote form */}
        {!isClosed && !hasVoted && (
          <form onSubmit={handleVote} className="space-y-3">
            <div className="space-y-1.5">
              {options.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all text-sm ${
                    selectedOption === opt.id
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]/30"
                      : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                  }`}
                >
                  <input
                    type="radio"
                    name={`survey-${survey.id}`}
                    value={opt.id}
                    checked={selectedOption === opt.id}
                    onChange={() => setSelectedOption(opt.id)}
                    className="accent-[#1e3a5f]"
                  />
                  <span className="text-[#1e3a5f] font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                placeholder="ชื่อ-สกุล"
                required
                className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none"
              />
              <button
                type="submit"
                disabled={voting || !selectedOption || !voterName.trim()}
                className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {voting ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                โหวต
              </button>
            </div>
          </form>
        )}

        {hasVoted && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-xl">
            <CheckCircle2 size={16} /> โหวตเรียบร้อยแล้ว!
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-[#94a3b8]">แจ้งโดย: {survey.created_by}</span>
          <Link
            to={`/surveys/${survey.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] hover:text-[#c9a227] transition-colors"
          >
            ดูรายละเอียด <ExternalLink size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
