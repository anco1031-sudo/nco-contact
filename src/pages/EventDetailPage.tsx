import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Event as EventType, EventStatus } from "../lib/types";
import {
  Calendar, MapPin, Clock, ArrowLeft, Timer,
  ClipboardList, CheckCircle2, Hourglass, CircleCheckBig,
} from "lucide-react";
import ShareButton from "../components/ShareButton";

const statusConfig: Record<EventStatus, { label: string; color: string; icon: typeof Calendar }> = {
  survey: { label: "สำรวจ", color: "bg-blue-100 text-blue-700", icon: ClipboardList },
  upcoming: { label: "ยังไม่ถึง", color: "bg-amber-100 text-amber-700", icon: Hourglass },
  confirmed: { label: "ยืนยัน", color: "bg-green-100 text-green-700", icon: CircleCheckBig },
  in_progress: { label: "กำลังดำเนินการ", color: "bg-orange-100 text-orange-700", icon: CircleCheckBig },
  ended: { label: "จบแล้ว", color: "bg-gray-200 text-gray-600", icon: CheckCircle2 },
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    supabase.from("events").select("*").eq("id", id).single().then(({ data }) => {
      setEvent(data);
      setLoading(false);
    });
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!event || event.status !== "confirmed") return;
    const target = new Date(event.event_date);
    if (event.event_time) {
      const [h, m] = event.event_time.split(":").map(Number);
      target.setHours(h, m, 0, 0);
    }
    const tick = () => {
      const diff = target.getTime() - Date.now();
      setCountdown(diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0);
    };
    tick();
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-[#64748b]">ไม่พบกิจกรรมนี้</p>
        <Link to="/events" className="mt-4 inline-flex items-center gap-2 text-[#1e3a5f] hover:underline">
          <ArrowLeft size={16} /> กลับไปหน้ากิจกรรม
        </Link>
      </div>
    );
  }

  const cfg = statusConfig[event.status] || statusConfig.survey;
  const StatusIcon = cfg.icon;

  const dateStr = new Date(event.event_date).toLocaleDateString("th-TH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/events" className="inline-flex items-center gap-2 text-sm text-[#64748b] hover:text-[#1e3a5f] mb-6 transition-colors">
        <ArrowLeft size={16} /> กลับไปหน้ากิจกรรม
      </Link>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-[#e2e8f0]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] leading-tight">{event.title}</h1>
            <div className="flex items-center gap-2 shrink-0">
              <ShareButton title={event.title} description={event.description || undefined} />
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                <StatusIcon size={14} />
                {cfg.label}
              </span>
            </div>
          </div>

          {/* Countdown */}
          {event.status === "confirmed" && countdown !== null && countdown > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <Timer size={18} className="text-green-600" />
              <span className="text-sm font-semibold text-green-700">นับถอยหลัง</span>
              <div className="bg-green-600 text-white rounded-xl px-5 py-2">
                <span className="text-3xl font-bold">{countdown}</span>
              </div>
              <span className="text-sm text-green-700 font-medium">วัน</span>
            </div>
          )}

          {event.status === "in_progress" && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center gap-3">
              <CircleCheckBig size={18} className="text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">กำลังดำเนินการอยู่ในขณะนี้</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-xl">
              <Calendar size={20} className="text-[#1e3a5f] shrink-0" />
              <div>
                <p className="text-xs text-[#94a3b8]">วันที่</p>
                <p className="text-sm font-semibold text-[#1e3a5f]">{dateStr}</p>
              </div>
            </div>
            {event.event_time && (
              <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-xl">
                <Clock size={20} className="text-[#1e3a5f] shrink-0" />
                <div>
                  <p className="text-xs text-[#94a3b8]">เวลา</p>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{event.event_time} น.</p>
                </div>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-3 p-4 bg-[#f8fafc] rounded-xl sm:col-span-2">
                <MapPin size={20} className="text-[#1e3a5f] shrink-0" />
                <div>
                  <p className="text-xs text-[#94a3b8]">สถานที่</p>
                  <p className="text-sm font-semibold text-[#1e3a5f]">{event.location}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <div className="mt-6">
              <h3 className="text-sm font-bold text-[#1e3a5f] mb-3">รายละเอียด</h3>
              <div className="text-sm text-[#475569] whitespace-pre-wrap leading-relaxed bg-[#f8fafc] p-4 rounded-xl border border-[#e2e8f0]">
                {event.description}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#e2e8f0] flex items-center justify-between text-xs text-[#94a3b8]">
            <span>แจ้งโดย: {event.created_by}</span>
            <span>สร้างเมื่อ: {new Date(event.created_at).toLocaleDateString("th-TH")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
