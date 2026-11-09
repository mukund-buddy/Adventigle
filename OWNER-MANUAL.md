# Adventigle — Owner Manual (GitHub-Only Ultra-Easy Workflow)

Ye manual tumhare liye (Mukund) likha gaya hai. Ab tumhe apne PC pe koi Node script (`import-videos.js`) chalane ya 3–4 alag files banane ki zaroorat nahi hai. Poori website **seedha GitHub.com ke web interface (phone ya PC browser)** se manage ho sakti hai! 🙂

> **Live Website:** `https://mukund-buddy.github.io/Adventigle/`
> **GitHub Repo:** `https://github.com/mukund-buddy/Adventigle`
> **Creator:** Mukund (`@notgamingplayz` / `@adventigle`)

---

## 0. Quick Cheat-Sheet (Sabse Important)

| Kaam | Kahan / Kaise (Seedha GitHub.com par) |
|------|---------------------------------------|
| **Naya video add karna** | Sirf **2 steps**: `content/videos/index.json` mein entry add karo + `content/videos/<slug>.md` file banao (§1 dekho) |
| **JSON snippet jaldi banana** | `tools/creator-quick-entry.html` file kholo (offline tool, website par nahi hai) → form bharo → JSON copy karo (§1.1 dekho) |
| **Video ka title / download link badalna** | Sirf `content/videos/index.json` edit karo |
| **Video ke written notes / guide badalna** | `content/videos/<slug>.md` edit karo |
| **Review approve karna (10 seconds)** | Telegram pe aaye review ka `<pre>` JSON copy karo → `content/reviews.json` mein paste karo (§2 dekho) |
| **Telegram / Google Sheet relay setup** | [`RELAY-SETUP.md`](./RELAY-SETUP.md) follow karo — step-by-step setup + deploy |
| **Colors ya design badalna** | `assets/css/style.css` ke top `:root` section mein |

---

## 1. Naya Video Kaise Add Karein (Sirf 2 Easy Steps on GitHub!)

Pehle har video ke liye 4 files chahiye hoti thi (`index.json`, `video-N.json`, `video-N.md`, aur `video/<slug>/index.html`). **Ab wo sab khatam!** Ab sirf **2 steps** hain:

### Step 1 — `content/videos/index.json` mein video add karo

1. Tip: Agar JSON haath se nahi likhna, toh **`tools/creator-quick-entry.html`** file kholo (browser me double-click, koi install nahi chahiye) aur YouTube URL + Title + Category + Download URL bhar do. Wo tumhe ready-to-paste JSON aur exact `.md` filename de dega. **Generator ab website par nahi hai** — wo sirf us file me hai.
2. GitHub repo mein `content/videos/index.json` kholo aur **✏️ (Edit this file)** button dabao.
3. `"videos": [` ke bilkul neeche (sabse upar) apna naya video object paste karo aur uske baad comma `,` laga do:

```json
{
  "id": "mera-naya-video-slug",
  "slug": "mera-naya-video-slug",
  "youtubeId": "Mvx-Y4RI-8Q",
  "title": "Mera Naya Minecraft PE Video Title",
  "topic": "Ek line ka short summary.",
  "description": "Video ke baare mein thoda detail paragraph.",
  "category": "tips-tricks",
  "categoryLabel": "Tips & Tricks",
  "keywords": ["mcpe", "bedrock"],
  "duration": "1m 45s",
  "date": "2026-11-09",
  "hasGuide": true,
  "downloads": [
    {
      "name": "Direct Download Pack",
      "type": "Link",
      "size": "2 MB",
      "icon": "📦",
      "url": "https://not-gaming-playz.pages.dev/...",
      "note": "Minecraft PE 1.21+ ke liye tested"
    }
  ]
},
```

> 💡 **Smart Auto-Fill (`app.js`):**
> - Tumhe `watchUrl` likhne ki zaroorat nahi hai — `app.js` khud `youtubeId` se `https://www.youtube.com/watch?v=...` bana leta hai!
> - Agar tum `slug` likhna bhool bhi jao, toh `app.js` khud `title` se slug generate kar lega.
> - Categories jo tum use kar sakte ho:
>   - `"tips-tricks"` (`"Tips & Tricks"`)
>   - `"texture-packs"` (`"Texture Packs"`)
>   - `"ui-packs"` (`"UI Packs"`)
>   - `"bg-music"` (`"BG Music"`)

4. **Commit changes** daba do.

### Step 2 — `content/videos/<slug>.md` guide file banao

1. GitHub par `content/videos/` folder kholo.
2. **Add file → Create new file** par click karo.
3. File ka naam bilkul wahi `slug` rakho jo Step 1 mein diya tha, aur aage `.md` laga do — jaise:
   `content/videos/mera-naya-video-slug.md`
4. Iske andar apna step-by-step guide Markdown mein likho:

```markdown
## Video Overview

Is video mein humne seekha ki Minecraft PE mein pack kaise lagate hain.

## Step-by-Step Guide

1. Neeche diye gaye **Downloads & links** section se file download karo.
2. ZArchiver mein file par tap karke Minecraft mein open karo.
3. Settings → Global Resources mein jaake pack activate karo.

```
/gamerule commandblockoutput false
```
```

5. **Commit changes** daba do!
6. Bas 1 minute mein tumhara naya video homepage par aa jayega aur uska link hoga:
   `https://mukund-buddy.github.io/Adventigle/video.html?v=mera-naya-video-slug`

## 1.1 ⚡ Creator Quick-Entry Generator (Alag File — Website Par Nahi Hai)

> **Generator ab website me nahi hai.** Wo ek alag, offline file ban gaya hai:
> **`tools/creator-quick-entry.html`**
>
> Is file ko browser me kholne ke liye bas **double-click** kar do — koi Node install nahi,
> koi server nahi, koi internet nahi chahiye.

### Generator kahan se hataya gaya

| Purana location | Ab kahan hai |
|------------------|--------------|
| Website footer → **Shortcuts** (`?` key) modal ke andar | ❌ Hata diya gaya |
| `about.html` ka **⚡ Creator Quick-Entry Generator** section | ❌ Hata diya gaya |
| Shortcuts modal ke andar wala version | ❌ Hata diya gaya |
| — | ✅ **`tools/creator-quick-entry.html`** (offline, single file) |

Site ab sirf **content** dikhati hai — generator kahin bhi visitor ko dikhai nahi deta.

### Kaise use karna hai

1. Repo me jao → `tools/` folder → `creator-quick-entry.html` kholo.
   (Ya local PC par: `G:\Development\Git\Adventigle-main\tools\creator-quick-entry.html`)
2. Form bharo:
   - **YouTube URL or Video ID** — `https://youtu.be/Mvx-Y4RI-8Q` ya raw ID
   - **Category** — `Tips & Tricks` / `Texture Packs` / `UI Packs` / `BG Music`
   - **Video Title** — asli title (slug isi se banta hai)
   - **Duration** — jaise `1m 45s`
   - **Download Label + URL** — optional
   - **Short Summary** — 1–2 line ka Hinglish summary (ye `topic` + `description` dono ban jaata hai)
3. Neeche output live update hota rehta hai:
   - **Step 1** → exact guide filename, jaise `content/videos/mera-naya-video-slug.md`
   - **Step 2** → ready-to-paste JSON object
4. **Copy JSON** dabao → GitHub pe `content/videos/index.json` kholo → `"videos": [` ke neeche paste karo → comma `,` lagao → **Commit changes**.
5. **Copy filename** wala text use karke `content/videos/` me guide `.md` file banao.

### Extra buttons

- **Copy JSON** — poora JSON object clipboard me.
- **Copy filename** — sirf `.md` filename.
- **Download .json** — object ko `.json` file me download (local record rakhne ke liye).

> 💡 Generator live site par hone ka fayda ab nahi hai, kyunki wo tool **sirf owner** use karta hai —
> visitors ko dikhane ka koi reason nahi. Isi liye website se hata diya gaya hai.

---
---

## 2. Telegram par Review Aane ke Baad `content/reviews.json` mein Kaise Daalein (10-Second Workflow)

Jab koi visitor kisi video page par **Write a review** form bharta hai:

1. Ab visitor ke liye **email bharna zaroori nahi hai** (sirf Star Rating aur Review text zaroori hai, taaki koi error na aaye).
2. ⭐ **Sabse tez tarika (Relay v3):** Telegram message me **✅ Approve & Publish** button dabao — review khud `content/reviews.json` me chala jayega, copy-paste ki zarurat hi nahi. Setup ke liye [`RELAY-SETUP.md`](./RELAY-SETUP.md) dekho.
2. Tumhare **Telegram bot** par turant ek message aayega jismein review ke neeche ek ready-to-paste **`<pre>` JSON block** hoga:

```json
{
  "id": "r-1794195862",
  "videoId": "feather-client-of-mcpe",
  "author": "Aarav",
  "rating": 5,
  "text": "Bhai mast pack hai, 1st try mein chal gaya!",
  "date": "2026-11-09"
}
```

3. Telegram mein us code block par **1 tap karo** — wo apne aap copy ho jayega!
4. GitHub par `content/reviews.json` kholo → **✏️ Edit** dabao.
5. `"reviews": [` array ke andar paste kar do:
   - Agar pehla review hai toh seedha `[` aur `]` ke beech paste karo.
   - Agar pehle se reviews hain toh pichle `{ ... }` ke baad comma `,` lagao aur paste kar do.
6. **Commit changes** कर दो — review turant video page par live dikhne lagega! (`app.js` dono `video.id` aur `video.slug` se reviews match karta hai).

---

## 3. `google_apps_script.js` Kaise Setup ya Update Karein (Relay v3)

> **Relay v3** = Telegram alerts + ✅/❌ Approve buttons + approved reviews ka **auto GitHub commit**.
>
> 📖 **Poora step-by-step setup guide alag file me hai:** **[`RELAY-SETUP.md`](./RELAY-SETUP.md)**
> — token/chat ID kaise nikalein, Script Properties, deploy, aur har future change me kya karna hai.

### Quick summary (detail ke liye RELAY-SETUP.md dekho)

1. **@BotFather** se bot token, **@userinfobot** se chat ID, aur apni ek random **shared secret** banao.
2. `script.google.com` → naya project → pura `google_apps_script.js` paste → Save.
3. **Project Settings → Script Properties** me daalo:
   `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `SHARED_SECRET`
   (auto-commit ke liye: `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`)
4. `setupAll` run karo → Telegram par test message aayega.
5. **Deploy → New deployment → Web app** (Execute as: Me, Anyone) → URL copy karo.
6. `assets/js/app.js` me `SITE.appsScriptUrl` + `SITE.relayKey` update karo.
7. Har future change: **Deploy → Manage deployments → ✏️ → New version → Deploy**.

### Kya kya security hai v3 me

| Layer | Kaam |
|-------|------|
| **Shared secret** | Requests sirf aapki site se aayein |
| **Server-side rate limit** | 10 min me 6 max — localStorage chala ke bhi nahi chhoot sakte |
| **Replay guard** | Timestamp freshness + one-shot nonce |
| **Spam traps** | Honeypot field + minimum fill time |
| **Sanitization** | Server-side HTML strip, field caps, email validation |
| **Error hygiene** | Client ko sirf code milta hai, stack trace kabhi nahi |
| **Secret storage** | Script Properties me — code share karne par token leak nahi hota |

### Approve / Reject kaise kaam karta hai

| Button | Kya hota hai |
|--------|--------------|
| ✅ **Approve & Publish** | Sheet me status `approved + github`, Approved Reviews tab me row, aur **khud** `content/reviews.json` me commit (1–2 min me live site par dikhta hai) |
| ❌ **Reject** | Sirf status `rejected` — **kuch publish nahi hota** |

> Telegram ke buttons nahi chahiye to `?action=pending` / `?action=approve&id=...` admin URL bhi hai (RELAY-SETUP.md me).

### Common problems

| Problem | Fix |
|---------|-----|
| `UNAUTHORIZED` | `SHARED_SECRET` aur `SITE.relayKey` same value rakho |
| `RATE_LIMITED` | Thoda wait karo |
| `STALE_REQUEST` | Device ka time sync karo |
| Approve par GitHub me nahi gaya | `GITHUB_TOKEN` dobara banao, "Contents: Read and write" check karo, `System Log` tab dekho |
| Live site par review nahi dikha | GitHub Pages rebuild me 1–2 min lagte hain, phir Ctrl+Shift+R |

---

## 4. 💡 Ideas — Aur Kya Kya Add Ho Sakta Hai (Future Roadmap)

Ye features script **me** add karne layak hain (jabhi chahiye):

### A. Spam aur abuse se Extra protection

| Idea | Kaise kaam karega |
|------|------------------|
| **IP-based rate limit** | Abhi email/slug se limit hai. `doPost` me IP nahi milta, par Google ke `X-Forwarded-For` header se mil sakta hai (Apps Script me `e` se headers nahi aate — iske liye Cloudflare Worker front chahiye) |
| **Link spam filter** | Text me >2 URL ho to flag karo (bot favourite) |
| **Duplicate + near-duplicate** | Same text ka fuzzy match (shingle similarity) |
| **CAPTCHA (hCaptcha/Turnstile)** | Cloudflare Turnstile free hai, invisible reCAPTCHA v2 se behtar |
| **Auto-ban list** | Ek email/IP se 10 baar fail → 24h block |
| **Telegram-side delete** | Spam ko Telegram me hi delete kar do (message_id use karke) |

### B. Creator ke liye workflow improvements

| Idea | Fayda |
|------|-------|
| **Approve/Reject inline buttons** | ✅ Already v3 me hai — Telegram se 1 tap |
| **Edit-before-approve** | Approve se pehle text ko inline edit karne ka option |
| **Auto-publish to GitHub** | ✅ Already v3 me hai (GITHUB_TOKEN se) |
| **Review as GitHub PR** | Direct commit nahi, PR banao — review + revert easy |
| **Draft reply generator** | AI se reply draft (Telegram me "Draft" button) |
| **Bulk pending list** | `?action=pending` se JSON, kisi bhi tool me import |
| **CSV export** | Sheet ka built-in export kaafi hai, par custom format bhi |
| **Scheduled digest** | Roz subah 1 summary email — "aaj 5 questions, 2 reviews" |
| **Weekly analytics** | Top videos, conversion rate, response time |

### C. Visitor experience

| Idea | Fayda |
|------|-------|
| **Auto "we got your question" email** | `MailApp` se turant acknowledgment (reply-to tumhara Gmail) |
| **Ticket ID system** | Har question ko ID milti hai, visitor ko dikhti hai — duplicate messages pehle detect |
| **Live status page** | "Aaj 3 pending, avg reply 4 ghante" — trust badhata hai |
| **Star-rating analytics per video** | Sheet me already hai, chart banana ho to dekh lo |
| **Follow-up reminders** | 48 ghante me reply nahi kiya → reminder |

### D. Architecture level

| Idea | Trade-off |
|------|-----------|
| **Cloudflare Worker front proxy** | IP detection + Turnstile + caching milega, par ek aur service maintain karni padegi |
| **Apps Script → Cloudflare Worker migration** | Durable storage + better logs, par Telegram + Sheet logic rewrite |
| **Redis-free sliding window** | CacheService already kaafi hai |
| **Secret rotation button** | Telegram se `/rotate_secret` command — script properties update |

> ⚠️ **Sabse important baat:** website static hai, isliye `app.js` me jo bhi secret hai wo public hai.
> Isliye `SHARED_SECRET` sirf naive bots rokta hai. Asli protection **server-side rate limit +
> replay guard + spam traps** hain — wo v3 me already shamil hain.

---
## 5. Purane Shared Links (`404.html` Auto-Redirect)

Pehle tumhare video links `/video/<slug>/` format mein the. Ab clean single-page routing `video.html?v=<slug>` use hoti hai.
Agar kisi purane YouTube description ya dost ke paas purana `/Adventigle/video/<slug>/` link hai, toh naya **`404.html`** usko automatically **`/Adventigle/video.html?v=<slug>`** par redirect kar deta hai — ek bhi purana link kabhi dead nahi hoga!

---

## 6. Security & Anti-Spam Protections

- **60-Second Cooldown:** Question aur Review forms mein 60-second ka rate-limit laga hai (`localStorage` mein `adventigle:lastSubmit`), taaki koi spam bot tumhare Telegram ko flood na kar sake.
- **Strict CSP & HTTPS Validation:** Saari HTML files mein Content-Security-Policy लगी hai aur har dynamic download/external URL `https://` ke liye validate hota hai.

---

## 7. Language System (Hinglish Default + 10 Translations)

Website ki **default language Hinglish** hai (Hindi + English mix, Roman script) — wahi bhasha
jo tum apne content me likhte ho. Isliye **Hinglish select karne pe koi translation call nahi jaata**,
content apne original form me dikhta hai aur page turant load hota hai.

| # | Language | Kya hota hai |
|---|----------|---------------|
| 1 | **Hinglish** (default) | Original content — **zero** network calls, sabse fast |
| 2 | **English** | Poora page Google Translate se English me |
| 3 | हिन्दी / Español / Français / Deutsch / 日本語 / Português / Bahasa / Русский / العربية | Poora page translate hota hai |

### Kaunsi cheez translate hoti hai

- **UI chrome** (nav, buttons, headings, form labels, footer) — 11 languages ka ready dictionary `app.js` me hai,
  isliye ye **foran** badal jaata hai, koi loading nahi.
- **Video title, description, guide (`.md`), review text** — ye Hinglish me authored hain, inhe
  Google Translate API par translate karke laaya jaata hai (batch me, cached).

### Cache

Har translation `localStorage` me cache hoti hai (`adventigle:mt2:<lang>`), isliye dobara
same language switch karne pe **instant** hota hai aur Google ko baar-baar request nahi jaata.

### Agar translation slow lage

Ye pehli baar me normal hai (network + batch). Doosri baar cache se instant aayega. Agar
translation fail ho to page **khaali nahi hota** — original Hinglish/English text hi rehta hai.

---

## 8. Relay Version (Agar Review/Question Fail Ho)

Website har page load pe apne Apps Script relay ka version check karta hai.

| Relay version | Behaviour |
|---------------|-----------|
| **v3** (current, `google_apps_script.js`) | Shared secret + rate limit + replay guard + spam traps + **Approve buttons** + optional **auto GitHub commit** |
| **v2** | Review bina email ke chalta hai, but security layers kam |
| **v1** (purana deployment) | Review ke liye email **zaroori** hai |

### Version kaise pata karein?

Web App URL kholo → JSON dikhega:

```json
{ "ok": true, "service": "adventigle-relay", "version": "3.0.0", "features": { ... } }
```

### Purane deployment chal raha hai to?

1. `script.google.com` kholo → apna project (jo account login hai wahi).
2. Naya `google_apps_script.js` code paste karo → **Save**.
3. **Deploy → Manage deployments → ✏️ → Version: New version → Deploy**.
4. `assets/js/app.js` me `SITE.appsScriptUrl` (agar URL badla to) aur `SITE.relayKey` update karo.
5. Website refresh karo — ab `version: "3.0.0"` dikhega.

> ⚠️ **Galat account se deploy hone wala problem:**
> Google Apps Script web app har browser profile me alag account se deploy hota hai. Agar tumhe
> "Scripts are not enabled" ya 403 error aaye to **us browser profile me Google logout karke
> sahi account se login** karo aur wahi script project kholo.
>
> Website par "3.0.0" dikh raha hai but features missing hain → `SITE.appsScriptUrl` me purana URL hai.

---
*Adventigle — Built for Mukund (`@notgamingplayz`). Last updated: 2026-11-09.*
