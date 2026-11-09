# Can Gemini AI Code a Custom Minecraft Bedrock UI?

Is video me dekha gaya hai ki Google Gemini AI Minecraft Bedrock ke liye custom UI pack likh sakta hai ya nahi — prompt likhna, code generate karna, usse resource pack me convert karna aur game me import karna.

## Video Overview

- Tool: Google Gemini AI (browser/chat interface).
- Goal: ek simple custom UI (button / menu layout) generate karna.
- Pipeline: prompt → generated code → resource pack structure → import → test in game.

## Step-by-Step Guide

1. Minecraft Bedrock ka latest version note kar lo — UI pack JSON structure version ke saath change hota hai.
2. Gemini AI me ek clear prompt likho: kaunsi file chahiye (jaise `ui/*.json`), kaunsi screen banana hai, kaunsi button images use karni hain, aur size/resolution kya honi chahiye.
3. Gemini se jo JSON mile usse carefully check karo — AI kabhi-kabhi comments, trailing commas ya missing brackets daal deta hai, jo Minecraft me crash kar sakte hain.
4. Ek text editor me code copy karo aur syntax validate karo (JSON me trailing comma hatao, quotes fix karo).
5. Resource pack ka folder structure banao: `manifest.json` + `ui/` folder jisme generated JSON file rakho, aur `pack_icon.png` add karo.
6. `manifest.json` me `format_version`, `header` (uuid + name + version), aur `modules` array sahi se bharo — header uuid aur module uuid alag hone chahiye.
7. Folder ko `.mcpack` me pack karo (zip karo aur extension badlo).
8. Minecraft me jaake `Global Resources` me import karke pack activate karo, phir settings me jaake UI pack select karo.
9. Test karo: buttons kaam karte hain ya nahi, text sahi render hota hai ya nahi, aur game crash to nahi hota.

**Important:** Ye ek experiment hai. AI-generated code har Minecraft version par kaam nahi karta, aur generated UI ka visual result aapke prompt quality par depend karta hai. Is listing koi ready-to-install pack provide nahi karti — code aapko khud generate aur test karna hota hai. Har download ka link pehle video me verify karein.

*Thank you for reading this guide. — @notgamingplayz*
