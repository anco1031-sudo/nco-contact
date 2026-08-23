import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface Props {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ImageLightbox({ images, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex);

  // ปิดด้วย Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
      if (e.key === "ArrowRight") setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
      >
        <X size={24} />
      </button>

      {/* Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
          {current + 1} / {images.length}
        </div>
      )}

      {/* Previous */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((p) => (p === 0 ? images.length - 1 : p - 1));
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {/* Image */}
      <img
        src={images[current]}
        alt={`รูป ${current + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrent((p) => (p === images.length - 1 ? 0 : p + 1));
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
        >
          <ChevronRight size={28} />
        </button>
      )}

      {/* Thumbnail dots */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setCurrent(i);
              }}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ========== Clickable Image with Lightbox ========== */
interface ClickableImageProps {
  src: string;
  alt: string;
  allImages: string[];
  className?: string;
}

export function ClickableImage({ src, alt, allImages, className }: ClickableImageProps) {
  const [open, setOpen] = useState(false);
  const index = allImages.indexOf(src);

  return (
    <>
      <div
        className={`relative group cursor-pointer ${className || ""}`}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className="w-full object-contain" style={{ maxHeight: "100%" }} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white p-2 rounded-full">
            <ZoomIn size={20} />
          </div>
        </div>
      </div>
      {open && (
        <ImageLightbox
          images={allImages}
          initialIndex={index >= 0 ? index : 0}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
