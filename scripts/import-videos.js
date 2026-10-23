/* ============================================================================
   Adventigle — bulk video importer
   ----------------------------------------------------------------------------
   Reads the master list at  G:/Development/Git/notgamingplayz-videos.md
   and regenerates:
     - content/videos/index.json        (homepage catalog)
     - content/videos/video-N.json      (per-video metadata + downloads)
     - content/videos/video-N.md        (clean guide text — NO links inside)
     - video/<slug>/index.html          (shareable pretty-URL pages)

   Downloads & links rule:
     - Every external URL inside a video block is extracted into the JSON
       `downloads` array. The generated .md guide never contains URLs — the
       site renders them from JSON in the "Downloads & links" box.
     - If a video block has NO links in the master file (clean master), the
       downloads already stored in content/videos/video-N.json are preserved
       as-is. To change a link later: edit that video-N.json file directly,
       or add a link section (e.g. "### Download") back to the master file
       for that video (then master links replace the stored ones).
     - The video's own YouTube link and social links are never stored.

   Maintenance flag:
     node scripts/import-videos.js --clean-master
       Strips all content URLs out of the master file itself (keeps the
       - **YouTube:** header lines) and saves a backup at
       notgamingplayz-videos.links-backup.md first. One-time use.

   Run normally with:   node scripts/import-videos.js
   It OVERWRITES generated files — hand edits to content/videos/*.md are lost.
   ============================================================================ */
const fs = require("fs");
const path = require("path");

const ROOT = "G:/Development/JavaScript/adventigle";
const SRC = "G:/Development/Git/notgamingplayz-videos.md";
const URL_RE = /https?:\/\/[^\s|)]+/g;
const GENERIC_HEAD = /^(description|download|downloads|links?|tools?|websites?|resources?|notes?|important)$/i;

/* ---------- tiny helpers ---------- */
function field(block, name) {
  const re = new RegExp("- \\*\\*" + name + ":\\*\\*\\s*(.*)");
  const m = block.match(re);
  return m ? m[1].trim() : "";
}

function normUrl(u) {
  u = String(u || "").trim().replace(/[).,]+$/, "").replace(/#+$/, "");
  u = u.replace(/[?&]si=[^&#]+/g, "");
  u = u.replace(/\?usp=sharing$/i, "").replace(/([?&])usp=sharing(&|$)/g, "$1$2");
  u = u.replace(/\?$/, "");
  return u;
}

function cleanLabel(s) {
  return String(s || "")
    .replace(/\*\*/g, "")
    .replace(/[@•]/g, " ")
    .replace(/\s*[-\u2013\u2014:]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function friendlyDomain(u) {
  var host = "";
  try { host = new URL(u).hostname; } catch (e) { return "Link"; }
  host = host.replace(/^www\./, "").toLowerCase();
  var map = {
    "mediafire.com": "MediaFire",
    "drive.google.com": "Google Drive",
    "play.google.com": "Google Play Store",
    "aistudio.google.com": "Google AI Studio",
    "github.com": "GitHub",
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "mcpedl.com": "MCPEDL",
    "curseforge.com": "CurseForge",
    "9minecraft.net": "9Minecraft",
    "minecraft.wiki": "Minecraft Wiki",
    "learn.microsoft.com": "Microsoft Learn",
    "holoprint-mc.github.io": "HoloPrint",
    "bedrocktweaks.net": "Bedrock Tweaks",
    "flarial.xyz": "Flarial",
    "directgrab.pages.dev": "DirectGrab",
    "bypass.city": "Bypass.city",
    "bypass.vip": "Bypass.vip",
    "not-gaming-playz.pages.dev": "Not Gaming Playz"
  };
  if (map[host]) return map[host];
  var parts = host.split(".");
  if (parts.length > 2 && /^(pages\.dev|github\.io|netlify\.app|vercel\.app|web\.app|gitlab\.io)$/.test(parts.slice(-2).join("."))) {
    parts = parts.slice(0, parts.length - 2);
  } else if (parts.length > 2 && ["com", "net", "org", "io", "dev", "app", "xyz", "me", "co", "info", "us"].indexOf(parts[parts.length - 1]) !== -1) {
    parts = parts.slice(0, parts.length - 1);
  }
  var label = parts.join(".").replace(/-/g, " ").trim();
  if (!label) return "Link";
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/* Plain-text version for JSON description / topic (no markdown, no URLs) */
function textOf(s) {
  return String(s || "")
    .replace(URL_RE, " ")
    .replace(/[*_`>#]/g, " ")
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}]/gu, " ")
    .replace(/[\u2500\u2501\u2504_\-=]{3,}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cutWords(s, max) {
  s = String(s || "").trim();
  if (s.length <= max) return s;
  var c = s.slice(0, max);
  var k = c.lastIndexOf(" ");
  if (k > max * 0.55) c = c.slice(0, k);
  return c.replace(/[,.;:!?\u2014\u2013-]+$/, "").trim();
}

function shortTopic(firstPara, title) {
  var t = firstPara || textOf(title);
  var m = t.match(/^(.{40,170}?[.!?])(\s|$)/);
  if (m) return m[1];
  return cutWords(t, 167) + "\u2026";
}

function slugify(title) {
  let s = String(title || "")
    .toLowerCase()
    .replace(/[\u2019'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (s.length > 60) {
    s = s.slice(0, 60);
    const cut = s.lastIndexOf("-");
    if (cut > 25) s = s.slice(0, cut);
  }
  return s || "video";
}

function categorize(title, bodyText) {
  const ti = String(title || "").toLowerCase();
  const t = (title + " " + bodyText).toLowerCase();
  // BG music: strong signals only (a "Music:" credit line must not capture pack videos)
  if (/\b(music|song|bgm|anthem|orchestral|soundtrack)\b/.test(ti) ||
      /\b(anthem|orchestral|soundtrack|instrumental|drum & bass|musical)\b/.test(t)) return ["bg-music", "BG Music"];
  // UI packs: strong phrases (generic "interface"/"menu" words in prose must not capture tutorials)
  if (/\b(ui pack|ui resource|anime ui|dark ui|themed menu|main menu|menu screen|loading screens?|crosshairs?|hud|start screen)\b/.test(t)) return ["ui-packs", "UI Packs"];
  if (/\b(texture|resource pack|night vision|full bright|totem|shader)\b/.test(t)) return ["texture-packs", "Texture Packs"];
  if (/\b(fix|kaise|how to|tutorial|bypass|export|convert|command|client|tour|farm|mode|marketplace|skin|website|lag)\b/.test(t)) return ["tips-tricks", "Tips & Tricks"];
  return ["others", "Others"];
}

/* ---------- URL stripping (shared by guide builder + master cleaner) ---------- */

/* Markdown table row handling: extract URLs (label = first column), strip
   them from cells and drop a pure "Link" column entirely. */
function cleanTable(rows, collect, lastHeading) {
  const header = rows[0];
  const sep = rows[1] || [];
  const body = rows.slice(2);
  const linkCol = header.findIndex(function (c) { return /^links?$/i.test(c); });

  body.forEach(function (row) {
    row.forEach(function (cell, j) {
      const us = cell.match(URL_RE);
      if (!us) return;
      us.forEach(function (u) {
        collect.push({
          url: u,
          label: cleanLabel(row[0]) || cleanLabel(header[0]),
          heading: lastHeading,
          note: linkCol === j ? (row[1] || "").replace(/\*\*/g, "").trim() : ""
        });
      });
      row[j] = cell.replace(URL_RE, "").replace(/\*\*/g, "").trim();
    });
  });

  let emit = [header, sep].concat(body);
  if (linkCol >= 0) {
    emit = emit.map(function (r) { return r.filter(function (_, j) { return j !== linkCol; }); });
  }
  return emit.map(function (r) { return "| " + r.join(" | ") + " |"; });
}

/*
  Strips every URL from the given body lines, collecting {url,label,heading,note}
  into `collect`. Returns cleaned lines (structure kept: lists stay lists,
  tables stay tables, code fences untouched). Short label-only leftovers are
  dropped; their text becomes the link's `note`.
*/
function cleanBody(lines, collect) {
  const out = [];
  let inCode = false;
  let lastHeading = "";
  let lastHeadingGeneric = false;

  function addRest(rest, linePushed) {
    rest = String(rest || "")
      .replace(/\*\*/g, " ")
      .replace(/^\s*[-*\u2022]\s*/, "")
      .replace(/^\s*[\u2013\u2014]\s*/, "")
      .replace(/[\s\u2013\u2014]+$/, "")
      .replace(/[:\s]+$/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!rest) return;
    const words = rest.split(" ").length;
    if (rest.length <= 70 && words <= 10) {
      if (linePushed && collect.length && !collect[collect.length - 1].note) {
        collect[collect.length - 1].note = rest;
      }
      return; // short label-ish fragment → lives on the JSON entry, not the guide
    }
    out.push(rest);
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*```/.test(line)) { inCode = !inCode; out.push(line); i++; continue; }
    if (inCode) { out.push(line); i++; continue; }
    if (/^\s*-{3,}\s*$/.test(line)) { i++; continue; }

    const hm = line.match(/^###\s+(.*)$/);
    if (hm) {
      lastHeading = hm[1].trim();
      lastHeadingGeneric = GENERIC_HEAD.test(cleanLabel(lastHeading));
      out.push(line);
      i++;
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      const rows = [];
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map(function (s) { return s.trim(); }));
        i++;
      }
      cleanTable(rows, collect, lastHeading).forEach(function (r) { out.push(r); });
      continue;
    }

    const urls = line.match(URL_RE);
    if (!urls) { out.push(line); i++; continue; }

    const first = urls[0];
    const pre = line.slice(0, line.indexOf(first));
    const bm = pre.match(/\*\*(.+?)\*\*/);
    let label = bm ? bm[1] : "";
    if (!label) {
      const preTxt = pre.replace(/^\s*[-*]\s*/, "").replace(/\*\*/g, "").replace(/[\u2013\u2014]\s*$/, "").trim();
      if (preTxt.length >= 3 && preTxt.length <= 90) label = preTxt;
    }
    const tag = collect.length;
    urls.forEach(function (u) { collect.push({ url: u, label: label, heading: lastHeading, headingGeneric: lastHeadingGeneric }); });

    let rest = line.replace(URL_RE, " ").trim();
    if (rest) {
      // remove the bold label portion (it lives on the JSON entry now)
      rest = rest.replace(/\*\*/g, " ");
      const lbl = cleanLabel(label);
      if (lbl) {
        const esc = lbl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        rest = rest.replace(new RegExp("(^|\\s)" + esc + "\\s*:?\\s*"), " ");
      }
    }
    addRest(rest, collect.length > tag);
    i++;
  }
  return out;
}

/* Drop ###-headings whose section became empty after URL stripping */
function dropEmptySections(lines) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (/^###\s/.test(lines[i])) {
      let j = i + 1;
      while (j < lines.length && !/^###\s/.test(lines[j]) && !/^\s*-{3,}\s*$/.test(lines[j])) j++;
      let has = false;
      for (let k = i + 1; k < j; k++) if (lines[k].trim()) { has = true; break; }
      if (!has) { i = j; continue; }
    }
    out.push(lines[i]);
    i++;
  }
  return out;
}

function normalizeBlanks(lines) {
  const out = [];
  let prevBlank = false;
  lines.forEach(function (l) {
    const blank = !l.trim();
    if (blank && prevBlank) return;
    out.push(blank ? "" : l.replace(/\s+$/, ""));
    prevBlank = blank;
  });
  while (out.length && !out[0].trim()) out.shift();
  while (out.length && !out[out.length - 1].trim()) out.pop();
  return out;
}

/* ---------- downloads finalizer ---------- */
function finalizeDownloads(collect, vid) {
  const out = [];
  const seen = new Set();
  collect.forEach(function (c) {
    const url = normUrl(c.url);
    if (!/^https?:\/\//i.test(url)) return;
    if (/instagram\.com|(^|[^a-z])t\.me\//i.test(url)) return; // social junk
    if (vid) {
      const v = String(vid).toLowerCase();
      const lo = url.toLowerCase();
      if (lo.indexOf("watch?v=" + v) !== -1 || lo.indexOf("youtu.be/" + v) !== -1) return;
    }
    if (seen.has(url)) return;
    seen.add(url);
    let label = cleanLabel(c.label);
    if (!label) {
      const hd = cleanLabel(c.heading || "");
      if (hd && !GENERIC_HEAD.test(hd) && !c.headingGeneric) label = hd;
      else label = friendlyDomain(url);
    }
    const ext = (url.split("?")[0].match(/\.(mcpack|mcaddon|mcworld|mctemplate|mcstructure|zip|rar|7z)$/i) || [])[1];
    out.push({
      name: label.slice(0, 70) || "Open link",
      type: ext ? ext.toUpperCase() : "Link",
      size: "",
      icon: ext ? "\uD83D\uDCE6" : "\uD83D\uDD17",
      url: url,
      note: String(c.note || "").slice(0, 140)
    });
  });
  return out.slice(0, 10);
}

function loadOldJson(id) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, "content/videos", id + ".json"), "utf8"));
  } catch (e) { return null; }
}

/* ---------- description helpers ---------- */
function descriptionSectionParas(cleaned) {
  const start = cleaned.findIndex(function (l) { return /^###\s+Description\s*$/i.test(l); });
  if (start < 0) return [];
  const sec = [];
  for (let i = start + 1; i < cleaned.length && !/^###\s/.test(cleaned[i]); i++) sec.push(cleaned[i]);
  const paras = [];
  let cur = [];
  sec.forEach(function (l) {
    if (!l.trim()) { if (cur.length) { paras.push(cur.join(" ")); cur = []; } }
    else cur.push(l);
  });
  if (cur.length) paras.push(cur.join(" "));
  return paras.map(textOf).filter(function (p) { return p.length > 15; });
}

/* Guide .md: `### Description` heading dropped, other ### headings become ## */
function guideMd(cleaned) {
  const out = [];
  cleaned.forEach(function (line) {
    const hm = line.match(/^###\s+(.*)$/);
    if (hm) {
      if (/^description$/i.test(hm[1].trim())) return;
      out.push("## " + hm[1].trim());
      return;
    }
    out.push(line);
  });
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/* ---------- main ---------- */
const raw = fs.readFileSync(SRC, "utf8").replace(/\r\n/g, "\n");
const blocks = raw.split(/^## /m).slice(1);

const videos = [];
const usedSlugs = new Set();

blocks.forEach(function (block, i) {
  const line0 = block.split("\n")[0].trim();
  const headingTitle = line0.replace(/^\d+\.\s*/, "").trim();

  const link = field(block, "Link") || field(block, "YouTube");
  let vid = field(block, "Video ID");
  if (!vid && link) {
    const m = link.match(/[?&]v=([\w-]+)/) || link.match(/youtu\.be\/([\w-]+)/);
    vid = m ? m[1] : "";
  }
  const views = field(block, "Views");
  const duration = field(block, "Duration");
  const upload = field(block, "Upload Date");

  const metaEnd = block.indexOf("### Description");
  const headPart = metaEnd < 0 ? block : block.slice(0, metaEnd);
  const meta = headPart.split("\n")
    .filter(function (l) { return /^\s*-\s+\*\*[^*]+:\*\*\s*\S/.test(l); })
    .map(function (l) { return l.trim(); });
  const bodyRaw = (metaEnd < 0 ? block : block.slice(metaEnd)).split("\n");

  const collect = [];
  let cleaned = cleanBody(bodyRaw, collect);
  cleaned = dropEmptySections(cleaned);
  cleaned = normalizeBlanks(cleaned);

  const id = "video-" + (i + 1);
  const old = loadOldJson(id);
  const downloads = collect.length ? finalizeDownloads(collect, vid) : ((old && old.downloads) || []);

  const descParas = descriptionSectionParas(cleaned);
  const description = cutWords(descParas.join(" "), 480);
  const topic = shortTopic(descParas[0], headingTitle);
  const [cat, catLabel] = categorize(headingTitle, cleaned.join(" "));

  let slug = slugify(headingTitle);
  const base = slug; let n = 2;
  while (usedSlugs.has(slug)) { slug = base + "-" + n++; }
  usedSlugs.add(slug);

  let date = "";
  if (upload.length === 8) {
    date = upload.slice(0, 4) + "-" + upload.slice(4, 6) + "-" + upload.slice(6, 8);
  } else if (upload) {
    const months = { jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06", jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12" };
    const m = upload.match(/(\d{1,2})\s+([a-zA-Z]{3})\s+(\d{4})/);
    if (m) {
      const mon = months[m[2].toLowerCase()];
      const day = m[1].padStart(2, "0");
      date = m[3] + "-" + mon + "-" + day;
    }
  }

  const hashtags = (cleaned.join(" ").match(/#[A-Za-z][A-Za-z0-9_]{2,}/g) || [])
    .map(function (h) { return h.slice(1).toLowerCase(); }).slice(0, 6);

  videos.push({
    id: id,
    slug: slug,
    youtubeId: vid,
    title: headingTitle,
    topic: topic,
    description: description,
    category: cat,
    categoryLabel: catLabel,
    keywords: hashtags,
    duration: duration,
    views: views,
    date: date,
    watchUrl: vid ? "https://www.youtube.com/watch?v=" + vid : link,
    downloads: downloads,
    _master: { line0: line0, meta: meta, cleaned: cleaned }
  });
});

/* ---------- write outputs ---------- */
fs.writeFileSync(path.join(ROOT, "content/videos/index.json"), JSON.stringify({
  channel: "NotGamingPlayz",
  handle: "@notgamingplayz",
  creator: "Mukund",
  updatedAt: new Date().toISOString().slice(0, 10),
  videos: videos.map(function (v) {
    return {
      id: v.id, slug: v.slug, youtubeId: v.youtubeId, title: v.title,
      topic: v.topic, description: v.description, category: v.category,
      categoryLabel: v.categoryLabel, keywords: v.keywords, duration: v.duration,
      views: v.views, date: v.date, hasGuide: true, downloads: v.downloads
    };
  })
}, null, 2));

videos.forEach(function (v) {
  const meta = {
    id: v.id, slug: v.slug, youtubeId: v.youtubeId, title: v.title,
    topic: v.topic, description: v.description, category: v.category,
    categoryLabel: v.categoryLabel, keywords: v.keywords, duration: v.duration,
    views: v.views, date: v.date, watchUrl: v.watchUrl, downloads: v.downloads
  };
  fs.writeFileSync(path.join(ROOT, "content/videos", v.id + ".json"), JSON.stringify(meta, null, 2));

  let md = "# " + v.title + "\n\n" + guideMd(v._master.cleaned) +
    "\n\n*Thank you for reading this guide. \u2014 @notgamingplayz*\n";
  fs.writeFileSync(path.join(ROOT, "content/videos", v.id + ".md"), md);
});

/* ---------- slug pages from video.html ---------- */
const shell = fs.readFileSync(path.join(ROOT, "video.html"), "utf8");
const videoDir = path.join(ROOT, "video");
if (fs.existsSync(videoDir)) fs.rmSync(videoDir, { recursive: true, force: true });
videos.forEach(function (v) {
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

/* ---------- optional: clean the master file itself ---------- */
if (process.argv.includes("--clean-master")) {
  const backup = SRC + ".links-backup.md";
  if (!fs.existsSync(backup)) fs.copyFileSync(SRC, backup);

  const firstBlock = raw.search(/^## \d/m);
  let header = raw.slice(0, firstBlock);
  header = header.replace(/Total videos: \d+/, "Total videos: " + blocks.length);
  header = header.replace(/\s+$/, "\n\n");

  const parts = videos.map(function (v) {
    return "## " + v._master.line0 + "\n\n" +
      v._master.meta.join("\n") + "\n\n" +
      v._master.cleaned.join("\n").replace(/\n{3,}/g, "\n\n");
  });
  fs.writeFileSync(SRC, header + parts.join("\n\n---\n\n") + "\n");
  console.log("Master cleaned: content URLs removed (backup: " + path.basename(backup) + ")");
}

/* ---------- report ---------- */
const totalDl = videos.reduce(function (a, v) { return a + v.downloads.length; }, 0);
console.log("Parsed " + videos.length + " videos (" + totalDl + " download links captured)");
console.log("Categories:", videos.reduce(function (a, v) {
  a[v.categoryLabel] = (a[v.categoryLabel] || 0) + 1; return a;
}, {}));
console.log("No youtubeId:", videos.filter(function (v) { return !v.youtubeId; }).map(function (v) { return v.id; }).join(", ") || "none");
console.log("Downloads per video:");
videos.forEach(function (v) {
  console.log("  " + v.id + " (" + v.downloads.length + "): " +
    v.downloads.map(function (d) { return d.name; }).join(", "));
});
