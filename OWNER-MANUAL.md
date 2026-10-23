# Adventigle — Owner Manual

Ye manual tumhare liye hai. Agar kuch din baad bhool jao ki site kaise chalani hai
ya kaise kuch badalna hai, to bas ye file kholo aur padho. Sab kuch aasan steps
mein likha hai. 🙂

> **Site folder:** `G:\Development\Websites\notgamingplayz-community\`
> **Site ka naam:** Adventigle
> **Channel:** Not Gaming Playz (@notgamingplayz)

---

## 0. Quick cheat‑sheet (sabse important)

| Kaam | Kahan / Kaise |
|------|----------------|
| Site ko apne PC pe dekhna | `python -m http.server 8000` → kholo `http://localhost:8000` |
| Naya video add karna | Neeche §3 dekho |
| Video ka title/description badalna | `content/videos/video-N.json` edit karo |
| Video ke download links badalna | `content/videos/video-N.json` ki `downloads` list |
| Home ka bada headline badalna | `index.html` (dhoondo: "Make your Minecraft PE") |
| Site ka naam badalna | §7 dekho |
| Reviews approve karna | `content/reviews.json` edit karo |
| Rang (colors) badalna | `assets/css/style.css` (sabse upar `:root`) |
| Telegram (questions form) theek karna | §5 dekho |
| Website internet pe daalna (live karna) | §9 (GitHub Pages) |

---

## 1. Ye website kaise kaam karti hai (ek line mein)

Ye ek **static website** hai — matlab sirf files hain, koi server/database nahi.
Sab content `.json` aur `.md` files mein hai. Jo bhi badalna ho, file edit karke
save kar do aur (live site pe) GitHub pe upload kar do — ho gaya.

**Bahut zaroori:** `index.html` ko double‑click karke mat kholo. Hamesha ek chhota
local server chalao (neeche dekho), warna videos load nahi honge.

---

## 2. Site ko apne PC pe chalana (preview)

Terminal (Git Bash) kholo aur ye chalao:

```bash
cd "G:/Development/Websites/notgamingplayz-community"
python -m http.server 8000
```

Phir browser mein kholo: **http://localhost:8000**

Band karne ke liye Terminal mein `Ctrl + C` dabao.

---

## 3. Naya video add karna (sabse common kaam)

Tumhare paas do tareeke hain.

### Tareeka A — Importer script (agar tumhare paas master markdown list ho)

Master list file: `G:\Development\Git\notgamingplayz-videos.md`

1. Us file mein naya video ka block add karo (usi format mein — `## N. Title`,
   phir `- **Link:**`, `- **Video ID:**`, etc.).
2. Terminal mein chalao:
   ```bash
   cd "G:/Development/Websites/notgamingplayz-community"
   node scripts/import-videos.js
   ```
3. Bas! Ye khud‑ba‑khud `index.json`, `video-N.json`, `video-N.md` aur har video ka
   slug page bana dega.

> ⚠️ Ye script uske banayi hui files ko **overwrite** karti hai. Agar tumne kisi
> video ka JSON/MD manually badla tha, to script chalane se wo badal jayega.

### Tareeka B — Manually (ek‑ek file)

Naya video `video-39` maan lo:

1. **`content/videos/video-39.json`** — purani `video-1.json` copy karo aur badlo:
   ```json
   {
     "id": "video-39",
     "slug": "mera-naya-video",          // URL-friendly, chhote akshar, hyphen
     "youtubeId": "XXXXXXXXXXX",          // youtube link ke ?v= ke baad wala part
     "title": "Mera Naya Video",
     "topic": "Ek line ka chhota summary.",
     "description": "Thoda bada paragraph jo video page pe dikhega.",
     "category": "tip/trick",             // koi bhi label
     "categoryLabel": "Tips & Tricks",
     "keywords": ["minecraft", "pe"],
     "duration": "5m 10s",
     "views": "1.2K",
     "date": "2026-10-15",
     "watchUrl": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
     "downloads": [
       { "name": "Download Pack", "type": "MCPACK", "size": "2 MB", "icon": "📦", "url": "https://..." }
     ]
   }
   ```
2. **`content/videos/video-39.md`** — video ke notes/guide (Markdown).
3. **`content/videos/index.json`** — `videos` array mein wahi object (kam se kam
   `id`, `slug`, `youtubeId`, `title`, `categoryLabel`, `date`) add karo. Isi se
   home page ka grid banta hai.
4. **`video/<slug>/index.html`** — koi purana slug folder copy karo, folder ka naam
   apna slug rakho, aur file ke andar wali line badlo:
   ```html
   <script>window.__VIDEO_SLUG__="mera-naya-video";window.__SITE_ROOT__="../../";</script>
   ```
5. Live karna ho to GitHub pe commit/push (§9).

---

## 4. Kisi video ko edit ya delete karna

- **Title/description/links badalna:** sirf `content/videos/video-N.json` edit karo.
  Agar home page ka card bhi badalna hai to `content/videos/index.json` mein wahi
  entry bhi update karo.
- **Notes/guide badalna:** `content/videos/video-N.md` edit karo.
- **Video delete karna:** `video-N.json` aur `video-N.md` delete karo, `index.json`
  se uska object hata do, aur uska `video/<slug>/` folder delete kar do.

---

## 5. Telegram / Questions form (form kahan jata hai?)

Jab koi question ya review bhejta hai, wo tumhare **Telegram** pe aata hai.
Iske liye Google Apps Script use hota hai (`google_apps_script.js`).

**Ek baar ka setup:**
1. Telegram mein **@BotFather** ko `/newbot` bhejo → **token** copy karo.
2. Telegram mein **@userinfobot** ko message karo → apna **Chat ID** copy karo.
3. Kholo <https://script.google.com> → **New project** → `google_apps_script.js`
   ka pura code paste karo.
4. Upar config badlo:
   ```js
   var TELEGRAM_BOT_TOKEN = "yahan-token";
   var TELEGRAM_CHAT_ID   = "yahan-chat-id";
   ```
5. Dropdown se `setupSheet` → **Run** (Google permission de do), phir `testTelegram`
   → **Run**. Telegram pe test message aana chahiye.
6. **Deploy → New deployment → Web app** → Execute as: **Me**, Who has access:
   **Anyone** → **Deploy** → `/exec` URL copy karo.
7. Wo URL `assets/js/app.js` mein daalo:
   ```js
   appsScriptUrl: "https://script.google.com/macros/s/..../exec",
   ```
   (Abhi tumhare URL already daala hua hai.)

**Yaad rakho:** script mein baad me kuch badlo to **Deploy → Manage deployments →
✏️ Edit → Version: New version** karna zaroori hai, warna purana code chalta rahega.

---

## 6. Reviews approve / reject karna

Reviews `content/reviews.json` mein store hote hain. Naya review phone/Telegram pe
aayega — accha lage to file kholo aur append karo:

```json
{ "id": "r-096", "videoId": "video-5", "author": "Rahul", "rating": 5, "text": "Bahut acchi video thi!", "date": "2026-10-15" }
```

- Pichle object ke baad **comma (,)** lagana mat bhoolo.
- **Kabhi email/handle yahan na daalo** — sirf name, rating, text, date public hote hain.
- Reject karna ho to bas add mat karo.

---

## 7. Site ka naam, headline aur colors badalna

- **Hero headline:** `index.html` kholo → "Make your Minecraft PE…" dhoondo → text badal do.
- **Hero chhota text / buttons / stats:** wahi `index.html` ke hero section mein.
- **Site ka naam (Adventigle):** `index.html` aur `video.html` ke `wordmark`/`<title>`,
  aur `assets/js/app.js` mein `" — Adventigle"` wali line badlo.
- **Colors:** `assets/css/style.css` ke sabse upar `:root` block mein —
  `--pink`, `--ink`, `--canvas` (background), etc.
- **Fonts:** `index.html`/`video.html` ke Google Fonts `<link>` aur CSS ke `--font-*`.

---

## 8. Naya language add karna (advanced)

`assets/js/app.js` mein `I18N` object hai. Ek naya code (jaise `bn`) add karke
English wale keys copy kar do, phir `LANG_CODES` array mein `"bn"` add karo. Language
modal aur Google Translate dropdown dono update karne honge (`index.html`/`video.html`
ki `includedLanguages` list).

---

## 9. Website live karna (GitHub Pages) — free

1. GitHub account banao → **New repository** → naam `adventigle`, **Public** rakho.
2. Poora folder upload karo (ya Git se):
   ```bash
   cd "G:/Development/Websites/notgamingplayz-community"
   git init
   git add .
   git commit -m "Adventigle site"
   git branch -M main
   git remote add origin https://github.com/<username>/adventigle.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`,
   folder `/ (root)` → **Save**.
4. ~2 minute baad live: `https://<username>.github.io/adventigle/`

Koi bhi static host chalega (Cloudflare Pages, Netlify, Vercel) — bas folder daal do.

> 💡 Har video ka apna shareable URL hai, jaise
> `https://adventigle.jmukund9625.workers.dev/video/photo-se-minecraft-skin-kaise-banaye-100-free/`

---

## 10. Agar kuch toota lage (troubleshooting)

| Problem | Fix |
|---------|-----|
| Page khaali / videos load nahi | File double‑click nahi — local server se kholo (§2) |
| Video page "Video not found" | `content/videos/video-N.json` hai? `index.json` mein uska `slug` sahi hai? |
| Thumbnail nahi aa rahi | `youtubeId` galat hai — link ke `?v=` ke baad wala part daalo |
| Form bhejne pe kuch nahi hota | Apps Script URL / deploy / bot token check karo (§5) |
| Naya video home pe nahi dikh raha | `content/videos/index.json` mein entry add ki? |
| Sab kuch theek but purana dikh raha | Browser refresh (Ctrl + F5) — cache clear |

Debug karne ke liye browser mein **F12** dabao → **Console** tab → error dekho.

---

## 11. Files ka matlab (glossary)

| File / folder | Kya hai |
|---------------|----------|
| `index.html` | Home page |
| `video.html` | Video page ka template (legacy `?id=` route) |
| `video/<slug>/index.html` | Har video ka apna shareable page |
| `assets/css/style.css` | Poora design (colors, fonts, layout) |
| `assets/js/app.js` | Website ka dimaag — data load, forms, language |
| `content/videos/index.json` | Home grid ka catalog (38 videos) |
| `content/videos/video-N.json` | Ek video ki detail |
| `content/videos/video-N.md` | Ek video ke notes |
| `content/reviews.json` | Approved reviews |
| `google_apps_script.js` | Telegram relay (Google pe paste karte ho) |
| `scripts/import-videos.js` | Bulk importer (markdown se sab generate) |
| `README.md` | Technical setup guide |
| `LICENSE` | Copyright (all rights reserved) |

---

## 12. Extra flair jo site mein laga hua hai (taaki pata rahe)

- **Hero collage** — 3 latest video thumbnails, live data se.
- **Video search** — home pe "Search videos…" box.
- **Back‑to‑top button** — neeche daayein corner ↑ button, scroll karne pe aata hai.
- **Scroll progress bar** — upar patli pink line jo padhne ka progress dikhati hai.
- **Card animation** — cards scroll pe fade‑up hote hain, hover pe zoom.
- **Copy link / Watch on YouTube** — video page pe share karne ke buttons.
- **Language button** — 10 languages, auto‑translate.

---

*Adventigle — built for Mukund (@notgamingplayz). Last updated: 2026‑10‑06.*
