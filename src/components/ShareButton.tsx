import { useState } from "react";
import { Share2, Link2, Check, Copy, X } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  url?: string;
}

export default function ShareButton({ title, description, url }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);

  const shareUrl = url || window.location.href;
  const shareText = `📢 ${title}\n${description ? description + "\n" : ""}\n🔗 ${shareUrl}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyText() {
    await navigator.clipboard.writeText(shareText);
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <>
      {/* ปุ่มแชร์ */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#1e3a5f] hover:text-white hover:border-[#1e3a5f] transition-all"
      >
        <Share2 size={13} /> แชร์
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-lg font-bold text-[#1e3a5f]">แชร์</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-[#94a3b8] hover:text-[#1e293b] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Preview */}
            <div className="mx-5 bg-[#f8fafc] rounded-xl p-3 border border-[#e2e8f0] mb-4">
              <p className="text-sm font-semibold text-[#1e3a5f] line-clamp-2">{title}</p>
              {description && (
                <p className="text-xs text-[#64748b] mt-1 line-clamp-2">{description}</p>
              )}
              <p className="text-xs text-[#94a3b8] mt-2 truncate">{shareUrl}</p>
            </div>

            {/* Buttons */}
            <div className="px-5 pb-5 space-y-2.5">
              <button
                onClick={copyText}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold bg-[#c9a227] text-[#1e3a5f] hover:bg-[#d4b44a] transition-colors"
              >
                {copied === "text" ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Copy size={18} />
                )}
                {copied === "text" ? "คัดลอกข้อความแล้ว! ✓" : "คัดลอกข้อความ + ลิงก์"}
              </button>

              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
              >
                {copied === "link" ? (
                  <Check size={18} className="text-green-600" />
                ) : (
                  <Link2 size={18} />
                )}
                {copied === "link" ? "คัดลอกลิงก์แล้ว! ✓" : "คัดลอกลิงก์"}
              </button>
            </div>

            {/* Hint */}
            <div className="px-5 pb-5">
              <p className="text-[11px] text-[#94a3b8] text-center leading-relaxed">
                💡 กด <b className="text-[#64748b]">"คัดลอกข้อความ + ลิงก์"</b> แล้วไปวางใน LINE / Facebook ได้เลย
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
