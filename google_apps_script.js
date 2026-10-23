/**
 * ============================================================
 * ADVENTIGLE — Telegram Relay & Sheet Logger (Google Apps Script)
 * ============================================================
 * What it does:
 *   1. Receives form submissions (question / review) from the site.
 *   2. Sends you an HTML-formatted Telegram alert containing:
 *        - Type (Question or Review)
 *        - Video title + page timestamp
 *        - User name, Gmail, optional Instagram (clickable)
 *        - Question / review text (+ star rating for reviews)
 *        - A 1-TAP "REPLY IN GMAIL" button (mailto: link)
 *   3. Appends every submission to a Google Sheet (free "database").
 *
 * SETUP (5 minutes):
 *   1. Go to https://script.google.com  ->  New project
 *   2. Delete the sample code, paste THIS whole file.
 *   3. Replace the three CONFIG values below (bot token, chat id,
 *      optional sheet name).
 *   4. Run setupSheet once (authorize when asked).
 *   5. Deploy -> New deployment -> Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *   6. Copy the Web App URL into assets/js/app.js -> SITE.appsScriptUrl
 * ============================================================
 */

/* ================= CONFIG — EDIT THESE ================= */
var TELEGRAM_BOT_TOKEN = "PASTE_BOT_TOKEN_FROM_BOTFATHER_HERE"; // from @BotFather
var TELEGRAM_CHAT_ID   = "PASTE_CHAT_ID_FROM_USERINFOBOT_HERE"; // from @userinfobot
var SHEET_NAME         = "Adventigle Submissions";                 // auto-created
/* ======================================================== */

var TELEGRAM_API = "https://api.telegram.org/bot" + TELEGRAM_BOT_TOKEN + "/sendMessage";

/** Web app entry point. */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var type = String(data.type || "question").toLowerCase();
    var isReview = (type === "review");
    var videoTitle = String(data.videoTitle || data.videoId || "General");
    var name = String(data.name || "Anonymous").substring(0, 60);
    var email = String(data.email || "").substring(0, 120);
    var instagram = String(data.instagram || "").substring(0, 40);
    var text = String(data.text || "").substring(0, 900);
    var rating = data.rating ? Number(data.rating) : 0;
    var ts = String(data.timestamp || new Date().toISOString());
    var page = String(data.page || "");
    var lang = String(data.lang || "en");

    // Basic spam shield: block obvious junk
    if (!email || !text || text.length < 3) {
      return jsonOut({ ok: false, error: "MISSING_FIELDS" });
    }

    // 1) Telegram alert
    var tgResult = sendTelegramAlert({
      isReview: isReview,
      videoTitle: videoTitle,
      name: name,
      email: email,
      instagram: instagram,
      text: text,
      rating: rating,
      ts: ts,
      page: page,
      lang: lang
    });

    // 2) Sheet log
    appendToSheet([new Date(), type, videoTitle, name, email, instagram, rating || "", text, ts, page, lang, tgResult]);

    return jsonOut({ ok: true });

  } catch (err) {
    try { appendToSheet([new Date(), "ERROR", "", "", "", "", "", String(err), "", "", "", ""]); } catch (e2) {}
    return jsonOut({ ok: false, error: String(err) });
  }
}

/** Browser health-check: open the web app URL once to test. */
function doGet(e) {
  return jsonOut({ ok: true, service: "adventigle-relay", time: new Date().toISOString() });
}

/* ---------------- Telegram ---------------- */

function sendTelegramAlert(d) {
  var stars = "";
  for (var i = 1; i <= 5; i++) stars += (i <= d.rating ? "⭐" : "☆");

  var typeLabel = d.isReview ? "🌟 NEW REVIEW" : "❓ NEW QUESTION";
  var subject = d.isReview
    ? ("Review " + (d.rating ? d.rating + "/5" : "") + " — " + d.videoTitle)
    : ("Re: Your question — " + d.videoTitle);

  // The 1-TAP Gmail reply button (mailto link)
  var mailto = "mailto:" + encodeURIComponent(d.email) +
    "?subject=" + encodeURIComponent(subject) +
    "&body=" + encodeURIComponent(
      "Hi " + d.name + ",\n\nThanks for reaching out about \"" + d.videoTitle + "\"!\n\n" +
      (d.isReview ? "Your review means a lot.\n\n" : "About your question:\n> " + d.text + "\n\n") +
      "— Mukund (@notgamingplayz)\nAdventigle"
    );

  var html =
    typeLabel + "\n" +
    "🎬 <b>" + escHtml(d.videoTitle) + "</b>\n" +
    "🕒 " + escHtml(d.ts) + "\n" +
    "─────────────\n" +
    "👤 <b>Name:</b> " + escHtml(d.name) + "\n" +
    "📧 <b>Gmail:</b> " + escHtml(d.email) + "\n" +
    (d.instagram ? "📸 <b>Instagram:</b> <a href=\"https://instagram.com/" + encodeURIComponent(d.instagram) + "\">@" + escHtml(d.instagram) + "</a>\n" : "") +
    (d.isReview ? "⭐ <b>Rating:</b> " + stars + " (" + d.rating + "/5)\n" : "") +
    "─────────────\n" +
    "💬 <b>" + (d.isReview ? "Review" : "Question") + ":</b>\n" +
    escHtml(d.text) + "\n" +
    "─────────────\n" +
    "<a href=\"" + escAttr(mailto) + "\">📬 TAP HERE TO REPLY IN GMAIL</a>" +
    (d.page ? "\n🔗 <a href=\"" + escAttr(d.page) + "\">Open video page</a>" : "");

  var payload = {
    chat_id: TELEGRAM_CHAT_ID,
    text: html,
    parse_mode: "HTML",
    disable_web_page_preview: true
  };

  var resp = UrlFetchApp.fetch(TELEGRAM_API, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var code = resp.getResponseCode();
  if (code !== 200) {
    Logger.log("Telegram error " + code + ": " + resp.getContentText());
    return "TG_FAIL_" + code;
  }
  return "TG_OK";
}

/** Paste your bot token + chat id, then run this once to verify the pipe. */
function testTelegram() {
  var ok = sendTelegramAlert({
    isReview: false,
    videoTitle: "TEST — Adventigle Relay",
    name: "Setup Bot",
    email: "you@gmail.com",
    instagram: "",
    text: "✅ If you can read this on Telegram, the relay works. Forms will now reach you.",
    rating: 0,
    ts: new Date().toISOString(),
    page: "",
    lang: "en"
  });
  Logger.log("testTelegram result: " + ok);
}

/* ---------------- Sheet logging ---------------- */

function appendToSheet(row) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["Received", "Type", "Video", "Name", "Email", "Instagram",
                       "Rating", "Text", "User Timestamp", "Page", "Lang", "Telegram"]);
      sheet.setFrozenRows(1);
      sheet.getRange("1:1").setFontWeight("bold");
    }
    sheet.appendRow(row);
  } catch (err) {
    // Sheet failures must never block the Telegram alert
    Logger.log("Sheet error: " + err);
  }
}

/** Run once from the editor to create the sheet + authorize. */
function setupSheet() {
  appendToSheet([new Date(), "SETUP", "-", "-", "-", "-", "", "Sheet initialized by setupSheet()", "-", "-", "-", "-"]);
  Logger.log("Sheet ready: " + SHEET_NAME);
}

/* ---------------- Helpers ---------------- */

function escHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escAttr(s) {
  return String(s).replace(/"/g, "%22").replace(/</g, "%lt;");
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
