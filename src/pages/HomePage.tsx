import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Contact, Event as EventType, News, Survey } from "../lib/types";
import EventCard from "../components/EventCard";
import NewsCard from "../components/NewsCard";
import SurveyCard from "../components/SurveyCard";
import {
  Users, CalendarDays, Newspaper, MessageCircle as BoardIcon,
  Star, BarChart3, Megaphone, Vote,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1e3a5f] via-[#2d5986] to-[#1e3a5f] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[#c9a227] rounded-full" />
          <div className="absolute bottom-10 right-20 w-48 h-48 border border-[#c9a227] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/20 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <img src="/logo.jpg" alt="NCO 1333 Logo" className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 rounded-2xl shadow-2xl object-cover border-4 border-[#c9a227]" />
          <div className="inline-flex items-center gap-2 bg-[#c9a227]/20 text-[#c9a227] px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-[#c9a227]/30">
            <Star size={14} />
            นักเรียนนายสิบรุ่นที่ 1333
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight">
            NCO <span className="text-[#c9a227]">1333</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-8">
            เพื่อนกันจนวันตาย — ติดต่อ แลกเปลี่ยน แบ่งปันข่าวสาร<br />
            ให้พวกเราไม่พลาดทุกเรื่องราวของรุ่น
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/news"
              className="px-5 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl hover:bg-[#d4b44a] transition-colors flex items-center gap-2 shadow-lg text-sm">
              <Megaphone size={16} /> ข่าวสาร
            </Link>
            <Link to="/surveys"
              className="px-5 py-2.5 bg-white text-[#1e3a5f] font-bold rounded-xl hover:bg-[#f0f7ff] transition-colors flex items-center gap-2 shadow-lg text-sm">
              <Vote size={16} /> โหวต
            </Link>
            <Link to="/contacts"
              className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20 text-sm">
              <Users size={16} /> รายชื่อเพื่อน
            </Link>
            <Link to="/events"
              className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20 text-sm">
              <CalendarDays size={16} /> กิจกรรม
            </Link>
            <Link to="/board"
              className="px-5 py-2.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20 text-sm">
              <BoardIcon size={16} /> สนทนา
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <QuickStats />
      </section>

      {/* ★ ข่าวสาร — สำคัญสุด อยู่บนสุด */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionHeader
          title="ข่าวสารล่าสุด"
          icon={<Newspaper size={24} className="text-[#c9a227]" />}
          linkTo="/news"
          linkText="ดูทั้งหมด"
        />
        <LatestNews />
      </section>

      {/* ★ โหวต — ต้องรีบตอบ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <SectionHeader
          title="โหวตล่าสุด"
          icon={<BarChart3 size={24} className="text-[#c9a227]" />}
          linkTo="/surveys"
          linkText="ดูทั้งหมด"
        />
        <LatestSurveys />
      </section>

      {/* ★ กิจกรรม */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <SectionHeader
          title="กิจกรรมล่าสุด"
          icon={<CalendarDays size={24} className="text-[#c9a227]" />}
          linkTo="/events"
          linkText="ดูทั้งหมด"
        />
        <LatestEvents />
      </section>
    </div>
  );
}

function SectionHeader({ title, icon, linkTo, linkText }: {
  title: string; icon: React.ReactNode; linkTo: string; linkText: string;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
        {icon} {title}
      </h2>
      <Link to={linkTo} className="text-sm text-[#c9a227] hover:underline font-medium flex items-center gap-1">
        {linkText} <span className="text-lg">→</span>
      </Link>
    </div>
  );
}

function QuickStats() {
  const [contacts, setContacts] = useState(0);
  const [events, setEvents] = useState(0);
  const [news, setNews] = useState(0);

  useEffect(() => {
    async function load() {
      const [c, e, n] = await Promise.all([
        supabase.from("contacts").select("id", { count: "exact", head: true }),
        supabase.from("events").select("id", { count: "exact", head: true }),
        supabase.from("news").select("id", { count: "exact", head: true }),
      ]);
      setContacts(c.count || 0);
      setEvents(e.count || 0);
      setNews(n.count || 0);
    }
    load();
  }, []);

  const stats = [
    { label: "เพื่อน", value: contacts, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "กิจกรรม", value: events, icon: CalendarDays, color: "bg-amber-50 text-amber-600" },
    { label: "ข่าวสาร", value: news, icon: Newspaper, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 bg-white rounded-2xl shadow-lg border border-[#e2e8f0] p-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="flex items-center gap-3 justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-black text-[#1e3a5f]">{s.value}</p>
              <p className="text-xs text-[#64748b]">{s.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LatestNews() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false }).limit(4);
      if (data) setNews(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-8"><div className="inline-block w-6 h-6 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" /></div>;
  const visible = news.filter((n) => !n.expires_at || new Date(n.expires_at) > new Date());
  if (visible.length === 0) return <p className="text-center text-[#94a3b8] py-8">ยังไม่มีข่าวสาร</p>;
  return <div className="grid gap-4 md:grid-cols-2">{visible.map((n) => <NewsCard key={n.id} item={n} />)}</div>;
}

function LatestSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("surveys").select("*").order("created_at", { ascending: false }).limit(2);
      if (data) setSurveys(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-8"><div className="inline-block w-6 h-6 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" /></div>;
  if (surveys.length === 0) return <p className="text-center text-[#94a3b8] py-8">ยังไม่มีแบบสำรวจ</p>;
  return <div className="grid gap-4 md:grid-cols-2">{surveys.map((s) => <SurveyCard key={s.id} survey={s} onVoted={() => {}} />)}</div>;
}

function LatestEvents() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false }).limit(3);
      if (data) setEvents(data);
      setLoading(false);
    }
    load();
    const handler = () => load();
    window.addEventListener("event-status-changed", handler);
    return () => window.removeEventListener("event-status-changed", handler);
  }, []);

  if (loading) return <div className="text-center py-8"><div className="inline-block w-6 h-6 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" /></div>;
  if (events.length === 0) return <p className="text-center text-[#94a3b8] py-8">ยังไม่มีกิจกรรม</p>;
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{events.map((e) => <EventCard key={e.id} event={e} />)}</div>;
}
