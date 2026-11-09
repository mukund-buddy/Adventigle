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
| **JSON snippet jaldi banana** | Website ke footer mein **Shortcuts** (`?` key) ya `about.html` kholo → **Creator Quick-Entry Generator** use karo |
| **Video ka title / download link badalna** | Sirf `content/videos/index.json` edit karo |
| **Video ke written notes / guide badalna** | `content/videos/<slug>.md` edit karo |
| **Review approve karna (10 seconds)** | Telegram pe aaye review ka `<pre>` JSON copy karo → `content/reviews.json` mein paste karo (§2 dekho) |
| **Telegram / Google Sheet relay setup** | `google_apps_script.js` ko `script.google.com` pe deploy karo (§3 dekho) |
| **Colors ya design badalna** | `assets/css/style.css` ke top `:root` section mein |

---

## 1. Naya Video Kaise Add Karein (Sirf 2 Easy Steps on GitHub!)

Pehle har video ke liye 4 files chahiye hoti thi (`index.json`, `video-N.json`, `video-N.md`, aur `video/<slug>/index.html`). **Ab wo sab khatam!** Ab sirf **2 steps** hain:

### Step 1 — `content/videos/index.json` mein video add karo

1. Tip: Agar JSON haath se nahi likhna, toh apni live website kholo, keyboard par **`?`** dabao (ya `about.html` kholo), aur **⚡ Creator Quick-Entry Generator** mein YouTube URL + Title + Category + Download URL daalo. Wo tumhe ready-to-paste JSON aur exact `.md` filename de dega!
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

---

## 2. Telegram par Review Aane ke Baad `content/reviews.json` mein Kaise Daalein (10-Second Workflow)

Jab koi visitor kisi video page par **Write a review** form bharta hai:

1. Ab visitor ke liye **email bharna zaroori nahi hai** (sirf Star Rating aur Review text zaroori hai, taaki koi error na aaye).
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

## 3. `google_apps_script.js` Kaise Setup ya Update Karein

Questions aur Reviews ko tumhare Telegram aur Google Sheet tak bhejne ka kaam `google_apps_script.js` karta hai.

### Pehli Baar Setup (Agar naya banana ho)

1. Telegram par **@BotFather** ko `/newbot` bhejo aur apna **Bot Token** copy karo.
2. Telegram par **@userinfobot** ko message bhejo aur apna **Chat ID** copy karo.
3. Google Sheets mein ek nayi blank sheet kholo → upar menu mein **Extensions → Apps Script** par click karo (ya seedha `https://script.google.com` kholo).
4. Wahan ka sample code mita kar is repo ki `google_apps_script.js` file ka **poora code copy-paste** kar do.
5. Sabse upar apni 2 values daalo (ye values kabhi GitHub pe public mat daalna, sirf Google Apps Script ke andar rakhna):
   ```javascript
   var TELEGRAM_BOT_TOKEN = "APNA_BOT_TOKEN_YAHAN_PASTE_KARO";
   var TELEGRAM_CHAT_ID   = "APNA_CHAT_ID_YAHAN_PASTE_KARO";
   ```
6. Upar function dropdown mein `setupSheet` select karke **Run** dabao (permissions allow kar do).
7. Phir dropdown mein `testTelegram` select karke **Run** dabao — tumhare Telegram pe test review + JSON block aa jayega!
8. Upar daayein corner mein **Deploy → New deployment** par click karo:
   - Select type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - **Deploy** dabao aur milne wala `/exec` Web App URL copy karke `assets/js/app.js` ke `SITE.appsScriptUrl` mein daal do.

### Existing Script ko Update Karna (Bahut Zaroori!)

Agar tumne pehle se script deploy kar rakhi hai aur naya `google_apps_script.js` code (jismein bina email ke review + Telegram JSON snippet fix hai) lagana chahte ho:

1. `https://script.google.com` par apna project kholo.
2. Naya `google_apps_script.js` code paste karo aur apna `TELEGRAM_BOT_TOKEN` aur `TELEGRAM_CHAT_ID` wapas upar bhar do.
3. **Save (Ctrl+S)** karo.
4. Upar **Deploy → Manage deployments** par click karo → **✏️ (Edit)** icon dabao → **Version** dropdown mein **"New version"** select karo → **Deploy** dabao!
   - *(Fayda: Isse tumhara `/exec` URL nahi badlega aur `app.js` mein kuch change nahi karna padega!)*

---

## 4. Purane Shared Links (`404.html` Auto-Redirect)

Pehle tumhare video links `/video/<slug>/` format mein the. Ab clean single-page routing `video.html?v=<slug>` use hoti hai.
Agar kisi purane YouTube description ya dost ke paas purana `/Adventigle/video/<slug>/` link hai, toh naya **`404.html`** usko automatically **`/Adventigle/video.html?v=<slug>`** par redirect kar deta hai — ek bhi purana link kabhi dead nahi hoga!

---

## 5. Security & Anti-Spam Protections

- **60-Second Cooldown:** Question aur Review forms mein 60-second ka rate-limit laga hai (`localStorage` mein `adventigle:lastSubmit`), taaki koi spam bot tumhare Telegram ko flood na kar sake.
- **Strict CSP & HTTPS Validation:** Saari HTML files mein Content-Security-Policy लगी hai aur har dynamic download/external URL `https://` ke liye validate hota hai.

---

*Adventigle — Built for Mukund (`@notgamingplayz`). Last updated: 2026-11-09.*
