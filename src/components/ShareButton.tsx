import { useState } from "react";
import { Share2, Link2, Check, Copy, X, MessageCircle } from "lucide-react";

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

  function openShare(target: "line" | "facebook") {
    const u = encodeURIComponent(shareUrl);
    const link =
      target === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${u}`
        : `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    window.open(link, "_blank", "width=600,height=600,noopener");
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

              {/* Social share */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => openShare("line")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#06C755] text-white hover:bg-[#05b04b] transition-colors"
                >
                  <MessageCircle size={18} />
                  LINE
                </button>
                <button
                  onClick={() => openShare("facebook")}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold bg-[#1877F2] text-white hover:bg-[#1461d6] transition-colors"
                >
                  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
                    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.026 1.792-4.697 4.533-4.697 1.313 0 2.686.236 2.686.236v2.971H15.83c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
                  </svg>
                  Facebook
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="px-5 pb-5">
              <p className="text-[11px] text-[#94a3b8] text-center leading-relaxed">
                💡 แชร์ผ่าน LINE / Facebook ได้เลย หรือกด <b className="text-[#64748b]">"คัดลอกข้อความ + ลิงก์"</b> ไปวางเอง
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
