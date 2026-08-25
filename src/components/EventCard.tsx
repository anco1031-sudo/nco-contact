import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Event as EventType, EventStatus } from "../lib/types";
import { Link } from "react-router-dom";
import {
  Calendar, MapPin, Clock,
  ClipboardList, CheckCircle2, Hourglass, CircleCheckBig, Pencil, Timer, ExternalLink,
} from "lucide-react";
import ShareButton from "./ShareButton";

const statusConfig: Record<EventStatus, { label: string; color: string; icon: typeof Calendar }> = {
  survey: { label: "สำรวจ", color: "bg-blue-100 text-blue-700", icon: ClipboardList },
  upcoming: { label: "ยังไม่ถึง", color: "bg-amber-100 text-amber-700", icon: Hourglass },
  confirmed: { label: "ยืนยัน", color: "bg-green-100 text-green-700", icon: CircleCheckBig },
  in_progress: { label: "กำลังดำเนินการ", color: "bg-orange-100 text-orange-700", icon: CircleCheckBig },
  ended: { label: "จบแล้ว", color: "bg-gray-200 text-gray-600", icon: CheckCircle2 },
};

function getEventTarget(eventDate: string, eventTime: string | null) {
  const target = new Date(eventDate);
  if (eventTime) {
    const [h, m] = eventTime.split(":").map(Number);
    target.setHours(h, m, 0, 0);
  }
  return target;
}

function useEventTimer(eventDate: string, eventTime: string | null, status: EventStatus) {
  const isActive = status === "confirmed" || status === "in_progress";
  const [diff, setDiff] = useState<number>(() => getEventTarget(eventDate, eventTime).getTime() - Date.now());
  const [autoStatus, setAutoStatus] = useState<"in_progress" | "ended" | null>(null);

  useEffect(() => {
    if (!isActive) return;
    const tick = () => {
      const remaining = getEventTarget(eventDate, eventTime).getTime() - Date.now();
      setDiff(remaining);
      // วันนี้ = กำลังดำเนินการ
      if (remaining <= 0 && remaining > -(24 * 60 * 60 * 1000)) {
        setAutoStatus("in_progress");
      } else if (remaining <= -(24 * 60 * 60 * 1000)) {
        setAutoStatus("ended");
        clearInterval(interval);
      }
    };
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [eventDate, eventTime, isActive]);

  if (!isActive) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return { days, isPast: diff <= 0, autoStatus };
}

interface Props {
  event: EventType;
  onEdit?: (event: EventType) => void;
}

export default function EventCard({ event, onEdit }: Props) {
  const cfg = statusConfig[event.status] || statusConfig.survey;

  const countdown = useEventTimer(event.event_date, event.event_time, event.status);

  // Auto-update status when time passes
  useEffect(() => {
    if (!countdown?.autoStatus || countdown.autoStatus === event.status) return;
    supabase.from("events").update({ status: countdown.autoStatus }).eq("id", event.id).then(() => {
      window.dispatchEvent(new Event("event-status-changed"));
    });
  }, [countdown?.autoStatus, event.id, event.status]);

  const dateStr = new Date(event.event_date).toLocaleDateString("th-TH", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const displayStatus = countdown?.autoStatus || event.status;
  const displayCfg = statusConfig[displayStatus] || cfg;
  const DisplayIcon = displayCfg.icon;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-lg font-bold text-[#1e3a5f] leading-tight">{event.title}</h3>
          <div className="flex items-center gap-2 shrink-0">
            <ShareButton title={event.title} description={event.description || undefined} url={`${window.location.origin}/events/${event.id}`} />
            {event.status === "survey" && onEdit && (
              <button
                onClick={() => onEdit(event)}
                className="flex items-center gap-1 px-3 py-1 bg-[#1e3a5f] text-white rounded-full text-xs font-semibold hover:bg-[#2d5986] transition-colors"
              >
                <Pencil size={12} /> แก้ไข
              </button>
            )}
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${displayCfg.color}`}>
              <DisplayIcon size={14} />
              {displayCfg.label}
            </span>
          </div>
        </div>

        {/* Countdown for confirmed/in_progress events */}
        {(event.status === "confirmed" || event.status === "in_progress") && countdown && (
          <div className={`mb-3 p-3 rounded-xl border ${
            countdown.isPast
              ? "bg-gray-50 border-gray-200"
              : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
          }`}>
            {!countdown.isPast ? (
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-green-600" />
                <span className="text-xs font-semibold text-green-700">นับถอยหลัง</span>
                <div className="bg-green-600 text-white rounded-xl px-4 py-2 ml-2">
                  <span className="text-2xl font-bold">{countdown.days}</span>
                </div>
                <span className="text-sm text-green-700 font-medium">วัน</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Timer size={14} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">กำลังดำเนินการ</span>
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="space-y-1.5 text-sm text-[#64748b]">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0" />
            <span>{dateStr}</span>
          </div>
          {event.event_time && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="shrink-0" />
              <span>{event.event_time}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="shrink-0" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="text-xs text-[#94a3b8]">แจ้งโดย: {event.created_by}</div>
        </div>

        {/* View detail link */}
        <Link
          to={`/events/${event.id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e3a5f] hover:text-[#c9a227] transition-colors"
        >
          ดูรายละเอียด <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
