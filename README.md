# Adventigle — Community Hub

The official **100% static, zero-backend** community platform for YouTube creator
**Mukund ([@notgamingplayz](https://www.youtube.com/@notgamingplayz))** — a video
vault with real thumbnails, downloadable packs, Markdown Q&A guides, verified
reviews, a 10-language UI, and a Telegram relay with 1-tap Gmail replies.

> **Live site:** <https://mukund-buddy.github.io/Adventigle/>

Visual system adapted from the **Gumroad open-source design system (MIT)**:
thin black borders, a soft pink accent, rounded corners, the Gumroad pink /
yellow / green palette, and Space Grotesk + Inter + JetBrains Mono type.

> **License:** All rights reserved. Copying, cloning or rebranding this site is
> prohibited — see [LICENSE](./LICENSE).

> **Owner?** Read [OWNER-MANUAL.md](./OWNER-MANUAL.md) — a plain-language guide
> for adding videos, approving reviews, editing the design, and deploying the
> site.

---

## Table of contents

1. [What it is](#1-what-it-is)
2. [Content snapshot](#2-content-snapshot)
3. [Folder map](#3-folder-map)
4. [How the zero-backend architecture works](#4-how-the-zero-backend-architecture-works)
5. [Telegram + Google Apps Script relay](#5-telegram--google-apps-script-relay)
6. [Adding a new video](#6-adding-a-new-video)
7. [Review approval (Git-based)](#7-review-approval-git-based)
8. [Languages and translation](#8-languages-and-translation)
9. [Privacy model](#9-privacy-model)
10. [SEO files](#10-seo-files)
11. [Deploy](#11-deploy)
12. [Local testing](#12-local-testing)
13. [Maintenance checklist](#13-maintenance-checklist)

---

## 1. What it is

Adventigle is a fan-facing hub that turns every YouTube upload into its own page:

- **Homepage (`index.html`)** — hero, the full video grid (real YouTube
  thumbnails), and a **Have a question?** form.
- **Video page (`video/<slug>/`)** — embedded player, tags, published date,
  info & notes, **Downloads & links**, **Ask a question**, **Reviews** and a
  **Write a review** form, plus a related-videos sidebar.
- **Legacy route (`video.html?id=video-N`)** — still supported as a fallback.

Everything visitors see is served from plain HTML, CSS, JS and JSON. There is
no server, no database, no admin panel, and no login — the deployed site is
just files on a static host.

### Shareable video URLs

Every video has a human-readable, share-ready URL:

```
https://mukund-buddy.github.io/Adventigle/video/photo-se-minecraft-skin-kaise-banaye-100-free/
```

Each lives in its own folder (`video/<slug>/index.html`) and identifies its
video by **slug**, which `app.js` resolves against `content/videos/index.json`.
Slugs are stored in every video's JSON (`"slug": "..."`), and the pretty URL is
the canonical link (the legacy `?id=` route still redirects visitors to it).

Every video page also carries its own static `<title>`, description,
Open-Graph and Twitter-Card tags and a `sitemap.xml` entry, so link previews
and search snippets show the real video — not a generic placeholder.

---

## 2. Content snapshot

**39 videos**, each with its own page, guide and download links:

| Category | Videos |
|---|---|
| Tips & Tricks | 14 |
| Texture Packs | 13 |
| UI Packs | 7 |
| BG Music | 5 |
| **Total** | **39** |

Plus: a verified-review pipeline (stars shown on the homepage), keyboard
shortcuts ([shortcuts.md](./shortcuts.md)), and a hidden Google-Translate
bridge over hand-translated UI strings.

---

## 3. Folder map

```
Adventigle/
├── index.html                     Homepage: hero, video grid, "Have a question?" form
├── video.html                     Video-page template (legacy ?id=video-N route)
├── video/                         Shareable pretty-URL pages — one folder per video slug
│   └── <slug>/index.html          e.g. video/photo-se-minecraft-skin-kaise-banaye-100-free/
├── assets/
│   ├── css/style.css              Gumroad-style design system stylesheet
│   └── js/app.js                  Config, i18n (10 languages), markdown parser,
│                                  forms, toasts, language modal, Google Translate hook
├── content/
│   ├── reviews.json               Approved reviews (public fields only)
│   └── videos/
│       ├── index.json             Fast catalog (39 videos) — source for the grid
│       ├── video-1.json … video-39.json   Per-video metadata (title, id, links)
│       └── video-1.md  … video-39.md      Per-video info & notes (markdown)
├── google_apps_script.js          Telegram relay + Google Sheet logger (placeholders here by design)
├── scripts/
│   └── import-videos.js           Bulk importer (markdown → catalog + slug pages)
├── sitemap.xml                    40 URLs: homepage + all video pages
├── robots.txt                     Crawler rules + sitemap pointer
├── _headers                       Security headers (used by Cloudflare Pages; other hosts ignore it)
├── og.png                         Social share image (real capture of the homepage hero)
├── OWNER-MANUAL.md                Plain-language owner guide
├── shortcuts.md                   Keyboard shortcut reference
├── LICENSE                        All rights reserved — no copying
└── README.md                      This file
```

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
| Link previews | Per-page OG/Twitter tags + `sitemap.xml` |
| Hosting | Any static host (GitHub Pages, Cloudflare Pages, Netlify…) |

The only dynamic request the site ever makes is the form POST to the Apps
Script endpoint. Everything else is a `fetch()` of a local JSON file.

---

## 5. Telegram + Google Apps Script relay

The relay script (`google_apps_script.js`) receives each form submission and
sends an HTML Telegram alert containing the type, video title, name, Gmail,
optional clickable Instagram, the message text, and a star rating (for
reviews) — plus a reply-in-Gmail button that opens a pre-filled reply draft.

Two different files matter here:

- **`google_apps_script.js` (this repo)** intentionally contains
  placeholder values (`PASTE_BOT_TOKEN...`). The real bot token and chat ID
  must exist only inside the deployed Google Apps Script project — never in a
  public repository.
- **`assets/js/app.js`** already carries the deployed Web App URL
  (`SITE.appsScriptUrl`). You do not need to paste it again unless the script
  is re-deployed and gets a new URL.

The complete setup (BotFather, chat ID, Apps Script deployment, sheet) is
step-by-step in [OWNER-MANUAL.md](./OWNER-MANUAL.md), section 5.

---

## 6. Adding a new video

Two supported workflows (both with verify steps) live in the owner manual:

1. **Importer script** — `scripts/import-videos.js` turns a master Markdown
   list into the catalog + slug pages in one run.
2. **Manual** — copy a pair of files, edit JSON, copy a slug page, append to
   `index.json`.

Categories currently in use (the pills on the cards): `texture-packs`,
`tips-tricks`, `ui-packs`, `bg-music`. Category counts live in the content
snapshot above and are printed by the importer; keep `index.json`,
`video-*.json` and the slug pages in sync for every new video.

After adding: commit and push — the host updates in about a minute.

---

## 7. Review approval (Git-based)

1. A visitor submits a review -> it lands in **Telegram** for screening
   (with their Gmail, used only for verification).
2. If it is good, append the public review object to
   `content/reviews.json` (only name, rating, text and date — never emails
   or Instagram handles) and commit.
3. To reject, simply do not add it. The homepage star averages and the
   video-page review cards read from this file automatically.

---

## 8. Languages and translation

Ten languages ship in the dropdown: **English, Hindi, Spanish, French,
German, Japanese, Portuguese, Indonesian, Russian, Arabic.** On a first visit
a modal invites the visitor to pick one.

Two translation layers work together:

1. **UI chrome** (nav, buttons, pills, stats, modal, legal line) is
   hand-translated in the `I18N` dictionary inside `assets/js/app.js` and
   marked `translate="no"` so the machine translator never double-translates
   it.
2. **Long content** (Markdown guides, review text, card titles, form fields)
   is translated live by a hidden **Google Translate** element. Choosing a
   language sets a `googtrans` cookie and drives the `goog-te-combo` element.

---

## 9. Privacy model

- **No accounts, no tracking cookies, no analytics.**
- **A visitor's Gmail is never published.** It is sent only to the creator's
  private Telegram (and the private Google Sheet) for verification;
  `reviews.json` stores only public fields.
- All visitor input is HTML-escaped before rendering (`esc()` in `app.js`),
  so there is no XSS vector.
- `robots.txt` allows normal crawling and points to the sitemap.

---

## 10. SEO files

| File | Purpose |
|---|---|
| `sitemap.xml` | 40 URLs — homepage + one per video slug |
| `robots.txt` | Allow-all + `Sitemap:` line |
| per-page meta | Static title/description/canonical, Open-Graph and Twitter tags baked into every video page |
| `og.png` | 1200x630 share image (real capture of the homepage hero) |

---

## 11. Deploy

The site is pure static files — no build step.

### GitHub Pages (current live)

- Source: **Deploy from a branch** — `main`, folder `/ (root)`.
- Live at <https://mukund-buddy.github.io/Adventigle/>.
- Note: GitHub Pages serves fixed headers and ignores `_headers` and
  `robots.txt` customization for headers. `robots.txt` still works as a file.

### Cloudflare Pages (recommended for stronger defaults)

Cloudflare Pages honours the `_headers` file, which pins a real Content
Security Policy (YouTube embeds, Google Fonts and the Apps Script relay are
allowed; remote script injection and framing are blocked) plus
`nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` and
HSTS.

1. Connect the repository as a Cloudflare Pages project.
2. Build command: **leave empty**; output directory: `/`.
3. Deploy — the site goes live on a `*.pages.dev` subdomain with the security
   headers from `_headers` automatically applied.
4. Update this README's live link and the per-page `canonical`/`og:url` tags
   if the new host becomes the primary one.

---

## 12. Local testing

```bash
git clone https://github.com/mukund-buddy/Adventigle.git
cd Adventigle
python -m http.server 8000
```

Then open <http://localhost:8000>. Do not just double-click `index.html` —
the `fetch()` calls for JSON need a real HTTP server.

---

## 13. Maintenance checklist

Things an owner checks, either as routine maintenance or after importing
content:

- [ ] Video count check: entries in `content/videos/index.json` =
      number of `video-*.json` files = number of `video/<slug>/` folders.
- [ ] Every slug folder's `window.__VIDEO_SLUG__` matches its folder name.
- [ ] Download links in `index.json` still resolve (spot-check after imports).
- [ ] `reviews.json` contains no emails or handles (public fields only).
- [ ] New deployment of `google_apps_script.js`? Update `SITE.appsScriptUrl`
      in `app.js` if the `/exec` URL changed.
- [ ] After content changes: bump `lastmod` in `sitemap.xml` for changed URLs.

**Known open items (checked 2026-10-25):**

- [ ] The CurseForge link (video-7) blocks automated checkers (403);
      confirm it opens in a normal browser.
- [ ] Confirm the deployed Apps Script webhook sends alerts (it is invisible
      by design; the repo copy intentionally holds placeholders).

---

*Built for Mukund ([@notgamingplayz](https://www.youtube.com/@notgamingplayz)) — Adventigle. 2026, all rights reserved.*
