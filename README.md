# Adventigle — Creator Knowledge & Community Hub

The official **100% static, zero-backend** self-serve community platform for YouTube creator **Mukund ([@notgamingplayz](https://www.youtube.com/@notgamingplayz) & [@adventigle](https://www.youtube.com/@adventigle))** — featuring a 43-video Minecraft PE / Bedrock vault, slug-based Markdown step-by-step guides, tested direct downloads, verified community reviews, a **Hinglish-first 11-language UI** (Hinglish default, zero-translation; 10 more languages on click), keyboard shortcuts, a standalone offline JSON entry generator, and a Telegram relay with 1-tap Gmail replies.

> **Live site:** <https://mukund-buddy.github.io/Adventigle/>
> **Owner guide (Hinglish):** [OWNER-MANUAL.md](./OWNER-MANUAL.md)
> **License:** All rights reserved — see [LICENSE](./LICENSE).

---

## 1. Architecture & Ultra-Easy GitHub Workflow

Adventigle is engineered so the creator can manage everything **directly in the GitHub web interface** with zero Node build scripts and zero duplicate HTML/JSON files:

- **Single Video Catalog (`content/videos/index.json`)** — All 43 videos (including `id`, `slug`, `youtubeId`, `title`, `topic`, `description`, `category`, `categoryLabel`, `keywords`, `duration`, `views`, `date`, `watchUrl`, and `downloads`) live in one canonical JSON file. `app.js` automatically generates `watchUrl` from `youtubeId` and `slug` from `title` whenever omitted.
- **Slug-Named Markdown Guides (`content/videos/<slug>.md`)** — Every video's written guide is named after its exact slug (e.g., `content/videos/feather-client-of-mcpe.md`). `initVideoPage()` fetches `content/videos/${video.slug}.md` with an automatic fallback to `content/videos/${video.id}.md`.
- **Clean Query Routing (`video.html?v=<slug>`) + Legacy Redirect (`404.html`)** — Video cards link cleanly to `video.html?v=<slug>`. If anyone visits a legacy `/video/<slug>/` link, `404.html` automatically redirects them to `/Adventigle/video.html?v=<slug>`.
- **Dynamic SEO (`VideoObject` JSON-LD)** — When `video.html` loads a video, `app.js` dynamically injects Schema.org `VideoObject` structured data into `<head>` and updates the document title.

---

## 2. Pages & Core Features

| Page / Component | Description |
|---|---|
| **`index.html`** | Floating cylindrical pill header, zero-CLS pre-populated hero collage (`43` videos + 3 thumbnails), live search (`/`), responsive video grid with duration badges and `<time>` tags, and a general question form. |
| **`video.html`** | Privacy-enhanced YouTube embed (`youtube-nocookie.com`), duration & keyword chips, Markdown guide renderer with Gumroad-styled pink `COPY` buttons on code blocks, download cards with icons & notes, question form, and review section. |
| **`about.html`** | **Why I Built Adventigle** mission statement, **How to Use This Site** 3-step visual card grid, **About the Creator (Mukund)** social cards (`@notgamingplayz`, `@adventigle`, `@antigle_official`, `@mukund-buddy`), and the creator mission. |
| **`404.html`** | Custom Gumroad-styled 404 page that intercepts legacy `/video/<slug>/` paths and redirects to `/Adventigle/video.html?v=<slug>`. |
| **`#shortcutsModal`** | Accessible modal triggered via `?` or the footer **Shortcuts** link, displaying keyboard shortcuts (`?`, `/`, `L`, `1`–`9`, `0`, `Esc`). |

---

## 3. Repository Structure

```text
Adventigle/
├── index.html                     Homepage: pill header, hero collage, video vault, Q&A form
├── video.html                     Dynamic video player, Markdown guide, downloads, Q&A & reviews
├── about.html                     Creator mission, 3-step guide & social links
├── 404.html                       Custom 404 page + automatic /video/<slug>/ legacy redirect
├── assets/
│   ├── css/style.css              Gumroad neo-brutalist design system + floating pill header
│   └── js/app.js                  Routing, i18n (11 languages + translation engine), Markdown parser,
│                                  Schema.org JSON-LD, 60s rate-limit cooldown, URL sanitizer
├── content/
│   ├── reviews.json               Approved community reviews store (matches by id or slug)
│   └── videos/
│       ├── index.json             Single master catalog for all 43 videos
│       └── <slug>.md              43 slug-named Markdown guides (e.g. feather-client-of-mcpe.md)
├── tools/
│   └── creator-quick-entry.html   Standalone OFFLINE generator for new video entries (not part of the site)
├── RELAY-SETUP.md                  Step-by-step relay setup guide (secrets, deploy, approve buttons)
├── google_apps_script.js          Relay v3: Telegram alerts + inline Approve/Reject buttons, shared-secret
│                                  auth, server-side rate limiting, replay guard, spam traps, optional
│                                  auto-commit of approved reviews to GitHub + Sheet logging
├── sitemap.xml                    45 URLs: index.html, about.html, and all 43 video.html?v=<slug> pages
├── robots.txt                     Crawler directives + sitemap pointer
├── _headers                       HTTP security headers for Cloudflare/Netlify hosts
├── og.png                         Social Open Graph preview image
├── OWNER-MANUAL.md                Step-by-step Hinglish manual for GitHub-only maintenance
├── shortcuts.md                   Keyboard shortcut reference notes
├── LICENSE                        All rights reserved
└── README.md                      Technical documentation
```

---

## 4. Security & Technical Audit Highlights

1. **Content Security Policy (CSP)**: Embedded via `<meta http-equiv="Content-Security-Policy">` across all HTML pages (`index.html`, `video.html`, `about.html`, `404.html`) and mirrored in `_headers` — restricting scripts, frames, styles, fonts, images, and connections strictly to `'self'`, Google Fonts, YouTube (`i.ytimg.com`, `www.youtube-nocookie.com`), Google Apps Script (`script.google.com`, `script.googleusercontent.com`), and the Google Translate API (`translate.googleapis.com`). The old Google Translate **widget** was removed because the CSP blocked its helper script, which silently broke translation.
2. **Layered Anti-Spam (client + server)**: the forms enforce a 60-second client cooldown (`localStorage`), a hidden honeypot (`name="company"`) and a minimum fill time. Relay v3 independently enforces a **shared secret**, **server-side rate limiting** (CacheService), a **one-shot nonce + timestamp freshness** replay guard, payload/field caps, server-side HTML stripping and duplicate detection — so clearing localStorage does not bypass the limits.
3. **Strict URL & DOM Sanitization**: Every user-supplied or JSON-supplied string is escaped via `esc()` before rendering, and all dynamic links are validated to allow `https://` URLs only (`safeHttpsUrl()`).
4. **Zero Layout Shift (0 CLS)**: Hero statistics (`43`) and the 3 hero collage thumbnails (`#heroShot1..3`) have static dimensions and default `src` attributes baked into `index.html`.
5. **Internationalization & Brand Protection**: The UI chrome uses `data-i18n` attributes across **11 languages** (Hinglish default → English → हिन्दी, Español, Français, Deutsch, 日本語, Português, Bahasa, Русский, العربية). **Hinglish is the source voice** and performs zero network calls; every other language translates on demand via the Google Translate REST API with batched requests, a pinned source language, and a `localStorage` cache. Brand wordmarks (`Adventigle`, `@notgamingplayz`, `@adventigle`) carry `translate="no"` so translation never mangles them.

---

## 5. Adding a Video or Approving a Review

See **[OWNER-MANUAL.md](./OWNER-MANUAL.md)** for the complete Hinglish walkthrough:

1. **Add a Video in 2 Steps**: Open the standalone offline generator `tools/creator-quick-entry.html`, copy the generated JSON into `content/videos/index.json`, and create the `content/videos/<slug>.md` guide file.
2. **Approve a Review in 10 Seconds**: Copy the `<pre>` JSON block from the Telegram bot notification and paste it into `content/reviews.json`.

---
