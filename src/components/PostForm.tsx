import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Send, Loader2 } from "lucide-react";

interface Props {
  onAdded: () => void;
}

export default function PostForm({ onAdded }: Props) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) {
      setError("กรุณากรอกข้อความและชื่อ");
      return;
    }
    setSaving(true);
    setError("");
    const { error: err } = await supabase.from("posts").insert({
      content: content.trim(),
      author_name: authorName.trim(),
    });
    if (err) setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    else {
      setContent("");
      onAdded();
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm space-y-3">
      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="ชื่อ-สกุล"
        className="w-full px-4 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="เขียนอะไรสักอย่าง..."
        className="w-full px-4 py-2.5 border border-[#cbd5e1] rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] outline-none transition-all resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={saving || !content.trim()}
          className="px-5 py-2 bg-[#1e3a5f] text-white rounded-xl text-sm font-medium hover:bg-[#2d5986] transition-colors disabled:opacity-40 flex items-center gap-2">
          {saving ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
          โพสต์
        </button>
      </div>
    </form>
  );
}
