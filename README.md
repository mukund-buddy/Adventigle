# Adventigle — Community Hub

The official **100% static, zero-backend** community platform for YouTube creator
**Mukund ([@notgamingplayz](https://www.youtube.com/@notgamingplayz))** — a video
vault with real thumbnails, downloadable packs, Markdown Q&A guides, verified
reviews, a 10-language UI, and a Telegram relay with **1-tap Gmail replies**.

Visual system adapted from the **Gumroad open-source design system (MIT)**:
thin black borders, a soft pink accent, rounded corners, the Gumroad pink /
yellow / green palette, and Space Grotesk + Inter + JetBrains Mono type.

> ⚠️ **License:** All rights reserved. Copying, cloning or rebranding this site is
> prohibited — see [`LICENSE`](./LICENSE).

> 📘 **Owner?** Read [`OWNER-MANUAL.md`](./OWNER-MANUAL.md) — a plain-language guide
> for adding videos, approving reviews, editing the design, and deploying the site.

---

## Table of contents

1. [What it is](#1-what-it-is)
2. [Folder map](#2-folder-map)
3. [Design system](#3-design-system)
4. [How the zero-backend architecture works](#4-how-the-zero-backend-architecture-works)
5. [Telegram + Google Apps Script relay](#5-telegram--google-apps-script-relay)
6. [Adding a new video](#6-adding-a-new-video)
7. [Review approval (Git-based)](#7-review-approval-git-based)
8. [Languages & translation](#8-languages--translation)
9. [Privacy model](#9-privacy-model)
10. [Deploy to GitHub Pages](#10-deploy-to-github-pages)
11. [Local testing](#11-local-testing)
12. [Security model](#12-security-model)
13. [Known placeholders / TODO](#13-known-placeholders--todo)

---

## 1. What it is

Adventigle is a fan-facing hub that turns every YouTube upload into its own page:

- **Homepage (`index.html`)** — hero, the full video grid (real YouTube
  thumbnails), and a **Have a question?** form.
- **Video page (`video/<slug>/`)** — embedded player, tags, published date,
  info & notes, **Downloads & links**, **Ask a question**, **Reviews** and a
  **Write a review** form, plus a related-videos sidebar.

Everything visitors see is served from plain HTML, CSS, JS and JSON. There is no
server, no database, no admin panel, and no login — the deployed site is just
files on a static host.

### Shareable video URLs

Every video has a human-readable, share-ready URL:

```
https://yoursite.com/video/minecraft-resource-pack-review/
https://yoursite.com/video/100-days-in-realistic-minecraft/
```

Each lives in its own folder (`video/<slug>/index.html`) and identifies its video
by **slug**, which `app.js` resolves against `content/videos/index.json`. Slugs
are stored in every video's JSON (`"slug": "..."`). The older
`video.html?id=video-N` route still works as a fallback.

Live example of the design language: <https://adventigle.jmukund9625.workers.dev/>

---

## 2. Folder map

```
notgamingplayz-community/          ← current folder name (rename the repo freely)
├── index.html                     Homepage: hero, video grid, "Have a question?" form
├── video.html                     Video-page template (legacy ?id=video-N route)
├── video/                         Shareable pretty-URL pages — one folder per video slug
│   └── <slug>/index.html          e.g. video/photo-se-minecraft-skin-kaise-banaye-100-free/
├── assets/
│   ├── css/style.css              Gumroad-style design system stylesheet
│   └── js/app.js                  Config, i18n (10 languages), markdown parser,
│                                  forms, toasts, language modal, Google Translate hook
├── content/
│   ├── reviews.json               Approved reviews (NEVER put emails here)
│   └── videos/
│       ├── index.json             Fast catalog (38 videos) — source for the grid
│       ├── video-1.json … video-38.json   Per-video metadata (title, id, links)
│       └── video-1.md  … video-38.md      Per-video info & notes (markdown)
├── google_apps_script.js          Telegram relay + Google Sheet logger
├── scripts/
│   └── import-videos.js           Bulk importer (markdown → catalog + slug pages)
├── OWNER-MANUAL.md                Plain-language owner guide
├── LICENSE                        All rights reserved — no copying
└── README.md                      This file
```

---

## 3. Design system

| Token | Value |
|-------|-------|
| Background | `#f4f4f0` |
| Ink | `#242423` |
| Pink (accent) | `#ff90e8` |
| Yellow | `#f1f333` |
| Green | `#23a094` |
| Purple | `#90a8ed` |
| Red | `#dc341e` |

Fonts: **Space Grotesk** (display), **Inter** (body), **JetBrains Mono** (code).

Signature elements: hard offset shadows (2–8px, no blur), 12px/8px rounded
corners, pill badges, amber stars, pink/yellow highlight spans in the hero, and
YouTube thumbnails baked into the video cards.

---

## 4. How the zero-backend architecture works

| Concern | Solution |
|---------|----------|
| Content storage | Static JSON + Markdown files committed to the repo |
| Video catalog | `content/videos/index.json` powers cards, search and stats |
| Thumbnails | `https://i.ytimg.com/vi/<youtubeId>/hqdefault.jpg` (no uploads needed) |
| Reviews | Public reviews live in `content/reviews.json`; screening happens in Telegram |
| Form delivery | Visitor POSTs to the Google Apps Script Web App URL → Telegram + Google Sheet |
| Translation | Hand-written UI dictionary in `app.js` + Google Translate for long content |
| Hosting | Any static host (GitHub Pages, Cloudflare Pages/Workers, Netlify…) |

The only dynamic request the site ever makes is the form POST to the Apps Script
endpoint. Everything else is a `fetch()` of a local JSON file.

---

## 5. Telegram + Google Apps Script relay

> ✅ The deployed Web App URL is **already wired** into
> `assets/js/app.js` → `SITE.appsScriptUrl`. You do **not** need to paste it again
> unless you redeploy the script and get a new URL.

The relay script (`google_apps_script.js`) receives each form submission and sends
you an HTML Telegram alert containing the type, video title, name, Gmail, optional
clickable Instagram, the message text, and a star rating (for reviews) — plus a
**📬 TAP HERE TO REPLY IN GMAIL** button that opens a pre-filled reply draft.

### One-time setup

1. **Create the bot** — in Telegram, message **@BotFather** → `/newbot` → copy the token.
2. **Get your chat ID** — message **@userinfobot** → copy the numeric `Id`.
3. **Create the Apps Script** — open <https://script.google.com> → **New project**,
   delete the sample code and paste the whole `google_apps_script.js`.
4. **Fill the config** at the top of that file:
   ```js
   var TELEGRAM_BOT_TOKEN = "PASTE_BOT_TOKEN_FROM_BOTFATHER_HERE";
   var TELEGRAM_CHAT_ID   = "PASTE_CHAT_ID_FROM_USERINFOBOT_HERE";
   var SHEET_NAME         = "Adventigle Submissions";   // auto-created
   ```
5. **Run once** — pick `setupSheet` in the toolbar dropdown → **Run** → authorize
   (Advanced → Allow). Then pick `testTelegram` → **Run** to confirm the alert arrives. ✅
6. **Deploy** — **Deploy → New deployment → ⚙️ → Web app**:
   - Description: `Adventigle Telegram Relay`
   - Execute as: **Me**
   - Who has access: **Anyone**
   Then **Deploy** and copy the `/exec` URL.
7. **Wire it (if the URL changed)** — paste the `/exec` URL into
   `assets/js/app.js`:
   ```js
   appsScriptUrl: "https://script.google.com/macros/s/XXXX/exec",
   ```

**Re-deploying after edits:** always use **Deploy → Manage deployments → ✏️ Edit →
Version: New version**, otherwise the old code keeps serving.

---

## 6. Adding a new video

1. **`content/videos/video-7.json`** — copy an existing file and set `youtubeId`
   (the part after `watch?v=`), a unique `slug` (lowercase, hyphenated — this
   becomes the shareable URL), `title`, `topic` (one-line card summary),
   `description` (longer watch-page paragraph), `category`, `duration` and downloads.
2. **`video/<slug>/index.html`** — copy an existing `video/*/index.html` folder
   and change the `window.__VIDEO_SLUG__` value to your new slug. The homepage
   card links here automatically.
3. **`content/videos/video-7.md`** — write the guide/FAQ. Supported Markdown:
   `#`/`##`/`###` headings, **bold**, *italic*, `` `code` ``, fenced code blocks
   (with copy buttons), lists, tables, blockquotes, links.
4. **`content/videos/index.json`** — append the matching object (with the same
   `slug`) to the `videos` array (this is what the homepage grid renders).
5. Commit & push — the host updates in about a minute.

**Category values** (must match the pills): `ui-packs`, `generators-tools`,
`shaders-visuals`, `commands-redstone`.

---

## 7. Review approval (Git-based)

1. A visitor submits a review → it lands in your **Telegram** for screening
   (with their Gmail, used only for verification).
2. If it's good, open `content/reviews.json` on the host → edit → append:
   ```json
   { "id": "r-009", "videoId": "video-2", "author": "Rahul", "rating": 5, "text": "Loved the ruins kit!", "date": "2026-10-07" }
   ```
   Add a comma after the previous object. **Never put emails or Instagram here —
   only name, rating, text and date are public.**
3. Commit. The review goes live in ~1 minute. To reject, simply don't add it.

Homepage star averages and video-page review cards read from this file automatically.

---

## 8. Languages & translation

Ten languages ship in the dropdown: **English, Hindi, Spanish, French, German,
Japanese, Portuguese, Indonesian, Russian, Arabic.** On a visitor's first visit a
modal invites them to pick one.

Two translation layers work together:

1. **UI chrome** (nav, buttons, pills, stats, modal, legal line) is hand-translated
   in the `I18N` dictionary inside `assets/js/app.js` and marked `translate="no"`
   so the machine translator never double-translates it.
2. **Long content** (Markdown guides, review text, card titles, form fields) is
   translated live by a hidden **Google Translate** element. Choosing a language
   sets a `googtrans` cookie and triggers the `goog-te-combo` element.

---

## 9. Privacy model

- **No accounts, no cookies for tracking, no analytics.**
- **A visitor's Gmail is never published.** It is sent only to the creator's
  private Telegram (and the private Google Sheet) for verification; `reviews.json`
  stores only public fields.
- All visitor input is HTML-escaped before rendering (`esc()` in `app.js`), so
  there is no XSS vector.

---

## 10. Deploy to GitHub Pages

1. Create a GitHub account → **New repository** (e.g. `adventigle`), keep it **Public**.
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "Adventigle community hub"
   git branch -M main
   git remote add origin https://github.com/<username>/adventigle.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages** → *Build and deployment* → Source:
   **Deploy from a branch** → Branch `main`, folder `/ (root)` → **Save**.
4. Wait ~2 minutes → live at `https://<username>.github.io/adventigle/` with free HTTPS.

Any static host works the same way (Cloudflare Pages, Netlify, Vercel…). The site
is pure static files — no build step.

**Google Translate note:** the dropdown sets a `googtrans` cookie. This works out
of the box on normal domains; the first translation may take a second on slow
connections.

---

## 11. Local testing

```bash
cd "G:/Development/Websites/notgamingplayz-community"
python -m http.server 8000
```

Then open <http://localhost:8000>. Don't just double-click `index.html` — the
`fetch()` calls for JSON need a real HTTP server.

---

## 12. Security model

- **No backend, no database, no admin panel** — nothing to breach, because there's
  no server to breach.
- The Apps Script endpoint accepts text-only POSTs, caps field lengths, and writes
  only to your own Sheet.
- The only "admin" action is you editing files in the repo — protected by your
  hosting/GitHub account.

---

## 13. Known placeholders / TODO

Before going fully live, replace these:


- **`content/videos/video-4.json` + `index.json`** — the `youtubeId`
  (`xDlbH7boVuo`) for the UI Pack video is a **placeholder**. Replace it with the
  real video ID.
- **MediaFire download links** in every `video-*.json` and in `index.json` are
  **placeholders** (`https://www.mediafire.com/file/...`). Swap in the real URLs.
- **`google_apps_script.js`** — set `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`
  (the URL in `app.js` is already wired).

---

*Built for Mukund ([@notgamingplayz](https://www.youtube.com/@notgamingplayz)) — Adventigle. © 2026, all rights reserved.*
