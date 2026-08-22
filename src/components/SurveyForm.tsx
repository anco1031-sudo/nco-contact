import { useState } from "react";
import { supabase } from "../lib/supabase";
import { BarChart3, Loader2, X, Plus, Upload, Trash2 } from "lucide-react";

interface Props {
  onAdded: () => void;
  onCancel?: () => void;
}

interface ImagePreview {
  file: File;
  preview: string;
}

export default function SurveyForm({ onAdded, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [closeDate, setCloseDate] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

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
    // reset input
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
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
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

  function addOption() {
    setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!title || !closeDate || !createdBy || validOptions.length < 2) {
      setError("กรุณากรอกข้อมูลให้ครบ (หัวข้อ, วันปิดโหวต, ชื่อผู้แจ้ง, ตัวเลือกอย่างน้อย 2)");
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

    // 1. Insert survey (ใช้รูปแรกเป็น image_url หลัก)
    const { data: survey, error: err1 } = await supabase.from("surveys").insert({
      title, description, image_url: imageUrls[0] || "", close_date: closeDate, created_by: createdBy,
    }).select().single();

    if (err1 || !survey) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setSaving(false);
      return;
    }

    // 2. Insert options
    const opts = validOptions.map((label, i) => ({ survey_id: survey.id, label, sort_order: i }));
    await supabase.from("survey_options").insert(opts);

    // 3. Insert extra images (รูปที่ 2, 3, ...)
    if (imageUrls.length > 1) {
      const imgs = imageUrls.slice(1).map((url, i) => ({ survey_id: survey.id, image_url: url, sort_order: i }));
      await supabase.from("survey_images").insert(imgs);
    }

    // Reset
    setTitle(""); setDescription(""); setImages([]); setCloseDate(""); setCreatedBy("");
    setOptions(["", ""]);
    onAdded();
    setSaving(false);
  }

  const input = "w-full px-3 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[#1e3a5f] flex items-center gap-2">
          <BarChart3 size={20} className="text-[#c9a227]" />
          สร้างแบบสำรวจ/โหวตใหม่
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="เช่น อยากไปเที่ยวที่ไหน?" className={input} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">รายละเอียด</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="อธิบายเพิ่มเติม..." className={input + " resize-none"} />
        </div>

        {/* Multiple images */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-[#64748b] mb-1">รูปภาพ (กดเพิ่มได้หลายรูป)</label>

          {/* Preview existing */}
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

          {/* Upload button */}
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[#cbd5e1] rounded-xl cursor-pointer hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors">
            <Upload size={20} className="text-[#94a3b8] mb-1" />
            <span className="text-xs text-[#64748b]">
              {images.length > 0 ? `เพิ่มรูปอีก (${images.length} รูปแล้ว)` : "คลิกเพื่อเลือกรูปจากเครื่อง"}
            </span>
            <span className="text-[10px] text-[#94a3b8]">JPG, PNG ไม่เกิน 5MB ต่อรูป</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">วันปิดโหวต *</label>
          <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} required className={input} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#64748b] mb-1">ชื่อผู้แจ้ง *</label>
          <input value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} required placeholder="ชื่อ-สกุล" className={input} />
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-xs font-medium text-[#64748b] mb-2">ตัวเลือกโหวต * (อย่างน้อย 2)</label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`ตัวเลือก ${i + 1}`}
                className={input}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)}
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addOption}
          className="mt-2 flex items-center gap-1 text-xs text-[#1e3a5f] font-medium hover:underline">
          <Plus size={14} /> เพิ่มตัวเลือก
        </button>
      </div>

      <button type="submit" disabled={saving || uploading}
        className="px-6 py-2.5 bg-[#c9a227] text-[#1e3a5f] font-bold rounded-xl hover:bg-[#d4b44a] transition-colors text-sm disabled:opacity-50 flex items-center gap-2">
        {(saving || uploading) && <Loader2 className="animate-spin" size={14} />}
        {uploading ? `กำลังอัพโหลดรูป...` : saving ? "กำลังบันทึก..." : "สร้างแบบสำรวจ"}
      </button>
    </form>
  );
}
