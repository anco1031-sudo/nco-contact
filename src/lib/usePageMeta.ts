import { useEffect } from "react";

const SITE_NAME = "NCO 1333";

interface PageMeta {
  title?: string;
  description?: string;
  image?: string;
}

function setMeta(selector: string, attr: "property" | "name", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * อัปเดต <title> และ meta tags (OG / Twitter / description) ฝั่ง browser
 * หมายเหตุ: crawler ของ LINE/Facebook ไม่รัน JS — preview ของแชร์จัดการโดย
 * api/social-preview (server-side) แทน
 */
export function usePageMeta({ title, description, image }: PageMeta) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} เพื่อนกันจนวันตาย`;
    const desc =
      description?.replace(/\s+/g, " ").trim().slice(0, 200) ||
      "ระบบจัดการข้อมูลเครือข่ายนักเรียนนายสิบรุ่นที่ 1333";
    const img = image || `${window.location.origin}/logo.jpg`;

    document.title = fullTitle;
    setMeta('meta[property="og:title"]', "property", "og:title", fullTitle);
    setMeta('meta[property="og:description"]', "property", "og:description", desc);
    setMeta('meta[property="og:image"]', "property", "og:image", img);
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", desc);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", img);
    setMeta('meta[name="description"]', "name", "description", desc);
  }, [title, description, image]);
}
