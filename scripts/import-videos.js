/* ============================================================================
   Adventigle — bulk video importer
   ----------------------------------------------------------------------------
   Reads the master list at  G:/Development/Git/notgamingplayz-videos.md
   and regenerates:
     - content/videos/index.json        (the homepage catalog)
     - content/videos/video-N.json      (per-video metadata)
     - content/videos/video-N.md        (per-video info / notes)
     - video/<slug>/index.html          (shareable pretty-URL pages)

   Run it with:   node scripts/import-videos.js
   (Edit the SRC path below if your markdown file lives somewhere else.)
   It OVERWRITES the generated files — hand edits to those files will be lost.
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = "G:/Development/Websites/notgamingplayz-community";
const SRC = "G:/Development/Git/notgamingplayz-videos.md";

const raw = fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");

// Split into per-video blocks on "## N. Title"
const blocks = raw.split(/^## /m).slice(1);

function field(block, name) {
  const re = new RegExp("- \\*\\*" + name + ":\\*\\*\\s*(.*)");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function clean(s) {
  return String(s || "")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[`*_>#]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, " ")
    .replace(/[━─_=]{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(title) {
  let s = String(title || "")
    .toLowerCase()
    .replace(/[’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > 60) {
    s = s.slice(0, 60);
    const cut = s.lastIndexOf("-");
    if (cut > 25) s = s.slice(0, cut);
  }
  return s || "video";
}

function categorize(title, desc) {
  const t = (title + " " + desc).toLowerCase();
  if (/\b(music|bgm|song|orchestral|soundtrack)\b/.test(t)) return ["bg-music", "BG Music"];
  if (/\b(ui|menu|hud|crosshair|crosshairs|interface|start screen)\b/.test(t)) return ["ui-packs", "UI Packs"];
  if (/\b(texture|resource pack|night vision|full bright|totem|shader)\b/.test(t)) return ["texture-packs", "Texture Packs"];
  if (/\b(fix|kaise|how to|tutorial|bypass|export|convert|command|client|tour|farm|mode|marketplace|skin|website|lag)\b/.test(t)) return ["tips-tricks", "Tips & Tricks"];
  return ["others", "Others"];
}

function paragraphs(desc) {
  const cleaned = desc
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((p) => p.split("\n").filter((ln) => {
      const l = ln.trim();
      if (!l) return false;
      if (/subscribe|playlist|channel:|thanks for watching|like kar|share kar|credit\s*:|^\s*[-_=━─]{2,}\s*$/i.test(l)) return false;
      if (/^(📦|🎮|🔗|🎬|✅|👤|📌|💬|👍|⚠️|📱)/.test(l) && l.length < 60 && !/https?:/.test(l)) return false;
      return true;
    }).join(" "))
    .map((p) => clean(p))
    .filter((p) => p.length > 25);
  return cleaned;
}

function shortTopic(paras, title) {
  let t = paras[0] || clean(title);
  t = t.replace(/\s*[—–]\s*/g, " — ");
  const m = t.match(/^(.{40,160}?[.!?])\s/);
  if (m) t = m[1];
  if (t.length > 170) t = t.slice(0, 167).replace(/\s\S*$/, "") + "…";
  return t;
}

function extractLinks(desc) {
  const out = [];
  const seen = new Set();
  const lines = desc.replace(/\r/g, "").split("\n");
  const re = /(https?:\/\/\S+)/g;
  for (const line of lines) {
    const urls = line.match(re);
    if (!urls) continue;
    for (let u of urls) {
      u = u.replace(/[),.]+$/, "").replace(/^\*+/, "");
      if (/youtube\.com|youtu\.be|instagram\.com|t\.me|discord/i.test(u)) continue;
      if (seen.has(u)) continue;
      seen.add(u);
      let label = line.replace(re, "").replace(/[@*•\-–—:]/g, " ").trim();
      label = label.replace(/\s+/g, " ").slice(0, 70);
      const ext = (u.split("?")[0].match(/\.([a-z0-9]{2,5})$/i) || [])[1];
      out.push({
        name: label || "Open link",
        type: ext ? ext.toUpperCase() : "LINK",
        size: "",
        icon: /\.(mcpack|mcaddon|mcworld|zip|7z|rar)$/i.test(u) ? "📦" : "🔗",
        url: u
      });
      if (out.length >= 6) return out;
    }
  }
  return out;
}

const videos = [];
const usedSlugs = new Set();

blocks.forEach((block, i) => {
  const firstLine = block.split("\n")[0].trim();
  const headingTitle = firstLine.replace(/^\d+\.\s*/, "").trim();

  const link = field(block, "Link");
  let vid = field(block, "Video ID");
  if (!vid) {
    const m = link.match(/[?&]v=([\w-]+)/);
    vid = m ? m[1] : "";
  }
  const title = field(block, "Topic/Title") || headingTitle;
  const views = field(block, "Views");
  const duration = field(block, "Duration");
  const upload = field(block, "Upload Date");

  const descIdx = block.indexOf("**Description:**");
  const desc = descIdx >= 0 ? block.slice(descIdx + "**Description:**".length) : "";

  const paras = paragraphs(desc);
  const [cat, catLabel] = categorize(title, desc);

  let slug = slugify(title);
  let base = slug, n = 2;
  while (usedSlugs.has(slug)) { slug = base + "-" + n++; }
  usedSlugs.add(slug);

  const date = upload.length === 8
    ? upload.slice(0, 4) + "-" + upload.slice(4, 6) + "-" + upload.slice(6, 8)
    : "";

  const hashtags = (desc.match(/#[A-Za-z][A-Za-z0-9_]{2,}/g) || [])
    .map((h) => h.slice(1).toLowerCase()).slice(0, 6);

  videos.push({
    id: "video-" + (i + 1),
    slug,
    youtubeId: vid,
    title,
    topic: shortTopic(paras, title),
    description: paras.slice(0, 2).join(" ").slice(0, 480),
    category: cat,
    categoryLabel: catLabel,
    keywords: hashtags,
    duration,
    views,
    date,
    watchUrl: vid ? "https://www.youtube.com/watch?v=" + vid : link,
    downloads: extractLinks(desc),
    _paras: paras
  });
});

fs.writeFileSync(path.join(ROOT, "content/videos/index.json"), JSON.stringify({
  channel: "NotGamingPlayz",
  handle: "@notgamingplayz",
  creator: "Mukund",
  updatedAt: new Date().toISOString().slice(0, 10),
  videos: videos.map((v) => ({
    id: v.id, slug: v.slug, youtubeId: v.youtubeId, title: v.title,
    topic: v.topic, description: v.description, category: v.category,
    categoryLabel: v.categoryLabel, keywords: v.keywords, duration: v.duration,
    views: v.views, date: v.date, hasGuide: true, downloads: v.downloads
  }))
}, null, 2));

videos.forEach((v) => {
  const meta = {
    id: v.id, slug: v.slug, youtubeId: v.youtubeId, title: v.title,
    topic: v.topic, description: v.description, category: v.category,
    categoryLabel: v.categoryLabel, keywords: v.keywords, duration: v.duration,
    views: v.views, date: v.date, watchUrl: v.watchUrl, downloads: v.downloads
  };
  fs.writeFileSync(path.join(ROOT, "content/videos", v.id + ".json"), JSON.stringify(meta, null, 2));

  let md = "# " + v.title + "\n\n";
  if (v.description) md += v.description + "\n\n";
  const extra = v._paras.slice(2);
  if (extra.length) md += extra.slice(0, 4).join("\n\n") + "\n\n";
  if (v.downloads.length) {
    md += "## 🔗 Links & downloads\n\n";
    v.downloads.forEach((d) => { md += "- **" + d.name + "** — " + d.url + "\n"; });
    md += "\n";
  }
  md += "*Guide compiled for Adventigle. Channel: @notgamingplayz.*\n";
  fs.writeFileSync(path.join(ROOT, "content/videos", v.id + ".md"), md);
});

// Build slug pages from video.html
const shell = fs.readFileSync(path.join(ROOT, "video.html"), "utf8");
const videoDir = path.join(ROOT, "video");
if (fs.existsSync(videoDir)) fs.rmSync(videoDir, { recursive: true, force: true });
videos.forEach((v) => {
  const dir = path.join(videoDir, v.slug);
  fs.mkdirSync(dir, { recursive: true });
  const page = shell
    .replace(/href="assets\/css\/style\.css"/g, 'href="../../assets/css/style.css"')
    .replace(/src="assets\/js\/app\.js"/g, 'src="../../assets/js/app.js"')
    .replace(/href="index\.html/g, 'href="../../index.html')
    .replace(/(<script src="\.\.\/\.\.\/assets\/js\/app\.js"><\/script>)/,
      '<script>window.__VIDEO_SLUG__="' + v.slug + '";window.__SITE_ROOT__="../../";</script>\n  $1');
  fs.writeFileSync(path.join(dir, "index.html"), page);
});

console.log("Parsed " + videos.length + " videos");
console.log("Categories:", videos.reduce((a, v) => { a[v.categoryLabel] = (a[v.categoryLabel] || 0) + 1; return a; }, {}));
console.log("No youtubeId:", videos.filter((v) => !v.youtubeId).map((v) => v.id).join(", ") || "none");
console.log("Sample:", JSON.stringify({ id: videos[0].id, slug: videos[0].slug, cat: videos[0].categoryLabel, topic: videos[0].topic.slice(0, 80), dl: videos[0].downloads.length }, null, 1));
