/* ============================================================
   Adventigle — Community Hub
   app.js — front-end brain for index.html + video.html (v2)

   Sections:
     0. CONFIG
     1. I18N dictionary (10 languages) — UI chrome only;
        long content is translated by Google Translate.
     2. Language state + first-visit modal + Google Translate hook
     3. Utilities
     4. Markdown parser + code copy buttons
     5. Toasts
     6. Relay (Google Apps Script)
     7. Index page
     8. Video page (player, downloads, notes, reviews, Q&A)
     9. Boot
   ============================================================ */
"use strict";

/* ---------- 0. CONFIG ---------- */
/* Site-root prefix. Root pages leave this empty; nested pages such as
   video/<slug>/index.html set window.__SITE_ROOT__ = "../../" so every
   relative asset + content path resolves back to the site root. */
var SITE_ROOT = (typeof window !== "undefined" && window.__SITE_ROOT__) || "";

var SITE = {
  channel: "NotGamingPlayz",
  creator: "Mukund",
  handle: "@notgamingplayz",
  channelUrl: "https://www.youtube.com/@notgamingplayz",
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbw-Z7-i5ccbZ4glfL1LREr_e5hGP8k9Bi2FNMzIEf5KYrst1Wb04W3YznLIM2fVx_4/exec",
  storageKey: "adventigle:lang",
  apiBase: SITE_ROOT + "content/videos/"
};

/* ---------- 1. I18N (UI chrome) ---------- */
var I18N = {
  en: { _dir: "ltr", _flag: "🇬🇧", _label: "English",
    nav_home: "Home",
    brand_sub: "Creator Knowledge & Q&A Hub",
    hero_badge: "VERIFIED CREATOR PLATFORM",
    hero_title1: "Got questions about our videos?",
    hero_title2: "Get Direct Answers",
    hero_and: "&",
    hero_title3: "Topic Notes.",
    hero_desc: "Play the maps. Grab the packs. Steal the commands. Every download, every guide and every answer from @notgamingplayz — free forever. No login, no ads, no tracking.",
    hero_cta_watch: "Browse the Vault", hero_cta_yt: "Watch on YouTube",
    stats_videos: "Videos", stats_downloads: "Packs", stats_reviews: "Reviews", stats_qa: "Answers",
    stats_guides: "Guides", stats_langs: "Languages",
    hero_panel_title: "📊 LIVE FROM THE VAULT",
    hero_panel_sub: "Numbers update straight from the Git content store — no databases, no APIs, nothing to hack.",
    ticker_items: "100% FREE FOREVER — NO ADS — NO LOGIN — ANTI-NOOB ARMY — NEW VIDEOS EVERY WEEK — STL — JIMIN — SPIDER — ",
    search_placeholder: "Search maps, packs, commands...",
    filter_all: "All", filter_ui: "UI & Packs", filter_gen: "Generators & Tools",
    filter_sha: "Shaders & Visuals", filter_cmd: "Commands & Redstone",
    section_latest: "THE VIDEO VAULT",
    section_latest_sub: "Every upload, its downloads and its community — one page each.",
    results_zero: "NO VIDEOS MATCHED",
    results_zero_sub: "Try a different keyword — or ask me on YouTube.",
    card_watch: "WATCH + Q&A", card_notes: "NOTES", card_reviews: "REVIEWS",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — ALL RIGHTS RESERVED",
    footer_hosted: "UNAUTHORIZED COPYING PROHIBITED",
    modal_title: "PICK YOUR LANGUAGE",
    modal_sub: "You can change this anytime from the menu above.",
    modal_gt_note: "💡 Video guides, reviews & forms are auto-translated by Google Translate when you pick a language."
  },
  hi: { _dir: "ltr", _flag: "🇮🇳", _label: "हिन्दी",
    nav_home: "होम",
    brand_sub: "क्रिएटर नॉलेज और Q&A हब",
    hero_badge: "वेरिफाइड क्रिएटर प्लेटफ़ॉर्म",
    hero_title1: "वीडियो के बारे में सवाल हैं?",
    hero_title2: "सीधे जवाब पाएं",
    hero_and: "और",
    hero_title3: "टॉपिक नोट्स।",
    hero_desc: "मैप खेलो। पैक लो। कमांड उठाओ। @notgamingplayz का हर डाउनलोड, हर गाइड और हर जवाब — हमेशा मुफ़्त। ना लॉगिन, ना ऐड, ना ट्रैकिंग।",
    hero_cta_watch: "वॉल्ट देखें", hero_cta_yt: "यूट्यूब पर देखें",
    stats_videos: "वीडियो", stats_downloads: "पैक", stats_reviews: "रिव्यू", stats_qa: "जवाब",
    stats_guides: "गाइड", stats_langs: "भाषाएँ",
    hero_panel_title: "📊 वॉल्ट से लाइव",
    hero_panel_sub: "नंबर सीधे Git कंटेंट स्टोर से अपडेट होते हैं — कोई डेटाबेस नहीं, कोई API नहीं, हैक करने लायक कुछ नहीं।",
    ticker_items: "हमेशा 100% मुफ़्त — कोई ऐड नहीं — कोई लॉगिन नहीं — एंटी-नूब आर्मी — हर हफ़्ते नए वीडियो — STL — जिमिन — स्पाइडर — ",
    search_placeholder: "मैप, पैक, कमांड खोजें...",
    filter_all: "सभी", filter_ui: "UI और पैक", filter_gen: "जनरेटर और टूल्स",
    filter_sha: "शेडर और विज़ुअल्स", filter_cmd: "कमांड और रेडस्टोन",
    section_latest: "वीडियो वॉल्ट",
    section_latest_sub: "हर अपलोड, उसके डाउनलोड और उसकी कम्युनिटी — हर एक का अपना पेज।",
    results_zero: "कोई वीडियो नहीं मिला",
    results_zero_sub: "दूसरा कीवर्ड आज़माएँ — या यूट्यूब पर पूछें।",
    card_watch: "देखें + सवाल", card_notes: "नोट्स", card_reviews: "रिव्यू",
    footer_legal: "© 2026 मुकुंद (NOTGAMINGPLAYZ) — सर्वाधिकार सुरक्षित",
    footer_hosted: "अनधिकृत कॉपी वर्जित",
    modal_title: "अपनी भाषा चुनें",
    modal_sub: "आप इसे ऊपर मेनू से कभी भी बदल सकते हैं।",
    modal_gt_note: "💡 भाषा चुनने पर गाइड, रिव्यू और फ़ॉर्म Google Translate से अपने आप अनुवादित हो जाएँगे।"
  },
  es: { _dir: "ltr", _flag: "🇪🇸", _label: "Español",
    nav_home: "Inicio",
    brand_sub: "Hub de Conocimiento y Q&A del Creador",
    hero_badge: "PLATAFORMA VERIFICADA DEL CREADOR",
    hero_title1: "¿Preguntas sobre nuestros videos?",
    hero_title2: "Respuestas Directas",
    hero_and: "y",
    hero_title3: "Notas del Tema.",
    hero_desc: "Juega los mapas. Descarga los packs. Roba los comandos. Cada descarga, guía y respuesta de @notgamingplayz — gratis para siempre. Sin login, sin ads, sin rastreo.",
    hero_cta_watch: "Ver la Bóveda", hero_cta_yt: "Ver en YouTube",
    stats_videos: "Videos", stats_downloads: "Packs", stats_reviews: "Reseñas", stats_qa: "Respuestas",
    stats_guides: "Guías", stats_langs: "Idiomas",
    hero_panel_title: "📊 EN DIRECTO DESDE LA BÓVEDA",
    hero_panel_sub: "Cifras actualizadas desde el almacén Git — sin bases de datos, sin APIs, nada que hackear.",
    ticker_items: "100% GRATIS SIEMPRE — SIN ADS — SIN LOGIN — EJÉRCITO ANTI-NOOB — NUEVOS VIDEOS CADA SEMANA — STL — JIMIN — SPIDER — ",
    search_placeholder: "Buscar mapas, packs, comandos...",
    filter_all: "Todo", filter_ui: "UI y Packs", filter_gen: "Generadores y Herramientas",
    filter_sha: "Shaders y Visuales", filter_cmd: "Comandos y Redstone",
    section_latest: "LA BÓVEDA DE VIDEOS",
    section_latest_sub: "Cada subida, sus descargas y su comunidad — una página para cada una.",
    results_zero: "SIN RESULTADOS",
    results_zero_sub: "Prueba otra palabra clave — o pregúntame en YouTube.",
    card_watch: "VER + Q&A", card_notes: "NOTAS", card_reviews: "RESEÑAS",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — TODOS LOS DERECHOS RESERVADOS",
    footer_hosted: "COPIA NO AUTORIZADA PROHIBIDA",
    modal_title: "ELIGE TU IDIOMA",
    modal_sub: "Puedes cambiarlo cuando quieras desde el menú de arriba.",
    modal_gt_note: "💡 Las guías, reseñas y formularios se traducen automáticamente con Google Translate al elegir idioma."
  },
  fr: { _dir: "ltr", _flag: "🇫🇷", _label: "Français",
    nav_home: "Accueil",
    brand_sub: "Hub de Savoir et Q&A du Créateur",
    hero_badge: "PLATEFORME VÉRIFIÉE DU CRÉATEUR",
    hero_title1: "Des questions sur nos vidéos ?",
    hero_title2: "Réponses Directes",
    hero_and: "et",
    hero_title3: "Notes de Topic.",
    hero_desc: "Joue aux maps. Prends les packs. Vole les commandes. Chaque téléchargement, guide et réponse de @notgamingplayz — gratuit pour toujours. Sans compte, sans pub, sans traçage.",
    hero_cta_watch: "Explorer le Coffre", hero_cta_yt: "Voir sur YouTube",
    stats_videos: "Vidéos", stats_downloads: "Packs", stats_reviews: "Avis", stats_qa: "Réponses",
    stats_guides: "Guides", stats_langs: "Langues",
    hero_panel_title: "📊 EN DIRECT DU COFFRE",
    hero_panel_sub: "Chiffres mis à jour depuis le magasin Git — pas de bases de données, pas d'API, rien à pirater.",
    ticker_items: "100% GRATUIT POUR TOUJOURS — SANS PUB — SANS COMPTE — ARMÉE ANTI-NOOB — NOUVELLES VIDÉOS CHAQUE SEMAINE — STL — JIMIN — SPIDER — ",
    search_placeholder: "Rechercher maps, packs, commandes...",
    filter_all: "Tout", filter_ui: "UI et Packs", filter_gen: "Générateurs et Outils",
    filter_sha: "Shaders et Visuels", filter_cmd: "Commandes et Redstone",
    section_latest: "LE COFFRE À VIDÉOS",
    section_latest_sub: "Chaque vidéo, ses téléchargements et sa communauté — une page dédiée.",
    results_zero: "AUCUN RÉSULTAT",
    results_zero_sub: "Essayez un autre mot-clé — ou demandez-moi sur YouTube.",
    card_watch: "VOIR + Q&R", card_notes: "NOTES", card_reviews: "AVIS",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — TOUS DROITS RÉSERVÉS",
    footer_hosted: "COPIE INTERDITE",
    modal_title: "CHOISISSEZ VOTRE LANGUE",
    modal_sub: "Modifiable à tout moment dans le menu ci-dessus.",
    modal_gt_note: "💡 Guides, avis et formulaires sont traduits automatiquement par Google Translate."
  },
  de: { _dir: "ltr", _flag: "🇩🇪", _label: "Deutsch",
    nav_home: "Start",
    brand_sub: "Creator-Wissens- & Q&A-Hub",
    hero_badge: "VERIFIZIERTE CREATOR-PLATTFORM",
    hero_title1: "Fragen zu unseren Videos?",
    hero_title2: "Direkte Antworten",
    hero_and: "und",
    hero_title3: "Topic-Notizen.",
    hero_desc: "Spiel die Maps. Nimm die Packs. Klau die Commands. Jeder Download, jede Anleitung und jede Antwort von @notgamingplayz — für immer gratis. Ohne Login, Werbung oder Tracking.",
    hero_cta_watch: "Zum Tresor", hero_cta_yt: "Auf YouTube ansehen",
    stats_videos: "Videos", stats_downloads: "Packs", stats_reviews: "Bewertungen", stats_qa: "Antworten",
    stats_guides: "Guides", stats_langs: "Sprachen",
    hero_panel_title: "📊 LIVE AUS DEM TRESOR",
    hero_panel_sub: "Zahlen kommen direkt aus dem Git-Speicher — keine Datenbanken, keine APIs, nichts zu hacken.",
    ticker_items: "100% KOSTENLOS FÜR IMMER — KEINE WERBUNG — KEIN LOGIN — ANTI-NOOB-ARMEE — JEDE WOCHE NEUE VIDEOS — STL — JIMIN — SPIDER — ",
    search_placeholder: "Maps, Packs, Commands suchen...",
    filter_all: "Alle", filter_ui: "UI & Packs", filter_gen: "Generatoren & Tools",
    filter_sha: "Shader & Optik", filter_cmd: "Commands & Redstone",
    section_latest: "DER VIDEO-TRESOR",
    section_latest_sub: "Jedes Video, seine Downloads und seine Community — eine eigene Seite.",
    results_zero: "KEINE TREFFER",
    results_zero_sub: "Probier ein anderes Stichwort — oder frag mich auf YouTube.",
    card_watch: "ANSEHEN + F&A", card_notes: "NOTIZEN", card_reviews: "BEWERTUNGEN",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — ALLE RECHTE VORBEHALTEN",
    footer_hosted: "UNAUTORISIERTES KOPIEREN VERBOTEN",
    modal_title: "WÄHLE DEINE SPRACHE",
    modal_sub: "Jederzeit im Menü oben änderbar.",
    modal_gt_note: "💡 Guides, Bewertungen & Formulare werden per Google Translate automatisch übersetzt."
  },
  ja: { _dir: "ltr", _flag: "🇯🇵", _label: "日本語",
    nav_home: "ホーム",
    brand_sub: "クリエイター知識＆Q&Aハブ",
    hero_badge: "認証済みクリエイタープラットフォーム",
    hero_title1: "動画について質問がある？",
    hero_title2: "直接回答をゲット",
    hero_and: "と",
    hero_title3: "トピックノート。",
    hero_desc: "マップで遊ぶ。パックを入手。コマンドを盗む。@notgamingplayz の全ダウンロード・ガイド・回答 — ずっと無料。ログイン不要、広告なし、トラッキングなし。",
    hero_cta_watch: "Vaultを見る", hero_cta_yt: "YouTubeで見る",
    stats_videos: "動画", stats_downloads: "パック", stats_reviews: "レビュー", stats_qa: "回答",
    stats_guides: "ガイド", stats_langs: "言語",
    hero_panel_title: "📊 VAULTからライブ配信",
    hero_panel_sub: "数値はGitストアから直接更新 — データベースもAPIもなし、ハックされるものもなし。",
    ticker_items: "永遠に100%無料 — 広告なし — ログイン不要 — アンチ・ヌーブ軍団 — 毎週新動画 — STL — ジミン — スパイダー — ",
    search_placeholder: "マップ・パック・コマンドを検索...",
    filter_all: "すべて", filter_ui: "UIとパック", filter_gen: "ジェネレーターとツール",
    filter_sha: "シェーダーと映像", filter_cmd: "コマンドとレッドストーン",
    section_latest: "動画Vault",
    section_latest_sub: "全動画にダウンロードとコミュニティページ付き。",
    results_zero: "該当なし",
    results_zero_sub: "キーワードを変えてみて — YouTubeで聞いてもOK。",
    card_watch: "視聴＋Q&A", card_notes: "ノート", card_reviews: "レビュー",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — 無断転載禁止",
    footer_hosted: "無断コピー禁止",
    modal_title: "言語を選択",
    modal_sub: "上のメニューからいつでも変更できます。",
    modal_gt_note: "💡 言語を選ぶとガイド・レビュー・フォームはGoogle Translateで自動翻訳されます。"
  },
  pt: { _dir: "ltr", _flag: "🇧🇷", _label: "Português",
    nav_home: "Início",
    brand_sub: "Hub de Conhecimento e Q&A do Criador",
    hero_badge: "PLATAFORMA VERIFICADA DO CRIADOR",
    hero_title1: "Perguntas sobre nossos vídeos?",
    hero_title2: "Respostas Diretas",
    hero_and: "e",
    hero_title3: "Notas do Tópico.",
    hero_desc: "Jogue os mapas. Pegue os packs. Roube os comandos. Cada download, guia e resposta do @notgamingplayz — grátis para sempre. Sem login, sem ads, sem rastreamento.",
    hero_cta_watch: "Ver o Cofre", hero_cta_yt: "Ver no YouTube",
    stats_videos: "Vídeos", stats_downloads: "Packs", stats_reviews: "Avaliações", stats_qa: "Respostas",
    stats_guides: "Guias", stats_langs: "Idiomas",
    hero_panel_title: "📊 AO VIVO DO COFRE",
    hero_panel_sub: "Números atualizados direto do repositório Git — sem bancos de dados, sem APIs, nada para hackear.",
    ticker_items: "100% GRÁTIS PARA SEMPRE — SEM ADS — SEM LOGIN — EXÉRCITO ANTI-NOOB — VÍDEOS NOVOS TODA SEMANA — STL — JIMIN — SPIDER — ",
    search_placeholder: "Buscar mapas, packs, comandos...",
    filter_all: "Tudo", filter_ui: "UI e Packs", filter_gen: "Geradores e Ferramentas",
    filter_sha: "Shaders e Visuais", filter_cmd: "Comandos e Redstone",
    section_latest: "O COFRE DE VÍDEOS",
    section_latest_sub: "Cada vídeo, seus downloads e sua comunidade — uma página para cada.",
    results_zero: "NENHUM RESULTADO",
    results_zero_sub: "Tente outra palavra — ou me pergunte no YouTube.",
    card_watch: "VER + P&R", card_notes: "NOTAS", card_reviews: "AVALIAÇÕES",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — TODOS OS DIREITOS RESERVADOS",
    footer_hosted: "CÓPIA NÃO AUTORIZADA PROIBIDA",
    modal_title: "ESCOLHA SEU IDIOMA",
    modal_sub: "Você pode mudar quando quiser no menu acima.",
    modal_gt_note: "💡 Guias, avaliações e formulários são traduzidos automaticamente pelo Google Translate."
  },
  id: { _dir: "ltr", _flag: "🇮🇩", _label: "Bahasa Indonesia",
    nav_home: "Beranda",
    brand_sub: "Hub Pengetahuan & Tanya-Jawab Kreator",
    hero_badge: "PLATFORM KREATOR TERVERIFIKASI",
    hero_title1: "Punya pertanyaan soal video kami?",
    hero_title2: "Dapat Jawaban Langsung",
    hero_and: "dan",
    hero_title3: "Catatan Topik.",
    hero_desc: "Mainkan map-nya. Ambil pack-nya. Curvi command-nya. Semua download, panduan dan jawaban dari @notgamingplayz — gratis selamanya. Tanpa login, iklan, atau pelacakan.",
    hero_cta_watch: "Lihat Vault", hero_cta_yt: "Tonton di YouTube",
    stats_videos: "Video", stats_downloads: "Pack", stats_reviews: "Ulasan", stats_qa: "Jawaban",
    stats_guides: "Panduan", stats_langs: "Bahasa",
    hero_panel_title: "📊 LANGSUNG DARI VAULT",
    hero_panel_sub: "Angka diperbarui langsung dari penyimpanan Git — tanpa database, tanpa API, tidak ada yang bisa diretas.",
    ticker_items: "100% GRATIS SELAMANYA — TANPA IKLAN — TANPA LOGIN — PASUKAN ANTI-NOOB — VIDEO BARU TIAP MINGGU — STL — JIMIN — SPIDER — ",
    search_placeholder: "Cari map, pack, command...",
    filter_all: "Semua", filter_ui: "UI & Pack", filter_gen: "Generator & Alat",
    filter_sha: "Shader & Visual", filter_cmd: "Command & Redstone",
    section_latest: "VAULT VIDEO",
    section_latest_sub: "Setiap video, download-nya dan komunitasnya — satu halaman khusus.",
    results_zero: "TIDAK ADA HASIL",
    results_zero_sub: "Coba kata kunci lain — atau tanya di YouTube.",
    card_watch: "TONTON + T&J", card_notes: "CATATAN", card_reviews: "ULASAN",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — SEMUA HAK DILINDUNGI",
    footer_hosted: "MENYALIN TANPA IZIN DILARANG",
    modal_title: "PILIH BAHASAMU",
    modal_sub: "Bisa diganti kapan saja lewat menu di atas.",
    modal_gt_note: "💡 Panduan, ulasan & formulir diterjemahkan otomatis oleh Google Translate."
  },
  ru: { _dir: "ltr", _flag: "🇷🇺", _label: "Русский",
    nav_home: "Главная",
    brand_sub: "Хаб знаний и Q&A автора",
    hero_badge: "ПРОВЕРЕННАЯ ПЛАТФОРМА АВТОРА",
    hero_title1: "Есть вопросы по нашим видео?",
    hero_title2: "Прямые ответы",
    hero_and: "и",
    hero_title3: "Конспекты тем.",
    hero_desc: "Играй карты. Забирай паки. Кради команды. Все загрузки, гайды и ответы от @notgamingplayz — бесплатно навсегда. Без логина, рекламы и слежки.",
    hero_cta_watch: "К Хранилищу", hero_cta_yt: "Смотреть на YouTube",
    stats_videos: "Видео", stats_downloads: "Паки", stats_reviews: "Отзывы", stats_qa: "Ответы",
    stats_guides: "Гайды", stats_langs: "Языки",
    hero_panel_title: "📊 ПРЯМО ИЗ ХРАНИЛИЩА",
    hero_panel_sub: "Цифры обновляются прямо из Git-хранилища — без баз данных, без API, взламывать нечего.",
    ticker_items: "100% БЕСПЛАТНО НАВСЕГДА — БЕЗ РЕКЛАМЫ — БЕЗ ЛОГИНА — АНТИ-НУБ АРМИЯ — НОВЫЕ ВИДЕО КАЖДУЮ НЕДЕЛЮ — STL — ДЖИМИН — СПАЙДЕР — ",
    search_placeholder: "Поиск карт, паков, команд...",
    filter_all: "Все", filter_ui: "UI и Паки", filter_gen: "Генераторы и Инструменты",
    filter_sha: "Шейдеры и Графика", filter_cmd: "Команды и Редстоун",
    section_latest: "ХРАНИЛИЩЕ ВИДЕО",
    section_latest_sub: "Каждое видео, его загрузки и его сообщество — отдельная страница.",
    results_zero: "НИЧЕГО НЕ НАЙДЕНО",
    results_zero_sub: "Попробуй другое слово — или спроси на YouTube.",
    card_watch: "СМОТРЕТЬ + Q&A", card_notes: "КОНСПЕКТ", card_reviews: "ОТЗЫВЫ",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — ВСЕ ПРАВА ЗАЩИЩЕНЫ",
    footer_hosted: "КОПИРОВАНИЕ ЗАПРЕЩЕНО",
    modal_title: "ВЫБЕРИ ЯЗЫК",
    modal_sub: "Можно поменять в меню выше в любой момент.",
    modal_gt_note: "💡 Гайды, отзывы и формы переводятся автоматически через Google Translate."
  },
  ar: { _dir: "rtl", _flag: "🇸🇦", _label: "العربية",
    nav_home: "الرئيسية",
    brand_sub: "مركز معرفة ومناقشات المنشئ",
    hero_badge: "منصة منشئ موثقة",
    hero_title1: "عندك أسئلة عن فيديوهاتنا؟",
    hero_title2: "احصل على إجابات مباشرة",
    hero_and: "و",
    hero_title3: "ملاحظات المواضيع.",
    hero_desc: "العب الخرائط. خذ الحزم. اسرق الأوامر. كل التحميلات والأدلة والإجابات من @notgamingplayz — مجانية للأبد. بدون تسجيل أو إعلانات أو تتبع.",
    hero_cta_watch: "تصفح الخزانة", hero_cta_yt: "شاهد على يوتيوب",
    stats_videos: "فيديوهات", stats_downloads: "حزم", stats_reviews: "تقييمات", stats_qa: "إجابات",
    stats_guides: "أدلة", stats_langs: "لغات",
    hero_panel_title: "📊 مباشرة من الخزانة",
    hero_panel_sub: "الأرقام تتحدث مباشرة من مخزن Git — بدون قواعد بيانات أو واجهات API، لا شيء للاختراق.",
    ticker_items: "مجاني 100% للأبد — بدون إعلانات — بدون تسجيل — جيش أنتي-نوب — فيديوهات جديدة كل أسبوع — STL — جيمين — سبايدر — ",
    search_placeholder: "ابحث عن خرائط، حزم، أوامر...",
    filter_all: "الكل", filter_ui: "واجهة وحزم", filter_gen: "مولدات وأدوات",
    filter_sha: "شيدرز ومؤثرات", filter_cmd: "أوامر وريدستون",
    section_latest: "خزانة الفيديوهات",
    section_latest_sub: "كل فيديو، تحميلاته، ومجتمعه — صفحة مخصصة لكل واحد.",
    results_zero: "لا توجد نتائج",
    results_zero_sub: "جرب كلمة أخرى — أو اسألني على يوتيوب.",
    card_watch: "شاهد + اسأل", card_notes: "ملاحظات", card_reviews: "تقييمات",
    footer_legal: "© 2026 MUKUND (NOTGAMINGPLAYZ) — جميع الحقوق محفوظة",
    footer_hosted: "يُمنع النسخ غير المصرح به",
    modal_title: "اختر لغتك",
    modal_sub: "يمكنك تغييرها من القائمة أعلاه في أي وقت.",
    modal_gt_note: "💡 تتم ترجمة الأدلة والتقييمات والنماذج تلقائياً عبر Google Translate."
  }
};

var LANG_CODES = ["en", "hi", "es", "fr", "de", "ja", "pt", "id", "ru", "ar"];

/* ---------- 2. LANGUAGE STATE ---------- */
var CURRENT_LANG = "en";

function detectLang() {
  try {
    var saved = localStorage.getItem(SITE.storageKey);
    if (saved && I18N[saved]) return saved;
  } catch (e) { /* private mode */ }
  var nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  return I18N[nav] ? nav : "en";
}

function t(key) {
  var d = I18N[CURRENT_LANG] || I18N.en;
  return d[key] || I18N.en[key] || key;
}

/* Google Translate bridge: keeps the googtrans cookie in sync so the
   hidden GT element translates all long content (markdown, reviews,
   forms) into the chosen language. UI chrome is marked translate="no". */
function setGoogtransCookie(code) {
  try {
    var val = "/en/" + code;
    document.cookie = "googtrans=" + val + ";path=/;max-age=31536000";
    if (window.location.hostname && window.location.hostname !== "localhost") {
      document.cookie = "googtrans=" + val + ";path=/;domain=." + window.location.hostname + ";max-age=31536000";
    }
  } catch (e) { /* file:// or blocked cookies */ }
}

var gtPollTries = 0;
function triggerGoogleTranslate(code) {
  var combo = document.querySelector(".goog-te-combo");
  if (combo) {
    combo.value = code;
    combo.dispatchEvent(new Event("change"));
    gtPollTries = 0;
    return;
  }
  if (gtPollTries++ < 40) {
    setTimeout(function () { triggerGoogleTranslate(code); }, 250);
  }
}

function applyLang(code, opts) {
  if (!I18N[code]) return;
  opts = opts || {};
  CURRENT_LANG = code;
  try { localStorage.setItem(SITE.storageKey, code); } catch (e) { /* ignore */ }

  document.documentElement.setAttribute("lang", code);
  document.documentElement.setAttribute("dir", I18N[code]._dir);

  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    var key = el.getAttribute("data-i18n");
    if (I18N[code][key] !== undefined) el.textContent = I18N[code][key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
    var key = el.getAttribute("data-i18n-placeholder");
    if (I18N[code][key] !== undefined) el.setAttribute("placeholder", I18N[code][key]);
  });

  // Sync dropdown + modal buttons
  var sel = document.getElementById("langSelect");
  if (sel) sel.value = code;
  document.querySelectorAll(".lang-choice").forEach(function (b) {
    b.classList.toggle("is-current", b.getAttribute("data-lang") === code);
  });
  var lbl = document.querySelector(".lang-label");
  if (lbl && I18N[code] && I18N[code]._label) lbl.textContent = I18N[code]._label;

  var modal = document.getElementById("langModal");
  if (modal && !opts.keepOpen) modal.classList.remove("is-open");

  // Google Translate for content
  setGoogtransCookie(code);
  triggerGoogleTranslate(code);

  if (typeof onPageLanguageChanged === "function") onPageLanguageChanged(code);
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

  // First visit? Show the language modal.
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
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") modalEl.classList.remove("is-open");
    });
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

function isGmail(value) {
  return /^[a-z0-9](?:[a-z0-9._%+-]{1,48})?@gmail\.com$/i.test(String(value || "").trim());
}

function isHandle(value) {
  return /^@?[A-Za-z0-9._]{1,30}$/.test(String(value || "").trim());
}

function cleanHandle(value) {
  var v = String(value || "").trim();
  return v ? (v.charAt(0) === "@" ? v.slice(1) : v) : "";
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(CURRENT_LANG === "en" ? "en-GB" : CURRENT_LANG, {
      year: "numeric", month: "short", day: "numeric"
    });
  } catch (e) { return String(iso || ""); }
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

/* __APP_PART2__ */

/* ---------- 4. MINI MARKDOWN PARSER ---------- */
/* h1-h3, paragraphs, bold/italic/inline-code, fenced code blocks with
   copy button, lists, blockquotes, hr, tables, links. Escapes first. */
function mdInline(text) {
  var s = esc(text);
  s = s.replace(/`([^`]+)`/g, function (_, c) { return "<code>" + c + "</code>"; });
  s = s.replace(/\*\*([^*]+)\*\*/g, function (_, b) { return "<strong>" + b + "</strong>"; });
  s = s.replace(/(^|[\s(])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, function (_, label, url) {
    var safeUrl = /^https?:\/\//i.test(url) ? url : "#";
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
      var level = Math.min(h[1].length + 1, 5); // shift: # -> h2 (video title owns h1)
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
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "md-copy";
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

function showFormStatus(el, kind, message) {
  if (!el) return;
  el.className = "form-status form-status--" + kind;
  el.textContent = (TOAST_ICONS[kind] || "") + " " + message;
}

/* ---------- 6. RELAY (Google Apps Script) ---------- */
function sendToRelay(payload) {
  if (!SITE.appsScriptUrl || SITE.appsScriptUrl.indexOf("http") !== 0) {
    return Promise.reject(new Error("RELAY_NOT_CONFIGURED"));
  }
  return fetch(SITE.appsScriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, // no CORS preflight with Apps Script
    body: JSON.stringify(payload)
  }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (data) {
    if (!data || data.ok !== true) throw new Error(data && data.error ? data.error : "RELAY_ERROR");
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
  return v.slug
    ? (root + "video/" + v.slug + "/")
    : (root + "video.html?id=" + encodeURIComponent(v.id));
}

function starString(n) {
  n = Number(n) || 0;
  var s = "";
  for (var i = 1; i <= 5; i++) s += (i <= n) ? "★" : '<span class="star--empty">★</span>';
  return s;
}

function relayMessage(err) {
  if (err && err.message === "RELAY_NOT_CONFIGURED") {
    return "The form isn't connected yet — the creator needs to set the Apps Script URL.";
  }
  return "Couldn't send — network hiccup. Please try again.";
}

function setFormStatus(el, state, msg) {
  if (!el) return;
  el.dataset.state = state || "";
  el.textContent = msg || "";
}

/* Wire a question form (email + name + body). */
function wireQuestionForm(form, opts) {
  if (!form) return;
  var status = form.querySelector(".form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var emailEl = form.querySelector('[name="email"]');
    var nameEl = form.querySelector('[name="name"]');
    var bodyEl = form.querySelector('[name="body"]');
    var hpEl = form.querySelector('[name="company"]');
    var email = (emailEl && emailEl.value || "").trim();
    var name = (nameEl && nameEl.value || "").trim();
    var text = (bodyEl && bodyEl.value || "").trim();
    if (hpEl && hpEl.value) return; // honeypot
    if (!email || !text) { setFormStatus(status, "err", "Email and question are required."); return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    setFormStatus(status, "", "Sending…");
    sendToRelay({
      type: "question",
      videoId: (opts && opts.videoId) || "general",
      videoTitle: (opts && opts.videoTitle) || "General question",
      name: name,
      email: email,
      text: text,
      page: location.href,
      lang: CURRENT_LANG
    }).then(function () {
      setFormStatus(status, "ok", "Thanks! Your question has been sent — I'll reply by email.");
      form.reset();
    }).catch(function (err) {
      setFormStatus(status, "err", relayMessage(err));
    }).then(function () { if (btn) btn.disabled = false; });
  });
}

/* Wire a review form (star rating + name + body). */
function wireReviewForm(form, opts) {
  if (!form) return;
  var status = form.querySelector(".form-status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ratingEl = form.querySelector('input[name="rating"]:checked');
    var nameEl = form.querySelector('[name="name"]');
    var bodyEl = form.querySelector('[name="body"]');
    var hpEl = form.querySelector('[name="company"]');
    var rating = ratingEl ? Number(ratingEl.value) : 0;
    var name = (nameEl && nameEl.value || "").trim();
    var text = (bodyEl && bodyEl.value || "").trim();
    if (hpEl && hpEl.value) return;
    if (!rating || !text) { setFormStatus(status, "err", "Please pick a star rating and write your review."); return; }
    var btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    setFormStatus(status, "", "Sending…");
    sendToRelay({
      type: "review",
      videoId: (opts && opts.videoId) || "general",
      videoTitle: (opts && opts.videoTitle) || "",
      rating: rating,
      name: name,
      text: text,
      page: location.href,
      lang: CURRENT_LANG
    }).then(function () {
      setFormStatus(status, "ok", "Thanks! Your review was sent for approval.");
      form.reset();
    }).catch(function (err) {
      setFormStatus(status, "err", relayMessage(err));
    }).then(function () { if (btn) btn.disabled = false; });
  });
}

/* ---------- UI EXTRAS ---------- */
/* Scroll-reveal: adds the .reveal class then fades elements in as they enter
   the viewport. Only runs when IntersectionObserver exists, so no-JS / older
   browsers just see everything normally. */
function initReveal(els) {
  els = els || $all(".video-card, .help-cta, .hero-copy, .hero-art");
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

/* Top scroll-progress bar + floating back-to-top button. */
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

/* Populate the hero: live video count + a collage of the latest thumbnails. */
function renderHero(catalog) {
  var countEl = document.getElementById("heroCount");
  if (countEl) countEl.textContent = catalog.length;
  var cta = document.getElementById("heroCta");
  if (cta) cta.textContent = "Browse all " + catalog.length + " videos";
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

  function cardHtml(v) {
    return '<a class="card video-card" href="' + esc(videoHref(v)) + '" data-category="' + esc(v.category || "") + '">' +
      '<div class="thumb"><img src="' + esc(ytThumb(v)) + '" alt="" width="480" height="270" loading="lazy">' +
      '<span class="play" aria-hidden="true">' + PLAY_SVG + "</span></div>" +
      '<div class="body"><h3>' + esc(v.title) + "</h3>" +
      '<div class="meta"><span class="cat">' + esc(v.categoryLabel || "") + "</span>" +
      '<span aria-hidden="true">·</span><span>' + esc(fmtDate(v.date)) + "</span></div>" +
      "</div></a>";
  }

  function renderGrid() {
    var q = query.trim().toLowerCase();
    var list = catalog.filter(function (v) {
      if (!q) return true;
      var hay = (v.title + " " + (v.topic || "") + " " + (v.categoryLabel || "") + " " + (v.keywords || []).join(" ")).toLowerCase();
      return hay.indexOf(q) !== -1;
    });
    if (!list.length) { grid.innerHTML = '<p class="muted">No videos match “' + esc(query) + '”.</p>'; return; }
    grid.innerHTML = list.map(cardHtml).join("");
    initReveal($all(".video-card", grid));
  }

  wireQuestionForm($("#question-form"), { videoId: "general", videoTitle: "General question" });

  jsonFetch(SITE.apiBase + "index.json").then(function (data) {
    catalog = (data && data.videos) || [];
    if (!catalog.length) { grid.innerHTML = '<p class="muted">No videos yet.</p>'; return; }
    renderHero(catalog);

    var searchWrap = document.createElement("div");
    searchWrap.className = "search-row";
    searchWrap.innerHTML = '<input type="search" id="videoSearch" class="video-search" ' +
      'placeholder="Search ' + catalog.length + ' videos…" aria-label="Search videos" autocomplete="off">';
    grid.parentNode.insertBefore(searchWrap, grid);
    var searchEl = document.getElementById("videoSearch");
    if (searchEl) searchEl.addEventListener("input", function () { query = searchEl.value; renderGrid(); });

    renderGrid();
  }).catch(function (err) {
    console.error(err);
    grid.innerHTML = '<p class="muted">content/videos/index.json failed — ' + esc(err.message) + "</p>";
  });
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

  function invalid() {
    shell.innerHTML =
      '<section class="section"><div class="container">' +
      '<nav class="crumbs small muted"><a href="' + SITE_ROOT + 'index.html">Videos</a><span aria-hidden="true">/</span><span>Not found</span></nav>' +
      "<h1>Video not found</h1>" +
      '<p class="muted">No id in URL, or content/videos/' + esc(videoId || "?") + ".json is missing.</p>" +
      '<a class="btn btn--primary" href="' + SITE_ROOT + 'index.html">← Back to videos</a>' +
      "</div></section>";
  }

  function resolveVideoId() {
    if (videoId) return Promise.resolve(videoId);
    if (!videoSlug) return Promise.reject(new Error("NO_VIDEO_IN_URL"));
    return jsonFetch(SITE.apiBase + "index.json").then(function (idx) {
      var list = (idx && idx.videos) || [];
      var found = list.filter(function (v) { return v.slug === videoSlug; })[0];
      if (!found) throw new Error("SLUG_NOT_FOUND");
      videoId = found.id;
      return videoId;
    });
  }

  function resourcesHtml(data) {
    if (!data.downloads || !data.downloads.length) return "";
    var rows = data.downloads.map(function (d) {
      return '<li class="card resource-row"><div>' +
        '<a class="resource-label" href="' + esc(d.url) + '" target="_blank" rel="noopener noreferrer">' + esc(d.name) + "</a>" +
        '<p class="small muted resource-note">' + esc((d.type || "link") + (d.size ? " · " + d.size : "")) + "</p>" +
        '</div><span class="chip">' + esc((d.type || "link").toLowerCase()) + "</span></li>";
    }).join("");
    return '<section class="resources"><h2>Downloads &amp; links</h2><ul class="resource-list">' + rows + "</ul></section>";
  }

  function askHtml(data) {
    return '<section class="ask"><h2>Ask a question about this video</h2>' +
      '<p class="muted small">Your email is required so I can reply to you directly. Your question goes straight to me.</p>' +
      '<form class="ask-form" novalidate>' +
        '<input type="hidden" name="video_id" value="' + esc(data.id) + '">' +
        '<div class="ask-grid">' +
          '<div class="field"><label for="q-email">Your email <span aria-hidden="true">*</span></label><input id="q-email" name="email" type="email" required autocomplete="email" placeholder="you@example.com"></div>' +
          '<div class="field"><label for="q-name">Name <span class="muted small">(optional)</span></label><input id="q-name" name="name" type="text" maxlength="80" autocomplete="name"></div>' +
        "</div>" +
        '<div class="field"><label for="q-body">Your question <span aria-hidden="true">*</span></label><textarea id="q-body" name="body" required maxlength="2000" placeholder="Ask anything about this video…"></textarea></div>' +
        '<input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' +
        '<button class="btn btn--primary" type="submit">Send question</button>' +
        '<p class="form-status small" role="status" aria-live="polite"></p>' +
      "</form></section>";
  }

  function reviewFormHtml(data) {
    var stars = "";
    for (var i = 1; i <= 5; i++) {
      stars += '<label><input type="radio" name="rating" value="' + i + '" required>' +
        '<span aria-hidden="true">★</span><span class="sr-only">' + i + " star" + (i > 1 ? "s" : "") + "</span></label>";
    }
    return '<details class="review-form-wrap"><summary class="btn btn--ghost btn--sm">Write a review</summary>' +
      '<form class="review-form" novalidate>' +
        '<input type="hidden" name="video_id" value="' + esc(data.id) + '">' +
        '<fieldset class="rating-field"><legend>Your rating <span aria-hidden="true">*</span></legend><div class="rating">' + stars + "</div></fieldset>" +
        '<div class="field"><label for="r-name">Name <span class="muted small">(optional)</span></label><input id="r-name" name="name" type="text" maxlength="80" autocomplete="name"></div>' +
        '<div class="field"><label for="r-body">Your review <span aria-hidden="true">*</span></label><textarea id="r-body" name="body" required maxlength="1200" placeholder="What did you think?"></textarea></div>' +
        '<input type="text" name="company" tabindex="-1" autocomplete="off" aria-hidden="true" class="hp">' +
        '<button class="btn btn--primary" type="submit">Send review</button>' +
        '<p class="form-status small" role="status" aria-live="polite"></p>' +
      "</form></details>";
  }

  function renderReviews() {
    var list = $("#reviews-list");
    var empty = $("#reviews-empty");
    if (!list) return;
    var id = currentVideo && currentVideo.id;
    var mine = reviews.filter(function (r) { return String(r.videoId) === String(id); });
    if (!mine.length) { list.innerHTML = ""; if (empty) empty.hidden = false; return; }
    if (empty) empty.hidden = true;
    list.innerHTML = mine.map(function (r) {
      return '<article class="review-item"><div class="stars" aria-label="' + Number(r.rating) + ' out of 5">' + starString(r.rating) + "</div>" +
        '<p class="review-body">' + esc(r.text) + "</p>" +
        '<p class="small muted review-by">' + esc(r.author || "Anonymous") + (r.date ? " · " + esc(fmtDate(r.date)) : "") + "</p></article>";
    }).join("");
  }

  function renderRelated(data) {
    var box = $("#relatedList");
    if (!box) return;
    var others = catalog.filter(function (v) { return v.id !== data.id; });
    var same = others.filter(function (v) { return v.category === data.category; });
    var rest = others.filter(function (v) { return v.category !== data.category; });
    var picks = same.concat(rest).slice(0, 6);
    box.innerHTML = picks.map(function (v) {
      return '<a class="related-item" href="' + esc(videoHref(v, SITE_ROOT)) + '">' +
        '<img src="' + esc(ytThumb(v)) + '" alt="" width="160" height="90" loading="lazy">' +
        "<div><h3>" + esc(v.title) + "</h3>" +
        '<span class="small muted">' + esc(v.categoryLabel || "") + "</span></div></a>";
    }).join("");
  }

  function render(data) {
    currentVideo = data;
    document.title = data.title + " — Adventigle";
    var ytSrc = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(data.youtubeId) + "?rel=0";

    var tags = '<span class="chip chip--active">' + esc(data.categoryLabel || "") + "</span>";
    (data.keywords || []).forEach(function (k) { tags += '<span class="chip">#' + esc(k) + "</span>"; });

    var desc = data.description || data.topic || "";

    shell.innerHTML =
      '<section class="section"><div class="container">' +
        '<nav class="crumbs small muted" aria-label="Breadcrumb">' +
          '<a href="' + SITE_ROOT + 'index.html">Videos</a>' +
          '<span aria-hidden="true">/</span><span>' + esc(data.categoryLabel || "") + "</span>" +
        "</nav>" +
        '<div class="detail">' +
          '<div class="detail-main">' +
            '<div class="player"><iframe src="' + esc(ytSrc) + '" title="' + esc(data.title) + '" loading="lazy" ' +
              'allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>' +
            '<header class="detail-head">' +
              '<div class="detail-tags">' + tags + "</div>" +
              "<h1>" + esc(data.title) + "</h1>" +
              '<p class="small muted detail-date">Published ' + esc(fmtDate(data.date)) + "</p>" +
              '<div class="detail-actions">' +
                (data.watchUrl ? '<a class="btn btn--ghost btn--sm" href="' + esc(data.watchUrl) + '" target="_blank" rel="noopener">▶ Watch on YouTube</a>' : "") +
                '<button type="button" class="btn btn--ghost btn--sm" id="copyLink">🔗 Copy link</button>' +
              "</div>" +
            "</header>" +
            '<div class="prose"><p>' + esc(desc) + "</p></div>" +
            '<section class="guide" id="guideBlock"><div class="loader"><div class="box"></div></div></section>' +
            resourcesHtml(data) +
            askHtml(data) +
            '<section class="review-block"><h2>Reviews for this video</h2>' +
              '<div id="reviews-list" class="review-list"></div>' +
              '<p id="reviews-empty" class="muted small" hidden>No approved reviews yet. Be the first to review this video.</p>' +
              reviewFormHtml(data) +
            "</section>" +
          "</div>" +
          '<aside class="detail-aside"><h2>Related videos</h2><div class="related-list" id="relatedList"></div></aside>' +
        "</div>" +
      "</div></section>";

    renderRelated(data);
    renderReviews();
    wireQuestionForm($(".ask-form"), { videoId: data.id, videoTitle: data.title });
    wireReviewForm($(".review-form"), { videoId: data.id, videoTitle: data.title });
    initReveal($all(".resources, .ask, .review-block, .detail-aside", shell));

    var copyBtn = document.getElementById("copyLink");
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var url = location.href;
        function done() {
          copyBtn.textContent = "✓ Copied!";
          setTimeout(function () { copyBtn.textContent = "🔗 Copy link"; }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(done).catch(function () { window.prompt("Copy this link:", url); });
        } else {
          window.prompt("Copy this link:", url);
        }
      });
    }

    fetch(SITE.apiBase + data.id + ".md")
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
      .then(function (text) {
        var box = $("#guideBlock");
        if (!box) return;
        box.innerHTML = '<h2>Info &amp; notes</h2><div class="md-body">' + parseMarkdown(text) + "</div>";
        decorateCodeBlocks(box);
      })
      .catch(function () {
        var box = $("#guideBlock");
        if (box) box.innerHTML = '<div class="md-note">Notes coming soon — check back after the next upload.</div>';
      });
  }

  Promise.all([
    jsonFetch(SITE.apiBase + "index.json").catch(function () { return { videos: [] }; }),
    jsonFetch(SITE_ROOT + "content/reviews.json").catch(function () { return { reviews: [] }; }),
    resolveVideoId().then(function (id) { return jsonFetch(SITE.apiBase + id + ".json"); })
  ]).then(function (res) {
    catalog = (res[0] && res[0].videos) || [];
    reviews = (res[1] && res[1].reviews) || [];
    render(res[2]);
  }).catch(function (err) {
    console.error(err);
    invalid();
  });

  window.onPageLanguageChanged = function () { if (currentVideo) renderReviews(); };
}

/* ---------- 10. BOOT ---------- */
document.addEventListener("DOMContentLoaded", function () {
  initLang();
  initUiExtras();
  initIndexPage();
  initVideoPage();
  initReveal();
});
