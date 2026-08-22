import { useState } from "react";
import { supabase } from "../lib/supabase";
import { RANKS, UNITS, COMPANIES } from "../lib/constants";
import { ClipboardPlus, CheckCircle2, AlertCircle } from "lucide-react";

export default function RequestPage() {
  const [form, setForm] = useState({
    rank: "", first_name: "", last_name: "", unit: "", company: "",
    workplace: "", phone: "", line_id: "", notes: "",
    requester_name: "", requester_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!form.rank || !form.first_name || !form.last_name || !form.unit || !form.company || !form.requester_name || !form.requester_phone) {
      setError("กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("requests").insert({
      rank: form.rank, first_name: form.first_name, last_name: form.last_name,
      unit: form.unit, company: form.company, workplace: form.workplace,
      phone: form.phone, line_id: form.line_id, notes: form.notes,
      requester_name: form.requester_name, requester_phone: form.requester_phone,
      status: "pending",
    });

    if (insertError) {
      setError("เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } else {
      setSubmitted(true);
    }
    setLoading(false);
  }

  const inputClass = "w-full px-3 py-2.5 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all";

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-[#cbd5e1] p-10 shadow-sm">
          <CheckCircle2 className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-primary mb-2">ส่งคำขอสำเร็จ!</h2>
          <p className="text-muted mb-6">
            คำขอเพิ่มชื่อของท่านถูกส่งเรียบร้อยแล้ว<br />
            รอการตรวจสอบจาก Admin ก่อนนะครับ
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setForm({ rank: "", first_name: "", last_name: "", unit: "", company: "", workplace: "", phone: "", line_id: "", notes: "", requester_name: "", requester_phone: "" });
            }}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-light transition-colors font-medium"
          >
            ส่งคำขอเพิ่มอีก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ClipboardPlus className="text-accent" size={32} />
          ขอเพิ่มชื่อ
        </h1>
        <p className="mt-2 text-muted">กรอกแบบฟอร์มด้านล่างเพื่อขอเพิ่มรายชื่อ</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-500 shrink-0" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#cbd5e1] p-6 sm:p-8 shadow-sm space-y-6">
        {/* ข้อมูลบุคลากร */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-[#cbd5e1]">ข้อมูลบุคลากร</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">ยศ <span className="text-red-500">*</span></label>
              <select name="rank" value={form.rank} onChange={handleChange} required className={inputClass}>
                <option value="">-- เลือกยศ --</option>
                {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">ชื่อ <span className="text-red-500">*</span></label>
              <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required placeholder="กรอกชื่อ" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">สกุล <span className="text-red-500">*</span></label>
              <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required placeholder="กรอกนามสกุล" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">เหล่า <span className="text-red-500">*</span></label>
              <select name="unit" value={form.unit} onChange={handleChange} required className={inputClass}>
                <option value="">-- เลือกเหล่า --</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">กองร้อย <span className="text-red-500">*</span></label>
              <select name="company" value={form.company} onChange={handleChange} required className={inputClass}>
                <option value="">-- เลือกกองร้อย --</option>
                {COMPANIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">ที่ทำงาน</label>
              <input type="text" name="workplace" value={form.workplace} onChange={handleChange} placeholder="สถานที่ปฎิบัติงาน" className={inputClass} />
            </div>
          </div>
        </div>

        {/* ข้อมูลติดต่อ */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-[#cbd5e1]">ข้อมูลติดต่อ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">เบอร์โทรศัพท์</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="0XX-XXX-XXXX" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">LINE ID</label>
              <input type="text" name="line_id" value={form.line_id} onChange={handleChange} placeholder="@line_id" className={inputClass} />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">อื่น ๆ / หมายเหตุ</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="ข้อมูลเพิ่มเติม..." className={inputClass + " resize-none"} />
          </div>
        </div>

        {/* ข้อมูลผู้ขอ */}
        <div>
          <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-[#cbd5e1]">ข้อมูลผู้ขอ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">ชื่อผู้ขอ <span className="text-red-500">*</span></label>
              <input type="text" name="requester_name" value={form.requester_name} onChange={handleChange} required placeholder="ชื่อ-สกุล ผู้ขอ" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">เบอร์ผู้ขอ <span className="text-red-500">*</span></label>
              <input type="tel" name="requester_phone" value={form.requester_phone} onChange={handleChange} required placeholder="เบอร์ติดต่อ" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-accent text-primary font-bold rounded-xl hover:bg-accent-light transition-colors text-sm shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? "กำลังส่ง..." : "ส่งคำขอเพิ่มชื่อ"}
          </button>
        </div>
      </form>
    </div>
  );
}
