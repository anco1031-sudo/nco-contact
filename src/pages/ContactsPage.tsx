import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Contact } from "../lib/types";
import type { User } from "@supabase/supabase-js";
import { RANKS, UNITS, COMPANIES } from "../lib/constants";import { Search, Filter, Phone,
  ChevronDown, ChevronUp, X, Users, Pencil, Loader2, Send, UserPlus, Check, Clipboard
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ rank: "", unit: "", company: "", workplace: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [requestContact, setRequestContact] = useState<Contact | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    checkUser();
    fetchContacts();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts").select("*")
      .order("rank", { ascending: true })
      .order("first_name", { ascending: true });
    if (!error && data) setContacts(data);
    setLoading(false);
  }

  const filteredContacts = contacts.filter((c) => {
    const matchSearch = !searchTerm ||
      `${c.rank} ${c.first_name} ${c.last_name} ${c.unit} ${c.company} ${c.workplace} ${c.phone} ${c.line_id} ${c.notes}`
        .toLowerCase().includes(searchTerm.toLowerCase());
    const matchRank = !filters.rank || c.rank === filters.rank;
    const matchUnit = !filters.unit || c.unit === filters.unit;
    const matchCompany = !filters.company || c.company === filters.company;
    const matchWorkplace = !filters.workplace || c.workplace.toLowerCase().includes(filters.workplace.toLowerCase());
    return matchSearch && matchRank && matchUnit && matchCompany && matchWorkplace;
  });

  const hasActiveFilters = filters.rank || filters.unit || filters.company || filters.workplace;
  function clearFilters() { setFilters({ rank: "", unit: "", company: "", workplace: "" }); setSearchTerm(""); }

  const [copiedLineId, setCopiedLineId] = useState<string | null>(null);

  async function copyLineId(lineId: string, contactId: string) {
    await navigator.clipboard.writeText(lineId);
    setCopiedLineId(contactId);
    setTimeout(() => setCopiedLineId(null), 2000);
  }

  const uniqueWorkplaces = [...new Set(contacts.map((c) => c.workplace).filter(Boolean))].sort();
  const input = "w-full px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#1e3a5f] flex items-center gap-3">
            <Users className="text-[#c9a227]" size={32} />
            รายชื่อเพื่อน ๆ
          </h1>
          <p className="mt-1 text-[#64748b] text-sm">เพื่อนๆ รุ่น 1333</p>
        </div>
        <Link
          to="/request"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors shadow-sm self-start"
        >
          <UserPlus size={16} /> ขอเพิ่มรายชื่อ
        </Link>
      </div>

      {/* Success message */}
      {requestSent && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl text-sm text-green-700 flex items-center gap-2">
          <CheckCircle2 size={16} /> ส่งคำขอแก้ไขเรียบร้อยแล้ว! รอ admin อนุมัติ
          <button onClick={() => setRequestSent(false)} className="ml-auto text-green-500 hover:text-green-700"><X size={14} /></button>
        </div>
      )}

      {/* Edit modal (login) */}
      {editingContact && (
        <EditContactModal
          contact={editingContact}
          onClose={() => setEditingContact(null)}
          onSaved={() => { setEditingContact(null); fetchContacts(); }}
        />
      )}

      {/* Request edit modal (not login) */}
      {requestContact && (
        <EditRequestModal
          contact={requestContact}
          onClose={() => setRequestContact(null)}
          onSent={() => { setRequestContact(null); setRequestSent(true); }}
        />
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={18} />
            <input type="text" placeholder="ค้นหา..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={input + " pl-10 pr-10"} />
            {searchTerm && (
              <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#1e293b]">
                <X size={16} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-[#cbd5e1] hover:bg-gray-50 text-[#64748b]"
            }`}>
            <Filter size={16} /> กรอง
            {hasActiveFilters && <span className="bg-[#c9a227] text-[#1e3a5f] text-xs px-1.5 py-0.5 rounded-full font-bold">!</span>}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">ยศ</label>
              <select value={filters.rank} onChange={(e) => setFilters({ ...filters, rank: e.target.value })} className={input}>
                <option value="">ทั้งหมด</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">เหล่า</label>
              <select value={filters.unit} onChange={(e) => setFilters({ ...filters, unit: e.target.value })} className={input}>
                <option value="">ทั้งหมด</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">กองร้อย</label>
              <select value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} className={input}>
                <option value="">ทั้งหมด</option>
                {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#64748b] mb-1">ที่ทำงาน</label>
              <select value={filters.workplace} onChange={(e) => setFilters({ ...filters, workplace: e.target.value })} className={input}>
                <option value="">ทั้งหมด</option>
                {uniqueWorkplaces.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4">
                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                  <X size={14} /> ล้างตัวกรอง
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 text-sm text-[#64748b]">
        พบ {filteredContacts.length} รายการ
        {hasActiveFilters && ` (จากทั้งหมด ${contacts.length})`}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
          <Users className="mx-auto text-[#cbd5e1] mb-3" size={48} />
          <p className="text-[#64748b]">ไม่พบข้อมูล</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1e3a5f]/5 border-b border-[#e2e8f0]">
                  <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">ยศ-ชื่อ-สกุล</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">เหล่า</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">กองร้อย</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">ที่ทำงาน</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#1e3a5f]">ติดต่อ</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#1e3a5f]">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="border-b border-[#e2e8f0]/50 hover:bg-[#f0f7ff] transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-[#c9a227]">{c.rank}</span>{" "}
                      {c.first_name} {c.last_name}
                      {c.notes && <span className="ml-2 text-xs text-[#94a3b8]">({c.notes})</span>}
                    </td>
                    <td className="px-4 py-3 text-[#64748b]">{c.unit}</td>
                    <td className="px-4 py-3 text-[#64748b]">{c.company}</td>
                    <td className="px-4 py-3 text-[#64748b]">{c.workplace || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-xs font-medium">
                            <Phone size={12} /> {c.phone}
                          </a>
                        )}
                        {c.line_id && (
                          <button
                            onClick={() => copyLineId(c.line_id, c.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs font-medium cursor-pointer"
                            title="คัดลอก LINE ID"
                          >
                            {copiedLineId === c.id ? <Check size={12} /> : <Clipboard size={12} />}
                            {copiedLineId === c.id ? "คัดลอกแล้ว!" : c.line_id}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user ? (
                        <button
                          onClick={() => setEditingContact(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg text-xs font-medium hover:bg-[#2d5986] transition-colors"
                        >
                          <Pencil size={12} /> แก้ไข
                        </button>
                      ) : (
                        <button
                          onClick={() => setRequestContact(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#c9a227] text-[#c9a227] rounded-lg text-xs font-medium hover:bg-[#c9a227]/10 transition-colors"
                        >
                          <Send size={12} /> ขอแก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredContacts.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-bold text-[#c9a227]">{c.rank}</span>{" "}
                    <span className="font-medium">{c.first_name} {c.last_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {user ? (
                      <button onClick={() => setEditingContact(c)} className="p-1.5 text-[#1e3a5f] hover:bg-[#1e3a5f]/10 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                    ) : (
                      <button onClick={() => setRequestContact(c)} className="p-1.5 text-[#c9a227] hover:bg-[#c9a227]/10 rounded-lg transition-colors">
                        <Send size={14} />
                      </button>
                    )}
                    <button onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)} className="text-[#94a3b8]">
                      {expandedRow === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-[#64748b] space-y-1">
                  <p>เหล่า: <span className="text-[#1e293b]">{c.unit}</span></p>
                  <p>กองร้อย: <span className="text-[#1e293b]">{c.company}</span></p>
                </div>
                {expandedRow === c.id && (
                  <div className="mt-3 pt-3 border-t border-[#e2e8f0] text-xs space-y-2">
                    {c.workplace && <p>ที่ทำงาน: <span className="text-[#1e293b]">{c.workplace}</span></p>}
                    {c.notes && <p>หมายเหตุ: <span className="text-[#1e293b]">{c.notes}</span></p>}
                    <div className="flex gap-2 pt-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                          <Phone size={14} /> {c.phone}
                        </a>
                      )}
                      {c.line_id && (
                        <button
                          onClick={() => copyLineId(c.line_id, c.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium cursor-pointer"
                          title="คัดลอก LINE ID"
                        >
                          {copiedLineId === c.id ? <Check size={14} /> : <Clipboard size={14} />}
                          {copiedLineId === c.id ? "คัดลอกแล้ว!" : `LINE: ${c.line_id}`}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ========== Edit Contact Modal (login) ========== */
function EditContactModal({ contact, onClose, onSaved }: { contact: Contact; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    rank: contact.rank, first_name: contact.first_name, last_name: contact.last_name,
    unit: contact.unit, company: contact.company, workplace: contact.workplace || "",
    phone: contact.phone || "", line_id: contact.line_id || "", notes: contact.notes || "",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("contacts").update({
      rank: form.rank, first_name: form.first_name, last_name: form.last_name,
      unit: form.unit, company: form.company, workplace: form.workplace,
      phone: form.phone, line_id: form.line_id, notes: form.notes,
    }).eq("id", contact.id);
    if (!error) onSaved();
    setSaving(false);
  }

  const input = "px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1e3a5f] text-lg">แก้ไขรายชื่อ</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select name="rank" value={form.rank} onChange={handleChange} required className={input}>
              <option value="">ยศ</option>{RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="ชื่อ" className={input} />
            <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="สกุล" className={input} />
            <select name="unit" value={form.unit} onChange={handleChange} required className={input}>
              <option value="">เหล่า</option>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select name="company" value={form.company} onChange={handleChange} required className={input}>
              <option value="">กองร้อย</option>{COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="workplace" value={form.workplace} onChange={handleChange} placeholder="ที่ทำงาน" className={input} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="เบอร์โทร" className={input} />
            <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="LINE ID" className={input} />
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="หมายเหตุ" className={input} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2d5986] transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="animate-spin" size={14} />} บันทึก
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-[#cbd5e1] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ========== Edit Request Modal (not login) ========== */
function EditRequestModal({ contact, onClose, onSent }: { contact: Contact; onClose: () => void; onSent: () => void }) {
  const [form, setForm] = useState({
    rank: contact.rank, first_name: contact.first_name, last_name: contact.last_name,
    unit: contact.unit, company: contact.company, workplace: contact.workplace || "",
    phone: contact.phone || "", line_id: contact.line_id || "", notes: contact.notes || "",
  });
  const [requesterName, setRequesterName] = useState("");
  const [requesterPhone, setRequesterPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requesterName.trim()) {
      setError("กรุณากรอกชื่อผู้ขอแก้ไข");
      return;
    }
    setSaving(true);
    setError("");

    // เก็บเฉพาะข้อมูลที่แก้ไข
    const editData: Record<string, string> = {};
    if (form.rank !== contact.rank) editData.rank = form.rank;
    if (form.first_name !== contact.first_name) editData.first_name = form.first_name;
    if (form.last_name !== contact.last_name) editData.last_name = form.last_name;
    if (form.unit !== contact.unit) editData.unit = form.unit;
    if (form.company !== contact.company) editData.company = form.company;
    if (form.workplace !== (contact.workplace || "")) editData.workplace = form.workplace;
    if (form.phone !== (contact.phone || "")) editData.phone = form.phone;
    if (form.line_id !== (contact.line_id || "")) editData.line_id = form.line_id;
    if (form.notes !== (contact.notes || "")) editData.notes = form.notes;

    if (Object.keys(editData).length === 0) {
      setError("ยังไม่มีข้อมูลที่แก้ไข");
      setSaving(false);
      return;
    }

    const { error: err } = await supabase.from("requests").insert({
      type: "edit",
      contact_id: contact.id,
      rank: contact.rank,
      first_name: contact.first_name,
      last_name: contact.last_name,
      unit: contact.unit,
      company: contact.company,
      workplace: contact.workplace,
      phone: contact.phone,
      line_id: contact.line_id,
      notes: contact.notes,
      requester_name: requesterName.trim(),
      requester_phone: requesterPhone.trim(),
      status: "pending",
      edit_data: editData,
    });

    if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    else onSent();
    setSaving(false);
  }

  const input = "px-3 py-2 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[#1e3a5f] text-lg">ขอแก้ไขรายชื่อ</h3>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1e293b]"><X size={20} /></button>
        </div>
        <p className="text-xs text-[#64748b] mb-4 bg-[#f8fafc] p-3 rounded-xl border border-[#e2e8f0]">
          แก้ไขข้อมูลที่ต้องการ → แล้วกดส่งคำขอ admin จะเป็นผู้อนุมัติก่อนข้อมูลจะถูกอัพเดท
        </p>

        {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select name="rank" value={form.rank} onChange={handleChange} required className={input}>
              <option value="">ยศ</option>{RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input name="first_name" value={form.first_name} onChange={handleChange} required placeholder="ชื่อ" className={input} />
            <input name="last_name" value={form.last_name} onChange={handleChange} required placeholder="สกุล" className={input} />
            <select name="unit" value={form.unit} onChange={handleChange} required className={input}>
              <option value="">เหล่า</option>{UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <select name="company" value={form.company} onChange={handleChange} required className={input}>
              <option value="">กองร้อย</option>{COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="workplace" value={form.workplace} onChange={handleChange} placeholder="ที่ทำงาน" className={input} />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="เบอร์โทร" className={input} />
            <input name="line_id" value={form.line_id} onChange={handleChange} placeholder="LINE ID" className={input} />
            <input name="notes" value={form.notes} onChange={handleChange} placeholder="หมายเหตุ" className={input} />
          </div>

          <div className="border-t border-[#e2e8f0] pt-4 space-y-3">
            <p className="text-xs font-semibold text-[#1e3a5f]">ข้อมูลผู้ขอแก้ไข *</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input value={requesterName} onChange={(e) => setRequesterName(e.target.value)} required placeholder="ชื่อ-สกุล ผู้ขอ" className={input} />
              <input value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} placeholder="เบอร์โทร ผู้ขอ" className={input} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="px-6 py-2 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl text-sm hover:bg-[#d4b44a] transition-colors disabled:opacity-50 flex items-center gap-2">
              {saving && <Loader2 className="animate-spin" size={14} />} <Send size={14} /> ส่งคำขอ
            </button>
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-[#cbd5e1] rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CheckCircle2(props: { size: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
