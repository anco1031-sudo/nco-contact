import { createClient } from "@supabase/supabase-js";

const SITE_TITLE = "NCO 1333 เพื่อนกันจนวันตาย";

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(str, max = 200) {
  const clean = String(str || "").replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1) + "…" : clean;
}

async function fetchItem(supabase, path, origin) {
  let m;

  if ((m = /^\/news\/([\w-]+)$/.exec(path))) {
    const { data: news } = await supabase.from("news").select("*").eq("id", m[1]).single();
    if (!news) return null;
    const { data: imgs } = await supabase
      .from("news_images")
      .select("image_url")
      .eq("news_id", m[1])
      .order("sort_order")
      .limit(1);
    return {
      title: news.title,
      description: truncate(news.content),
      image: imgs?.[0]?.image_url,
      type: "article",
    };
  }

  if ((m = /^\/events\/([\w-]+)$/.exec(path))) {
    const { data: ev } = await supabase.from("events").select("*").eq("id", m[1]).single();
    if (!ev) return null;
    const date = new Date(ev.event_date).toLocaleDateString("th-TH", {
      year: "numeric", month: "long", day: "numeric",
    });
    return {
      title: ev.title,
      description: truncate(ev.description || `กิจกรรมวันที่ ${date}${ev.location ? ` ณ ${ev.location}` : ""}`),
      image: null,
      type: "article",
    };
  }

  if ((m = /^\/surveys\/([\w-]+)$/.exec(path))) {
    const { data: sv } = await supabase.from("surveys").select("*").eq("id", m[1]).single();
    if (!sv) return null;
    return {
      title: sv.title,
      description: truncate(sv.description || "แบบสำรวจความคิดเห็น"),
      image: sv.image_url,
      type: "article",
    };
  }

  return null;
}

export default async function handler(req, res) {
  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const origin = `${proto}://${host}`;
    const path = new URL(req.url, origin).pathname;

    // index.html ถูก serve เป็น static file อยู่แล้ว (filesystem match มาก่อน rewrite)
    const htmlRes = await fetch(`${origin}/index.html`, { redirect: "follow" });
    let html = await htmlRes.text();

    const item = await (async () => {
      try {
        const url = process.env.VITE_SUPABASE_URL;
        const key = process.env.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) return null;
        const supabase = createClient(url, key);
        return await fetchItem(supabase, path, origin);
      } catch {
        return null;
      }
    })();

    if (item) {
      const fullTitle = `${item.title} | NCO 1333`;
      const desc = item.description || "ระบบจัดการข้อมูลเครือข่ายนักเรียนนายสิบรุ่นที่ 1333";
      const img = item.image || `${origin}/logo.jpg`;

      const replace = (pattern, replacement) => {
        html = html.replace(pattern, replacement);
      };

      replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(fullTitle)}</title>`);
      replace(
        /<meta property="og:type" content="[^"]*" \/>/,
        `<meta property="og:type" content="${item.type}" />`
      );
      replace(
        /<meta property="og:title" content="[^"]*" \/>/,
        `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`
      );
      replace(
        /<meta property="og:description" content="[^"]*" \/>/,
        `<meta property="og:description" content="${escapeHtml(desc)}" />`
      );
      replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${escapeHtml(img)}" />`
      );
      replace(
        /<meta property="og:url" content="[^"]*" \/>/,
        `<meta property="og:url" content="${escapeHtml(origin + path)}" />`
      );
      replace(
        /<meta name="twitter:title" content="[^"]*" \/>/,
        `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`
      );
      replace(
        /<meta name="twitter:description" content="[^"]*" \/>/,
        `<meta name="twitter:description" content="${escapeHtml(desc)}" />`
      );
      replace(
        /<meta name="twitter:image" content="[^"]*" \/>/,
        `<meta name="twitter:image" content="${escapeHtml(img)}" />`
      );
      replace(
        /<meta name="description" content="[^"]*" \/>/,
        `<meta name="description" content="${escapeHtml(desc)}" />`
      );
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
    res.status(200).send(html);
  } catch {
    res.status(500).send("Internal Server Error");
  }
}
