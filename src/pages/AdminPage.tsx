import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Request as ContactRequest } from "../lib/types";
import { RANKS, UNITS, COMPANIES } from "../lib/constants";
import {
  Shield, LogIn, LogOut, CheckCircle2, XCircle,
  Clock, Trash2, Loader2,
} from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Login form
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl border border-[#cbd5e1] p-8 shadow-sm">
          <div className="text-center mb-8">
            <Shield className="mx-auto text-accent mb-3" size={48} />
            <h1 className="text-2xl font-bold text-primary">Admin Login</h1>
            <p className="text-muted text-sm mt-2">เข้าสู่ระบบเพื่อจัดการข้อมูล</p>
          </div>
          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authError}</div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">อีเมล</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com"
                className="w-full px-4 py-2.5 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">รหัสผ่าน</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                className="w-full px-4 py-2.5 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none" />
            </div>
            <button type="submit" disabled={authLoading}
              className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
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
        <div className="bg-white rounded-2xl border border-[#cbd5e1] p-8 shadow-sm">
          <XCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-primary mb-2">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-muted text-sm mb-4">บัญชีของท่านไม่มีสิทธิ์ Administrator</p>
          <button onClick={handleLogout}
            className="px-6 py-2.5 border border-[#cbd5e1] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto">
            <LogOut size={16} /> ออกจากระบบ
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard user={user} onLogout={handleLogout} />;
}

function AdminDashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [tab, setTab] = useState<"requests" | "contacts">("requests");
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoadingRequests(true);
    const { data } = await supabase.from("requests").select("*").order("created_at", { ascending: false });
    if (data) setRequests(data);
    setLoadingRequests(false);
  }

  async function handleReview(id: string, status: "approved" | "rejected") {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    if (status === "approved") {
      await supabase.from("contacts").insert({
        rank: req.rank, first_name: req.first_name, last_name: req.last_name,
        unit: req.unit, company: req.company, workplace: req.workplace,
        phone: req.phone, line_id: req.line_id, notes: req.notes,
      });
    }
    await supabase.from("requests").update({
      status, reviewed_by: user.email, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    await fetchRequests();
  }

  async function handleDeleteRequest(id: string) {
    await supabase.from("requests").delete().eq("id", id);
    await fetchRequests();
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Shield className="text-accent" size={32} /> Admin Dashboard
          </h1>
          <p className="mt-1 text-muted text-sm">ยินดีต้อนรับ {user.email}</p>
        </div>
        <button onClick={onLogout}
          className="px-4 py-2 border border-[#cbd5e1] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <LogOut size={16} /> ออกจากระบบ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-[#cbd5e1] pb-2">
        <button onClick={() => setTab("requests")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "requests" ? "bg-primary text-white" : "text-muted hover:bg-gray-100"
          }`}>
          <Clock size={16} /> คำขอที่รออนุมัติ
          {pendingCount > 0 && (
            <span className="bg-accent text-primary text-xs px-2 py-0.5 rounded-full font-bold">{pendingCount}</span>
          )}
        </button>
        <button onClick={() => setTab("contacts")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === "contacts" ? "bg-primary text-white" : "text-muted hover:bg-gray-100"
          }`}>
          จัดการรายชื่อ
        </button>
      </div>

      {tab === "requests" && (
        <RequestsTab requests={requests} loading={loadingRequests} onReview={handleReview} onDelete={handleDeleteRequest} />
      )}
      {tab === "contacts" && <ContactsTab />}
    </div>
  );
}

function RequestsTab({ requests, loading, onReview, onDelete }: {
  requests: ContactRequest[]; loading: boolean;
  onReview: (id: string, s: "approved" | "rejected") => void;
  onDelete: (id: string) => void;
}) {
  if (loading) return <div className="text-center py-12"><Loader2 className="animate-spin text-primary mx-auto" size={32} /></div>;
  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#cbd5e1] p-12 text-center">
        <Clock className="mx-auto text-muted/50 mb-3" size={48} />
        <p className="text-muted font-medium">ยังไม่มีคำขอ</p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req.id} className={`bg-white rounded-xl border p-5 shadow-sm ${
          req.status === "pending" ? "border-accent/30" : "border-[#cbd5e1]"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="font-bold text-accent">{req.rank}</span>{" "}
              <span className="font-medium">{req.first_name} {req.last_name}</span>
              <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                req.status === "pending" ? "badge-pending" : req.status === "approved" ? "badge-approved" : "badge-rejected"
              }`}>
                {req.status === "pending" ? "รออนุมัติ" : req.status === "approved" ? "อนุมัติแล้ว" : "ไม่อนุมัติ"}
              </span>
            </div>
            <div className="text-xs text-muted">
              ส่งเมื่อ: {new Date(req.created_at).toLocaleDateString("th-TH")}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm mb-3">
            <div><span className="text-muted">เหล่า: </span>{req.unit}</div>
            <div><span className="text-muted">กองร้อย: </span>{req.company}</div>
            {req.workplace && <div><span className="text-muted">ที่ทำงาน: </span>{req.workplace}</div>}
            {req.phone && <div><span className="text-muted">เบอร์: </span>{req.phone}</div>}
            {req.line_id && <div><span className="text-muted">LINE: </span>{req.line_id}</div>}
            {req.notes && <div><span className="text-muted">หมายเหตุ: </span>{req.notes}</div>}
          </div>
          <div className="text-xs text-muted border-t border-[#cbd5e1] pt-3">
            ผู้ขอ: {req.requester_name} | เบอร์ผู้ขอ: {req.requester_phone}
          </div>
          {req.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <button onClick={() => onReview(req.id, "approved")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1.5">
                <CheckCircle2 size={16} /> อนุมัติ
              </button>
              <button onClick={() => onReview(req.id, "rejected")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5">
                <XCircle size={16} /> ไม่อนุมัติ
              </button>
              <button onClick={() => onDelete(req.id)}
                className="px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm text-muted hover:bg-gray-50 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ContactsTab() {
  const [contacts, setContacts] = useState<{ id: string; rank: string; first_name: string; last_name: string; unit: string; company: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
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
        <p className="text-sm text-muted">{contacts.length} รายการ</p>
        <button onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-accent text-primary rounded-lg text-sm font-bold hover:bg-accent-light transition-colors">
          {showAddForm ? "ซ่อนฟอร์ม" : "+ เพิ่มชื่อ"}
        </button>
      </div>
      {showAddForm && <div className="mb-6"><AddContactForm onAdded={() => { fetchContacts(); setShowAddForm(false); }} /></div>}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="animate-spin text-primary mx-auto" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/5 border-b border-[#cbd5e1]">
                <th className="text-left px-4 py-3 font-semibold text-primary">ยศ-ชื่อ-สกุล</th>
                <th className="text-left px-4 py-3 font-semibold text-primary">เหล่า</th>
                <th className="text-left px-4 py-3 font-semibold text-primary">กองร้อย</th>
                <th className="text-right px-4 py-3 font-semibold text-primary">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-[#cbd5e1]/50 table-row-hover">
                  <td className="px-4 py-3">
                    <span className="font-bold text-accent">{c.rank}</span> {c.first_name} {c.last_name}
                  </td>
                  <td className="px-4 py-3 text-muted">{c.unit}</td>
                  <td className="px-4 py-3 text-muted">{c.company}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                      className="px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
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
  const [form, setForm] = useState({
    rank: "", first_name: "", last_name: "", unit: "", company: "",
    workplace: "", phone: "", line_id: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("contacts").insert({
      rank: form.rank, first_name: form.first_name, last_name: form.last_name,
      unit: form.unit, company: form.company, workplace: form.workplace,
      phone: form.phone, line_id: form.line_id, notes: form.notes,
    });
    if (!error) onAdded();
    setSaving(false);
  }

  const inputClass = "px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 outline-none";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-accent/30 p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-primary text-sm">เพิ่มชื่อใหม่</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <select name="rank" value={form.rank} onChange={handleChange} required className={inputClass}>
          <option value="">ยศ</option>
          {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="ชื่อ" className={inputClass} />
        <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="สกุล" className={inputClass} />
        <select name="unit" value={form.unit} onChange={handleChange} required className={inputClass}>
          <option value="">เหล่า</option>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select name="company" value={form.company} onChange={handleChange} required className={inputClass}>
          <option value="">กองร้อย</option>
          {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input name="workplace" value={form.workplace} onChange={handleChange} placeholder="ที่ทำงาน" className={inputClass} />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="เบอร์โทร" className={inputClass} />
        <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="LINE ID" className={inputClass} />
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="หมายเหตุ" className={inputClass} />
      </div>
      <button type="submit" disabled={saving}
        className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition-colors disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 className="animate-spin" size={14} />} บันทึก
      </button>
    </form>
  );
}
