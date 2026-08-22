import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { News, NewsCategory } from "../lib/types";
import { Megaphone, Loader2, X, Upload, Trash2 } from "lucide-react";

interface Props {
  onAdded: () => void;
  onCancel?: () => void;
  editNews?: News | null;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export default function NewsForm({ onAdded, onCancel, editNews }: Props) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "pr" as NewsCategory,
    created_by: "",
    expires_at: "",
  });
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editNews) {
      setForm({
        title: editNews.title,
        content: editNews.content,
        category: editNews.category as NewsCategory,
        created_by: editNews.created_by,
        expires_at: editNews.expires_at ? editNews.expires_at.split("T")[0] : "",
      });
    }
  }, [editNews]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("ขนาดไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImages([...images, { file, preview: ev.target?.result as string }]);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function removeImage(index: number) {
    setImages(images.filter((_, i) => i !== index));
  }

  async function uploadAllImages(): Promise<string[]> {
    setUploading(true);
    const urls: string[] = [];
    for (const img of images) {
      const fileExt = img.file.name.split(".").pop();
      const fileName = `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const { error } = await supabase.storage
        .from("survey-images")
        .upload(fileName, img.file, { contentType: img.file.type });
      if (error) {
        setError("อัพโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
        setUploading(false);
        return [];
      }
      const { data } = supabase.storage.from("survey-images").getPublicUrl(fileName);
      urls.push(data.publicUrl);
    }
    setUploading(false);
    return urls;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.created_by) {
      setError("กรุณากรอก หัวข้อ และ ชื่อผู้แจ้ง");
      return;
    }
    setSaving(true);
    setError("");

    // Upload images
    let imageUrls: string[] = [];
    if (images.length > 0) {
      imageUrls = await uploadAllImages();
      if (imageUrls.length === 0) {
        setSaving(false);
        return;
      }
    }

    // Default หมดอายุ 30 วัน ถ้าไม่ได้ตั้ง
    let expiresAt: string | null = null;
    if (form.expires_at) {
      expiresAt = new Date(form.expires_at).toISOString();
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      expiresAt = d.toISOString();
    }

    const newsData: Record<string, unknown> = {
      title: form.title,
      content: form.content,
      category: form.category,
      expires_at: expiresAt,
    };

    if (editNews) {
      const { error: err } = await supabase.from("news").update(newsData).eq("id", editNews.id);
      if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      else {
        // เพิ่มรูปใหม่ถ้ามี
        if (imageUrls.length > 0) {
          const imgs = imageUrls.map((url, i) => ({ news_id: editNews.id, image_url: url, sort_order: i }));
          await supabase.from("news_images").insert(imgs);
        }
        onAdded();
      }
    } else {
      const { data: news, error: err } = await supabase.from("news").insert({ ...newsData, created_by: form.created_by }).select().single();
      if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      else {
        // เพิ่มรูป
        if (imageUrls.length > 0 && news) {
          const imgs = imageUrls.map((url, i) => ({ news_id: news.id, image_url: url, sort_order: i }));
          await supabase.from("news_images").insert(imgs);
        }
        setForm({ title: "", content: "", category: "pr", created_by: "", expires_at: "" });
        setImages([]);
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
          <Megaphone size={20} className="text-[#c9a227]" />
          {editNews ? "แก้ไขข่าว" : "แจ้งข่าวใหม่"}
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
          <label className="block text-xs font-medium text-[#64748b] mb-1">หัวข้อ *</label>
          <input name="title" value={form.title} onChange={handleChange} required placeholder="หัวข้อข่าว..." className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">ประเภท</label>
          <select name="category" value={form.category} onChange={handleChange} className={input}>
            <option value="pr">ประชาสัมพันธ์</option>
            <option value="congratulations">แสดงความยินดี</option>
            <option value="condolence">สูญเสีย</option>
            <option value="other">อื่นๆ</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">วันหมดอายุ (เว้นว่าง = 30 วัน)</label>
          <input type="date" name="expires_at" value={form.expires_at} onChange={handleChange} className={input} />
        </div>
        {!editNews && (
          <div>
            <label className="block text-xs font-medium text-[#64748b] mb-1">ชื่อผู้แจ้ง *</label>
            <input name="created_by" value={form.created_by} onChange={handleChange} required placeholder="ชื่อ-สกุล" className={input} />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">รายละเอียด</label>
          <textarea name="content" value={form.content} onChange={handleChange} rows={4} placeholder="เนื้อหาข่าว..." className={input + " resize-none"} />
        </div>

        {/* Multiple images */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">รูปภาพ (กดเพิ่มได้หลายรูป)</label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={img.preview} alt={`รูป ${i + 1}`} className="w-full h-32 object-cover rounded-xl border border-[#e2e8f0]" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow opacity-0 group-hover:opacity-100">
                    <Trash2 size={10} />
                  </button>
                  <span className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          )}

          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#cbd5e1] rounded-xl cursor-pointer hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors">
            <Upload size={20} className="text-[#94a3b8] mb-1" />
            <span className="text-xs text-[#64748b]">
              {images.length > 0 ? `เพิ่มรูปอีก (${images.length} รูปแล้ว)` : "คลิกเพื่อเลือกรูปจากเครื่อง"}
            </span>
            <span className="text-[10px] text-[#94a3b8]">JPG, PNG ไม่เกิน 5MB</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      </div>

      <button type="submit" disabled={saving || uploading}
        className="px-6 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl hover:bg-[#d4b44a] transition-colors text-sm disabled:opacity-50 flex items-center gap-2">
        {(saving || uploading) && <Loader2 className="animate-spin" size={14} />}
        {uploading ? "กำลังอัพโหลดรูป..." : saving ? "กำลังบันทึก..." : editNews ? "บันทึกการแก้ไข" : "แจ้งข่าว"}
      </button>
    </form>
  );
}
