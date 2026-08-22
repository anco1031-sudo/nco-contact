import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Contact } from "../lib/types";
import { RANKS, UNITS, COMPANIES } from "../lib/constants";
import {
  Search, Filter, Phone, MessageCircle,
  ChevronDown, ChevronUp, X, Users,
} from "lucide-react";

export default function HomePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rank: "", unit: "", company: "", workplace: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("rank", { ascending: true })
      .order("first_name", { ascending: true });
    if (!error && data) setContacts(data);
    setLoading(false);
  }

  const filteredContacts = contacts.filter((c) => {
    const matchSearch =
      searchTerm === "" ||
      `${c.rank} ${c.first_name} ${c.last_name} ${c.unit} ${c.company} ${c.workplace} ${c.phone} ${c.line_id} ${c.notes}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchRank = !filters.rank || c.rank === filters.rank;
    const matchUnit = !filters.unit || c.unit === filters.unit;
    const matchCompany = !filters.company || c.company === filters.company;
    const matchWorkplace =
      !filters.workplace ||
      c.workplace.toLowerCase().includes(filters.workplace.toLowerCase());
    return matchSearch && matchRank && matchUnit && matchCompany && matchWorkplace;
  });

  const hasActiveFilters =
    filters.rank || filters.unit || filters.company || filters.workplace;

  function clearFilters() {
    setFilters({ rank: "", unit: "", company: "", workplace: "" });
    setSearchTerm("");
  }

  const uniqueWorkplaces = [
    ...new Set(contacts.map((c) => c.workplace).filter(Boolean)),
  ].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Users className="text-accent" size={32} />
          รายชื่อบุคลากร
        </h1>
        <p className="mt-2 text-muted">
          ข้อมูลติดต่อบุคลากรทางทหาร — ค้นหาและกรองข้อมูลได้ตามต้องการ
        </p>
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#cbd5e1] p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="ค้นหาจาก ยศ, ชื่อ, เหล่า, กองร้อย, ที่ทำงาน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#cbd5e1] rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[#1e293b]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              showFilters || hasActiveFilters
                ? "bg-primary text-white border-primary"
                : "border-[#cbd5e1] hover:bg-gray-50 text-muted"
            }`}
          >
            <Filter size={16} />
            กรองข้อมูล
            {hasActiveFilters && (
              <span className="bg-accent text-primary text-xs px-1.5 py-0.5 rounded-full font-bold">!</span>
            )}
            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#cbd5e1] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">ยศ</label>
              <select
                value={filters.rank}
                onChange={(e) => setFilters({ ...filters, rank: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              >
                <option value="">ทั้งหมด</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">เหล่า</label>
              <select
                value={filters.unit}
                onChange={(e) => setFilters({ ...filters, unit: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              >
                <option value="">ทั้งหมด</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">กองร้อย</label>
              <select
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              >
                <option value="">ทั้งหมด</option>
                {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">ที่ทำงาน</label>
              <select
                value={filters.workplace}
                onChange={(e) => setFilters({ ...filters, workplace: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
              >
                <option value="">ทั้งหมด</option>
                {uniqueWorkplaces.map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4">
                <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1">
                  <X size={14} /> ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted">
        พบ {filteredContacts.length} รายการ
        {hasActiveFilters && ` (จากทั้งหมด ${contacts.length} รายการ)`}
      </div>

      {/* Contacts table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-muted">กำลังโหลดข้อมูล...</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#cbd5e1] p-12 text-center">
          <Users className="mx-auto text-muted/50 mb-3" size={48} />
          <p className="text-muted font-medium">ไม่พบข้อมูล</p>
          <p className="text-sm text-muted/70 mt-1">
            {contacts.length === 0
              ? "ยังไม่มีข้อมูลในระบบ — สามารถขอเพิ่มชื่อได้ที่หน้า 'ขอเพิ่มชื่อ'"
              : "ลองเปลี่ยนคำค้นหาหรือล้างตัวกรอง"}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#cbd5e1] overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b border-[#cbd5e1]">
                  <th className="text-left px-4 py-3 font-semibold text-primary">ยศ-ชื่อ-สกุล</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary">เหล่า</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary">กองร้อย</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary">ที่ทำงาน</th>
                  <th className="text-left px-4 py-3 font-semibold text-primary">ติดต่อ</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((c) => (
                  <tr key={c.id} className="border-b border-[#cbd5e1]/50 table-row-hover">
                    <td className="px-4 py-3">
                      <span className="font-medium text-accent">{c.rank}</span>{" "}
                      {c.first_name} {c.last_name}
                      {c.notes && <span className="ml-2 text-xs text-muted">({c.notes})</span>}
                    </td>
                    <td className="px-4 py-3 text-muted">{c.unit}</td>
                    <td className="px-4 py-3 text-muted">{c.company}</td>
                    <td className="px-4 py-3 text-muted">{c.workplace || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors text-xs font-medium">
                            <Phone size={12} /> {c.phone}
                          </a>
                        )}
                        {c.line_id && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            <MessageCircle size={12} /> {c.line_id}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filteredContacts.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-[#cbd5e1] p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-bold text-accent">{c.rank}</span>{" "}
                    <span className="font-medium">{c.first_name} {c.last_name}</span>
                  </div>
                  <button
                    onClick={() => setExpandedRow(expandedRow === c.id ? null : c.id)}
                    className="text-muted"
                  >
                    {expandedRow === c.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                <div className="text-xs text-muted space-y-1">
                  <p>เหล่า: <span className="text-[#1e293b]">{c.unit}</span></p>
                  <p>กองร้อย: <span className="text-[#1e293b]">{c.company}</span></p>
                </div>
                {expandedRow === c.id && (
                  <div className="mt-3 pt-3 border-t border-[#cbd5e1] text-xs space-y-2">
                    {c.workplace && <p>ที่ทำงาน: <span className="text-[#1e293b]">{c.workplace}</span></p>}
                    {c.notes && <p>หมายเหตุ: <span className="text-[#1e293b]">{c.notes}</span></p>}
                    <div className="flex gap-2 pt-1">
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors font-medium">
                          <Phone size={14} /> {c.phone}
                        </a>
                      )}
                      {c.line_id && (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium">
                          <MessageCircle size={14} /> LINE: {c.line_id}
                        </span>
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
