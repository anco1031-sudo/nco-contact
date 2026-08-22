import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Event as EventType, EventStatus } from "../lib/types";
import { CalendarPlus, Loader2, X } from "lucide-react";

interface Props {
  onAdded: () => void;
  onCancel?: () => void;
  editEvent?: EventType | null;
}

export default function EventForm({ onAdded, onCancel, editEvent }: Props) {
  const [form, setForm] = useState({
    title: "", description: "", event_date: "", event_time: "",
    location: "", status: "survey" as EventStatus, created_by: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editEvent) {
      setForm({
        title: editEvent.title,
        description: editEvent.description,
        event_date: editEvent.event_date,
        event_time: editEvent.event_time,
        location: editEvent.location,
        status: editEvent.status as EventStatus,
        created_by: editEvent.created_by,
      });
    }
  }, [editEvent]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.event_date || !form.created_by) {
      setError("กรุณากรอก ชื่อกิจกรรม, วันที่, และ ชื่อผู้แจ้ง");
      return;
    }
    setSaving(true);
    setError("");

    if (editEvent) {
      // Update existing event
      const { error: err } = await supabase.from("events").update({
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        event_time: form.event_time,
        location: form.location,
        status: form.status,
      }).eq("id", editEvent.id);
      if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      else onAdded();
    } else {
      // Insert new event
      const { error: err } = await supabase.from("events").insert({
        title: form.title,
        description: form.description,
        event_date: form.event_date,
        event_time: form.event_time,
        location: form.location,
        status: form.status,
        created_by: form.created_by,
      });
      if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      else {
        setForm({ title: "", description: "", event_date: "", event_time: "", location: "", status: "survey", created_by: "" });
        onAdded();
      }
    }
    setSaving(false);
  }

  const input = "w-full px-3 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1e3a5f] flex items-center gap-2">
          <CalendarPlus size={20} className="text-[#c9a227]" />
          {editEvent ? "แก้ไขกิจกรรม" : "แจ้งกิจกรรมใหม่"}
        </h3>
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <X size={18} />
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">ชื่อกิจกรรม *</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="เช่น วันรวมรุ่น 1333" className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">วันที่ *</label>
          <input type="date" name="event_date" value={form.event_date} onChange={handleChange} required className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">เวลา</label>
          <input type="time" name="event_time" value={form.event_time} onChange={handleChange} className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">สถานที่</label>
          <input name="location" value={form.location} onChange={handleChange} placeholder="สถานที่จัดงาน" className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">สถานะ</label>
          <select name="status" value={form.status} onChange={handleChange} className={input}>
            <option value="survey">สำรวจ</option>
            <option value="upcoming">ยังไม่ถึง</option>
            <option value="confirmed">ยืนยัน</option>
            <option value="in_progress">กำลังดำเนินการ</option>
            <option value="ended">จบแล้ว</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">รายละเอียด</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="รายละเอียดกิจกรรม..." className={input + " resize-none"} />
        </div>
        {!editEvent && (
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#64748b] mb-1">ชื่อผู้แจ้ง *</label>
            <input name="created_by" value={form.created_by} onChange={handleChange} required placeholder="ชื่อ-สกุล" className={input} />
          </div>
        )}
      </div>

      <button type="submit" disabled={saving}
        className="px-6 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl hover:bg-[#d4b44a] transition-colors text-sm disabled:opacity-50 flex items-center gap-2">
        {saving && <Loader2 className="animate-spin" size={14} />} {editEvent ? "บันทึกการแก้ไข" : "แจ้งกิจกรรม"}
      </button>
    </form>
  );
}
