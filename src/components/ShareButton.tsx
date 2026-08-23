import { useState, useRef, useEffect } from "react";
import { Share2, Link2, X, Check, Copy } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  url?: string;
}

export default function ShareButton({ title, description, url }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"link" | "text" | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const shareUrl = url || window.location.href;
  const shareText = `📢 ${title}\n${description ? description + "\n" : ""}\n🔗 ${shareUrl}`;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#1e3a5f] hover:text-white hover:border-[#1e3a5f] transition-all"
      >
        <Share2 size={13} /> แชร์
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#e2e8f0] shadow-2xl p-3 w-72">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-sm font-bold text-[#1e3a5f]">แชร์</span>
            <button onClick={() => setOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
              <X size={16} />
            </button>
          </div>

          {/* Preview card */}
          <div className="bg-[#f8fafc] rounded-xl p-3 mb-3 border border-[#e2e8f0]">
            <p className="text-xs font-semibold text-[#1e3a5f] line-clamp-2">{title}</p>
            {description && (
              <p className="text-[10px] text-[#64748b] mt-1 line-clamp-2">{description}</p>
            )}
            <p className="text-[10px] text-[#94a3b8] mt-1 truncate">{shareUrl}</p>
          </div>

          {/* Actions */}
          <div className="space-y-1.5">
            {/* คัดลอกข้อความพร้อมลิงก์ */}
            <button
              onClick={copyText}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium bg-[#c9a227] text-[#1e3a5f] hover:bg-[#d4b44a] transition-colors"
            >
              {copied === "text" ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
              {copied === "text" ? "คัดลอกข้อความแล้ว! ✓" : "คัดลอกข้อความ + ลิงก์"}
            </button>

            {/* คัดลอกลิงก์ */}
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              {copied === "link" ? <Check size={15} className="text-green-600" /> : <Link2 size={15} />}
              {copied === "link" ? "คัดลอกแล้ว! ✓" : "คัดลอกลิงก์"}
            </button>
          </div>

          {/* Hint */}
          <p className="text-[10px] text-[#94a3b8] mt-3 text-center leading-relaxed">
            💡 กด <b>"คัดลอกข้อความ + ลิงก์"</b> แล้วไปวางใน LINE / Facebook ได้เลย
          </p>
        </div>
      )}
    </div>
  );
}
