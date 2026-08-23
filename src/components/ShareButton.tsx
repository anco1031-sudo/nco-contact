import { useState } from "react";
import { Share2, Link2, X, MessageCircle } from "lucide-react";

interface Props {
  title: string;
  description?: string;
  url?: string;
}

const SITE_URL = window.location.origin;

export default function ShareButton({ title, description, url }: Props) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareText = description
    ? `${title}\n\n${description}\n\n${shareUrl}`
    : `${title}\n\n${shareUrl}`;

  // Web Share API (มือถือ)
  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch {
        // user cancelled
      }
    } else {
      setOpen(!open);
    }
  }

  // คัดลอกลิงก์
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const socialLinks = [
    {
      name: "LINE",
      color: "bg-[#06C755] hover:bg-[#05a847]",
      icon: <MessageCircle size={16} />,
      href: `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "Facebook",
      color: "bg-[#1877F2] hover:bg-[#1565d8]",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`,
    },
    {
      name: "X",
      color: "bg-[#000000] hover:bg-[#333333]",
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="relative">
      {/* Share button */}
      <button
        onClick={handleNativeShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#1e3a5f] transition-colors"
      >
        <Share2 size={13} /> แชร์
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-2xl border border-[#e2e8f0] shadow-xl p-3 w-56 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-semibold text-[#1e3a5f]">แชร์ไปที่</span>
              <button onClick={() => setOpen(false)} className="text-[#94a3b8] hover:text-[#1e293b]">
                <X size={14} />
              </button>
            </div>

            {/* Social links */}
            <div className="space-y-1.5">
              {socialLinks.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-white text-xs font-medium transition-colors ${s.color}`}
                >
                  {s.icon}
                  {s.name}
                </a>
              ))}
            </div>

            {/* Copy link */}
            <button
              onClick={copyLink}
              className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-[#e2e8f0] text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
            >
              <Link2 size={14} />
              {copied ? "คัดลอกแล้ว! ✓" : "คัดลอกลิงก์"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
