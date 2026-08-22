import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { ContactRequest, Event as EventType, News, Post, Survey } from "../lib/types";
import { RANKS, UNITS, COMPANIES } from "../lib/constants";
import {
  Shield, LogIn, LogOut, CheckCircle2, XCircle,
  Clock, Trash2, Loader2, Users, CalendarDays, Newspaper,
  MessageCircle, Pencil, X, BarChart3, Plus,
} from "lucide-react";
import EventForm from "../components/EventForm";
import NewsForm from "../components/NewsForm";

type Tab = "requests" | "contacts" | "events" | "news" | "surveys" | "board";

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => { checkUser(); }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase
        .from("user_roles").select("role")
        .eq("user_id", user.id).eq("role", "admin").single();
      setIsAdmin(!!data);
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    else await checkUser();
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  const input = "w-full px-4 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none";

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="animate-spin text-[#1e3a5f]" size={32} /></div>;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          <div className="text-center mb-8">
            <Shield className="mx-auto text-[#c9a227] mb-3" size={48} />
            <h1 className="text-2xl font-bold text-[#1e3a5f]">Admin Login</h1>
            <p className="text-[#64748b] text-sm mt-2">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
          </div>
          {authError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{authError}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" className={input} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className={input} />
            </div>
            <button type="submit" disabled={authLoading}
              className="w-full py-3 bg-[#1e3a5f] text-white rounded-xl font-medium hover:bg-[#2d5986] transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {authLoading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 shadow-sm">
          <XCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-[#64748b] text-sm mb-4">บัญชีของท่านไม่มีสิทธิ์ Administrator</p>
          <button onClick={handleLogout} className="px-6 py-2.5 border border-[#cbd5e1] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("requests");
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loadingR, setLoadingR] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoadingR(true);
    const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoadingR(false);
  }

  async function handleReview(id: string, status: "approved" | "rejected") {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    if (status === "approved") {
      if (req.type === "edit" && req.contact_id && req.edit_data) {
        // อนุมัติแก้ไข → อัพเดท contact
        await supabase.from("contacts").update(req.edit_data).eq("id", req.contact_id);
      } else {
        // อนุมัติเพิ่มใหม่ → insert contact
        await supabase.from("contacts").insert({
          rank: req.rank, first_name: req.first_name, last_name: req.last_name,
          unit: req.unit, company: req.company, workplace: req.workplace,
          phone: req.phone, line_id: req.line_id, notes: req.notes,
        });
      }
    }
    await supabase.from("requests").update({ status, reviewed_by: user.email, reviewed_at: new Date().toISOString() }).eq("id", id);
    await fetchRequests();
  }

  async function handleDeleteRequest(id: string) {
    await supabase.from("requests").delete().eq("id", id);
    await fetchRequests();
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const tabs: { id: Tab; label: string; icon: typeof Clock; badge?: number }[] = [
    { id: "requests", label: "คำขอ", icon: Clock, badge: pendingCount },
    { id: "contacts", label: "รายชื่อ", icon: Users },
    { id: "events", label: "กิจกรรม", icon: CalendarDays },
    { id: "news", label: "ข่าวสาร", icon: Newspaper },
    { id: "surveys", label: "โหวต", icon: BarChart3 },
    { id: "board", label: "กระดาน", icon: MessageCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Shield className="text-[#c9a227]" size={32} /> Admin Dashboard
          </h1>
          <p className="mt-1 text-[#64748b] text-sm">ยินดีต้อนรับ {user.email}</p>
        </div>
        <button onClick={onLogout} className="px-4 py-2 border border-[#cbd5e1] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#e2e8f0] pb-2 overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                tab === t.id ? "bg-[#1e3a5f] text-white" : "text-[#64748b] hover:bg-gray-100"
              }`}>
              <Icon size={16} /> {t.label}
              {t.badge && t.badge > 0 && (
                <span className="bg-[#c9a227] text-[#1e3a5f] text-xs px-2 py-0.5 rounded-full font-bold">{t.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "requests" && <RequestsTab requests={requests} loading={loadingR} onReview={handleReview} onDelete={handleDeleteRequest} />}
      {tab === "contacts" && <ContactsTab />}
      {tab === "events" && <EventsTab />}
      {tab === "news" && <NewsTab />}
      {tab === "surveys" && <SurveysTab />}
      {tab === "board" && <BoardTab />}
    </div>
  );
}

function RequestsTab({ requests, loading, onReview, onDelete }: {
  requests: ContactRequest[]; loading: boolean;
  onReview: (id: string, s: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}) {
  const editLabel: Record<string, string> = {
    rank: "ยศ", first_name: "ชื่อ", last_name: "สกุล", unit: "เหล่า",
    company: "กองร้อย", workplace: "ที่ทำงาน", phone: "เบอร์โทร", line_id: "LINE", notes: "หมายเหตุ",
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>;
  if (requests.length === 0) return <EmptyState icon={<Clock size={48} />} text="ยังไม่มีคำขอ" />;
  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const reqType = req.type || "add";
        const editData = req.edit_data;
        const isEdit = reqType === "edit";
        return (
          <div key={req.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${req.status === "pending" ? "border-[#c9a227]/30" : "border-[#e2e8f0]"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="font-bold text-[#c9a227]">{req.rank}</span>{" "}
                <span className="font-medium">{req.first_name} {req.last_name}</span>
                <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${isEdit ? "bg-blue-100 text-blue-700" : req.status === "pending" ? "badge-pending" : req.status === "approved" ? "badge-approved" : "badge-rejected"}`}>
                  {isEdit ? "ขอแก้ไข" : req.status === "pending" ? "รออนุมัติ" : req.status === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ"}
                </span>
                {!isEdit && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${req.status === "pending" ? "badge-pending" : req.status === "approved" ? "badge-approved" : "badge-rejected"}`}>
                    {req.status === "pending" ? "รออนุมัติ" : req.status === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ"}
                  </span>
                )}
              </div>
              <div className="text-xs text-[#94a3b8]">ส่งเมื่อ: {new Date(req.created_at).toLocaleDateString("th-TH")}</div>
            </div>

            {/* แสดงข้อมูลที่ขอแก้ไข */}
            {isEdit && editData && Object.keys(editData).length > 0 && (
              <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-2">📝 ข้อมูลที่ต้องการแก้ไข:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(editData).map(([key, val]) => (
                    <div key={key} className="text-xs">
                      <span className="text-blue-600 font-medium">{editLabel[key] || key}: </span>
                      <span className="text-[#1e3a5f]">{val || "(ว่าง)"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* แสดงข้อมูลเดิม (เฉพาะ add) */}
            {!isEdit && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
                <div><span className="text-[#64748b]">เหล่า: </span>{req.unit}</div>
                <div><span className="text-[#64748b]">กองร้อย: </span>{req.company}</div>
                {req.workplace && <div><span className="text-[#64748b]">ที่ทำงาน: </span>{req.workplace}</div>}
                {req.phone && <div><span className="text-[#64748b]">เบอร์: </span>{req.phone}</div>}
                {req.line_id && <div><span className="text-[#64748b]">LINE: </span>{req.line_id}</div>}
                {req.notes && <div className="col-span-2"><span className="text-[#64748b]">หมายเหตุ: </span>{req.notes}</div>}
              </div>
            )}

            <div className="text-xs text-[#94a3b8] border-t border-[#e2e8f0] pt-3">ผู้ขอ: {req.requester_name} | เบอร์ผู้ขอ: {req.requester_phone}</div>
            {req.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <button onClick={() => onReview(req.id, "approved")} className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> อนุมัติ
                </button>
                <button onClick={() => onReview(req.id, "rejected")} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5">
                  <XCircle size={16} /> ไม่อนุมัติ
                </button>
                <button onClick={() => onDelete(req.id)} className="px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm text-[#64748b] hover:bg-gray-50 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ContactsTab() {
  const [contacts, setContacts] = useState<{ id: string; rank: string; first_name: string; last_name: string; unit: string; company: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { fetchContacts(); }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data } = await supabase.from("contacts").select("id, rank, first_name, last_name, unit, company").order("rank");
    if (data) setContacts(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await supabase.from("contacts").delete().eq("id", id);
    await fetchContacts();
    setDeleting(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#64748b]">{contacts.length} รายการ</p>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] rounded-xl text-sm font-bold hover:bg-[#d4b44a] transition-colors">
          {showForm ? "ซ่อน" : "+ เพิ่มชื่อ"}
        </button>
      </div>
      {showForm && <div className="mb-6"><AddContactForm onAdded={() => { fetchContacts(); setShowForm(false); }} /></div>}
      {loading ? <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div> : (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1e3a5f]/5 border-b border-[#e2e8f0]">
                <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">ยศ-ชื่อ-สกุล</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">เหล่า</th>
                <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">กองร้อย</th>
                <th className="text-right px-4 py-3 font-semibold text-[#1e3a5f]">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-[#e2e8f0]/50 hover:bg-[#f0f7ff] transition-colors">
                  <td className="px-4 py-3"><span className="font-bold text-[#c9a227]">{c.rank}</span> {c.first_name} {c.last_name}</td>
                  <td className="px-4 py-3 text-[#64748b]">{c.unit}</td>
                  <td className="px-4 py-3 text-[#64748b]">{c.company}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                      {deleting === c.id ? <Loader2 className="animate-spin" size={14} /> : "ลบ"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AddContactForm({ onAdded }: { onAdded: () => void }) {
  const [form, setForm] = useState({ rank: "", first_name: "", last_name: "", unit: "", company: "", workplace: "", phone: "", line_id: "", notes: "" });
  const [saving, setSaving] = useState(false);
  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) { setForm({ ...form, [e.target.name]: e.target.value }); }
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const { error } = await supabase.from("contacts").insert({ rank: form.rank, first_name: form.first_name, last_name: form.last_name, unit: form.unit, company: form.company, workplace: form.workplace, phone: form.phone, line_id: form.line_id, notes: form.notes });
    if (!error) onAdded(); setSaving(false);
  }
  const input = "px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none";
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#c9a227]/30 p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-[#1e3a5f] text-sm">เพิ่มชื่อใหม่</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select name="rank" value={form.rank} onChange={handleChange} required className={input}><option value="">ยศ</option>{RANKS.map((r) => <option key={r} value={r}>{r}</option>)}</select>
        <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="ชื่อ" className={input} />
        <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="สกุล" className={input} />
        <select name="unit" value={form.unit} onChange={handleChange} required className={input}><option value="">เหล่า</option>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}</select>
        <select name="company" value={form.company} onChange={handleChange} required className={input}><option value="">กองร้อย</option>{COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        <input name="workplace" value={form.workplace} onChange={handleChange} placeholder="ที่ทำงาน" className={input} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="เบอร์โทร" className={input} />
        <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="LINE ID" className={input} />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="หมายเหตุ" className={input} />
      </div>
      <button type="submit" disabled={saving} className="px-6 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2d5986] transition-colors disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 className="animate-spin" size={14} />} บันทึก
      </button>
    </form>
  );
}

function EventsTab() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch();
    const handler = () => fetch();
    window.addEventListener("event-status-changed", handler);
    return () => window.removeEventListener("event-status-changed", handler);
  }, []);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("event_date", { ascending: false });
    if (data) setEvents(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบกิจกรรมนี้?")) return;
    setDeleting(id);
    await supabase.from("events").delete().eq("id", id);
    await fetch();
    setDeleting(null);
  }

  const statusLabel: Record<string, string> = { survey: "สำรวจ", upcoming: "ยังไม่ถึง", confirmed: "ยืนยัน", in_progress: "กำลังดำเนินการ", ended: "จบแล้ว" };
  const statusColor: Record<string, string> = {
    survey: "bg-blue-100 text-blue-700", upcoming: "bg-amber-100 text-amber-700",
    confirmed: "bg-green-100 text-green-700", in_progress: "bg-orange-100 text-orange-700",
    ended: "bg-gray-200 text-gray-600",
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#64748b]">{events.length} กิจกรรม</p>
        <button onClick={() => { setShowForm(!showForm); setEditingEvent(null); }}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] rounded-xl text-sm font-bold hover:bg-[#d4b44a] transition-colors">
          {showForm ? "ซ่อน" : "+ แจ้งกิจกรรม"}
        </button>
      </div>
      {(showForm || editingEvent) && (
        <div className="mb-6">
          <EventForm
            editEvent={editingEvent}
            onAdded={() => { fetch(); setShowForm(false); setEditingEvent(null); }}
            onCancel={() => { setShowForm(false); setEditingEvent(null); }}
          />
        </div>
      )}
      {events.length === 0 ? <EmptyState icon={<CalendarDays size={48} />} text="ยังไม่มีกิจกรรม" /> : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1e3a5f] truncate">{e.title}</p>
                <p className="text-xs text-[#64748b] mt-1">
                  {new Date(e.event_date).toLocaleDateString("th-TH")} {e.event_time && `| ${e.event_time}`}
                  {e.location && ` | ${e.location}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[e.status] || ""}`}>
                    {statusLabel[e.status] || e.status}
                  </span>
                  <span className="text-xs text-[#94a3b8]">โดย: {e.created_by}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditingEvent(e); setShowForm(false); }}
                  className="px-3 py-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <Pencil size={14} /> แก้ไข
                </button>
                <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                  {deleting === e.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewsTab() {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบข่าวนี้?")) return;
    setDeleting(id);
    // ลบรูปจาก Storage
    const { data: imgs } = await supabase.from("news_images").select("image_url").eq("news_id", id);
    if (imgs && imgs.length > 0) {
      const files = imgs.map((i) => i.image_url.split("/").pop()!);
      await supabase.storage.from("survey-images").remove(files);
    }
    await supabase.from("news_images").delete().eq("news_id", id);
    await supabase.from("news").delete().eq("id", id);
    await fetch();
    setDeleting(null);
  }

  const catLabel: Record<string, string> = { pr: "ประชาสัมพันธ์", congratulations: "แสดงความยินดี", condolence: "สูญเสีย", other: "อื่นๆ" };

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#64748b]">{news.length} ข่าว</p>
        <button onClick={() => { setShowForm(!showForm); setEditingNews(null); }}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] rounded-xl text-sm font-bold hover:bg-[#d4b44a] transition-colors">
          {showForm ? "ซ่อน" : "+ แจ้งข่าว"}
        </button>
      </div>
      {(showForm || editingNews) && (
        <div className="mb-6">
          <NewsForm
            editNews={editingNews}
            onAdded={() => { fetch(); setShowForm(false); setEditingNews(null); }}
            onCancel={() => { setShowForm(false); setEditingNews(null); }}
          />
        </div>
      )}
      {news.length === 0 ? <EmptyState icon={<Newspaper size={48} />} text="ยังไม่มีข่าวสาร" /> : (
        <div className="space-y-3">
          {news.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#1e3a5f] truncate">{n.title}</p>
                  {n.expires_at && new Date(n.expires_at) < new Date() && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold shrink-0">หมดอายุ</span>
                  )}
                </div>
                <p className="text-xs text-[#64748b] mt-1">{catLabel[n.category] || n.category} | {n.created_by} | {new Date(n.created_at).toLocaleDateString("th-TH")}</p>
                {n.expires_at && (
                  <p className="text-xs text-[#94a3b8] mt-0.5">หมดอายุ: {new Date(n.expires_at).toLocaleDateString("th-TH")}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { setEditingNews(n); setShowForm(false); }}
                  className="px-3 py-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <Pencil size={14} /> แก้ไข
                </button>
                <button onClick={() => handleDelete(n.id)} disabled={deleting === n.id}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                  {deleting === n.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BoardTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  useEffect(() => { fetchPosts(); }, []);

  async function fetchPosts() {
    setLoading(true);
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (data) {
      setPosts(data);
      // Fetch comment counts for each post
      const counts: Record<string, number> = {};
      for (const p of data) {
        const { count } = await supabase
          .from("comments").select("*", { count: "exact", head: true })
          .eq("post_id", p.id);
        counts[p.id] = count ?? 0;
      }
      setCommentCounts(counts);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบโพสต์นี้?")) return;
    setDeleting(id);
    // Delete comments first
    await supabase.from("comments").delete().eq("post_id", id);
    await supabase.from("posts").delete().eq("id", id);
    await fetchPosts();
    setDeleting(null);
  }

  // Sort: inactive posts (no comments, old) first
  const now = Date.now();
  const sortedPosts = [...posts].sort((a, b) => {
    const aAge = now - new Date(a.created_at).getTime();
    const bAge = now - new Date(b.created_at).getTime();
    const aComments = commentCounts[a.id] ?? 0;
    const bComments = commentCounts[b.id] ?? 0;
    // Inactive = old + no comments (show first so admin can review)
    const aInactive = aComments === 0 && aAge > 7 * 24 * 60 * 60 * 1000;
    const bInactive = bComments === 0 && bAge > 7 * 24 * 60 * 60 * 1000;
    if (aInactive !== bInactive) return aInactive ? -1 : 1;
    return bAge - aAge;
  });

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>;
  if (posts.length === 0) return <EmptyState icon={<MessageCircle size={48} />} text="ยังไม่มีโพสต์" />;

  return (
    <div>
      <p className="text-sm text-[#64748b] mb-4">{posts.length} โพสต์ | เรียง: โพสต์ไม่เคลื่อนไหวอยู่บนสุด (ไม่มีคอมเมนต์ & โพสต์มากกว่า 7 วัน)</p>
      <div className="space-y-3">
        {sortedPosts.map((p) => {
          const age = now - new Date(p.created_at).getTime();
          const days = Math.floor(age / (1000 * 60 * 60 * 24));
          const count = commentCounts[p.id] ?? 0;
          const isInactive = count === 0 && days > 7;
          return (
            <div key={p.id} className={`bg-white rounded-2xl border p-4 flex items-start justify-between gap-3 ${isInactive ? "border-amber-300 bg-amber-50/50" : "border-[#e2e8f0]"}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-[#1e3a5f]">{p.author_name}</span>
                  <span className="text-xs text-[#94a3b8]">
                    {new Date(p.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  {isInactive && (
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded-full text-[10px] font-bold">
                      ไม่เคลื่อนไหว {days} วัน
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#475569] truncate">{p.content}</p>
                <p className="text-xs text-[#94a3b8] mt-1">💬 {count} คอมเมนต์</p>
              </div>
              <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id}
                className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
                {deleting === p.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SurveysTab() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => { fetch(); }, []);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from("surveys").select("*").order("created_at", { ascending: false });
    if (data) {
      setSurveys(data);
      const counts: Record<string, number> = {};
      for (const s of data) {
        const { count } = await supabase.from("survey_votes").select("*", { count: "exact", head: true }).eq("survey_id", s.id);
        counts[s.id] = count ?? 0;
      }
      setVoteCounts(counts);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("ลบแบบสำรวจนี้?")) return;
    setDeleting(id);
    // หารูปทั้งหมดแล้วลบจาก Storage
    const survey = surveys.find((s) => s.id === id);
    const filesToRemove: string[] = [];
    // รูปหลัก
    if (survey?.image_url) {
      const urlParts = survey.image_url.split("/");
      filesToRemove.push(urlParts[urlParts.length - 1]);
    }
    // รูปเพิ่มเติม
    const { data: extraImgs } = await supabase.from("survey_images").select("image_url").eq("survey_id", id);
    if (extraImgs) {
      for (const img of extraImgs) {
        const urlParts = img.image_url.split("/");
        filesToRemove.push(urlParts[urlParts.length - 1]);
      }
    }
    if (filesToRemove.length > 0) {
      await supabase.storage.from("survey-images").remove(filesToRemove);
    }
    // ลบ DB
    await supabase.from("survey_votes").delete().eq("survey_id", id);
    await supabase.from("survey_options").delete().eq("survey_id", id);
    await supabase.from("survey_images").delete().eq("survey_id", id);
    await supabase.from("surveys").delete().eq("id", id);
    await fetch();
    setDeleting(null);
  }

  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-[#1e3a5f] mx-auto" size={32} /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-[#64748b]">{surveys.length} แบบสำรวจ</p>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] rounded-xl text-sm font-bold hover:bg-[#d4b44a] transition-colors">
          {showForm ? "ซ่อน" : "+ ตั้งหัวข้อ"}
        </button>
      </div>
      {showForm && (
        <div className="mb-6">
          <SurveyFormInline onAdded={() => { fetch(); setShowForm(false); }} onCancel={() => setShowForm(false)} />
        </div>
      )}
      {surveys.length === 0 ? <EmptyState icon={<BarChart3 size={48} />} text="ยังไม่มีแบบสำรวจ" /> : (
        <div className="space-y-3">
          {surveys.map((s) => {
            const isClosed = new Date(s.close_date) < new Date();
            return (
              <div key={s.id} className={`bg-white rounded-2xl border p-4 flex items-center justify-between gap-3 ${isClosed ? "border-gray-200 bg-gray-50" : "border-[#e2e8f0]"}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#1e3a5f] truncate">{s.title}</p>
                    {isClosed ? (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded-full text-[10px] font-bold shrink-0">ปิดแล้ว</span>
                    ) : (
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold shrink-0">เปิดอยู่</span>
                    )}
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">ปิดโหวต: {new Date(s.close_date).toLocaleDateString("th-TH")} | 💬 {voteCounts[s.id] ?? 0} โหวต | {s.created_by}</p>
                </div>
                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0">
                  {deleting === s.id ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SurveyFormInline({ onAdded, onCancel }: { onAdded: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!title || !closeDate || !createdBy || validOptions.length < 2) return;
    setSaving(true);
    const { data: survey } = await supabase.from("surveys").insert({ title, description: "", image_url: imageUrl, close_date: closeDate, created_by: createdBy }).select().single();
    if (survey) {
      await supabase.from("survey_options").insert(validOptions.map((label, i) => ({ survey_id: survey.id, label, sort_order: i })));
      onAdded();
    }
    setSaving(false);
  }

  const input = "px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#c9a227]/30 p-5 shadow-sm space-y-3">
      <h3 className="font-semibold text-[#1e3a5f] text-sm flex items-center gap-2"><BarChart3 size={16} className="text-[#c9a227]" /> ตั้งหัวข้อโหวต</h3>
      <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="หัวข้อ" className={input + " w-full"} />
      <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL รูปภาพ (ถ้ามี)" className={input + " w-full"} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} required className={input} />
        <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required placeholder="ชื่อผู้แจ้ง" className={input} />
      </div>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex gap-2">
            <input value={opt} onChange={(e) => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`ตัวเลือก ${i + 1}`} className={input + " flex-1"} />
            {i > 1 && (
              <button type="button" onClick={() => setOptions(options.filter((_, idx) => idx !== i))} className="text-[#94a3b8] hover:text-red-500"><X size={16} /></button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button type="button" onClick={() => setOptions([...options, ""])} className="text-xs text-[#1e3a5f] flex items-center gap-1 hover:underline"><Plus size={12} /> เพิ่มตัวเลือก</button>
        )}
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="px-4 py-2 bg-[#c9a227] text-[#1e3a5f] rounded-xl text-sm font-bold hover:bg-[#d4b44a] transition-colors disabled:opacity-50 flex items-center gap-1.5">{saving && <Loader2 className="animate-spin" size={14} />} สร้าง</button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-[#cbd5e1] rounded-xl text-sm hover:bg-gray-50 transition-colors">ยกเลิก</button>
      </div>
    </form>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
      <div className="mx-auto text-[#cbd5e1] mb-3">{icon}</div>
      <p className="text-[#64748b] font-medium">{text}</p>
    </div>
  );
}
