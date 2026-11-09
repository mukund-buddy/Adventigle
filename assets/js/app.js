/* ============================================================
   Adventigle — Community Hub
   app.js — front-end brain for index.html, video.html, about.html & 404.html (v3)

   Sections:
     0. CONFIG
     1. I18N dictionary (10 languages) — UI chrome only;
        long content is translated by Google Translate.
     2. Language state + first-visit modal + Google Translate hook
     3. Utilities (sanitization, HTTPS validation, slugify, rate limiting)
     4. Markdown parser + code copy buttons
     5. Toasts
     6. Relay (Google Apps Script + 60s client-side cooldown)
     7. Shared render helpers + Schema.org VideoObject JSON-LD
     8. Index page
     9. Video page (player, downloads, notes, reviews, Q&A)
    10. Shortcuts Modal (#shortcutsModal) + Creator Quick-Entry Generator
    11. Boot
   ============================================================ */
"use strict";

/* ---------- 0. CONFIG ---------- */
var SITE_ROOT = (typeof window !== "undefined" && window.__SITE_ROOT__) || "";

var SITE = {
  channel: "NotGamingPlayz",
  creator: "Mukund",
  handle: "@notgamingplayz",
  channelUrl: "https://www.youtube.com/@notgamingplayz",
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbw-Z7-i5ccbZ4glfL1LREr_e5hGP8k9Bi2FNMzIEf5KYrst1Wb04W3YznLIM2fVx_4/exec",
  // Shared secret for relay v3. Must match the SHARED_SECRET Script Property.
  // NOTE: this file is public on GitHub Pages, so the key only blocks naive
  // bots - the real protection is the server-side rate limit + replay guard.
  relayKey: "PASTE_YOUR_SHARED_SECRET_HERE",
  storageKey: "adventigle:lang",
  rateLimitKey: "adventigle:lastSubmit",
  rateLimitMs: 60000,
  apiBase: SITE_ROOT + "content/videos/"
};

/* ---------- 1. I18N (UI chrome) ---------- */
var I18N = {
  hinglish: { _dir: "ltr", _flag: "🇮🇳", _label: "Hinglish",
    skip_content: "Content pe seedha jao",
    nav_home: "Home",
    nav_videos: "Videos",
    nav_about: "Baare mein",
    nav_shortcuts: "Shortcuts",
    nav_menu: "Menu",
    lang_label: "Bhasha",
    hero_eyebrow: "Minecraft PE & Bedrock",
    hero_title: "Apne Minecraft PE ko bilkul [[[T0]]]next-level[[[/T0]]] banao.",
    hero_lead: "Custom UI packs, texture packs, building shortcuts aur Bedrock ke one-click fixes — har download aur har install step @notgamingplayz ke short video mein. Hamesha free, sign-up nahi.",
    hero_cta_watch: "Saare {n} videos dekho",
    hero_cta_yt: "YouTube pe dekho",
    stats_videos: "Videos",
    stats_free: "Free downloads",
    stats_new: "Naye uploads",
    stats_period: "Haftey",
    hero_badge_art: "Latest packs",
    section_latest: "Latest videos",
    section_latest_sub: "Har upload, uske downloads aur uski community — har ek ka apna page.",
    results_zero: "KOI VIDEO NAHI MILA",
    results_zero_sub: "Doosra keyword try karo — ya YouTube pe puchh lo.",
    card_watch: "DEKHO + SAWAAL",
    card_notes: "NOTES",
    card_reviews: "REVIEWS",
    help_title: "Koi sawaal hai?",
    help_text: "Kisi bhi video ya Minecraft PE se related kuch bhi poochho — main email pe reply karunga. Sawaal seedha mere paas jaate hain.",
    form_email_label: "Tumhara email",
    form_name_label: "Naam",
    form_optional: "(optional)",
    form_question_label: "Tumhara sawaal",
    form_email_ph: "you@example.com",
    form_question_ph: "Adventigle ke content ke baare mein kuch bhi poochho…",
    btn_send_question: "Sawaal bhejo",
    form_status_sending: "Bhej rahe hain…",
    form_status_wait: "Dobara bhejne se pehle {n}s wait karo.",
    form_status_ok_q: "Thanks! Tumhara sawaal chala gaya — main email pe reply karunga.",
    form_status_ok_r: "Thanks! Tumhara review bhej diya — approve hone ke baad dikhega.",
    form_status_err_q: "Email aur sawaal dono zaroori hain.",
    form_status_err_r: "Star rating chuno aur review likho.",
    form_status_relay: "Nahi bhej saka — network issue. Dobara try karo.",
    footer_brand_text: "Minecraft PE videos, UI & texture packs, tips aur free downloads — Mukund (@notgamingplayz) ke saath.",
    footer_nav_language: "Bhasha",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Adventigle. Design system Gumroad ke open-source design system se liya gaya hai (MIT).",
    modal_title: "Apni bhasha chuno",
    modal_sub: "Isse upar wale menu se kabhi bhi badal sakte ho.",
    modal_gt_note: "💡 Bhasha choose karte hi guides aur reviews Google Translate se apne aap translate ho jaate hain.",
    sc_title: "Keyboard Shortcuts & Creator Tools",
    sc_key: "Key",
    sc_action: "Kaam",
    sc_row1: "Ye Shortcuts & Creator Tools modal kholo / band karo",
    sc_row2: "Homepage par seedha video search box pe chalo",
    sc_row3: "Bhasha picker modal kholo",
    sc_row4: "Bhasha modal khula ho to 1–10 se bhasha chuno",
    sc_row5: "Koi bhi khula modal band karo ya search box se cursor hatao",
    ab_eyebrow: "Creator Mission & Self-Serve Hub",
    ab_h1: "Maine Adventigle kyun banaya",
    ab_p1: "As a creator, maine dekha ki subscribers YouTube comments mein aksar important sawaal poochhte hain — jaise resource pack import kyun nahi hua, direct download link kahan hai, ya Android [[[T2]]]data[[[/T2]]] folder ki permission issue kaise fix karein — aur phir reply ka intezaar ghanton ya dinon tak karna padta hai.",
    ab_p2: "Maine Adventigle ko 100% free, self-serve knowledge hub ki tarah banaya taaki tumhe kabhi [[[T1]]]mere reply ka wait na karna pade[[[/T1]]]. Jab bhi atak jao, yahan aa sakte ho — kisi bhi video ka exact step-by-step written breakdown padho, bina ad-walls ke tested direct downloads lo, aur Minecraft PE / Bedrock issues turant solve karo. Aur agar phir bhi atak jao, to har page se tumhara sawaal seedha mere phone pe aayega taaki main khud madad kar saku.",
    ab_how_title: "Ye site kaise use karein",
    ab_step1_h: "Apna topic dhoondo",
    ab_step1_p: "Homepage pe / dabao ya video vault browse karo — jo exact UI pack, texture pack, command tutorial ya Bedrock fix chahiye woh mil jayega.",
    ab_step2_h: "Guide padho aur downloads lo",
    ab_step2_p: "Video page kholo — tutorial dekho, written step-by-step notes follow karo, commands ek click mein copy karo, aur verified direct links le jao.",
    ab_step3_h: "Atak jao to seedha sawaal poochho",
    ab_step3_p: "Error phir bhi aa raha hai? Kisi bhi video page ka question box use karo — mujhe seedha Telegram pe alert milta hai, main tumhare email pe reply kar sakta hoon.",
    ab_creator_title: "Creator ke baare mein — Mukund",
    ab_creator_p: "Hey! Main [[[T1]]]Mukund[[[/T1]]] hoon — @notgamingplayz aur @adventigle ke peeche ka creator. Main chhote, no-fluff Minecraft PE & Bedrock tutorials, custom UI packs, texture packs aur gaming tracks banata hoon. Adventigle ki har cheez open hai, lightweight hai aur time bachane ke liye bani hai.",
    ab_yt_main: "YouTube (Main Channel)",
    ab_yt_main_sub: "Minecraft PE tutorials, UI packs & fixes →",
    ab_yt_second: "YouTube (Second Channel)",
    ab_yt_second_sub: "Official Adventigle channel & extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Updates, reels & community snaps →",
    ab_gh: "GitHub",
    ab_gh_sub: "Open-source projects & Adventigle repo →",
    e_eyebrow: "404 — Void mein kho gaye",
    e_h1: "Ye chunk load nahi hua.",
    e_p: "Jo page tum dhoondh rahe ho woh move ho gaya ya exist hi nahi karta. Purane video link pe aaye ho to tum automatically redirect ho jaooge — ya neeche buttons se wapas andar jao.",
    e_btn1: "← Saare Videos Dekho",
    e_btn2: "Adventigle ke baare mein",
    vp_crumb_videos: "Videos",
    vp_notfound_h1: "Video nahi mila",
    vp_notfound_p: "content/videos/index.json mein {slug} nahi mila.",
    vp_back: "← Videos pe wapas",
    vp_downloads_title: "Downloads & links",
    vp_ask_title: "Is video ke baare mein sawaal poochho",
    vp_ask_sub: "Tumhara email zaroori hai taaki main seedha reply kar saku. Tumhara sawaal seedha mere paas jaata hai.",
    vp_reviews_title: "Is video ke reviews",
    vp_reviews_empty: "Abhi koi approved review nahi. Is video ko pehle khud review karo.",
    vp_write_review: "Review likho",
    vp_rating_label: "Tumhari rating",
    vp_review_email_label: "Email",
    vp_review_name_label: "Naam",
    vp_review_body_label: "Tumhara review",
    vp_review_body_ph: "Tumhe kya laga?",
    vp_send_review: "Review bhejo",
    vp_related_title: "Related videos",
    vp_guide_title: "Info & notes",
    vp_notes_soon: "Notes jald aa rahe hain — next upload ke baad dekh lena.",
    vp_watch_yt: "▶ YouTube pe dekho",
    vp_copy_link: "🔗 Link copy karo",
    vp_copied: "✓ Copy ho gaya!",
    vp_published: "Published",
    vp_star_label: "{n} star",
    vp_stars_label: "{n} stars",
    search_placeholder: "{n} videos dhoondo…"
  },
  en: { _dir: "ltr", _flag: "🇬🇧", _label: "English",
    skip_content: "Skip to content",
    nav_home: "Home",
    nav_videos: "Videos",
    nav_about: "About",
    nav_shortcuts: "Shortcuts",
    nav_menu: "Menu",
    lang_label: "Language",
    hero_eyebrow: "Minecraft PE & Bedrock",
    hero_title: "Make your Minecraft PE look absolutely [[[T0]]]next-level[[[/T0]]].",
    hero_lead: "Custom UI packs, texture packs, building shortcuts and one-click fixes for Bedrock — every download and every install step shown in a short video by @notgamingplayz. Always free, no sign-up.",
    hero_cta_watch: "Browse all {n} videos",
    hero_cta_yt: "Watch on YouTube",
    stats_videos: "Videos",
    stats_free: "Free downloads",
    stats_new: "New uploads",
    stats_period: "Weekly",
    hero_badge_art: "Latest packs",
    section_latest: "Latest videos",
    section_latest_sub: "Every upload, its downloads and its community — one page each.",
    results_zero: "NO VIDEOS MATCHED",
    results_zero_sub: "Try a different keyword — or ask me on YouTube.",
    card_watch: "WATCH + Q&A",
    card_notes: "NOTES",
    card_reviews: "REVIEWS",
    help_title: "Have a question?",
    help_text: "Ask about any video — or something else Minecraft PE related — and I\'ll reply to you by email. Questions are sent straight to me.",
    form_email_label: "Your email",
    form_name_label: "Name",
    form_optional: "(optional)",
    form_question_label: "Your question",
    form_email_ph: "you@example.com",
    form_question_ph: "Ask anything about Adventigle content…",
    btn_send_question: "Send question",
    form_status_sending: "Sending…",
    form_status_wait: "Please wait {n}s before submitting again.",
    form_status_ok_q: "Thanks! Your question has been sent — I\'ll reply by email.",
    form_status_ok_r: "Thanks! Your review was sent for approval.",
    form_status_err_q: "Email and question are required.",
    form_status_err_r: "Please pick a star rating and write your review.",
    form_status_relay: "Couldn\'t send — network hiccup. Please try again.",
    footer_brand_text: "Minecraft PE videos, UI & texture packs, tips and free downloads by Mukund (@notgamingplayz).",
    footer_nav_language: "Language",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Adventigle. Visual system adapted from the Gumroad open-source design system (MIT).",
    modal_title: "Pick your language",
    modal_sub: "You can change this anytime from the menu above.",
    modal_gt_note: "💡 Guides and reviews are auto-translated by Google Translate when you pick a language.",
    sc_title: "Keyboard Shortcuts & Creator Tools",
    sc_key: "Key",
    sc_action: "Action",
    sc_row1: "Open / close this Shortcuts & Creator Tools modal",
    sc_row2: "Jump straight to the video search box on the homepage",
    sc_row3: "Open the language picker modal",
    sc_row4: "Select language 1-10 while the language modal is open (1 = Hinglish, 2 = English)",
    sc_row5: "Close any open modal or unfocus the search box",
    ab_eyebrow: "Creator Mission & Self-Serve Hub",
    ab_h1: "Why I Built Adventigle",
    ab_p1: "As a creator, I noticed subscribers often ask important questions in YouTube comments — like why a resource pack failed to import, where a direct download link is, or how to fix an Android [[[T2]]]data[[[/T2]]] folder permission issue — and then have to wait hours or even days for a reply.",
    ab_p2: "I built Adventigle as a 100% free, self-serve knowledge hub so you [[[T1]]]never have to wait for my reply[[[/T1]]]. Anytime you get stuck, you can come here, read the exact step-by-step written breakdown for any video, grab tested direct downloads without shady ad-walls, and solve your Minecraft PE / Bedrock issues immediately. And if you still hit a wall, your question on any page comes straight to my phone so I can help you personally.",
    ab_how_title: "How to Use This Site",
    ab_step1_h: "Search Your Topic",
    ab_step1_p: "Press / on the homepage or browse the video vault to find the exact UI pack, texture pack, command tutorial, or Bedrock fix you need.",
    ab_step2_h: "Read the Guide & Grab Downloads",
    ab_step2_p: "Open the video page to watch the tutorial, follow the written step-by-step notes, copy commands in one click, and grab verified direct links.",
    ab_step3_h: "Ask a Direct Question if Stuck",
    ab_step3_p: "Still facing an error? Use the question box on any video page — it alerts me directly on Telegram so I can reply straight to your email.",
    ab_creator_title: "About the Creator — Mukund",
    ab_creator_p: "Hey! I'm [[[T1]]]Mukund[[[/T1]]] — the creator behind @notgamingplayz and @adventigle. I make short, no-fluff Minecraft PE & Bedrock tutorials, custom UI packs, texture packs, and gaming tracks. Everything on Adventigle is open, lightweight, and built to save your time.",
    ab_yt_main: "YouTube (Main Channel)",
    ab_yt_main_sub: "Minecraft PE tutorials, UI packs & fixes →",
    ab_yt_second: "YouTube (Second Channel)",
    ab_yt_second_sub: "Official Adventigle channel & extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Updates, reels & community snaps →",
    ab_gh: "GitHub",
    ab_gh_sub: "Open-source projects & Adventigle repo →",
    e_eyebrow: "404 — Lost in the Void",
    e_h1: "This chunk hasn\'t loaded.",
    e_p: "The page you\'re looking for moved or doesn\'t exist. If you followed an old video link, you\'ll be redirected automatically — or use the buttons below to jump back in.",
    e_btn1: "← Browse All Videos",
    e_btn2: "About Adventigle",
    vp_crumb_videos: "Videos",
    vp_notfound_h1: "Video not found",
    vp_notfound_p: "Could not find video {slug} in content/videos/index.json.",
    vp_back: "← Back to videos",
    vp_downloads_title: "Downloads & links",
    vp_ask_title: "Ask a question about this video",
    vp_ask_sub: "Your email is required so I can reply to you directly. Your question goes straight to me.",
    vp_reviews_title: "Reviews for this video",
    vp_reviews_empty: "No approved reviews yet. Be the first to review this video.",
    vp_write_review: "Write a review",
    vp_rating_label: "Your rating",
    vp_review_email_label: "Email",
    vp_review_name_label: "Name",
    vp_review_body_label: "Your review",
    vp_review_body_ph: "What did you think?",
    vp_send_review: "Send review",
    vp_related_title: "Related videos",
    vp_guide_title: "Info & notes",
    vp_notes_soon: "Notes coming soon — check back after the next upload.",
    vp_watch_yt: "▶ Watch on YouTube",
    vp_copy_link: "🔗 Copy link",
    vp_copied: "✓ Copied!",
    vp_published: "Published",
    vp_star_label: "{n} star",
    vp_stars_label: "{n} stars",
    search_placeholder: "Search {n} videos…"
  },
  hi: { _dir: "ltr", _flag: "🇮🇳", _label: "हिन्दी",
    skip_content: "सामग्री पर जाएं",
    nav_home: "घर",
    nav_videos: "वीडियो",
    nav_about: "के बारे में",
    nav_shortcuts: "शॉर्टकट",
    nav_menu: "मेनू",
    lang_label: "भाषा",
    hero_eyebrow: "माइनक्राफ्ट पीई और बेडरॉक",
    hero_title: "अपने Minecraft PE को बिल्कुल [[[T0]]]अगले स्तर[[[/T0]]] जैसा बनाएं।",
    hero_lead: "कस्टम यूआई पैक, टेक्सचर पैक, बिल्डिंग शॉर्टकट और बेडरॉक के लिए एक-क्लिक फिक्स - प्रत्येक डाउनलोड और प्रत्येक इंस्टॉल चरण @notgamingplayz द्वारा एक लघु वीडियो में दिखाया गया है। हमेशा निःशुल्क, कोई साइन-अप नहीं।",
    hero_cta_watch: "सभी {n} वीडियो ब्राउज़ करें",
    hero_cta_yt: "यूट्यूब पर देखें",
    stats_videos: "वीडियो",
    stats_free: "मुफ़्त डाउनलोड",
    stats_new: "नये अपलोड",
    stats_period: "साप्ताहिक",
    hero_badge_art: "नवीनतम पैक",
    section_latest: "नवीनतम वीडियो",
    section_latest_sub: "प्रत्येक अपलोड, उसके डाउनलोड और उसका समुदाय - प्रत्येक एक पृष्ठ।",
    results_zero: "कोई वीडियो मेल नहीं खाता",
    results_zero_sub: "कोई भिन्न कीवर्ड आज़माएँ - या YouTube पर मुझसे पूछें।",
    card_watch: "देखें + प्रश्नोत्तर",
    card_notes: "टिप्पणियाँ",
    card_reviews: "समीक्षाएँ",
    help_title: "कोई प्रश्न है?",
    help_text: "किसी भी वीडियो के बारे में पूछें - या Minecraft PE से संबंधित किसी अन्य चीज़ के बारे में - और मैं आपको ईमेल द्वारा उत्तर दूंगा। प्रश्न सीधे मुझे भेजे जाते हैं.",
    form_email_label: "आपका ईमेल",
    form_name_label: "नाम",
    form_optional: "(वैकल्पिक)",
    form_question_label: "आपका प्रश्न",
    form_email_ph: "you@example.com",
    form_question_ph: "एडवेंटीगल सामग्री के बारे में कुछ भी पूछें...",
    btn_send_question: "प्रश्न भेजें",
    form_status_sending: "भेजा जा रहा है...",
    form_status_wait: "कृपया दोबारा सबमिट करने से पहले {n} प्रतीक्षा करें।",
    form_status_ok_q: "धन्यवाद! आपका प्रश्न भेज दिया गया है - मैं ईमेल द्वारा उत्तर दूंगा।",
    form_status_ok_r: "धन्यवाद! आपकी समीक्षा अनुमोदन के लिए भेजी गई थी.",
    form_status_err_q: "ईमेल और प्रश्न आवश्यक हैं.",
    form_status_err_r: "कृपया एक स्टार रेटिंग चुनें और अपनी समीक्षा लिखें।",
    form_status_relay: "नहीं भेजा जा सका - नेटवर्क संबंधी दिक्कत. कृपया पुन: प्रयास करें।",
    footer_brand_text: "मुकुंद (@notgamingplayz) द्वारा Minecraft PE वीडियो, यूआई और टेक्सचर पैक, टिप्स और मुफ्त डाउनलोड।",
    footer_nav_language: "भाषा",
    footer_nav_youtube: "यूट्यूब",
    footer_legal: "© 2026 एडवेंटिगल। गमरोड ओपन-सोर्स डिज़ाइन सिस्टम (एमआईटी) से अनुकूलित दृश्य प्रणाली।",
    modal_title: "अपनी भाषा चुनें",
    modal_sub: "आप इसे उपरोक्त मेनू से किसी भी समय बदल सकते हैं।",
    modal_gt_note: "💡 जब आप कोई भाषा चुनते हैं तो मार्गदर्शिकाएँ और समीक्षाएँ Google अनुवाद द्वारा स्वतः अनुवादित हो जाती हैं।",
    sc_title: "कीबोर्ड शॉर्टकट और क्रिएटर टूल",
    sc_key: "कुंजी",
    sc_action: "कार्रवाई",
    sc_row1: "इस शॉर्टकट और क्रिएटर टूल्स मोडल को खोलें/बंद करें",
    sc_row2: "मुखपृष्ठ पर सीधे वीडियो खोज बॉक्स पर जाएं",
    sc_row3: "भाषा पिकर मोडल खोलें",
    sc_row4: "भाषा मोडल खुला होने पर भाषा 1-10 का चयन करें",
    sc_row5: "किसी भी खुले मोडल को बंद करें या खोज बॉक्स को अनफोकस करें",
    ab_eyebrow: "क्रिएटर मिशन और सेल्फ-सर्व हब",
    ab_h1: "मैंने एडवेंटीगल का निर्माण क्यों किया?",
    ab_p1: "एक निर्माता के रूप में, मैंने देखा कि ग्राहक अक्सर YouTube टिप्पणियों में महत्वपूर्ण प्रश्न पूछते हैं - जैसे कि संसाधन पैक आयात करने में विफल क्यों हुआ, सीधा डाउनलोड लिंक कहां है, या एंड्रॉइड [[[T2]]]डेटा[[[/T2]]] फ़ोल्डर अनुमति समस्या को कैसे ठीक करें - और फिर उत्तर के लिए घंटों या दिनों तक इंतजार करना पड़ता है।",
    ab_p2: "मैंने एडवेंटीगल को 100% निःशुल्क, स्व-सेवा ज्ञान केंद्र के रूप में बनाया है ताकि आपको [[[T1]]]कभी भी मेरे उत्तर के लिए इंतजार न करना पड़े[[[/T1]]]। जब भी आप फंस जाते हैं, तो आप यहां आ सकते हैं, किसी भी वीडियो के लिए सटीक चरण-दर-चरण लिखित विवरण पढ़ सकते हैं, बिना संदिग्ध विज्ञापन-दीवारों के परीक्षण किए गए सीधे डाउनलोड प्राप्त कर सकते हैं, और अपने Minecraft PE/Bedrock मुद्दों को तुरंत हल कर सकते हैं। और यदि आप फिर भी किसी समस्या से जूझते हैं, तो किसी भी पेज पर आपका प्रश्न सीधे मेरे फोन पर आता है ताकि मैं व्यक्तिगत रूप से आपकी मदद कर सकूं।",
    ab_how_title: "इस साइट का उपयोग कैसे करें",
    ab_step1_h: "अपना विषय खोजें",
    ab_step1_p: "आपके लिए आवश्यक सटीक यूआई पैक, टेक्सचर पैक, कमांड ट्यूटोरियल या बेडरॉक फिक्स ढूंढने के लिए होमपेज पर / दबाएं या वीडियो वॉल्ट ब्राउज़ करें।",
    ab_step2_h: "गाइड पढ़ें और डाउनलोड प्राप्त करें",
    ab_step2_p: "ट्यूटोरियल देखने के लिए वीडियो पेज खोलें, लिखे गए चरण-दर-चरण नोट्स का पालन करें, एक क्लिक में कमांड कॉपी करें और सत्यापित प्रत्यक्ष लिंक प्राप्त करें।",
    ab_step3_h: "यदि फंस गए हों तो सीधा प्रश्न पूछें",
    ab_step3_p: "अभी भी त्रुटि का सामना करना पड़ रहा है? किसी भी वीडियो पेज पर प्रश्न बॉक्स का उपयोग करें - यह मुझे सीधे टेलीग्राम पर सचेत करता है ताकि मैं सीधे आपके ईमेल का उत्तर दे सकूं।",
    ab_creator_title: "निर्माता के बारे में - मुकुंद",
    ab_creator_p: "अरे! मैं [[[T1]]]मुकुंद[[[/T1]]] हूं - @notgamingplayz और @adventigle का निर्माता। मैं छोटे, बिना किसी रुकावट के Minecraft PE और बेडरॉक ट्यूटोरियल, कस्टम यूआई पैक, टेक्सचर पैक और गेमिंग ट्रैक बनाता हूं। एडवेंटीगल पर सब कुछ खुला, हल्का और आपका समय बचाने के लिए बनाया गया है।",
    ab_yt_main: "यूट्यूब (मुख्य चैनल)",
    ab_yt_main_sub: "Minecraft PE ट्यूटोरियल, यूआई पैक और सुधार →",
    ab_yt_second: "यूट्यूब (दूसरा चैनल)",
    ab_yt_second_sub: "आधिकारिक एडवेंटीगल चैनल और अतिरिक्त →",
    ab_ig: "इंस्टाग्राम",
    ab_ig_sub: "अपडेट, रील और सामुदायिक स्नैप →",
    ab_gh: "गिटहब",
    ab_gh_sub: "ओपन-सोर्स प्रोजेक्ट और एडवेंटीगल रेपो →",
    e_eyebrow: "404 - शून्य में खो गया",
    e_h1: "यह हिस्सा लोड नहीं हुआ है.",
    e_p: "आप जिस पृष्ठ को खोज रहे हैं वह स्थानांतरित हो गया है या मौजूद नहीं है। यदि आपने किसी पुराने वीडियो लिंक का अनुसरण किया है, तो आपको स्वचालित रूप से रीडायरेक्ट कर दिया जाएगा - या वापस जाने के लिए नीचे दिए गए बटनों का उपयोग करें।",
    e_btn1: "← सभी वीडियो ब्राउज़ करें",
    e_btn2: "एडवेंटीगल के बारे में",
    vp_crumb_videos: "वीडियो",
    vp_notfound_h1: "वीडियो नहीं मिला",
    vp_notfound_p: "content/videos/index.json में वीडियो {स्लग} नहीं मिल सका।",
    vp_back: "← वीडियो पर वापस जाएं",
    vp_downloads_title: "डाउनलोड और लिंक",
    vp_ask_title: "इस वीडियो के बारे में एक प्रश्न पूछें",
    vp_ask_sub: "आपका ईमेल आवश्यक है ताकि मैं आपको सीधे उत्तर दे सकूं। आपका प्रश्न सीधे मुझ तक जाता है.",
    vp_reviews_title: "इस वीडियो के लिए समीक्षाएँ",
    vp_reviews_empty: "अभी तक कोई स्वीकृत समीक्षा नहीं. इस वीडियो की को सबसे पहले रिव्यु करें।",
    vp_write_review: "एक समीक्षा लिखें",
    vp_rating_label: "आपकी रेटिंग",
    vp_review_email_label: "ईमेल",
    vp_review_name_label: "नाम",
    vp_review_body_label: "आपकी समीक्षा",
    vp_review_body_ph: "आपने क्या सोचा?",
    vp_send_review: "समीक्षा भेजें",
    vp_related_title: "संबंधित वीडियो",
    vp_guide_title: "जानकारी एवं नोट्स",
    vp_notes_soon: "नोट्स जल्द ही आ रहे हैं - अगले अपलोड के बाद दोबारा जाँचें।",
    vp_watch_yt: "▶ यूट्यूब पर देखें",
    vp_copy_link: "🔗लिंक कॉपी करें",
    vp_copied: "✓ कॉपी किया गया!",
    vp_published: "प्रकाशित",
    vp_star_label: "{n} सितारा",
    vp_stars_label: "{n} तारे",
    search_placeholder: "{n} वीडियो खोजें..."
  },
  es: { _dir: "ltr", _flag: "🇪🇸", _label: "Español",
    skip_content: "Saltar al contenido",
    nav_home: "Inicio",
    nav_videos: "Vídeos",
    nav_about: "Acerca de",
    nav_shortcuts: "Atajos",
    nav_menu: "Menú",
    lang_label: "Idioma",
    hero_eyebrow: "Minecraft PE y lecho de roca",
    hero_title: "Haz que tu Minecraft PE luzca absolutamente [[[T0]]]del siguiente nivel[[[/T0]]].",
    hero_lead: "Paquetes de interfaz de usuario personalizados, paquetes de texturas, accesos directos a la creación y correcciones con un solo clic para Bedrock: cada paso de descarga y cada instalación se muestra en un breve video de @notgamingplayz. Siempre gratis, sin necesidad de registrarse.",
    hero_cta_watch: "Explorar todos los {n} vídeos",
    hero_cta_yt: "Ver en YouTube",
    stats_videos: "Vídeos",
    stats_free: "Descargas gratuitas",
    stats_new: "Nuevas cargas",
    stats_period: "Semanal",
    hero_badge_art: "Últimos paquetes",
    section_latest: "Últimos vídeos",
    section_latest_sub: "Cada carga, sus descargas y su comunidad: una página cada una.",
    results_zero: "NO HAY VIDEOS COINCIDIDOS",
    results_zero_sub: "Pruebe con una palabra clave diferente o pregúnteme en YouTube.",
    card_watch: "VER + Preguntas y respuestas",
    card_notes: "NOTAS",
    card_reviews: "RESEÑAS",
    help_title: "¿Tiene alguna pregunta?",
    help_text: "Pregunta sobre cualquier vídeo, o cualquier otra cosa relacionada con Minecraft PE, y te responderé por correo electrónico. Las preguntas me las envían directamente.",
    form_email_label: "Tu correo electrónico",
    form_name_label: "Nombre",
    form_optional: "(opcional)",
    form_question_label: "Tu pregunta",
    form_email_ph: "tu@ejemplo.com",
    form_question_ph: "Pregunte cualquier cosa sobre el contenido de Adventigle...",
    btn_send_question: "Enviar pregunta",
    form_status_sending: "Enviando…",
    form_status_wait: "Espere {n} segundos antes de volver a enviarlo.",
    form_status_ok_q: "¡Gracias! Tu pregunta ha sido enviada. Te responderé por correo electrónico.",
    form_status_ok_r: "¡Gracias! Su reseña fue enviada para su aprobación.",
    form_status_err_q: "Se requiere correo electrónico y pregunta.",
    form_status_err_r: "Elija una calificación de estrellas y escriba su reseña.",
    form_status_relay: "No se pudo enviar: problema de red. Por favor inténtalo de nuevo.",
    footer_brand_text: "Vídeos, UI y paquetes de texturas de Minecraft PE, consejos y descargas gratuitas de Mukund (@notgamingplayz).",
    footer_nav_language: "Idioma",
    footer_nav_youtube: "youtube",
    footer_legal: "© 2026 Adventigle. Sistema visual adaptado del sistema de diseño de código abierto (MIT) Gumroad.",
    modal_title: "Elige tu idioma",
    modal_sub: "Puede cambiar esto en cualquier momento desde el menú de arriba.",
    modal_gt_note: "💡 Google Translate traduce automáticamente las guías y reseñas cuando eliges un idioma.",
    sc_title: "Atajos de teclado y herramientas para creadores",
    sc_key: "clave",
    sc_action: "acción",
    sc_row1: "Abrir/cerrar este modo de Atajos y herramientas de creador",
    sc_row2: "Vaya directamente al cuadro de búsqueda de vídeos en la página de inicio.",
    sc_row3: "Abrir el modal de selección de idioma",
    sc_row4: "Seleccione el idioma 1–10 mientras el modo de idioma está abierto",
    sc_row5: "Cierra cualquier modal abierto o desenfoca el cuadro de búsqueda.",
    ab_eyebrow: "Centro de autoservicio y misión del creador",
    ab_h1: "Por qué construí Adventigle",
    ab_p1: "Como creador, noté que los suscriptores a menudo hacen preguntas importantes en los comentarios de YouTube, como por qué no se pudo importar un paquete de recursos, dónde está un enlace de descarga directa o cómo solucionar un problema de permisos de la carpeta [[[T2]]]datos[[[/T2]]] de Android, y luego tienen que esperar horas o incluso días para recibir una respuesta.",
    ab_p2: "Creé Adventigle como un centro de conocimiento de autoservicio 100% gratuito para que [[[T1]]]nunca tengas que esperar mi respuesta[[[/T1]]]. Cada vez que te quedes atascado, puedes venir aquí, leer el desglose escrito exacto paso a paso de cualquier video, obtener descargas directas probadas sin anuncios sospechosos y resolver tus problemas de Minecraft PE/Bedrock de inmediato. Y si aún te encuentras con un muro, tu pregunta en cualquier página llega directamente a mi teléfono para poder ayudarte personalmente.",
    ab_how_title: "Cómo utilizar este sitio",
    ab_step1_h: "Busque su tema",
    ab_step1_p: "Presione / en la página de inicio o explore la bóveda de videos para encontrar el paquete de interfaz de usuario, el paquete de texturas, el tutorial de comandos o la solución Bedrock exactos que necesita.",
    ab_step2_h: "Lea la guía y obtenga descargas",
    ab_step2_p: "Abra la página del video para ver el tutorial, siga las notas escritas paso a paso, copie comandos con un solo clic y obtenga enlaces directos verificados.",
    ab_step3_h: "Haga una pregunta directa si está atascado",
    ab_step3_p: "¿Aún enfrentas un error? Utilice el cuadro de preguntas en cualquier página de vídeo: me alerta directamente en Telegram para que pueda responder directamente a su correo electrónico.",
    ab_creator_title: "Acerca del Creador - Mukund",
    ab_creator_p: "¡Ey! Soy [[[T1]]]Mukund[[[/T1]]], el creador detrás de @notgamingplayz y @adventigle. Hago tutoriales breves y sencillos de Minecraft PE y Bedrock, paquetes de interfaz de usuario personalizados, paquetes de texturas y pistas de juegos. Todo en Adventigle es abierto, liviano y está diseñado para ahorrarle tiempo.",
    ab_yt_main: "YouTube (canal principal)",
    ab_yt_main_sub: "Tutoriales, paquetes de interfaz de usuario y correcciones de Minecraft PE →",
    ab_yt_second: "YouTube (segundo canal)",
    ab_yt_second_sub: "Canal oficial de Adventigle y extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Actualizaciones, reels y instantáneas de la comunidad →",
    ab_gh: "GitHub",
    ab_gh_sub: "Proyectos de código abierto y repositorio de Adventigle →",
    e_eyebrow: "404 — Perdido en el vacío",
    e_h1: "Este fragmento no se ha cargado.",
    e_p: "La página que estás buscando se ha movido o no existe. Si seguiste un enlace de video antiguo, serás redirigido automáticamente, o usa los botones a continuación para regresar.",
    e_btn1: "← Explorar todos los vídeos",
    e_btn2: "Acerca de Adventigle",
    vp_crumb_videos: "Vídeos",
    vp_notfound_h1: "Vídeo no encontrado",
    vp_notfound_p: "No se pudo encontrar el video {slug} en content/videos/index.json.",
    vp_back: "← Volver a vídeos",
    vp_downloads_title: "Descargas y enlaces",
    vp_ask_title: "Haz una pregunta sobre este vídeo",
    vp_ask_sub: "Su correo electrónico es necesario para poder responderle directamente. Tu pregunta va directa a mí.",
    vp_reviews_title: "Reseñas de este vídeo",
    vp_reviews_empty: "Aún no hay revisiones aprobadas. Sé el primero en revisar este vídeo.",
    vp_write_review: "Escribe una reseña",
    vp_rating_label: "Tu calificación",
    vp_review_email_label: "Correo electrónico",
    vp_review_name_label: "Nombre",
    vp_review_body_label: "Tu reseña",
    vp_review_body_ph: "¿Qué pensaste?",
    vp_send_review: "Enviar reseña",
    vp_related_title: "Vídeos relacionados",
    vp_guide_title: "Información y notas",
    vp_notes_soon: "Próximamente notas: vuelve a consultarlas después de la próxima carga.",
    vp_watch_yt: "▶ Ver en YouTube",
    vp_copy_link: "🔗 Copiar enlace",
    vp_copied: "✓ ¡Copiado!",
    vp_published: "Publicado",
    vp_star_label: "{n} estrella",
    vp_stars_label: "{n} estrellas",
    search_placeholder: "Buscar {n} vídeos..."
  },
  fr: { _dir: "ltr", _flag: "🇫🇷", _label: "Français",
    skip_content: "Passer au contenu",
    nav_home: "Accueil",
    nav_videos: "Vidéos",
    nav_about: "À propos",
    nav_shortcuts: "Raccourcis",
    nav_menu: "Menus",
    lang_label: "Langue",
    hero_eyebrow: "Minecraft PE et substrat rocheux",
    hero_title: "Donnez à votre Minecraft PE un aspect absolument [[[T0]]]niveau supérieur[[[/T0]]].",
    hero_lead: "Packs d\'interface utilisateur personnalisés, packs de textures, raccourcis de création et correctifs en un clic pour Bedrock - chaque téléchargement et chaque étape d\'installation présentés dans une courte vidéo de @notgamingplayz. Toujours gratuit, sans inscription.",
    hero_cta_watch: "Parcourez toutes les {n} vidéos",
    hero_cta_yt: "Regarder sur YouTube",
    stats_videos: "Vidéos",
    stats_free: "Téléchargements gratuits",
    stats_new: "Nouveaux téléchargements",
    stats_period: "Hebdomadaire",
    hero_badge_art: "Derniers packs",
    section_latest: "Dernières vidéos",
    section_latest_sub: "Chaque téléchargement, ses téléchargements et sa communauté – une page chacun.",
    results_zero: "AUCUNE VIDÉO CORRESPONDÉE",
    results_zero_sub: "Essayez un autre mot-clé ou demandez-moi sur YouTube.",
    card_watch: "REGARDER + Q&R",
    card_notes: "REMARQUES",
    card_reviews: "AVIS",
    help_title: "Vous avez une question ?",
    help_text: "Renseignez-vous sur n\'importe quelle vidéo - ou autre chose liée à Minecraft PE - et je vous répondrai par e-mail. Les questions me sont envoyées directement.",
    form_email_label: "Votre email",
    form_name_label: "Nom",
    form_optional: "(facultatif)",
    form_question_label: "Votre question",
    form_email_ph: "vous@exemple.com",
    form_question_ph: "Demandez n\'importe quoi sur le contenu d\'Adventigle…",
    btn_send_question: "Envoyer une question",
    form_status_sending: "Envoi…",
    form_status_wait: "Veuillez attendre {n}s avant de soumettre à nouveau.",
    form_status_ok_q: "Merci! Votre question a été envoyée, je vous répondrai par e-mail.",
    form_status_ok_r: "Merci! Votre avis a été envoyé pour approbation.",
    form_status_err_q: "Un e-mail et une question sont requis.",
    form_status_err_r: "Veuillez choisir un nombre d\'étoiles et rédiger votre avis.",
    form_status_relay: "Envoi impossible : problème de réseau. Veuillez réessayer.",
    footer_brand_text: "Vidéos Minecraft PE, packs d\'interface utilisateur et de textures, astuces et téléchargements gratuits par Mukund (@notgamingplayz).",
    footer_nav_language: "Langue",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Adventigle. Système visuel adapté du système de conception open source (MIT) Gumroad.",
    modal_title: "Choisissez votre langue",
    modal_sub: "Vous pouvez modifier cela à tout moment à partir du menu ci-dessus.",
    modal_gt_note: "💡 Les guides et avis sont automatiquement traduits par Google Translate lorsque vous choisissez une langue.",
    sc_title: "Raccourcis clavier et outils de création",
    sc_key: "Clé",
    sc_action: "Action",
    sc_row1: "Ouvrir/fermer ce modal Raccourcis et outils de création",
    sc_row2: "Accédez directement au champ de recherche de vidéos sur la page d\'accueil",
    sc_row3: "Ouvrez le sélecteur de langue modal",
    sc_row4: "Sélectionnez la langue 1 à 10 pendant que le modal de langue est ouvert",
    sc_row5: "Fermez tout modal ouvert ou floutez le champ de recherche",
    ab_eyebrow: "Mission de créateur et centre libre-service",
    ab_h1: "Pourquoi j\'ai construit Adventigle",
    ab_p1: "En tant que créateur, j'ai remarqué que les abonnés posent souvent des questions importantes dans les commentaires YouTube, par exemple pourquoi un pack de ressources n'a pas pu être importé, où se trouve un lien de téléchargement direct ou comment résoudre un problème d'autorisation du dossier Android [[[T2]]]data[[[/T2]]] - et doivent ensuite attendre des heures, voire des jours, pour obtenir une réponse.",
    ab_p2: "J'ai construit Adventigle comme un centre de connaissances en libre-service 100 % gratuit afin que vous [[[T1]]]ne jamais avoir à attendre ma réponse[[[/T1]]]. Chaque fois que vous êtes bloqué, vous pouvez venir ici, lire la description écrite exacte étape par étape de n'importe quelle vidéo, récupérer des téléchargements directs testés sans murs publicitaires louches et résoudre immédiatement vos problèmes Minecraft PE / Bedrock. Et si vous vous heurtez toujours à un mur, votre question sur n'importe quelle page arrive directement sur mon téléphone afin que je puisse vous aider personnellement.",
    ab_how_title: "Comment utiliser ce site",
    ab_step1_h: "Recherchez votre sujet",
    ab_step1_p: "Appuyez sur / sur la page d\'accueil ou parcourez le coffre-fort vidéo pour trouver le pack d\'interface utilisateur, le pack de textures, le didacticiel de commande ou le correctif Bedrock dont vous avez besoin.",
    ab_step2_h: "Lisez le guide et récupérez les téléchargements",
    ab_step2_p: "Ouvrez la page vidéo pour regarder le didacticiel, suivez les notes écrites étape par étape, copiez les commandes en un clic et récupérez les liens directs vérifiés.",
    ab_step3_h: "Posez une question directe si vous êtes bloqué",
    ab_step3_p: "Vous êtes toujours confronté à une erreur ? Utilisez la boîte de questions sur n\'importe quelle page vidéo : elle m\'alerte directement sur Telegram afin que je puisse répondre directement à votre e-mail.",
    ab_creator_title: "À propos du Créateur — Mukund",
    ab_creator_p: "Hé! Je suis [[[T1]]]Mukund[[[/T1]]] — le créateur derrière @notgamingplayz et @adventigle. Je crée des didacticiels Minecraft PE et Bedrock courts et sans fioritures, des packs d'interface utilisateur personnalisés, des packs de textures et des pistes de jeu. Tout sur Adventigle est ouvert, léger et conçu pour vous faire gagner du temps.",
    ab_yt_main: "YouTube (chaîne principale)",
    ab_yt_main_sub: "Tutoriels Minecraft PE, packs d\'interface utilisateur et correctifs →",
    ab_yt_second: "YouTube (deuxième chaîne)",
    ab_yt_second_sub: "Chaîne officielle Adventigle et extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Mises à jour, bobines et instantanés de la communauté →",
    ab_gh: "GitHub",
    ab_gh_sub: "Projets open source et dépôt Adventigle →",
    e_eyebrow: "404 – Perdu dans le vide",
    e_h1: "Ce morceau n\'a pas été chargé.",
    e_p: "La page que vous recherchez a été déplacée ou n\'existe pas. Si vous avez suivi un ancien lien vidéo, vous serez automatiquement redirigé – ou utilisez les boutons ci-dessous pour y revenir.",
    e_btn1: "← Parcourir toutes les vidéos",
    e_btn2: "À propos de Adventigle",
    vp_crumb_videos: "Vidéos",
    vp_notfound_h1: "Vidéo introuvable",
    vp_notfound_p: "Impossible de trouver la vidéo {slug} dans content/videos/index.json.",
    vp_back: "← Retour aux vidéos",
    vp_downloads_title: "Téléchargements et liens",
    vp_ask_title: "Poser une question sur cette vidéo",
    vp_ask_sub: "Votre email est requis pour que je puisse vous répondre directement. Votre question s\'adresse directement à moi.",
    vp_reviews_title: "Commentaires pour cette vidéo",
    vp_reviews_empty: "Aucun avis approuvé pour l\'instant. Soyez le premier à revoir cette vidéo.",
    vp_write_review: "Écrire un avis",
    vp_rating_label: "Votre note",
    vp_review_email_label: "Courriel",
    vp_review_name_label: "Nom",
    vp_review_body_label: "Votre avis",
    vp_review_body_ph: "Qu\'en as-tu pensé ?",
    vp_send_review: "Envoyer un avis",
    vp_related_title: "Vidéos associées",
    vp_guide_title: "Informations et remarques",
    vp_notes_soon: "Notes à venir – revenez après le prochain téléchargement.",
    vp_watch_yt: "▶ Regarder sur YouTube",
    vp_copy_link: "🔗 Copier le lien",
    vp_copied: "✓ Copié!",
    vp_published: "Publié",
    vp_star_label: "{n} étoile",
    vp_stars_label: "{n} étoiles",
    search_placeholder: "Rechercher {n} vidéos…"
  },
  de: { _dir: "ltr", _flag: "🇩🇪", _label: "Deutsch",
    skip_content: "Zum Inhalt springen",
    nav_home: "Zuhause",
    nav_videos: "Videos",
    nav_about: "Über",
    nav_shortcuts: "Verknüpfungen",
    nav_menu: "Menü",
    lang_label: "Sprache",
    hero_eyebrow: "Minecraft PE & Bedrock",
    hero_title: "Lassen Sie Ihr Minecraft PE absolut [[[T0]]]Next-Level[[[/T0]]] aussehen.",
    hero_lead: "Benutzerdefinierte UI-Pakete, Texturpakete, Gebäudeverknüpfungen und Ein-Klick-Korrekturen für Bedrock – jeder Download und jeder Installationsschritt wird in einem kurzen Video von @notgamingplayz gezeigt. Immer kostenlos, keine Anmeldung.",
    hero_cta_watch: "Durchsuchen Sie alle {n} Videos",
    hero_cta_yt: "Auf YouTube ansehen",
    stats_videos: "Videos",
    stats_free: "Kostenlose Downloads",
    stats_new: "Neue Uploads",
    stats_period: "Wöchentlich",
    hero_badge_art: "Neueste Pakete",
    section_latest: "Neueste Videos",
    section_latest_sub: "Jeder Upload, seine Downloads und seine Community – jeweils eine Seite.",
    results_zero: "KEINE VIDEOS ÜBEREINSTIMMUNG",
    results_zero_sub: "Versuchen Sie es mit einem anderen Keyword – oder fragen Sie mich auf YouTube.",
    card_watch: "ANSEHEN + Q&A",
    card_notes: "HINWEISE",
    card_reviews: "BEWERTUNGEN",
    help_title: "Haben Sie eine Frage?",
    help_text: "Fragen Sie nach einem Video – oder etwas anderem, das mit Minecraft PE zu tun hat – und ich antworte Ihnen per E-Mail. Fragen werden direkt an mich gesendet.",
    form_email_label: "Ihre E-Mail",
    form_name_label: "Name",
    form_optional: "(optional)",
    form_question_label: "Deine Frage",
    form_email_ph: "you@example.com",
    form_question_ph: "Fragen Sie alles zu Adventigle-Inhalten …",
    btn_send_question: "Frage senden",
    form_status_sending: "Senden…",
    form_status_wait: "Bitte warten Sie {n}s, bevor Sie erneut senden.",
    form_status_ok_q: "Danke! Ihre Frage wurde gesendet – ich werde per E-Mail antworten.",
    form_status_ok_r: "Danke! Ihre Bewertung wurde zur Genehmigung gesendet.",
    form_status_err_q: "E-Mail und Frage sind erforderlich.",
    form_status_err_r: "Bitte wählen Sie eine Sternebewertung aus und schreiben Sie Ihre Bewertung.",
    form_status_relay: "Konnte nicht gesendet werden – Netzwerkproblem. Bitte versuchen Sie es erneut.",
    footer_brand_text: "Minecraft PE-Videos, UI- und Texturpakete, Tipps und kostenlose Downloads von Mukund (@notgamingplayz).",
    footer_nav_language: "Sprache",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Adventigle. Visuelles System, angepasst an das Open-Source-Designsystem Gumroad (MIT).",
    modal_title: "Wählen Sie Ihre Sprache",
    modal_sub: "Sie können dies jederzeit über das Menü oben ändern.",
    modal_gt_note: "💡 Leitfäden und Rezensionen werden von Google Translate automatisch übersetzt, wenn Sie eine Sprache auswählen.",
    sc_title: "Tastaturkürzel und Erstellungstools",
    sc_key: "Schlüssel",
    sc_action: "Aktion",
    sc_row1: "Öffnen/schließen Sie dieses Modal für Verknüpfungen und Erstellungstools",
    sc_row2: "Springen Sie direkt zum Videosuchfeld auf der Startseite",
    sc_row3: "Öffnen Sie das Sprachauswahl-Modal",
    sc_row4: "Wählen Sie die Sprache 1–10 aus, während das Sprachmodal geöffnet ist",
    sc_row5: "Schließen Sie alle geöffneten Modals oder heben Sie den Fokus des Suchfelds auf",
    ab_eyebrow: "Creator Mission & Self-Service Hub",
    ab_h1: "Warum ich Adventigle gebaut habe",
    ab_p1: "Als YouTuber ist mir aufgefallen, dass Abonnenten in YouTube-Kommentaren oft wichtige Fragen stellen – etwa, warum ein Ressourcenpaket nicht importiert werden konnte, wo sich ein direkter Download-Link befindet oder wie man ein Android-[[[T2]]]data[[[/T2]]]-Ordnerberechtigungsproblem behebt – und dann Stunden oder sogar Tage auf eine Antwort warten müssen.",
    ab_p2: "Ich habe Adventigle als 100 % kostenlosen Self-Service-Wissens-Hub aufgebaut, sodass Sie [[[T1]]]nie auf meine Antwort warten müssen[[[/T1]]]. Wann immer Sie nicht weiterkommen, können Sie hierher kommen, die genaue Schritt-für-Schritt-Aufschlüsselung für jedes Video lesen, sich getestete Direktdownloads ohne zwielichtige Werbewände holen und Ihre Minecraft PE-/Bedrock-Probleme sofort lösen. Und wenn Sie dennoch auf Schwierigkeiten stoßen, landet Ihre Frage auf einer beliebigen Seite direkt auf meinem Telefon, sodass ich Ihnen persönlich weiterhelfen kann.",
    ab_how_title: "So nutzen Sie diese Website",
    ab_step1_h: "Suchen Sie Ihr Thema",
    ab_step1_p: "Drücken Sie / auf der Startseite oder durchsuchen Sie den Video-Tresor, um genau das UI-Paket, Texturpaket, Befehls-Tutorial oder Bedrock-Fix zu finden, das Sie benötigen.",
    ab_step2_h: "Lesen Sie den Leitfaden und holen Sie sich Downloads",
    ab_step2_p: "Öffnen Sie die Videoseite, um sich das Tutorial anzusehen, folgen Sie den schriftlichen Schritt-für-Schritt-Anmerkungen, kopieren Sie Befehle mit einem Klick und greifen Sie auf verifizierte Direktlinks zu.",
    ab_step3_h: "Stellen Sie eine direkte Frage, wenn Sie nicht weiterkommen",
    ab_step3_p: "Stehen Sie immer noch vor einem Fehler? Verwenden Sie das Fragefeld auf einer beliebigen Videoseite – es benachrichtigt mich direkt auf Telegram, sodass ich direkt auf Ihre E-Mail antworten kann.",
    ab_creator_title: "Über den Schöpfer – Mukund",
    ab_creator_p: "Hey! Ich bin [[[T1]]]Mukund[[[/T1]]] – der Schöpfer hinter @notgamingplayz und @adventigle. Ich erstelle kurze, unkomplizierte Minecraft PE- und Bedrock-Tutorials, benutzerdefinierte UI-Pakete, Texturpakete und Gaming-Tracks. Alles auf Adventigle ist offen, leichtgewichtig und darauf ausgelegt, Ihnen Zeit zu sparen.",
    ab_yt_main: "YouTube (Hauptkanal)",
    ab_yt_main_sub: "Minecraft PE-Tutorials, UI-Pakete und Korrekturen →",
    ab_yt_second: "YouTube (Zweiter Kanal)",
    ab_yt_second_sub: "Offizieller Adventigle-Kanal und Extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Updates, Reels und Community-Snaps →",
    ab_gh: "GitHub",
    ab_gh_sub: "Open-Source-Projekte und Adventigle-Repo →",
    e_eyebrow: "404 – Verloren in der Leere",
    e_h1: "Dieser Block wurde nicht geladen.",
    e_p: "Die gesuchte Seite wurde verschoben oder existiert nicht. Wenn Sie einem alten Videolink gefolgt sind, werden Sie automatisch weitergeleitet – oder verwenden Sie die Schaltflächen unten, um wieder einzusteigen.",
    e_btn1: "← Alle Videos durchsuchen",
    e_btn2: "Über Adventigle",
    vp_crumb_videos: "Videos",
    vp_notfound_h1: "Video nicht gefunden",
    vp_notfound_p: "Video {slug} konnte in content/videos/index.json nicht gefunden werden.",
    vp_back: "← Zurück zu den Videos",
    vp_downloads_title: "Downloads & Links",
    vp_ask_title: "Stellen Sie eine Frage zu diesem Video",
    vp_ask_sub: "Ihre E-Mail-Adresse ist erforderlich, damit ich Ihnen direkt antworten kann. Deine Frage geht direkt an mich.",
    vp_reviews_title: "Rezensionen zu diesem Video",
    vp_reviews_empty: "Noch keine genehmigten Bewertungen. Seien Sie der Erste, der dieses Video bewertet.",
    vp_write_review: "Schreiben Sie eine Rezension",
    vp_rating_label: "Ihre Bewertung",
    vp_review_email_label: "E-Mail",
    vp_review_name_label: "Name",
    vp_review_body_label: "Ihre Bewertung",
    vp_review_body_ph: "Was hast du gedacht?",
    vp_send_review: "Bewertung senden",
    vp_related_title: "Verwandte Videos",
    vp_guide_title: "Infos & Notizen",
    vp_notes_soon: "Hinweise folgen in Kürze – schauen Sie nach dem nächsten Upload noch einmal vorbei.",
    vp_watch_yt: "▶ Auf YouTube ansehen",
    vp_copy_link: "🔗 Link kopieren",
    vp_copied: "✓ Kopiert!",
    vp_published: "Veröffentlicht",
    vp_star_label: "{n} Stern",
    vp_stars_label: "{n} Sterne",
    search_placeholder: "Suche {n} Videos…"
  },
  ja: { _dir: "ltr", _flag: "🇯🇵", _label: "日本語",
    skip_content: "コンテンツにスキップ",
    nav_home: "家",
    nav_videos: "動画",
    nav_about: "について",
    nav_shortcuts: "ショートカット",
    nav_menu: "メニュー",
    lang_label: "言語",
    hero_eyebrow: "Minecraft PE と Bedrock",
    hero_title: "あなたの Minecraft PE を完全に [[[T0]]] 次のレベル [[[/T0]]] に見せましょう。",
    hero_lead: "Bedrock のカスタム UI パック、テクスチャ パック、ショートカットの構築、ワンクリック修正 — すべてのダウンロードとすべてのインストール手順が、@notgamingplayz による短いビデオで示されています。いつでも無料、サインアップ不要。",
    hero_cta_watch: "すべての {n} 個の動画を閲覧する",
    hero_cta_yt: "YouTubeで見る",
    stats_videos: "動画",
    stats_free: "無料ダウンロード",
    stats_new: "新しいアップロード",
    stats_period: "毎週",
    hero_badge_art: "最新パック",
    section_latest: "最新のビデオ",
    section_latest_sub: "すべてのアップロード、ダウンロード、コミュニティはそれぞれ 1 ページです。",
    results_zero: "一致する動画はありません",
    results_zero_sub: "別のキーワードを試すか、YouTube で質問してください。",
    card_watch: "見る + Q&A",
    card_notes: "注意事項",
    card_reviews: "レビュー",
    help_title: "質問がありますか?",
    help_text: "ビデオ、またはその他の Minecraft PE 関連について質問してください。電子メールで返信します。質問は私に直接送信されます。",
    form_email_label: "あなたのメールアドレス",
    form_name_label: "名前",
    form_optional: "(オプション)",
    form_question_label: "あなたの質問",
    form_email_ph: "you@example.com",
    form_question_ph: "Adventile のコンテンツについて何でも質問してください…",
    btn_send_question: "質問を送信する",
    form_status_sending: "送信中…",
    form_status_wait: "再度送信する前に {n} 秒待ってください。",
    form_status_ok_q: "ありがとう！ご質問は送信されました - メールで返信させていただきます。",
    form_status_ok_r: "ありがとう！あなたのレビューは承認のために送信されました。",
    form_status_err_q: "メールと質問は必須です。",
    form_status_err_r: "星評価を選択してレビューを書いてください。",
    form_status_relay: "送信できませんでした — ネットワーク障害。もう一度試してください。",
    footer_brand_text: "Mukund (@notgamingplayz) による Minecraft PE ビデオ、UI およびテクスチャ パック、ヒント、無料ダウンロード。",
    footer_nav_language: "言語",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 アドベンティグル. Gumroad オープンソース デザイン システム (MIT) を採用したビジュアル システム。",
    modal_title: "言語を選択してください",
    modal_sub: "上のメニューからいつでも変更できます。",
    modal_gt_note: "💡 言語を選択すると、ガイドとレビューが Google 翻訳によって自動翻訳されます。",
    sc_title: "キーボード ショートカットとクリエイター ツール",
    sc_key: "鍵",
    sc_action: "アクション",
    sc_row1: "このショートカットとクリエイター ツール モーダルを開く/閉じる",
    sc_row2: "ホームページのビデオ検索ボックスに直接ジャンプします",
    sc_row3: "言語選択モーダルを開きます",
    sc_row4: "言語モーダルが開いているときに言語 1 ～ 10 を選択します",
    sc_row5: "開いているモーダルを閉じるか、検索ボックスのフォーカスを外します",
    ab_eyebrow: "クリエイターの使命とセルフサービス ハブ",
    ab_h1: "Adventigle を構築した理由",
    ab_p1: "クリエイターとして、私はチャンネル登録者が YouTube のコメントで重要な質問を頻繁にしていることに気づきました。たとえば、リソース パックのインポートに失敗した理由、直接ダウンロード リンクはどこにあるのか、Android [[[T2]]]data[[[/T2]]] フォルダーのアクセス許可の問題を解決する方法など) で、返答が来るまでに数時間、場合によっては数日も待たなければなりません。",
    ab_p2: "私は Adventigle を完全無料のセルフサービスのナレッジ ハブとして構築しました。そのため、[[[T1]]]私の返信を待つ必要はありません[[[/T1]]]。行き詰まったときは、いつでもここに来て、ビデオの詳細な説明を読んで、怪しい広告ウォールなしでテスト済みの直接ダウンロードを入手し、Minecraft PE / Bedrock の問題をすぐに解決してください。それでも壁にぶつかった場合は、どのページからでも私の携帯電話に直接質問が届くので、私が個別にサポートさせていただきます。",
    ab_how_title: "このサイトの使い方",
    ab_step1_h: "トピックを検索",
    ab_step1_p: "ホームページで / を押すか、ビデオ ボールトを参照して、必要な正確な UI パック、テクスチャ パック、コマンド チュートリアル、または Bedrock 修正を見つけてください。",
    ab_step2_h: "ガイドを読んでダウンロードしてください",
    ab_step2_p: "ビデオ ページを開いてチュートリアルを視聴し、書かれたステップバイステップのメモに従い、ワンクリックでコマンドをコピーし、検証済みの直接リンクを取得します。",
    ab_step3_h: "行き詰まった場合は直接質問する",
    ab_step3_p: "まだエラーが発生しますか?ビデオ ページの質問ボックスを使用してください。Telegram で直接アラートが届くので、メールに直接返信できます。",
    ab_creator_title: "クリエイターについて — Mukund",
    ab_creator_p: "おい！私は [[[T1]]]Mukund[[[/T1]]] — @notgamingplayz と @adventigle のクリエイターです。短くて無駄のない Minecraft PE と Bedrock チュートリアル、カスタム UI パック、テクスチャ パック、ゲーム トラックを作成しています。 Adventigle のすべてはオープンで軽量で、時間を節約できるように構築されています。",
    ab_yt_main: "YouTube（メインチャンネル）",
    ab_yt_main_sub: "Minecraft PE チュートリアル、UI パック、修正 →",
    ab_yt_second: "YouTube（セカンドチャンネル）",
    ab_yt_second_sub: "Adventile 公式チャンネルと特典 →",
    ab_ig: "インスタグラム",
    ab_ig_sub: "アップデート、リール、コミュニティスナップ →",
    ab_gh: "GitHub",
    ab_gh_sub: "オープンソース プロジェクトと Adventigle リポジトリ →",
    e_eyebrow: "404 — 虚空の中で失われた",
    e_h1: "このチャンクはロードされていません。",
    e_p: "お探しのページは移動されたか、存在しません。古いビデオ リンクをたどった場合は、自動的にリダイレクトされます。または、下のボタンを使用して元のビデオに戻ります。",
    e_btn1: "← すべてのビデオを参照",
    e_btn2: "アドベンティグルについて",
    vp_crumb_videos: "動画",
    vp_notfound_h1: "ビデオが見つかりません",
    vp_notfound_p: "content/videos/index.json でビデオ {slug} が見つかりませんでした。",
    vp_back: "← 動画に戻る",
    vp_downloads_title: "ダウンロードとリンク",
    vp_ask_title: "このビデオについて質問する",
    vp_ask_sub: "直接返信させていただくため、メールアドレスは必須です。あなたの質問は私に直接届きます。",
    vp_reviews_title: "このビデオのレビュー",
    vp_reviews_empty: "まだ承認されたレビューはありません。このビデオを最初にレビューしてください。",
    vp_write_review: "レビューを書く",
    vp_rating_label: "あなたの評価",
    vp_review_email_label: "電子メール",
    vp_review_name_label: "名前",
    vp_review_body_label: "あなたのレビュー",
    vp_review_body_ph: "どう思いましたか？",
    vp_send_review: "レビューを送信する",
    vp_related_title: "関連動画",
    vp_guide_title: "情報とメモ",
    vp_notes_soon: "メモは近日公開予定です。次回のアップロード後にもう一度確認してください。",
    vp_watch_yt: "▶ YouTubeで見る",
    vp_copy_link: "🔗 リンクをコピー",
    vp_copied: "✓ コピーされました!",
    vp_published: "発行済み",
    vp_star_label: "{n} つ星",
    vp_stars_label: "{n} つ星",
    search_placeholder: "{n} 個の動画を検索…"
  },
  pt: { _dir: "ltr", _flag: "🇧🇷", _label: "Português",
    skip_content: "Pular para o conteúdo",
    nav_home: "Lar",
    nav_videos: "Vídeos",
    nav_about: "Sobre",
    nav_shortcuts: "Atalhos",
    nav_menu: "Menu",
    lang_label: "Linguagem",
    hero_eyebrow: "Minecraft PE e base rochosa",
    hero_title: "Faça com que seu Minecraft PE pareça absolutamente [[[T0]]]de próximo nível[[[/T0]]].",
    hero_lead: "Pacotes de UI personalizados, pacotes de textura, atalhos de construção e correções com um clique para Bedrock – cada download e cada etapa de instalação mostrada em um pequeno vídeo de @notgamingplayz. Sempre gratuito, sem inscrição.",
    hero_cta_watch: "Procurar todos os {n} vídeos",
    hero_cta_yt: "Assista no YouTube",
    stats_videos: "Vídeos",
    stats_free: "Downloads gratuitos",
    stats_new: "Novos envios",
    stats_period: "Semanalmente",
    hero_badge_art: "Últimos pacotes",
    section_latest: "Últimos vídeos",
    section_latest_sub: "Cada upload, seus downloads e sua comunidade — uma página cada.",
    results_zero: "NENHUM VÍDEO CORRESPONDIDO",
    results_zero_sub: "Experimente uma palavra-chave diferente – ou pergunte-me no YouTube.",
    card_watch: "ASSISTIR + Perguntas e Respostas",
    card_notes: "NOTAS",
    card_reviews: "AVALIAÇÕES",
    help_title: "Tem alguma pergunta?",
    help_text: "Pergunte sobre qualquer vídeo - ou qualquer outra coisa relacionada ao Minecraft PE - e eu responderei por e-mail. As perguntas são enviadas diretamente para mim.",
    form_email_label: "Seu e-mail",
    form_name_label: "Nome",
    form_optional: "(opcional)",
    form_question_label: "Sua pergunta",
    form_email_ph: "você@exemplo.com",
    form_question_ph: "Pergunte qualquer coisa sobre o conteúdo do Adventigle…",
    btn_send_question: "Enviar pergunta",
    form_status_sending: "Enviando…",
    form_status_wait: "Aguarde {n}s antes de enviar novamente.",
    form_status_ok_q: "Obrigado! Sua pergunta foi enviada, responderei por e-mail.",
    form_status_ok_r: "Obrigado! Sua avaliação foi enviada para aprovação.",
    form_status_err_q: "E-mail e pergunta são obrigatórios.",
    form_status_err_r: "Escolha uma classificação por estrelas e escreva seu comentário.",
    form_status_relay: "Não foi possível enviar – problema de rede. Por favor, tente novamente.",
    footer_brand_text: "Vídeos do Minecraft PE, pacotes de interface e textura, dicas e downloads gratuitos de Mukund (@notgamingplayz).",
    footer_nav_language: "Linguagem",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Adventículo. Sistema visual adaptado do sistema de design de código aberto Gumroad (MIT).",
    modal_title: "Escolha seu idioma",
    modal_sub: "Você pode alterar isso a qualquer momento no menu acima.",
    modal_gt_note: "💡 Guias e avaliações são traduzidos automaticamente pelo Google Tradutor quando você escolhe um idioma.",
    sc_title: "Atalhos de teclado e ferramentas de criação",
    sc_key: "Chave",
    sc_action: "Ação",
    sc_row1: "Abra / feche este modal Atalhos e ferramentas de criação",
    sc_row2: "Vá direto para a caixa de pesquisa de vídeos na página inicial",
    sc_row3: "Abra o modal seletor de idioma",
    sc_row4: "Selecione o idioma 1–10 enquanto o modal de idioma está aberto",
    sc_row5: "Feche qualquer modal aberto ou desfoque a caixa de pesquisa",
    ab_eyebrow: "Missão do criador e centro de autoatendimento",
    ab_h1: "Por que construí o Adventigle",
    ab_p1: "Como criador, percebi que os assinantes costumam fazer perguntas importantes nos comentários do YouTube - como por que um pacote de recursos falhou na importação, onde está um link de download direto ou como corrigir um problema de permissão de pasta de dados [[[/T2]]] do Android - e então ter que esperar horas ou até dias por uma resposta.",
    ab_p2: "Eu construí o Adventigle como um centro de conhecimento de autoatendimento 100% gratuito para que você [[[T1]]]nunca precise esperar pela minha resposta[[[/T1]]]. Sempre que tiver dúvidas, você pode vir aqui, ler o detalhamento escrito passo a passo exato de qualquer vídeo, fazer downloads diretos testados sem paredes de anúncios obscuras e resolver seus problemas de Minecraft PE / Bedrock imediatamente. E se você ainda se deparar com alguma dúvida, sua pergunta em qualquer página chega direto no meu celular para que eu possa ajudá-lo pessoalmente.",
    ab_how_title: "Como usar este site",
    ab_step1_h: "Pesquise o seu tópico",
    ab_step1_p: "Pressione / na página inicial ou navegue no cofre de vídeo para encontrar o pacote de UI, pacote de textura, tutorial de comando ou correção Bedrock exato que você precisa.",
    ab_step2_h: "Leia o guia e faça downloads",
    ab_step2_p: "Abra a página do vídeo para assistir ao tutorial, siga as notas passo a passo escritas, copie comandos com um clique e obtenha links diretos verificados.",
    ab_step3_h: "Faça uma pergunta direta se estiver travado",
    ab_step3_p: "Ainda enfrentando um erro? Use a caixa de perguntas em qualquer página de vídeo – ela me alerta diretamente no Telegram para que eu possa responder diretamente ao seu e-mail.",
    ab_creator_title: "Sobre o Criador – Mukund",
    ab_creator_p: "Ei! Eu sou [[[T1]]]Mukund[[[/T1]]] — o criador por trás de @notgamingplayz e @adventigle. Eu faço tutoriais curtos e simples de Minecraft PE e Bedrock, pacotes de UI personalizados, pacotes de textura e trilhas de jogos. Tudo no Adventigle é aberto, leve e construído para economizar seu tempo.",
    ab_yt_main: "YouTube (canal principal)",
    ab_yt_main_sub: "Tutoriais, pacotes de UI e correções do Minecraft PE →",
    ab_yt_second: "YouTube (segundo canal)",
    ab_yt_second_sub: "Canal oficial da Adventigle e extras →",
    ab_ig: "Instagram",
    ab_ig_sub: "Atualizações, vídeos e fotos da comunidade →",
    ab_gh: "GitHub",
    ab_gh_sub: "Projetos de código aberto e repositório Adventigle →",
    e_eyebrow: "404 – Perdido no Vazio",
    e_h1: "Este pedaço não foi carregado.",
    e_p: "A página que você procura foi movida ou não existe. Se você seguiu o link de um vídeo antigo, será redirecionado automaticamente – ou use os botões abaixo para voltar.",
    e_btn1: "← Navegar por todos os vídeos",
    e_btn2: "Sobre Adventículo",
    vp_crumb_videos: "Vídeos",
    vp_notfound_h1: "Vídeo não encontrado",
    vp_notfound_p: "Não foi possível encontrar o vídeo {slug} em content/videos/index.json.",
    vp_back: "← Voltar aos vídeos",
    vp_downloads_title: "Downloads e links",
    vp_ask_title: "Faça uma pergunta sobre este vídeo",
    vp_ask_sub: "Seu e-mail é necessário para que eu possa responder diretamente a você. Sua pergunta vai direto para mim.",
    vp_reviews_title: "Críticas para este vídeo",
    vp_reviews_empty: "Nenhuma avaliação aprovada ainda. Seja o primeiro a avaliar este vídeo.",
    vp_write_review: "Escreva um comentário",
    vp_rating_label: "Sua classificação",
    vp_review_email_label: "E-mail",
    vp_review_name_label: "Nome",
    vp_review_body_label: "Sua avaliação",
    vp_review_body_ph: "O que você achou?",
    vp_send_review: "Enviar avaliação",
    vp_related_title: "Vídeos relacionados",
    vp_guide_title: "Informações e notas",
    vp_notes_soon: "Notas em breve – verifique novamente após o próximo upload.",
    vp_watch_yt: "▶ Assista no YouTube",
    vp_copy_link: "🔗 Copiar link",
    vp_copied: "✓ Copiado!",
    vp_published: "Publicado",
    vp_star_label: "{n} estrela",
    vp_stars_label: "{n} estrelas",
    search_placeholder: "Pesquisar {n} vídeos…"
  },
  id: { _dir: "ltr", _flag: "🇮🇩", _label: "Bahasa Indonesia",
    skip_content: "Lewati ke konten",
    nav_home: "Rumah",
    nav_videos: "Video",
    nav_about: "Tentang",
    nav_shortcuts: "Jalan pintas",
    nav_menu: "Tidak bisa",
    lang_label: "Bahasa",
    hero_eyebrow: "Minecraft PE & Batuan Dasar",
    hero_title: "Jadikan Minecraft PE Anda terlihat benar-benar [[[T0]]]tingkat berikutnya[[[/T0]]].",
    hero_lead: "Paket UI khusus, paket tekstur, pintasan pembuatan, dan perbaikan sekali klik untuk Bedrock — setiap langkah pengunduhan dan pemasangan ditampilkan dalam video pendek oleh @notgamingplayz. Selalu gratis, tidak perlu mendaftar.",
    hero_cta_watch: "Jelajahi semua {n} video",
    hero_cta_yt: "Tonton di YouTube",
    stats_videos: "Video",
    stats_free: "Unduhan gratis",
    stats_new: "Unggahan baru",
    stats_period: "Mingguan",
    hero_badge_art: "Paket terbaru",
    section_latest: "Video terbaru",
    section_latest_sub: "Setiap unggahan, unduhannya, dan komunitasnya — masing-masing satu halaman.",
    results_zero: "TIDAK ADA VIDEO YANG COCOK",
    results_zero_sub: "Coba kata kunci lain — atau tanyakan kepada saya di YouTube.",
    card_watch: "TONTON + Tanya Jawab",
    card_notes: "CATATAN",
    card_reviews: "ULASAN",
    help_title: "Punya pertanyaan?",
    help_text: "Tanyakan tentang video apa pun — atau hal lain yang terkait dengan Minecraft PE — dan saya akan membalas Anda melalui email. Pertanyaan dikirimkan langsung kepada saya.",
    form_email_label: "email Anda",
    form_name_label: "Nama",
    form_optional: "(opsional)",
    form_question_label: "Pertanyaan Anda",
    form_email_ph: "kamu@example.com",
    form_question_ph: "Tanyakan apa pun tentang konten Adventigle…",
    btn_send_question: "Kirim pertanyaan",
    form_status_sending: "Mengirim…",
    form_status_wait: "Harap tunggu {n}s sebelum mengirimkan lagi.",
    form_status_ok_q: "Terima kasih! Pertanyaan Anda telah terkirim — Saya akan membalasnya melalui email.",
    form_status_ok_r: "Terima kasih! Ulasan Anda telah dikirim untuk disetujui.",
    form_status_err_q: "Email dan pertanyaan diperlukan.",
    form_status_err_r: "Silakan pilih peringkat bintang dan tulis ulasan Anda.",
    form_status_relay: "Tidak dapat mengirim — gangguan jaringan. Silakan coba lagi.",
    footer_brand_text: "Video Minecraft PE, paket UI & tekstur, tip dan unduhan gratis oleh Mukund (@notgamingplayz).",
    footer_nav_language: "Bahasa",
    footer_nav_youtube: "YouTube",
    footer_legal: "© 2026 Petualangan. Sistem visual diadaptasi dari sistem desain sumber terbuka Gumroad (MIT).",
    modal_title: "Pilih bahasa Anda",
    modal_sub: "Anda dapat mengubahnya kapan saja dari menu di atas.",
    modal_gt_note: "💡 Panduan dan ulasan diterjemahkan secara otomatis oleh Google Terjemahan saat Anda memilih bahasa.",
    sc_title: "Pintasan Keyboard & Alat Pembuat",
    sc_key: "Kunci",
    sc_action: "Tindakan",
    sc_row1: "Buka/tutup modal Pintasan & Alat Pembuat ini",
    sc_row2: "Langsung ke kotak pencarian video di beranda",
    sc_row3: "Buka modal pemilih bahasa",
    sc_row4: "Pilih bahasa 1–10 saat modal bahasa terbuka",
    sc_row5: "Tutup semua modal terbuka atau hilangkan fokus kotak pencarian",
    ab_eyebrow: "Misi Pencipta & Pusat Pelayanan Mandiri",
    ab_h1: "Mengapa Saya Membangun Adventigle",
    ab_p1: "Sebagai pembuat konten, saya melihat pelanggan sering mengajukan pertanyaan penting di komentar YouTube — seperti mengapa paket sumber daya gagal diimpor, di mana letak tautan unduhan langsung, atau cara memperbaiki masalah izin folder [[[T2]]]data[[[/T2]]] Android — dan kemudian harus menunggu berjam-jam atau bahkan berhari-hari untuk mendapatkan balasan.",
    ab_p2: "Saya membangun Adventigle sebagai pusat pengetahuan mandiri yang 100% gratis sehingga Anda [[[T1]]]tidak perlu menunggu balasan saya[[[/T1]]]. Kapan pun Anda mengalami kebuntuan, Anda dapat datang ke sini, membaca uraian tertulis langkah demi langkah yang tepat untuk video apa pun, mengambil unduhan langsung yang teruji tanpa dinding iklan yang teduh, dan segera menyelesaikan masalah Minecraft PE / Batuan Dasar Anda. Dan jika Anda masih menemui jalan buntu, pertanyaan Anda di halaman mana pun langsung masuk ke ponsel saya sehingga saya dapat membantu Anda secara pribadi.",
    ab_how_title: "Cara Menggunakan Situs Ini",
    ab_step1_h: "Cari Topik Anda",
    ab_step1_p: "Tekan / di beranda atau jelajahi brankas video untuk menemukan paket UI, paket tekstur, tutorial perintah, atau perbaikan batuan dasar yang Anda perlukan.",
    ab_step2_h: "Baca Panduan & Unduhan Ambil",
    ab_step2_p: "Buka halaman video untuk menonton tutorialnya, ikuti catatan langkah demi langkah yang tertulis, salin perintah dalam satu klik, dan ambil tautan langsung yang terverifikasi.",
    ab_step3_h: "Ajukan Pertanyaan Langsung jika Terjebak",
    ab_step3_p: "Masih menghadapi kesalahan? Gunakan kotak pertanyaan di halaman video mana pun — kotak ini memberi tahu saya langsung di Telegram sehingga saya dapat langsung membalas email Anda.",
    ab_creator_title: "Tentang Sang Pencipta — Mukund",
    ab_creator_p: "Hai! Saya [[[T1]]]Mukund[[[/T1]]] — pencipta di balik @notgamingplayz dan @adventigle. Saya membuat tutorial singkat Minecraft PE & Batuan Dasar, paket UI khusus, paket tekstur, dan trek permainan. Segala sesuatu di Adventigle terbuka, ringan, dan dibuat untuk menghemat waktu Anda.",
    ab_yt_main: "YouTube (Saluran Utama)",
    ab_yt_main_sub: "Tutorial Minecraft PE, paket & perbaikan UI →",
    ab_yt_second: "YouTube (Saluran Kedua)",
    ab_yt_second_sub: "Saluran & ekstra resmi Adventigle →",
    ab_ig: "Instagram",
    ab_ig_sub: "Pembaruan, gulungan & jepretan komunitas →",
    ab_gh: "GitHub",
    ab_gh_sub: "Proyek sumber terbuka & repo Adventigle →",
    e_eyebrow: "404 — Tersesat dalam Kekosongan",
    e_h1: "Potongan ini belum dimuat.",
    e_p: "Halaman yang Anda cari dipindahkan atau tidak ada. Jika Anda mengikuti tautan video lama, Anda akan dialihkan secara otomatis — atau gunakan tombol di bawah untuk masuk kembali.",
    e_btn1: "← Jelajahi Semua Video",
    e_btn2: "Tentang Petualangan",
    vp_crumb_videos: "Video",
    vp_notfound_h1: "Video tidak ditemukan",
    vp_notfound_p: "Tidak dapat menemukan video {slug} di content/videos/index.json.",
    vp_back: "← Kembali ke video",
    vp_downloads_title: "Unduhan & tautan",
    vp_ask_title: "Ajukan pertanyaan tentang video ini",
    vp_ask_sub: "Email Anda diperlukan agar saya dapat membalas Anda secara langsung. Pertanyaan Anda langsung ditujukan kepada saya.",
    vp_reviews_title: "Ulasan untuk video ini",
    vp_reviews_empty: "Belum ada ulasan yang disetujui. Jadilah orang pertama yang mengulas video ini.",
    vp_write_review: "Tulis ulasan",
    vp_rating_label: "Peringkat Anda",
    vp_review_email_label: "Surel",
    vp_review_name_label: "Nama",
    vp_review_body_label: "Ulasan Anda",
    vp_review_body_ph: "Apa yang kamu pikirkan?",
    vp_send_review: "Kirim ulasan",
    vp_related_title: "Video terkait",
    vp_guide_title: "Info & catatan",
    vp_notes_soon: "Catatan segera hadir — periksa kembali setelah pengunggahan berikutnya.",
    vp_watch_yt: "▶ Tonton di YouTube",
    vp_copy_link: "🔗 Salin tautan",
    vp_copied: "✓ Disalin!",
    vp_published: "Diterbitkan",
    vp_star_label: "{n} bintang",
    vp_stars_label: "{n} bintang",
    search_placeholder: "Telusuri {n} video…"
  },
  ru: { _dir: "ltr", _flag: "🇷🇺", _label: "Русский",
    skip_content: "Перейти к содержимому",
    nav_home: "Дом",
    nav_videos: "Видео",
    nav_about: "О",
    nav_shortcuts: "Ярлыки",
    nav_menu: "Меню",
    lang_label: "Язык",
    hero_eyebrow: "Майнкрафт ПЕ и Бедрок",
    hero_title: "Сделайте свой Minecraft PE абсолютно [[[T0]]]нового уровня[[[/T0]]].",
    hero_lead: "Пользовательские пакеты пользовательского интерфейса, пакеты текстур, ярлыки для сборки и исправления для Bedrock одним щелчком мыши — каждая загрузка и каждый шаг установки показаны в коротком видеоролике от @notgamingplayz. Всегда бесплатно, без регистрации.",
    hero_cta_watch: "Просмотреть все видео: {n}",
    hero_cta_yt: "Смотреть на YouTube",
    stats_videos: "Видео",
    stats_free: "Бесплатные загрузки",
    stats_new: "Новые загрузки",
    stats_period: "Еженедельно",
    hero_badge_art: "Последние пакеты",
    section_latest: "Последние видео",
    section_latest_sub: "Каждая загрузка, ее загрузки и ее сообщество — по одной странице.",
    results_zero: "НЕТ ПОДХОДЯЩИХ ВИДЕО",
    results_zero_sub: "Попробуйте другое ключевое слово или спросите меня на YouTube.",
    card_watch: "СМОТРЕТЬ + Вопросы и Ответы",
    card_notes: "ПРИМЕЧАНИЯ",
    card_reviews: "ОТЗЫВЫ",
    help_title: "Есть вопросы?",
    help_text: "Спросите о любом видео или о чем-то еще, связанном с Minecraft PE, и я отвечу вам по электронной почте. Вопросы присылают прямо мне.",
    form_email_label: "Ваш адрес электронной почты",
    form_name_label: "Имя",
    form_optional: "(необязательный)",
    form_question_label: "Ваш вопрос",
    form_email_ph: "you@example.com",
    form_question_ph: "Спросите что-нибудь о контенте Adventigle…",
    btn_send_question: "Отправить вопрос",
    form_status_sending: "Отправка…",
    form_status_wait: "Пожалуйста, подождите {n} сек, прежде чем отправлять снова.",
    form_status_ok_q: "Спасибо! Ваш вопрос отправлен — отвечу по электронной почте.",
    form_status_ok_r: "Спасибо! Ваш отзыв отправлен на одобрение.",
    form_status_err_q: "Электронная почта и вопрос обязательны.",
    form_status_err_r: "Пожалуйста, выберите звездный рейтинг и напишите свой отзыв.",
    form_status_relay: "Не удалось отправить — сбой в сети. Пожалуйста, попробуйте еще раз.",
    footer_brand_text: "Видео Minecraft PE, пакеты пользовательского интерфейса и текстур, советы и бесплатные загрузки от Mukund (@notgamingplayz).",
    footer_nav_language: "Язык",
    footer_nav_youtube: "Ютуб",
    footer_legal: "© 2026 Адвентигл. Визуальная система адаптирована из системы дизайна с открытым исходным кодом Gumroad (MIT).",
    modal_title: "Выберите свой язык",
    modal_sub: "Вы можете изменить это в любое время в меню выше.",
    modal_gt_note: "💡 Руководства и обзоры автоматически переводятся Google Translate, когда вы выбираете язык.",
    sc_title: "Сочетания клавиш и инструменты для творчества",
    sc_key: "Ключ",
    sc_action: "Действие",
    sc_row1: "Открыть/закрыть модальное окно «Ярлыки и инструменты для творчества»",
    sc_row2: "Перейдите прямо к окну поиска видео на главной странице.",
    sc_row3: "Откройте модальное окно выбора языка",
    sc_row4: "Выберите язык 1–10, пока открыто языковое окно.",
    sc_row5: "Закройте любое открытое модальное окно или снимите фокус с поля поиска.",
    ab_eyebrow: "Миссия для авторов и центр самообслуживания",
    ab_h1: "Почему я построил Адвентигл",
    ab_p1: "Как автор, я заметил, что подписчики часто задают важные вопросы в комментариях на YouTube — например, почему не удалось импортировать пакет ресурсов, где находится прямая ссылка для скачивания или как исправить проблему с разрешением папки Android [[[T2]]]data[[[/T2]]] — а затем им приходится ждать ответа часами или даже днями.",
    ab_p2: "Я создал Adventigle как 100% бесплатный центр знаний с самообслуживанием, чтобы вам [[[T1]]]никогда не приходилось ждать моего ответа[[[/T1]]]. В любой момент, когда вы застрянете, вы можете прийти сюда, прочитать точную пошаговую письменную разбивку любого видео, получить проверенные прямые загрузки без теневых рекламных стен и немедленно решить свои проблемы с Minecraft PE / Bedrock. А если вы все равно застрянете, ваш вопрос на любой странице придет прямо на мой телефон, и я смогу помочь вам лично.",
    ab_how_title: "Как использовать этот сайт",
    ab_step1_h: "Найдите свою тему",
    ab_step1_p: "Нажмите / на главной странице или просмотрите хранилище видео, чтобы найти именно тот пакет пользовательского интерфейса, пакет текстур, руководство по командам или исправление Bedrock, которое вам нужно.",
    ab_step2_h: "Прочтите руководство и загрузите файлы",
    ab_step2_p: "Откройте страницу видео, чтобы посмотреть руководство, следуйте письменным пошаговым примечаниям, копируйте команды одним щелчком мыши и получайте проверенные прямые ссылки.",
    ab_step3_h: "Задайте прямой вопрос, если застряли",
    ab_step3_p: "Все еще сталкиваетесь с ошибкой? Используйте поле вопросов на любой странице видео — оно уведомит меня прямо в Telegram, и я смогу ответить прямо на ваше письмо.",
    ab_creator_title: "О Создателе — Мукунде",
    ab_creator_p: "Привет! Я [[[T1]]]Мукунд[[[/T1]]] — создатель @notgamingplayz и @adventigle. Я делаю короткие, простые руководства по Minecraft PE и Bedrock, пользовательские пакеты пользовательского интерфейса, пакеты текстур и игровые треки. Все в Adventigle открыто, легко и создано для экономии вашего времени.",
    ab_yt_main: "YouTube (основной канал)",
    ab_yt_main_sub: "Учебные пособия по Minecraft PE, пакеты пользовательского интерфейса и исправления →",
    ab_yt_second: "YouTube (Второй канал)",
    ab_yt_second_sub: "Официальный канал Adventigle и дополнительные материалы →",
    ab_ig: "Инстаграм",
    ab_ig_sub: "Обновления, ролики и снимки сообщества →",
    ab_gh: "GitHub",
    ab_gh_sub: "Проекты с открытым исходным кодом и репозиторий Adventigle →",
    e_eyebrow: "404 — Затерянный в пустоте",
    e_h1: "Этот чанк не загрузился.",
    e_p: "Страница, которую вы ищете, перемещена или не существует. Если вы перешли по старой ссылке на видео, вы будете перенаправлены автоматически — или воспользуйтесь кнопками ниже, чтобы вернуться обратно.",
    e_btn1: "← Просмотреть все видео",
    e_btn2: "Об Адвентигле",
    vp_crumb_videos: "Видео",
    vp_notfound_h1: "Видео не найдено",
    vp_notfound_p: "Не удалось найти видео {slug} в content/videos/index.json.",
    vp_back: "← Вернуться к видео",
    vp_downloads_title: "Загрузки и ссылки",
    vp_ask_title: "Задайте вопрос по этому видео",
    vp_ask_sub: "Ваш адрес электронной почты необходим, чтобы я мог ответить вам напрямую. Ваш вопрос адресован прямо мне.",
    vp_reviews_title: "Отзывы к этому видео",
    vp_reviews_empty: "Одобренных отзывов пока нет. Будьте первым, кто оставит обзор этого видео.",
    vp_write_review: "Написать отзыв",
    vp_rating_label: "Ваш рейтинг",
    vp_review_email_label: "Электронная почта",
    vp_review_name_label: "Имя",
    vp_review_body_label: "Ваш отзыв",
    vp_review_body_ph: "Что ты думаешь?",
    vp_send_review: "Отправить отзыв",
    vp_related_title: "Похожие видео",
    vp_guide_title: "Информация и примечания",
    vp_notes_soon: "Скоро появятся заметки — загляните сюда после следующей загрузки.",
    vp_watch_yt: "▶ Смотрите на YouTube",
    vp_copy_link: "🔗 Скопировать ссылку",
    vp_copied: "✓ Скопировано!",
    vp_published: "Опубликовано",
    vp_star_label: "{n} звезда",
    vp_stars_label: "{n} звезд",
    search_placeholder: "Найти {n} видео…"
  },
  ar: { _dir: "rtl", _flag: "🇸🇦", _label: "العربية",
    skip_content: "انتقل إلى المحتوى",
    nav_home: "بيت",
    nav_videos: "فيديوهات",
    nav_about: "عن",
    nav_shortcuts: "الاختصارات",
    nav_menu: "قائمة طعام",
    lang_label: "لغة",
    hero_eyebrow: "ماين كرافت PE وبيدروك",
    hero_title: "اجعل لعبة Minecraft PE الخاصة بك تبدو تمامًا [[[T0]]]المستوى التالي[[[/T0]]].",
    hero_lead: "حزم واجهة المستخدم المخصصة، وحزم النسيج، واختصارات البناء والإصلاحات بنقرة واحدة لـ Bedrock - كل تنزيل وكل خطوة تثبيت تظهر في مقطع فيديو قصير بواسطة @notgamingplayz. دائما مجانا، لا الاشتراك.",
    hero_cta_watch: "تصفح جميع مقاطع الفيديو {n}.",
    hero_cta_yt: "شاهد على يوتيوب",
    stats_videos: "فيديوهات",
    stats_free: "تنزيلات مجانية",
    stats_new: "تحميلات جديدة",
    stats_period: "أسبوعي",
    hero_badge_art: "أحدث الحزم",
    section_latest: "أحدث مقاطع الفيديو",
    section_latest_sub: "كل عملية تحميل وتنزيلاتها ومجتمعها — صفحة واحدة لكل منها.",
    results_zero: "لا توجد مقاطع فيديو متطابقة",
    results_zero_sub: "جرّب كلمة رئيسية مختلفة — أو اسألني على YouTube.",
    card_watch: "شاهد + سؤال وجواب",
    card_notes: "ملحوظات",
    card_reviews: "التعليقات",
    help_title: "هل لديك سؤال؟",
    help_text: "اسأل عن أي فيديو — أو أي شيء آخر متعلق بـ Minecraft PE — وسأرد عليك عبر البريد الإلكتروني. يتم إرسال الأسئلة مباشرة لي.",
    form_email_label: "البريد الإلكتروني الخاص بك",
    form_name_label: "اسم",
    form_optional: "(خياري)",
    form_question_label: "سؤالك",
    form_email_ph: "you@example.com",
    form_question_ph: "اسأل أي شيء عن محتوى Adventigle...",
    btn_send_question: "أرسل السؤال",
    form_status_sending: "إرسال…",
    form_status_wait: "يرجى الانتظار {n}s قبل الإرسال مرة أخرى.",
    form_status_ok_q: "شكرًا! لقد تم إرسال سؤالك - سأرد عليه عبر البريد الإلكتروني.",
    form_status_ok_r: "شكرًا! تم إرسال رأيك للموافقة عليه.",
    form_status_err_q: "مطلوب البريد الإلكتروني والسؤال.",
    form_status_err_r: "يرجى اختيار تصنيف النجوم وكتابة رأيك.",
    form_status_relay: "تعذر الإرسال — عطل في الشبكة. يرجى المحاولة مرة أخرى.",
    footer_brand_text: "مقاطع فيديو Minecraft PE وحزم واجهة المستخدم والنسيج والنصائح والتنزيلات المجانية بواسطة Mukund (@notgamingplayz).",
    footer_nav_language: "لغة",
    footer_nav_youtube: "يوتيوب",
    footer_legal: "© 2026 أدفينتيجل. نظام مرئي مقتبس من نظام التصميم مفتوح المصدر Gumroad (MIT).",
    modal_title: "اختر لغتك",
    modal_sub: "يمكنك تغيير هذا في أي وقت من القائمة أعلاه.",
    modal_gt_note: "💡 تتم ترجمة الأدلة والمراجعات تلقائيًا بواسطة خدمة الترجمة من Google عند اختيار لغة.",
    sc_title: "اختصارات لوحة المفاتيح وأدوات الإنشاء",
    sc_key: "مفتاح",
    sc_action: "فعل",
    sc_row1: "افتح/أغلق نموذج الاختصارات وأدوات الإنشاء",
    sc_row2: "انتقل مباشرة إلى مربع البحث عن الفيديو على الصفحة الرئيسية",
    sc_row3: "افتح نموذج منتقي اللغة",
    sc_row4: "حدد اللغة 1-10 بينما يكون شكل اللغة مفتوحًا",
    sc_row5: "أغلق أي شكل مفتوح أو قم بإلغاء التركيز على مربع البحث",
    ab_eyebrow: "مهمة منشئ المحتوى ومركز الخدمة الذاتية",
    ab_h1: "لماذا بنيت Adventigle",
    ab_p1: "باعتباري منشئ محتوى، لاحظت أن المشتركين غالبًا ما يطرحون أسئلة مهمة في تعليقات YouTube - مثل سبب فشل استيراد حزمة الموارد، أو مكان وجود رابط التنزيل المباشر، أو كيفية إصلاح مشكلة إذن مجلد Android [[[T2]]]data[[[/T2]]] - ثم يضطرون إلى الانتظار لساعات أو حتى أيام للرد.",
    ab_p2: "لقد قمت ببناء Adventigle كمركز معرفة مجاني 100% ذاتي الخدمة، لذلك [[[T1]]]لن تضطر أبدًا إلى انتظار ردي[[[/T1]]]. في أي وقت تواجهك مشكلة، يمكنك القدوم إلى هنا، وقراءة التفاصيل المكتوبة خطوة بخطوة لأي فيديو، والحصول على تنزيلات مباشرة تم اختبارها بدون جدران إعلانية مشبوهة، وحل مشكلات Minecraft PE / Bedrock على الفور. وإذا كنت لا تزال تصطدم بالحائط، فإن سؤالك في أي صفحة يصل مباشرة إلى هاتفي حتى أتمكن من مساعدتك شخصيًا.",
    ab_how_title: "كيفية استخدام هذا الموقع",
    ab_step1_h: "ابحث عن موضوعك",
    ab_step1_p: "اضغط على / في الصفحة الرئيسية أو تصفح مخزن الفيديو للعثور على حزمة واجهة المستخدم أو حزمة النسيج أو البرنامج التعليمي للأوامر أو إصلاح Bedrock الذي تحتاجه.",
    ab_step2_h: "اقرأ الدليل واحصل على التنزيلات",
    ab_step2_p: "افتح صفحة الفيديو لمشاهدة البرنامج التعليمي، واتبع الملاحظات المكتوبة خطوة بخطوة، وانسخ الأوامر بنقرة واحدة، واحصل على الروابط المباشرة التي تم التحقق منها.",
    ab_step3_h: "اطرح سؤالاً مباشرًا إذا علقت",
    ab_step3_p: "لا تزال تواجه خطأ؟ استخدم مربع الأسئلة في أي صفحة فيديو - فهو ينبهني مباشرة على Telegram حتى أتمكن من الرد مباشرة على بريدك الإلكتروني.",
    ab_creator_title: "عن الخالق — موكوند",
    ab_creator_p: "يا! أنا [[[T1]]]Mukund[[[/T1]]] — منشئ @notgamingplayz و@adventigle. أقوم بإنشاء برامج تعليمية قصيرة وبسيطة حول Minecraft PE وBedrock، وحزم واجهة مستخدم مخصصة، وحزم نسيج، ومسارات ألعاب. كل شيء في Adventigle مفتوح وخفيف الوزن ومصمم لتوفير وقتك.",
    ab_yt_main: "يوتيوب (القناة الرئيسية)",
    ab_yt_main_sub: "دروس Minecraft PE وحزم واجهة المستخدم والإصلاحات →",
    ab_yt_second: "يوتيوب (القناة الثانية)",
    ab_yt_second_sub: "قناة Adventigle الرسمية والإضافات →",
    ab_ig: "انستغرام",
    ab_ig_sub: "التحديثات والبكرات ولقطات المجتمع →",
    ab_gh: "جيثب",
    ab_gh_sub: "المشاريع مفتوحة المصدر وAdventigle repo →",
    e_eyebrow: "404 - ضاع في الفراغ",
    e_h1: "لم يتم تحميل هذه القطعة.",
    e_p: "الصفحة التي تبحث عنها قد تم نقلها أو أنها غير موجودة. إذا اتبعت رابط فيديو قديم، فستتم إعادة توجيهك تلقائيًا - أو استخدم الأزرار أدناه للعودة إليه مرة أخرى.",
    e_btn1: "← تصفح جميع مقاطع الفيديو",
    e_btn2: "حول أدفينتيجل",
    vp_crumb_videos: "فيديوهات",
    vp_notfound_h1: "لم يتم العثور على الفيديو",
    vp_notfound_p: "تعذر العثور على الفيديو {slug} في content/videos/index.json.",
    vp_back: "← العودة إلى أشرطة الفيديو",
    vp_downloads_title: "التنزيلات والروابط",
    vp_ask_title: "اطرح سؤالاً حول هذا الفيديو",
    vp_ask_sub: "بريدك الإلكتروني مطلوب حتى أتمكن من الرد عليك مباشرة. سؤالك يذهب مباشرة لي.",
    vp_reviews_title: "تعليقات لهذا الفيديو",
    vp_reviews_empty: "لا توجد مراجعات معتمدة حتى الآن. كن أول من يراجع هذا الفيديو.",
    vp_write_review: "اكتب مراجعة",
    vp_rating_label: "تقييمك",
    vp_review_email_label: "بريد إلكتروني",
    vp_review_name_label: "اسم",
    vp_review_body_label: "رأيك",
    vp_review_body_ph: "ماذا تعتقد؟",
    vp_send_review: "إرسال المراجعة",
    vp_related_title: "مقاطع الفيديو ذات الصلة",
    vp_guide_title: "معلومات وملاحظات",
    vp_notes_soon: "ستتوفر الملاحظات قريبًا - تحقق مرة أخرى بعد التحميل التالي.",
    vp_watch_yt: "◀ شاهد على اليوتيوب",
    vp_copy_link: "🔗انسخ الرابط",
    vp_copied: "✓ منقول!",
    vp_published: "تم النشر",
    vp_star_label: "{ن} نجمة",
    vp_stars_label: "{ن} نجوم",
    search_placeholder: "بحث في {n} من مقاطع الفيديو..."
  }
};

/* ---------- 2. LANGUAGE STATE + TRANSLATION ENGINE ---------- */
/* Picker order: Hinglish (default) -> English -> the rest.
   Hinglish is the site's native voice: its content needs NO translation,
   so selecting it performs zero network calls. Every other language is
   produced by translating the Hinglish/English source strings on demand. */
var LANG_CODES = ["hinglish", "en", "hi", "es", "fr", "de", "ja", "pt", "id", "ru", "ar"];
var DEFAULT_LANG = "hinglish";

/* ISO codes used for date formatting */
var LANG_LOCALE = {
  hinglish: "en-IN", en: "en-GB", hi: "hi-IN", es: "es-ES", fr: "fr-FR",
  de: "de-DE", ja: "ja-JP", pt: "pt-BR", id: "id-ID", ru: "ru-RU", ar: "ar-EG"
};

/* Languages whose long-form content (guides, reviews, video blurbs)
   is authored in Hinglish and therefore needs translation too. */
var LANG_NEEDS_TRANSLATION = {
  hinglish: false, en: true, hi: true, es: true, fr: true, de: true,
  ja: true, pt: true, id: true, ru: true, ar: true
};

/* Google Translate target codes (Hinglish maps to nothing: it is the source).
   The SOURCE language is pinned per target on purpose:
   with sl=auto Google detects the whole batch as one language, and because the
   content is Hinglish (Roman Hindi) it often returns the input unchanged for
   tl=hi. Pinning the source removes that ambiguity.
   - to Hindi we use sl=en so the Roman Hinglish is rendered in Devanagari.
   - every other target uses sl=hi, the actual source language of the content. */
var LANG_GT_SOURCE = {
  en: "hi", hi: "en", es: "hi", fr: "hi", de: "hi",
  ja: "hi", pt: "hi", id: "hi", ru: "hi", ar: "hi"
};

var CURRENT_LANG = DEFAULT_LANG;

function detectLang() {
  try {
    var saved = localStorage.getItem(SITE.storageKey);
    if (saved && I18N[saved]) return saved;
  } catch (e) { /* private mode */ }
  return DEFAULT_LANG;
}

/* Inline markup inside translated strings.
   Tokens "[[[T0]]]" / "[[[/T0]]]" survive translation and are swapped for
   real tags at render time; every other part stays escaped. */

/* Inline markup inside translated strings.
   Each token pair survives translation:
     "[[[T0]]]" ... "[[[/T0]]]"  -> <em> ... </em>
     "[[[T1]]]" ... "[[[/T1]]]"  -> <strong> ... </strong>
     "[[[T2]]]" ... "[[[/T2]]]"  -> <code> ... </code>
   Everything outside the tokens is escaped. */
var I18N_MARKUP_TAGS = {
  T0: ["<em>", "</em>"],
  T1: ["<strong>", "</strong>"],
  T2: ["<code>", "</code>"]
};

function renderI18nMarkup(value) {
  var str = String(value == null ? "" : value);
  if (!/\[\[\[T\d\]\]\]/.test(str)) return null;

  var out = "";
  var rest = str;
  var guard = 0;
  while (guard++ < 30) {
    // find the next opening token
    var best = null;
    for (var tag in I18N_MARKUP_TAGS) {
      var open = "[[[" + tag + "]]]";
      var idx = rest.indexOf(open);
      if (idx !== -1 && (best === null || idx < best.idx)) best = { idx: idx, open: open, tag: tag };
    }
    if (!best) { out += esc(rest); break; }

    var closeTok = "[[[/" + best.tag + "]]]";
    var closeIdx = rest.indexOf(closeTok, best.idx);
    if (closeIdx === -1) { out += esc(rest); break; }

    out += esc(rest.slice(0, best.idx));
    var inner = rest.slice(best.idx + best.open.length, closeIdx);
    out += I18N_MARKUP_TAGS[best.tag][0] + esc(inner) + I18N_MARKUP_TAGS[best.tag][1];
    rest = rest.slice(closeIdx + closeTok.length);
  }
  return out;
}

function t(key) {
  var d = I18N[CURRENT_LANG] || I18N.en;
  return d[key] || I18N.en[key] || key;
}

/* Same as t() but accepts an extra value that replaces {n} */
function tn(key, n) {
  return t(key).replace(/\{n\}/g, String(n));
}

/* Fill {n} placeholders (e.g. "Browse all {n} videos") */
function tNum(key, n) {
  return t(key).replace(/\{n\}/g, String(n));
}

/* ---------- 2b. TRANSLATION ENGINE (Google Translate REST API) ----------
   The old Google Translate *widget* was blocked by the site's own CSP
   (translate-pa.googleapis.com was missing from script-src), so the
   combo never appeared and nothing was ever translated. This engine uses
   the plain REST endpoint instead: no iframe, no widget, no CSP breakage.

   Strings are sent in batches joined by a separator token that survives
   translation, results are cached in localStorage per language, and
   failures fall back to the original source text (never blank). */
var TRANSLATE_ENDPOINT = "https://translate.googleapis.com/translate_a/single";
var TRANSLATE_SEP = "\n\n[[[___SEP___]]]\n\n";
var TRANSLATE_SEP_TOKEN = "[[[___SEP___]]]";
var TRANSLATE_CACHE_PREFIX = "adventigle:mt2:";
var translateCache = {};
var translateInFlight = {};

function translateCacheKey(code, text) {
  var h = 5381, i = text.length;
  while (i) h = (h * 33) ^ text.charCodeAt(--i);
  var source = LANG_GT_SOURCE[code] || "hi";
  return source + ">" + code + "|" + ((h >>> 0).toString(36)) + "|" + text.length;
}

function readTranslateCache(code) {
  if (translateCache[code]) return translateCache[code];
  var store = {};
  try {
    var raw = localStorage.getItem(TRANSLATE_CACHE_PREFIX + code);
    if (raw) store = JSON.parse(raw) || {};
  } catch (e) { /* ignore */ }
  translateCache[code] = store;
  return store;
}

function writeTranslateCache(code) {
  try {
    localStorage.setItem(TRANSLATE_CACHE_PREFIX + code, JSON.stringify(translateCache[code] || {}));
  } catch (e) { /* quota — ignore */ }
}

function gtRequest(code, text) {
  var source = LANG_GT_SOURCE[code] || "hi";
  var url = TRANSLATE_ENDPOINT +
    "?client=gtx&sl=" + encodeURIComponent(source) +
    "&tl=" + encodeURIComponent(code) + "&dt=t&q=" + encodeURIComponent(text);
  return fetch(url)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      return (data[0] || []).map(function (seg) { return seg[0]; }).join("");
    });
}

/* Translate an array of strings to `code`. Always resolves with an array
   of the same length; untranslated entries fall back to the source text.
   Long inputs are split into chunks so one request never exceeds the
   endpoint's URL limit. */
var TRANSLATE_CHUNK_CHARS = 1800;
var TRANSLATE_CHUNK_ITEMS = 20;

function translateStrings(code, texts) {
  if (!code || !texts || !texts.length) return Promise.resolve(texts || []);

  var cache = readTranslateCache(code);
  var out = new Array(texts.length);
  var missing = [];
  var missingIdx = [];

  texts.forEach(function (txt, i) {
    var src = String(txt == null ? "" : txt);
    if (!src) { out[i] = src; return; }
    var ck = translateCacheKey(code, src);
    if (Object.prototype.hasOwnProperty.call(cache, ck)) {
      out[i] = cache[ck];
    } else {
      out[i] = src;            // keep the source text until the translation arrives
      missing.push(src);
      missingIdx.push(i);
    }
  });

  if (!missing.length) return Promise.resolve(out);

  // de-duplicate identical sources inside this batch
  var uniq = [];
  missing.forEach(function (src) {
    if (uniq.indexOf(src) === -1) uniq.push(src);
  });

  // chunk by source length and item count
  var chunks = [];
  var cur = [];
  var curLen = 0;
  uniq.forEach(function (src) {
    if (cur.length && (curLen + src.length > TRANSLATE_CHUNK_CHARS || cur.length >= TRANSLATE_CHUNK_ITEMS)) {
      chunks.push(cur); cur = []; curLen = 0;
    }
    cur.push(src); curLen += src.length + 1;
  });
  if (cur.length) chunks.push(cur);

  var results = {};
  var chain = Promise.resolve();
  chunks.forEach(function (chunk) {
    chain = chain.then(function () {
      return translateChunk(code, chunk).then(function (res) {
        Object.keys(res).forEach(function (k) { results[k] = res[k]; });
      });
    });
  });

  return chain.then(function () {
    return applyTranslations(code, uniq, results, missingIdx, out);
  });
}

/* Translate one chunk of strings. Returns { sourceText: translatedText }. */
function translateChunk(code, chunk) {
  var joined = chunk.join(TRANSLATE_SEP);
  return gtRequest(code, joined).then(function (text) {
    var parts = text.split(TRANSLATE_SEP_TOKEN);
    if (parts.length === chunk.length) {
      var results = {};
      chunk.forEach(function (src, i) { results[src] = parts[i].trim(); });
      return results;
    }
    // Separator got mangled - fall back to one request per string
    var results2 = {};
    return chunk.reduce(function (p, src) {
      return p.then(function () {
        return gtRequest(code, src)
          .then(function (t2) { results2[src] = t2; })
          .catch(function () { results2[src] = src; });
      });
    }, Promise.resolve()).then(function () { return results2; });
  }).catch(function (err) {
    console.warn("Adventigle translation failed for", code, err);
    var results3 = {};
    chunk.forEach(function (src) { results3[src] = src; });
    return results3;
  });
}

function applyTranslations(code, uniq, results, missingIdx, out) {
  var cache = readTranslateCache(code);
  uniq.forEach(function (src) {
    var val = results[src];
    if (typeof val === "string" && val.length) {
      cache[translateCacheKey(code, src)] = val;
    }
  });
  writeTranslateCache(code);

  missingIdx.forEach(function (i) {
    var src = out[i];
    // out[i] currently holds the source text for uncached entries
    var cached = cache[translateCacheKey(code, src)];
    out[i] = (cached && cached.length) ? cached : src;
  });
  return out;
}

/* Translate a single string. */
function translateText(code, text) {
  return translateStrings(code, [text]).then(function (r) { return r[0]; });
}

/* ---------- 2c. APPLY LANGUAGE ---------- */
var translateRunToken = 0;

function applyLang(code, opts) {
  if (!I18N[code]) return;
  opts = opts || {};
  CURRENT_LANG = code;
  try { localStorage.setItem(SITE.storageKey, code); } catch (e) { /* ignore */ }

  document.documentElement.setAttribute("lang", code === "hinglish" ? "hi-Latn" : code);
  document.documentElement.setAttribute("dir", I18N[code]._dir);

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (I18N[code][key] === undefined) return;
    var value = I18N[code][key];
    var html = renderI18nMarkup(value);
    if (html !== null) el.innerHTML = html;
    else el.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-placeholder");
    if (I18N[code][key] !== undefined) el.setAttribute("placeholder", I18N[code][key]);
  });

  var sel = document.getElementById("langSelect");
  if (sel) sel.value = code;
  document.querySelectorAll(".lang-choice").forEach(function (b) {
    b.classList.toggle("is-current", b.getAttribute("data-lang") === code);
  });
  var lbl = document.querySelector(".lang-label");
  if (lbl && I18N[code] && I18N[code]._label) lbl.textContent = I18N[code]._label;

  var modal = document.getElementById("langModal");
  if (modal && !opts.keepOpen) modal.classList.remove("is-open");

  if (typeof window.onPageLanguageChanged === "function") window.onPageLanguageChanged(code);
}

function buildLangButtons() {
  var grid = document.getElementById("langGrid");
  if (!grid) return;
  grid.innerHTML = "";
  LANG_CODES.forEach(function (code) {
    var d = I18N[code];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lang-choice" + (code === CURRENT_LANG ? " is-current" : "");
    btn.setAttribute("data-lang", code);
    var flag = document.createElement("span");
    flag.className = "lang-choice__flag";
    flag.textContent = d._flag;
    var label = document.createElement("span");
    label.textContent = d._label;
    btn.appendChild(flag);
    btn.appendChild(label);
    btn.addEventListener("click", function () { applyLang(code); });
    grid.appendChild(btn);
  });
}

function initLang() {
  CURRENT_LANG = detectLang();

  var seen = null;
  try { seen = localStorage.getItem(SITE.storageKey); } catch (e) { /* ignore */ }
  if (!seen) {
    var modal = document.getElementById("langModal");
    if (modal) modal.classList.add("is-open");
  }
  buildLangButtons();

  applyLang(CURRENT_LANG, { keepOpen: !seen });

  var sel = document.getElementById("langSelect");
  if (sel) {
    sel.value = CURRENT_LANG;
    sel.addEventListener("change", function () { applyLang(sel.value); });
  }

  var modalEl = document.getElementById("langModal");
  if (modalEl) {
    modalEl.addEventListener("click", function (e) {
      if (e.target === modalEl) modalEl.classList.remove("is-open");
    });
    var close = modalEl.querySelector(".close-btn");
    if (close) close.addEventListener("click", function () { modalEl.classList.remove("is-open"); });
  }

  function openModal() {
    var m = document.getElementById("langModal");
    if (m) m.classList.add("is-open");
  }
  var langBtn = document.getElementById("langBtn");
  if (langBtn) langBtn.addEventListener("click", openModal);
  var footerLang = document.getElementById("footerLang");
  if (footerLang) footerLang.addEventListener("click", function (e) { e.preventDefault(); openModal(); });

  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
    });
  }
}

/* ---------- 3. UTILITIES ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHttpsUrl(url) {
  var u = String(url || "").trim();
  return /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : "#";
}

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 75) || "video";
}

function extractYoutubeId(input) {
  var s = String(input || "").trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  var m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : s;
}

function normalizeVideo(v, index) {
  if (!v) return v;
  if (!v.id) v.id = "video-" + (index + 1);
  if (!v.slug) v.slug = slugify(v.title || v.id);
  if (v.youtubeId && !v.watchUrl) {
    v.watchUrl = "https://www.youtube.com/watch?v=" + encodeURIComponent(v.youtubeId);
  }
  return v;
}

function normalizeCatalog(list) {
  return (list || []).map(function (v, idx) { return normalizeVideo(v, idx); });
}

function fmtDate(iso) {
  try {
    var locale = LANG_LOCALE[CURRENT_LANG] || "en-GB";
    return new Date(iso).toLocaleDateString(locale, {
      year: "numeric", month: "short", day: "numeric"
    });
  } catch (e) { return String(iso || ""); }
}

function timeHtml(iso) {
  if (!iso) return "";
  var safeIso = esc(String(iso));
  return '<time datetime="' + safeIso + '">' + esc(fmtDate(iso)) + "</time>";
}

function param(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function jsonFetch(url) {
  return fetch(url).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status + " for " + url);
    return r.text();
  }).then(function (txt) { return JSON.parse(txt); });
}

/* Rate limiting: 60-second cooldown stored in localStorage */
function checkRateLimit() {
  try {
    var last = Number(localStorage.getItem(SITE.rateLimitKey) || "0");
    var now = Date.now();
    if (last && now - last < SITE.rateLimitMs) {
      return Math.ceil((SITE.rateLimitMs - (now - last)) / 1000);
    }
  } catch (e) { /* ignore */ }
  return 0;
}

function recordSubmitTimestamp() {
  try {
    localStorage.setItem(SITE.rateLimitKey, String(Date.now()));
  } catch (e) { /* ignore */ }
}

/* ---------- 4. MINI MARKDOWN PARSER ---------- */
function mdInline(text) {
  var s = esc(text);
  s = s.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; });
  s = s.replace(/\*\*([^*]+)\*\*/g, function (_, b) { return "<strong>" + b + "</strong>"; });
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, function (_, label, url) {
    var safeUrl = safeHttpsUrl(url);
    return '<a href="' + esc(safeUrl) + '" target="_blank" rel="noopener noreferrer">' + label + "</a>";
  });
  return s;
}

function parseMarkdown(src) {
  var lines = String(src || "").replace(/\r\n/g, "\n").split("\n");
  var html = [];
  var i, j, line;

  for (i = 0; i < lines.length; i++) {
    line = lines[i];

    if (/^```/.test(line)) {
      var codeLines = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      html.push("<pre><code>" + esc(codeLines.join("\n")) + "</code></pre>");
      continue;
    }

    var h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      var level = Math.min(h[1].length + 1, 5);
      html.push("<h" + level + ">" + mdInline(h[2]) + "</h" + level + ">");
      continue;
    }

    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) { html.push("<hr>"); continue; }

    if (/^>\s?/.test(line)) {
      var quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      i--;
      html.push("<blockquote><p>" + quoteLines.map(mdInline).join("<br>") + "</p></blockquote>");
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1])) {
      var headCells = line.trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); });
      var tableRows = [];
      i += 2;
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) {
        tableRows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map(function (c) { return c.trim(); }));
        i++;
      }
      i--;
      var tHtml = "<table><thead><tr>";
      headCells.forEach(function (c) { tHtml += "<th>" + mdInline(c) + "</th>"; });
      tHtml += "</tr></thead><tbody>";
      tableRows.forEach(function (row) {
        tHtml += "<tr>";
        row.forEach(function (c) { tHtml += "<td>" + mdInline(c) + "</td>"; });
        tHtml += "</tr>";
      });
      tHtml += "</tbody></table>";
      html.push(tHtml);
      continue;
    }

    if (/^\s*[-*+]\s+/.test(line)) {
      var ulItems = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        ulItems.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      i--;
      html.push("<ul>" + ulItems.map(function (it) { return "<li>" + mdInline(it) + "</li>"; }).join("") + "</ul>");
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      var olItems = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        olItems.push(lines[i].replace(/^\s*\d+[.)]\s+/, ""));
        i++;
      }
      i--;
      html.push("<ol>" + olItems.map(function (it) { return "<li>" + mdInline(it) + "</li>"; }).join("") + "</ol>");
      continue;
    }

    if (/^\s*$/.test(line)) continue;

    var paraLines = [line];
    j = i + 1;
    while (
      j < lines.length &&
      !/^\s*$/.test(lines[j]) &&
      !/^```/.test(lines[j]) &&
      !/^#{1,4}\s/.test(lines[j]) &&
      !/^>\s?/.test(lines[j]) &&
      !/^\s*[-*+]\s+/.test(lines[j]) &&
      !/^\s*\d+[.)]\s+/.test(lines[j]) &&
      !/^\s*\|.+\|\s*$/.test(lines[j]) &&
      !/^\s*(-{3,}|\*{3,})\s*$/.test(lines[j])
    ) {
      paraLines.push(lines[j]);
      j++;
    }
    i = j - 1;
    html.push("<p>" + mdInline(paraLines.join(" ")) + "</p>");
  }

  return html.join("\n");
}

function decorateCodeBlocks(root) {
  $all("pre", root).forEach(function (pre) {
    if (pre.querySelector(".code-copy, .md-copy")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy md-copy";
    btn.textContent = "COPY";
    btn.addEventListener("click", function () {
      var code = pre.querySelector("code");
      var text = code ? code.textContent : "";
      function done() {
        btn.textContent = "COPIED ✓";
        setTimeout(function () { btn.textContent = "COPY"; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
    pre.appendChild(btn);
  });
}

/* ---------- 5. TOASTS ---------- */
function ensureToastStack() {
  var stack = $(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    stack.setAttribute("aria-live", "polite");
    document.body.appendChild(stack);
  }
  return stack;
}

var TOAST_ICONS = { success: "✔", error: "✖", info: "ℹ" };

function showToast(kind, title, message, ms) {
  var stack = ensureToastStack();
  var el = document.createElement("div");
  el.className = "toast toast--" + kind;
  var strong = document.createElement("strong");
  strong.textContent = TOAST_ICONS[kind] + " " + title;
  var span = document.createElement("span");
  span.textContent = message || "";
  el.appendChild(strong);
  el.appendChild(span);
  stack.appendChild(el);
  setTimeout(function () {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.25s";
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 260);
  }, ms || 4200);
}

/* ---------- 6. RELAY (Google Apps Script) ---------- */
/* One-shot nonce per submission (replay protection). */
function relayNonce() {
  try {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    if (window.crypto && window.crypto.getRandomValues) {
      var a = new Uint8Array(16);
      window.crypto.getRandomValues(a);
      return Array.prototype.map.call(a, function (b) {
        return ("0" + b.toString(16)).slice(-2);
      }).join("");
    }
  } catch (e) { /* fall through */ }
  return "n" + Date.now() + Math.floor(Math.random() * 1e9);
}

/* When the page loaded - the relay rejects submissions filled too fast. */
var PAGE_LOADED_AT = Date.now();

function sendToRelay(payload) {
  if (!SITE.appsScriptUrl || SITE.appsScriptUrl.indexOf("https://") !== 0) {
    return Promise.reject(new Error("RELAY_NOT_CONFIGURED"));
  }
  var body = {};
  Object.keys(payload || {}).forEach(function (k) { body[k] = payload[k]; });

  // relay v3 envelope
  // An empty key means "owner has not configured a shared secret yet" -
  // the relay skips the check in that case, so a fresh deploy still works.
  body.key = SITE.relayKey || "";
  body.ts = Date.now();
  body.nonce = relayNonce();
  body.pageLoadedAt = PAGE_LOADED_AT;

  return fetch(SITE.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (data) {
    if (!data || data.ok !== true) {
      throw new Error("RELAY_ERROR:" + (data && data.error ? data.error : "UNKNOWN"));
    }
    return data;
  });
}

/* ---------- 7. SHARED RENDER HELPERS ---------- */
var PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>';

function ytThumb(v) {
  return "https://i.ytimg.com/vi/" + encodeURIComponent(v.youtubeId || "") + "/hqdefault.jpg";
}

function videoHref(v, root) {
  root = root || "";
  var slug = (v && v.slug) ? v.slug : slugify((v && v.title) || (v && v.id) || "");
  return root + "video.html?v=" + encodeURIComponent(slug);
}

function starString(n) {
  n = Number(n) || 0;
  var s = "";
  for (var i = 1; i <= 5; i++) s += (i <= n) ? "★" : '<span class="star--empty">★</span>';
  return s;
}

/* Surface the real relay failure instead of hiding it behind a generic
   "network hiccup". The deployed Apps Script answers {"ok":false,"error":"..."}
   and sendToRelay turns that into an Error with message "RELAY_ERROR:<code>". */
function relayMessage(err) {
  if (!err) return t("form_status_relay");
  var msg = String(err.message || "");
  if (msg === "RELAY_NOT_CONFIGURED") {
    return "The form isn't connected yet — the creator needs to set the Apps Script URL.";
  }
  var m = msg.match(/^RELAY_ERROR:(.*)$/);
  if (m) {
    var code = m[1];
    if (code === "MISSING_FIELDS") {
      return "The relay rejected this submission as incomplete (MISSING_FIELDS). " +
             "Please add your email below and send again.";
    }
    if (code === "RATE_LIMITED") {
      return "Too many messages sent from this device. Please wait a few minutes and try again.";
    }
    if (code === "STALE_REQUEST" || code === "REPLAY" || code === "BAD_NONCE") {
      return "This message looked stale (security check). Please reload the page and send again.";
    }
    if (code === "TOO_FAST" || code === "SPAM") {
      return "That was sent a little too quickly. Please try again in a moment.";
    }
    if (code === "DUPLICATE") {
      return "You already sent this exact message. No need to send it again.";
    }
    if (code === "UNAUTHORIZED") {
      return "The relay rejected this submission (UNAUTHORIZED). The creator needs to re-check the shared secret.";
    }
    if (code === "PAYLOAD_TOO_LARGE" || code === "BAD_JSON" || code === "BAD_EMAIL") {
      return "The relay rejected this submission (" + code + "). Please shorten your message and try again.";
    }
    return "The relay rejected this submission (" + code + "). Please try again.";
  }
  var h = msg.match(/^HTTP (\d+)/);
  if (h) {
    return "The relay is not reachable right now (HTTP " + h[1] + "). Please try again in a moment.";
  }
  return t("form_status_relay");
}

function setFormStatus(el, state, msg) {
  if (!el) return;
  el.dataset.state = state || "";
  el.textContent = msg || "";
}

/* Parse "1m 56s" or "0m 50s" to ISO 8601 duration "PT1M56S" */
function isoDuration(durStr) {
  if (!durStr) return undefined;
  var m = String(durStr).match(/(?:(\d+)\s*m)?\s*(?:(\d+)\s*s)?/i);
  if (!m || (!m[1] && !m[2])) return undefined;
  var mins = Number(m[1] || 0);
  var secs = Number(m[2] || 0);
  return "PT" + (mins ? mins + "M" : "") + (secs ? secs + "S" : (!mins ? "0S" : ""));
}

/* Dynamically inject Schema.org VideoObject JSON-LD into <head> */
function injectVideoSchema(data) {
  var existing = document.getElementById("videoJsonLd");
  if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
  var schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": data.title,
    "description": data.description || data.topic || data.title,
    "thumbnailUrl": [ytThumb(data)],
    "uploadDate": data.date ? (data.date + "T00:00:00Z") : new Date().toISOString(),
    "embedUrl": "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(data.youtubeId || ""),
    "contentUrl": data.watchUrl || ("https://www.youtube.com/watch?v=" + encodeURIComponent(data.youtubeId || "")),
    "author": {
      "@type": "Person",
      "name": SITE.creator,
      "url": SITE.channelUrl
    }
  };
  var isoDur = isoDuration(data.duration);
  if (isoDur) schema.duration = isoDur;

  var script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "videoJsonLd";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/* Detect which relay version is deployed. v2 = review works without an
   email; v1 = the older deployment that demanded one. The site behaves
   accordingly instead of guessing. */
var relayVersion = null;
function detectRelayVersion() {
  if (relayVersion !== null) return Promise.resolve(relayVersion);
  if (!SITE.appsScriptUrl || SITE.appsScriptUrl.indexOf("https://") !== 0) {
    relayVersion = "unknown";
    return Promise.resolve(relayVersion);
  }
  return fetch(SITE.appsScriptUrl)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      // v2/v3 report a "version" field. Anything else is the old v1 relay,
      // which required an email on reviews.
      relayVersion = (d && d.version) ? String(d.version) : "1";
      return relayVersion;
    })
    .catch(function () {
      relayVersion = "unknown";
      return relayVersion;
    });
}

/* Wire a question form (email + name + body) with 60s rate limit cooldown. */
function wireQuestionForm(form, opts) {
  if (!form) return;
  var status = form.querySelector(".form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var waitSec = checkRateLimit();
    if (waitSec > 0) {
      setFormStatus(status, "err", t("form_status_wait").replace("{n}", waitSec));
      return;
    }
    var emailEl = form.querySelector('[name="email"]');
    var nameEl = form.querySelector('[name="name"]');
    var bodyEl = form.querySelector('[name="body"]');
    var hpEl = form.querySelector('[name="company"]');
    var email = (emailEl && emailEl.value || "").trim();
    var name = (nameEl && nameEl.value || "").trim();
    var text = (bodyEl && bodyEl.value || "").trim();
    if (hpEl && hpEl.value) return; // honeypot
    if (!email || !text) { setFormStatus(status, "err", t("form_status_err_q")); return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    setFormStatus(status, "", t("form_status_sending"));
    sendToRelay({
      type: "question",
      videoId: (opts && opts.videoId) || "general",
      videoSlug: (opts && opts.videoSlug) || (opts && opts.videoId) || "general",
      videoTitle: (opts && opts.videoTitle) || "General question",
      name: name,
      email: email,
      text: text,
      page: location.href,
      lang: CURRENT_LANG
    }).then(function () {
      recordSubmitTimestamp();
      setFormStatus(status, "ok", t("form_status_ok_q"));
      form.reset();
    }).catch(function (err) {
      setFormStatus(status, "err", relayMessage(err));
    }).then(function () { if (btn) btn.disabled = false; });
  });
}

/* Wire a review form (star rating + name + body, optional email) with 60s rate limit cooldown. */
function wireReviewForm(form, opts) {
  if (!form) return;
  var status = form.querySelector(".form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var waitSec = checkRateLimit();
    if (waitSec > 0) {
      setFormStatus(status, "err", "Please wait " + waitSec + "s before submitting again.");
      return;
    }
    var ratingEl = form.querySelector('input[name="rating"]:checked');
    var emailEl = form.querySelector('[name="email"]');
    var nameEl = form.querySelector('[name="name"]');
    var bodyEl = form.querySelector('[name="body"]');
    var hpEl = form.querySelector('[name="company"]');
    var rating = ratingEl ? Number(ratingEl.value) : 0;
    var email = (emailEl && emailEl.value || "").trim();
    var name = (nameEl && nameEl.value || "").trim();
    var text = (bodyEl && bodyEl.value || "").trim();
    if (hpEl && hpEl.value) return;
    if (!rating || !text) { setFormStatus(status, "err", t("form_status_err_r")); return; }
    // Relay v1 (old deployment) rejects reviews without an email.
    if (relayVersion === "1" && !email) {
      setFormStatus(status, "err", "This review needs your email before it can be sent — please fill the email field.");
      var emailField = form.querySelector('[name="email"]');
      if (emailField) emailField.focus();
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    setFormStatus(status, "", t("form_status_sending"));
    sendToRelay({
      type: "review",
      videoId: (opts && opts.videoId) || "general",
      videoSlug: (opts && opts.videoSlug) || (opts && opts.videoId) || "general",
      videoTitle: (opts && opts.videoTitle) || "",
      rating: rating,
      name: name,
      email: email,
      text: text,
      page: location.href,
      lang: CURRENT_LANG
    }).then(function () {
      recordSubmitTimestamp();
      setFormStatus(status, "ok", t("form_status_ok_r"));
      form.reset();
    }).catch(function (err) {
      setFormStatus(status, "err", relayMessage(err));
    }).then(function () { if (btn) btn.disabled = false; });
  });
}

/* ---------- UI EXTRAS ---------- */
function initReveal(els) {
  els = els || $all(".video-card, .help-cta, .hero-copy, .hero-art, .step-card, .social-card, .mission-card");
  if (!els.length || !("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -40px 0px", threshold: 0.04 });
  els.forEach(function (el, i) {
    if (el.classList.contains("reveal")) return;
    el.classList.add("reveal");
    el.style.transitionDelay = Math.min(i % 8, 6) * 45 + "ms";
    io.observe(el);
  });
}

function initUiExtras() {
  var bar = document.createElement("div");
  bar.className = "scroll-progress";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  var top = document.createElement("button");
  top.type = "button";
  top.className = "to-top";
  top.setAttribute("aria-label", "Back to top");
  top.title = "Back to top";
  top.textContent = "↑";
  top.addEventListener("click", function () {
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
  });
  document.body.appendChild(top);

  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    top.classList.toggle("is-visible", h.scrollTop > 420);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function renderHero(catalog) {
  var countEl = document.getElementById("heroCount");
  if (countEl) countEl.textContent = catalog.length;
  var cta = document.getElementById("heroCta");
  if (cta) cta.textContent = tn("hero_cta_watch", catalog.length);
  ["heroShot1", "heroShot2", "heroShot3"].forEach(function (id, i) {
    var img = document.getElementById(id);
    if (img && catalog[i]) img.src = ytThumb(catalog[i]);
  });
}

/* ---------- 8. INDEX PAGE ---------- */
function initIndexPage() {
  var grid = $("#videoGrid");
  if (!grid) return;

  var catalog = [];
  var query = "";
  var titleMap = {};

  function cardHtml(v) {
    var durBadge = v.duration ? '<span class="duration-badge">' + esc(v.duration) + "</span>" : "";
    var title = titleMap[v.title] || v.title;
    return '<a class="card video-card" href="' + esc(videoHref(v)) + '" data-category="' + esc(v.category || "") + '">' +
      '<div class="thumb"><img src="' + esc(ytThumb(v)) + '" alt="' + esc(title) + '" width="480" height="270" loading="lazy">' +
      durBadge +
      '<span class="play" aria-hidden="true">' + PLAY_SVG + "</span></div>" +
      '<div class="body"><h3>' + esc(title) + "</h3>" +
      '<div class="meta"><span class="cat">' + esc(v.categoryLabel || "") + "</span>" +
      '<span aria-hidden="true">·</span>' + timeHtml(v.date) + "</div>" +
      "</div></a>";
  }

  function renderGrid() {
    var q = query.trim().toLowerCase();
    var list = catalog.filter(function (v) {
      if (!q) return true;
      var hay = (v.title + " " + (v.topic || "") + " " + (v.categoryLabel || "") + " " + (v.keywords || []).join(" ")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (!list.length) {
      grid.innerHTML = '<p class="muted">' + esc(t("results_zero")) + " " + esc(query) + ". " + esc(t("results_zero_sub")) + "</p>";
      return;
    }
    grid.innerHTML = list.map(cardHtml).join("");
    initReveal($all(".video-card", grid));
  }

  /* Translate every video title on the page in one batch, then re-render. */
  function translateTitles() {
    if (!LANG_NEEDS_TRANSLATION[CURRENT_LANG] || !catalog.length) {
      titleMap = {};
      renderGrid();
      return Promise.resolve();
    }
    var titles = catalog.map(function (v) { return v.title; });
    return translateStrings(CURRENT_LANG, titles).then(function (arr) {
      var map = {};
      arr.forEach(function (tr, i) { map[catalog[i].title] = tr; });
      titleMap = map;
      renderGrid();
    });
  }

  wireQuestionForm($("#question-form"), { videoId: "general", videoSlug: "general", videoTitle: "General question" });

  jsonFetch(SITE.apiBase + "index.json").then(function (data) {
    catalog = normalizeCatalog((data && data.videos) || []);
    if (!catalog.length) { grid.innerHTML = '<p class="muted">' + esc(t("results_zero")) + "</p>"; return; }

    catalog.sort(function (a, b) {
      var da = a.date ? new Date(a.date).getTime() : 0;
      var db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    renderHero(catalog);

    var searchWrap = document.createElement("div");
    searchWrap.className = "search-row";
    searchWrap.innerHTML = '<input type="search" id="videoSearch" class="video-search" ' +
      'placeholder="' + esc(tn("search_placeholder", catalog.length)) + '" aria-label="Search videos" autocomplete="off">';
    grid.parentNode.insertBefore(searchWrap, grid);
    var searchEl = document.getElementById("videoSearch");
    if (searchEl) searchEl.addEventListener("input", function () { query = searchEl.value; renderGrid(); });

    renderGrid();
    return translateTitles();
  }).catch(function (err) {
    console.error(err);
    grid.innerHTML = '<p class="muted">content/videos/index.json failed — ' + esc(err.message) + "</p>";
  });

  /* Re-render chrome + titles when the visitor switches language. */
  window.onPageLanguageChanged = function () {
    var countEl = document.getElementById("heroCount");
    if (countEl && catalog.length) countEl.textContent = catalog.length;
    var cta = document.getElementById("heroCta");
    if (cta && catalog.length) cta.textContent = tn("hero_cta_watch", catalog.length);
    var searchEl = document.getElementById("videoSearch");
    if (searchEl && catalog.length) searchEl.setAttribute("placeholder", tn("search_placeholder", catalog.length));
    translateTitles();
  };
}

/* ---------- 9. VIDEO PAGE ---------- */
function initVideoPage() {
  var shell = $("#videoApp");
  if (!shell) return;

  var videoId = window.__VIDEO_ID__ || param("id");
  var videoSlug = window.__VIDEO_SLUG__ || param("v");
  var currentVideo = null;
  var reviews = [];
  var catalog = [];
  var guideMd = "";
  var renderToken = 0;

  /* Text that exists only in Hinglish and must be translated for
     non-Hinglish languages: video title, description, guide body,
     review bodies and resource names. */
  function trItems(data) {
    var items = [];
    if (data) {
      if (data.title) items.push(data.title);
      if (data.description) items.push(data.description);
      if (data.topic) items.push(data.topic);
    }
    (data && data.downloads ? data.downloads : []).forEach(function (d) {
      if (d.name) items.push(d.name);
      if (d.note) items.push(d.note);
    });
    if (guideMd) items.push(guideMd);
    reviews.forEach(function (r) { if (r.text) items.push(r.text); });
    return items;
  }

  /* Translate every Hinglish string of this page in one batch and
     return a lookup map (source -> translated). */
  function translatePage(data) {
    var items = trItems(data);
    if (!items.length) return Promise.resolve({});
    return translateStrings(CURRENT_LANG, items).then(function (arr) {
      var map = {};
      arr.forEach(function (v, i) { map[items[i]] = v; });
      return map;
    });
  }

  function invalid() {
    shell.innerHTML =
      '<section class="section"><div class="container">' +
      '<nav class="crumbs small muted"><a href="' + SITE_ROOT + 'index.html">' + esc(t("vp_crumb_videos")) + '</a><span aria-hidden="true">/</span><span>Not found</span></nav>' +
      "<h1>" + esc(t("vp_notfound_h1")) + "</h1>" +
      '<p class="muted">' + esc(t("vp_notfound_p").replace("{slug}", videoSlug || videoId || "?")) + "</p>" +
      '<a class="btn btn--primary" href="' + SITE_ROOT + 'index.html">' + esc(t("vp_back")) + "</a>" +
      "</div></section>";
  }

  function resourcesHtml(data, tr) {
    if (!data.downloads || !data.downloads.length) return "";
    var pick = function (s) { return (tr && s && tr[s]) || s; };
    var rows = data.downloads.map(function (d) {
      var safeUrl = safeHttpsUrl(d.url);
      var iconHtml = d.icon ? '<span class="resource-icon" aria-hidden="true">' + esc(d.icon) + "</span>" : "";
      var metaParts = [d.type || "Link"];
      if (d.size) metaParts.push(d.size);
      if (d.note) metaParts.push(pick(d.note));
      var name = pick(d.name);
      return '<li class="card resource-row"><div class="resource-main">' +
        iconHtml +
        '<div><a class="resource-label" href="' + esc(safeUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(name) + "</a>" +
        '<p class="small muted resource-note">' + esc(metaParts.join(" · ")) + "</p></div>" +
        '</div><span class="chip">' + esc((d.type || "link").toLowerCase()) + "</span></li>";
    }).join("");
    return '<section class="resources"><h2>' + esc(t("vp_downloads_title")) + '</h2><ul class="resource-list">' + rows + "</ul></section>";
  }

  function askHtml(data) {
    return '<section class="ask"><h2>' + esc(t("vp_ask_title")) + "</h2>" +
      '<p class="muted small">' + esc(t("vp_ask_sub")) + "</p>" +
      '<form class="ask-form" novalidate>' +
        '<input type="hidden" name="video_id" value="' + esc(data.id) + '">' +
        '<div class="ask-grid">' +
          '<div class="field"><label for="q-email">' + esc(t("form_email_label")) + ' <span aria-hidden="true">*</span></label><input id="q-email" name="email" type="email" required autocomplete="email" placeholder="' + esc(t("form_email_ph")) + '"></div>' +
          '<div class="field"><label for="q-name">' + esc(t("form_name_label")) + ' <span class="muted small">' + esc(t("form_optional")) + '</span></label><input id="q-name" name="name" type="text" maxlength="80" autocomplete="name"></div>' +
        "</div>" +
        '<div class="field"><label for="q-body">' + esc(t("form_question_label")) + ' <span aria-hidden="true">*</span></label><textarea id="q-body" name="body" required maxlength="2000" placeholder="' + esc(t("form_question_ph")) + '"></textarea></div>' +
        '<input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' +
        '<button class="btn btn--primary" type="submit">' + esc(t("btn_send_question")) + "</button>" +
        '<p class="form-status small" role="status" aria-live="polite"></p>' +
      "</form></section>";
  }

  function reviewFormHtml(data) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      var starLabel = i > 1 ? tn("vp_stars_label", i) : tn("vp_star_label", i);
      stars += '<label><input type="radio" name="rating" value="' + i + '" required>' +
        '<span aria-hidden="true">★</span><span class="sr-only">' + esc(starLabel) + "</span></label>";
    }
    return '<details class="review-form-wrap"><summary class="btn btn--ghost btn--sm">' + esc(t("vp_write_review")) + "</summary>" +
      '<form class="review-form" novalidate>' +
        '<input type="hidden" name="video_id" value="' + esc(data.slug || data.id) + '">' +
        '<fieldset class="rating-field"><legend>' + esc(t("vp_rating_label")) + ' <span aria-hidden="true">*</span></legend><div class="rating">' + stars + "</div></fieldset>" +
        '<div class="field"><label for="r-email">' + esc(t("vp_review_email_label")) + ' <span class="muted small">' + esc(t("form_optional")) + '</span></label><input id="r-email" name="email" type="email" autocomplete="email" placeholder="' + esc(t("form_email_ph")) + '"></div>' +
        '<div class="field"><label for="r-name">' + esc(t("vp_review_name_label")) + ' <span class="muted small">' + esc(t("form_optional")) + '</span></label><input id="r-name" name="name" type="text" maxlength="80" autocomplete="name"></div>' +
        '<div class="field"><label for="r-body">' + esc(t("vp_review_body_label")) + ' <span aria-hidden="true">*</span></label><textarea id="r-body" name="body" required maxlength="1200" placeholder="' + esc(t("vp_review_body_ph")) + '"></textarea></div>' +
        '<input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' +
        '<button class="btn btn--primary" type="submit">' + esc(t("vp_send_review")) + "</button>" +
        '<p class="form-status small" role="status" aria-live="polite"></p>' +
      "</form></details>";
  }

  function renderReviews(tr) {
    var list = $("#reviews-list");
    var empty = $("#reviews-empty");
    if (!list || !currentVideo) return;
    var mine = reviews.filter(function (r) {
      return r.videoId === currentVideo.id || r.videoId === currentVideo.slug;
    });
    if (!mine.length) {
      list.innerHTML = "";
      if (empty) { empty.hidden = false; empty.textContent = t("vp_reviews_empty"); }
      return;
    }
    if (empty) empty.hidden = true;
    var pick = function (s) { return (tr && s && tr[s]) || s; };
    list.innerHTML = mine.map(function (r) {
      return '<article class="review-item"><div class="stars" aria-label="' + Number(r.rating) + ' out of 5">' + starString(r.rating) + "</div>" +
        '<p class="review-body">' + esc(pick(r.text)) + "</p>" +
        '<p class="small muted review-by">' + esc(r.author || "Anonymous") + (r.date ? " · " + timeHtml(r.date) : "") + "</p></article>";
    }).join("");
  }

  function renderRelated(data, tr) {
    var box = $("#relatedList");
    if (!box) return;
    var others = catalog.filter(function (v) { return v.id !== data.id && v.slug !== data.slug; });
    var same = others.filter(function (v) { return v.category === data.category; });
    var rest = others.filter(function (v) { return v.category !== data.category; });
    var picks = same.concat(rest).slice(0, 6);
    var pick = function (s) { return (tr && s && tr[s]) || s; };
    box.innerHTML = picks.map(function (v) {
      var title = pick(v.title);
      return '<a class="related-item" href="' + esc(videoHref(v, SITE_ROOT)) + '">' +
        '<img src="' + esc(ytThumb(v)) + '" alt="' + esc(title) + '" width="160" height="90" loading="lazy">' +
        "<div><h3>" + esc(title) + "</h3>" +
        '<span class="small muted">' + esc(v.categoryLabel || "") + (v.duration ? " · " + esc(v.duration) : "") + "</span></div></a>";
    }).join("");
  }

  function fetchGuideMarkdown(data) {
    var slugUrl = SITE.apiBase + encodeURIComponent(data.slug) + ".md";
    var idUrl = SITE.apiBase + encodeURIComponent(data.id) + ".md";
    return fetch(slugUrl).then(function (r) {
      if (r.ok) return r.text();
      if (data.id && data.id !== data.slug) {
        return fetch(idUrl).then(function (r2) {
          if (!r2.ok) throw new Error("HTTP " + r2.status);
          return r2.text();
        });
      }
      throw new Error("HTTP " + r.status);
    });
  }

  /* Strip redundant top # Title and duplicate opening description paragraph from guide Markdown */
  function cleanGuideMarkdown(rawMd, data) {
    var lines = String(rawMd || "").replace(/\r\n/g, "\n").split("\n");
    while (lines.length && !lines[0].trim()) lines.shift();
    if (lines.length && /^#\s+/.test(lines[0])) {
      lines.shift();
      while (lines.length && !lines[0].trim()) lines.shift();
    }
    if (lines.length && !/^#/.test(lines[0]) && data && data.description) {
      var firstParaPlain = lines[0].replace(/[*_`]/g, "").trim();
      var descPlain = String(data.description).replace(/[*_`]/g, "").trim();
      if (firstParaPlain && descPlain && firstParaPlain.slice(0, 45) === descPlain.slice(0, 45)) {
        lines.shift();
        while (lines.length && !lines[0].trim()) lines.shift();
      }
    }
    return lines.join("\n");
  }

  function render(data, tr) {
    var token = ++renderToken;
    currentVideo = data;
    var pick = function (s) { return (tr && s && tr[s]) || s; };
    var title = pick(data.title);
    document.title = title + " — Adventigle";
    injectVideoSchema(data);

    var ytSrc = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(data.youtubeId) + "?rel=0";

    var tags = '<span class="chip chip--active">' + esc(data.categoryLabel || "") + "</span>";
    if (data.duration) {
      tags += '<span class="chip">⏱ ' + esc(data.duration) + "</span>";
    }
    (data.keywords || []).forEach(function (k) { tags += '<span class="chip">#' + esc(k) + "</span>"; });

    var desc = pick(data.description || data.topic || "");
    var watchHref = safeHttpsUrl(data.watchUrl);

    shell.innerHTML =
      '<section class="section"><div class="container">' +
        '<nav class="crumbs small muted" aria-label="Breadcrumb">' +
          '<a href="' + SITE_ROOT + 'index.html">' + esc(t("vp_crumb_videos")) + '</a>' +
          '<span aria-hidden="true">/</span><span>' + esc(data.categoryLabel || "") + "</span>" +
        "</nav>" +
        '<div class="detail">' +
          '<div class="detail-main">' +
            '<div class="player"><iframe src="' + esc(ytSrc) + '" title="' + esc(title) + '" loading="lazy" ' +
              'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
            '<header class="detail-head">' +
              '<div class="detail-tags">' + tags + "</div>" +
              "<h1>" + esc(title) + "</h1>" +
              '<p class="small muted detail-date">' + esc(t("vp_published")) + ' ' + timeHtml(data.date) + (data.duration ? ' · <span class="mono">' + esc(data.duration) + "</span>" : "") + "</p>" +
              '<div class="detail-actions">' +
                (watchHref !== "#" ? '<a class="btn btn--ghost btn--sm" href="' + esc(watchHref) + '" target="_blank" rel="noopener noreferrer">' + esc(t("vp_watch_yt")) + "</a>" : "") +
                '<button type="button" class="btn btn--ghost btn--sm" id="copyLink">' + esc(t("vp_copy_link")) + "</button>" +
              "</div>" +
            "</header>" +
            '<div class="prose"><p>' + esc(desc) + "</p></div>" +
            '<section class="guide" id="guideBlock"><div class="loader"><div class="box"></div></div></section>' +
            resourcesHtml(data, tr) +
            askHtml(data) +
            '<section class="review-block"><h2>' + esc(t("vp_reviews_title")) + "</h2>" +
              '<div id="reviews-list" class="review-list"></div>' +
              '<p id="reviews-empty" class="muted small" hidden>' + esc(t("vp_reviews_empty")) + "</p>" +
              reviewFormHtml(data) +
            "</section>" +
          "</div>" +
          '<aside class="detail-aside"><h2>' + esc(t("vp_related_title")) + '</h2><div class="related-list" id="relatedList"></div></aside>' +
        "</div>" +
      "</div></section>";

    renderRelated(data, tr);
    renderReviews(tr);
    wireQuestionForm($(".ask-form"), { videoId: data.id, videoSlug: data.slug, videoTitle: data.title });
    wireReviewForm($(".review-form"), { videoId: data.id, videoSlug: data.slug, videoTitle: data.title });
    initReveal($all(".resources, .ask, .review-block, .detail-aside", shell));

    var copyBtn = document.getElementById("copyLink");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = location.href;
        var copyLabel = t("vp_copy_link");
        var doneLabel = t("vp_copied");
        function done() {
          copyBtn.textContent = doneLabel;
          setTimeout(function () { copyBtn.textContent = copyLabel; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () { window.prompt("Copy this link:", url); });
        } else {
          window.prompt("Copy this link:", url);
        }
      });
    }

    fetchGuideMarkdown(data)
      .then(function (text) {
        guideMd = text;
        var box = $("#guideBlock");
        if (!box || token !== renderToken) return;
        var cleanedMd = cleanGuideMarkdown(text, data);
        var mdPromise = LANG_NEEDS_TRANSLATION[CURRENT_LANG]
          ? translateText(CURRENT_LANG, cleanedMd)
          : Promise.resolve(cleanedMd);
        return mdPromise.then(function (md) {
          if (token !== renderToken) return;
          box.innerHTML = "<h2>" + esc(t("vp_guide_title")) + '</h2><div class="md-body">' + parseMarkdown(md) + "</div>";
          decorateCodeBlocks(box);
        });
      })
      .catch(function () {
        var box = $("#guideBlock");
        if (box && token === renderToken) box.innerHTML = '<div class="md-note">' + esc(t("vp_notes_soon")) + "</div>";
      });
  }

  Promise.all([
    jsonFetch(SITE.apiBase + "index.json"),
    jsonFetch(SITE_ROOT + "content/reviews.json").catch(function () { return { reviews: [] }; })
  ]).then(function (res) {
    catalog = normalizeCatalog((res[0] && res[0].videos) || []);
    reviews = (res[1] && res[1].reviews) || [];
    var found = catalog.filter(function (v) {
      if (videoSlug && v.slug === videoSlug) return true;
      if (videoId && (v.id === videoId || v.slug === videoId)) return true;
      return false;
    })[0];
    if (!found) {
      invalid();
      return;
    }
    return fetchGuideMarkdown(found).then(function (md) { guideMd = md; }).catch(function () { guideMd = ""; })
      .then(function () { return translatePage(found); })
      .then(function (tr) { render(found, tr); });
  }).catch(function (err) {
    console.error(err);
    invalid();
  });

  window.onPageLanguageChanged = function () {
    if (!currentVideo) { invalid(); return; }
    translatePage(currentVideo).then(function (tr) { render(currentVideo, tr); });
  };
}

/* ---------- 10. SHORTCUTS MODAL ---------- */function initShortcuts() {
  var scModal = document.getElementById("shortcutsModal");
  var langModal = document.getElementById("langModal");

  function openShortcutsModal() {
    if (scModal) scModal.classList.add("is-open");
  }
  function closeShortcutsModal() {
    if (scModal) scModal.classList.remove("is-open");
  }

  $all("#footerShortcuts, [data-open-shortcuts]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openShortcutsModal();
    });
  });

  if (scModal) {
    scModal.addEventListener("click", function (e) {
      if (e.target === scModal) closeShortcutsModal();
    });
    var closeBtn = scModal.querySelector(".close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeShortcutsModal);
  }


  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    var t = e.target;
    var tag = (t && t.tagName || "").toLowerCase();
    var typing = !!(t && (tag === "input" || tag === "textarea" || tag === "select" || t.isContentEditable));
    var langOpen = !!(langModal && langModal.classList.contains("is-open"));
    var scOpen = !!(scModal && scModal.classList.contains("is-open"));

    if (e.key === "Escape") {
      if (langOpen) langModal.classList.remove("is-open");
      if (scOpen) closeShortcutsModal();
      if (typing && t && typeof t.blur === "function") t.blur();
      return;
    }

    if (langOpen) {
      if (/^[0-9]$/.test(e.key)) {
        var idx = e.key === "0" ? 9 : Number(e.key) - 1;
        var choices = $all(".lang-choice", langModal);
        if (choices[idx]) { e.preventDefault(); choices[idx].click(); }
      }
      return;
    }

    if (typing || e.repeat) return;

    if (e.key === "?") {
      e.preventDefault();
      if (scOpen) closeShortcutsModal();
      else openShortcutsModal();
      return;
    }

    if (e.key === "/") {
      var search = document.getElementById("videoSearch");
      if (search && document.activeElement !== search) {
        e.preventDefault();
        search.focus();
      }
      return;
    }

    if (e.key === "l" || e.key === "L") {
      if (langModal) {
        e.preventDefault();
        langModal.classList.add("is-open");
      }
    }
  });
}

/* ---------- 11. BOOT ---------- */
function bootAdventigle() {
  if (window.__ADVENTIGLE_BOOTED__) return;
  window.__ADVENTIGLE_BOOTED__ = true;
  detectRelayVersion();
  if (!SITE.relayKey || SITE.relayKey.indexOf("PASTE_") === 0) {
    console.warn("[Adventigle] SITE.relayKey is not set. Set it to the same value as " +
                 "the relay's SHARED_SECRET Script Property to enable the shared-secret check.");
  }
  initLang();
  initUiExtras();
  initIndexPage();
  initVideoPage();
  initShortcuts();
  initReveal();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootAdventigle);
} else {
  bootAdventigle();
}
