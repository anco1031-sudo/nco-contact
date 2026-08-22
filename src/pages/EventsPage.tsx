import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Event as EventType, EventStatus } from "../lib/types";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import { CalendarDays, Plus, Minus, Loader2, X } from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<EventStatus | "all">("all");
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);

  useEffect(() => {
    fetchEvents();
    const handler = () => fetchEvents();
    window.addEventListener("event-status-changed", handler);
    return () => window.removeEventListener("event-status-changed", handler);
  }, []);

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  }

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  const statusLabels: Record<EventStatus | "all", string> = {
    all: "ทั้งหมด", survey: "สำรวจ", upcoming: "ยังไม่ถึง", confirmed: "ยืนยัน", in_progress: "กำลังดำเนินการ", ended: "จบแล้ว",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <CalendarDays className="text-[#c9a227]" size={32} />
            กิจกรรม
          </h1>
          <p className="mt-1 text-[#64748b] text-sm">แจ้งข่าวกิจกรรมของรุ่น 1333</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingEvent(null); }}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors flex items-center gap-2"
        >
          {showForm ? <Minus size={16} /> : <Plus size={16} />}
          {showForm ? "ซ่อน" : "แจ้งกิจกรรม"}
        </button>
      </div>

      {(showForm || editingEvent) && (
        <div className="mb-6">
          <EventForm
            editEvent={editingEvent}
            onAdded={() => { fetchEvents(); setShowForm(false); setEditingEvent(null); }}
            onCancel={() => { setShowForm(false); setEditingEvent(null); }}
          />
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "survey", "upcoming", "confirmed", "in_progress", "ended"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? "bg-[#1e3a5f] text-white" : "bg-[#e2e8f0] text-[#64748b] hover:bg-[#cbd5e1]"
            }`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#e2e8f0]">
          <CalendarDays className="mx-auto text-[#cbd5e1] mb-3" size={48} />
          <p className="text-[#64748b]">ยังไม่มีกิจกรรม</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onEdit={(ev) => { setEditingEvent(ev); setShowForm(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
