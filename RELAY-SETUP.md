# Relay Setup Guide (Step-by-Step)

> **Relay v3** — Telegram alerts + auto-commit of approved reviews to GitHub.
> Ye guide follow karo, 10–15 minute me live ho jayega. Pehli baar hi karo, phir har
> future change ke liye sirf **Step 6** (deploy) repeat karna hoga.

---

## Step 1 — 3 cheezein nikaalo (5 min)

| # | Kahan se | Kya chahiye |
|---|----------|--------------|
| 1 | Telegram → [@BotFather](https://t.me/BotFather) → `/newbot` | **Bot token** (`123456789:AAE...`) |
| 2 | Telegram → [@userinfobot](https://t.me/userinfobot) | **Chat ID** (number jaise `987654321`) |
| 3 | Khud banao (koi bhi lambi random string) | **Shared secret** — jaise `k3R9xQm2Lp7Vt5Ns` |

> 💡 Bot token bahut sensitive hai — kisi ko mat bhejna. Ye sirf tumhare paas rahega.

---

## Step 2 — Naya Apps Script project banao (2 min)

1. Browser me kholo: **https://script.google.com**
2. **New project** click karo.
3. Pani ke neeche `Code.gs` file kholo → **saara sample code delete** karo.
4. `google_apps_script.js` ka **poora code copy** karke paste karo.
   - File yahan hai: `G:\Development\Git\Adventigle-main\google_apps_script.js`
5. **Ctrl+S** (Save).

---

## Step 3 — Secrets daalo (3 min) ⭐ sabse important

Project Settings (gear icon ⚙️) → **Script Properties** tab → **Add script property** — 3 rows banao:

| Property | Value |
|----------|-------|
| `TELEGRAM_BOT_TOKEN` | Step 1 ka bot token |
| `TELEGRAM_CHAT_ID` | Step 1 ka chat ID |
| `SHARED_SECRET` | Step 1 ka shared secret |

**Auto-commit ke liye 3 aur (optional, recommended):**

| Property | Value |
|----------|-------|
| `GITHUB_TOKEN` | GitHub personal access token (neeche banaya hai) |
| `GITHUB_REPO` | `mukund-buddy/Adventigle` |
| `GITHUB_BRANCH` | `main` |

> 🔐 **Secret kabhi code me mat likho.** Script Properties me rakhne se code share karne par
> token leak nahi hota. Yahi v3 ka sabse bada security improvement hai.

### GitHub token kaise banayein (2 min)
1. GitHub → **Settings** (top-right) → **Developer settings** → **Personal access tokens**
   → **Fine-grained tokens** → **Generate new token**.
2. **Repository access** → sirf **Adventigle** select karo.
3. **Permissions → Repository permissions → Contents → Read and write**.
4. Generate → token copy karke `GITHUB_TOKEN` me daalo.

---

## Step 4 — Test karo (2 min)

1. Code editor ke upar **function dropdown** se `setupAll` chuno.
2. **Run** dabao → Google permissions allow karo (haan haan).
3. **Telegram par ek test message aana chahiye** ✅
   - Nahi aaya? `Project Settings → Script Properties` me token/chat ID dobara check karo.
4. Sheet me 4 tabs bani hongi: `Questions`, `Reviews`, `Approved Reviews`, `System Log`.

---

## Step 5 — Web App deploy karo (2 min)

1. **Deploy** → **New deployment** → gear icon → **Web app**.
2. Settings:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
3. **Deploy** → **Authorize** (permissions allow karo).
4. **Web App URL** copy karo. Ye kuch aisa dikhega:
   ```
   https://script.google.com/macros/s/AKfycbw.../exec
   ```

---

## Step 6 — Website ko batao (1 min)

`assets/js/app.js` file me 2 jagah update karo:

```js
// line ~30
appsScriptUrl: "YAHA_SABKA_WEB_APP_URL",
relayKey: "YAHA_WO_SHARED_SECRET",     // Step 1 wala
```

> ⚠️ `relayKey` site ke public code me hota hai (site static hai). Ye sirf naive bots rokta hai.
> Asli protection script ke andar hai: rate limit + replay guard + spam traps.

---

## Step 7 — Approve buttons chalu karo (2 min, optional)

Telegram ke andar hi ✅/❌ buttons chahiye to:

1. Script Properties me ek aur row: `WEB_APP_URL` = apna `/exec` URL (Step 5 wali).
2. Function dropdown se `enableTelegramWebhook` chuna → **Run** karo.
3. Ab Telegram me review message aayega, usme **✅ Approve & Publish** / **❌ Reject** buttons honge.

> Band karna ho → `disableTelegramWebhook` run karo.

---

## Step 8 — Har future change me ye karo (30 sec)

Code change kiya → **Deploy → Manage deployments → ✏️ (pencil) → Version: `New version` → Deploy**.

> ⚠️ Bina "New version" ke deploy kiya to purana code hi chalega.

---

## Kaise kaam karta hai (flow)

```
Visitor ka review  →  Relay v3 (validate + rate limit + spam check)
                   →  Telegram message (buttons ke saath)
                   →  Sheet me "Reviews" tab me "pending" row
                          │
        ✅ Approve ──────┤
             │           │
             │           └─→ Sheet: status = "approved + github"
             │           └─→ Approved Reviews tab me row
             │
             └─→ GitHub API → content/reviews.json me review append
                 → 1–2 min me live site par review dikhta hai

        ❌ Reject ────────→ status = "rejected", kuch publish NAHI hota
```

---

## Backup: Telegram ke bina approve karna ho to

Kisi bhi browser me ye URL kholo (Step 1 ka secret daalke):

```
https://script.google.com/macros/s/AKfycbw.../exec?action=pending&key=YOUR_SECRET
```

JSON me pending reviews dikhenge. Fir approve karne ke liye:
```
.../exec?action=approve&id=s-1234567890-123&key=YOUR_SECRET
```
ya reject:
```
.../exec?action=reject&id=s-1234567890-123&key=YOUR_SECRET
```

Counts dekhne ke liye: `.../exec?action=stats&key=YOUR_SECRET`

---

## Troubleshooting

| Problem | Reason | Fix |
|---------|--------|-----|
| Test message nahi aaya | Token/chat ID galat | Step 1 dobara check karo; @userinfobot se dobara lo |
| `UNAUTHORIZED` error website par | `SHARED_SECRET` mismatch | Script Properties + `app.js` me `relayKey` — dono same value |
| `RATE_LIMITED` | 10 min me 6 se zyada | Thoda wait karo |
| `STALE_REQUEST` | Device ka clock galat | Time sync karo |
| `TOO_FAST` | Form 1.2 sec se kam me bharа | Thoda ruko phir bhejo |
| Approve button nahi dikh raha | Webhook set nahi | `enableTelegramWebhook` run karo (Step 7) |
| Approve par GitHub me nahi gaya | Token galat ya permission nahi | `GITHUB_TOKEN` dobara banao; "Contents: Read and write" check karo; `System Log` tab dekho |
| Live site par review nahi dikh raha | GitHub Pages rebuild me time lagta hai | 1–2 min ruko; hard refresh (Ctrl+Shift+R) |
| `TG_NOT_CONFIGURED` | Token missing | Script Properties check karo |

---

## Security checklist (deploy ke baad ek baar dekho)

- [ ] Token code me nahi, Script Properties me hai
- [ ] `SHARED_SECRET` set hai aur `app.js` me same value hai
- [ ] GitHub token me sirf **Contents: Read and write** hai (koi aur repo nahi)
- [ ] Script me `logSystem` messages me koi secret nahi likha ja raha
- [ ] Sheet tab "System Log" me koi `UNAUTHORIZED` spam nahi aa raha (matlab koi aur use nahi kar raha)

---

*Adventigle Relay v3 — setup guide.*
