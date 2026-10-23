# Convert .ZIP to .MCPACK / .MCADDON (Works Every Time)

Minecraft PE mein downloaded `.zip` file ko Resource Pack, Add-on ya world content ke roop mein import karne mein problem aa rahi hai? Is tutorial mein **ZArchiver** ke through extension rename karne aur zaroorat padne par pack folder ko manually correct Minecraft directory mein copy karne ke options cover kiye gaye hain. Sabse important baat: file ka extension badalna archive ke andar ka content convert nahi karta. Rename method tabhi kaam karega jab ZIP ke andar pehle se valid Minecraft pack structure maujood ho.

## Method 1 — Rename & Import

1. ZArchiver mein downloaded file locate karein aur long-press karke **Rename** choose karein.
2. Agar archive already ek valid pack ko contain karta hai, toh instructions ke mutabiq extension change karein:
   - Resource Pack: `.zip` → `.mcpack`
   - Add-on: `.zip` → `.mcaddon`
3. Renamed file par tap karein aur **Open with Minecraft**/Minecraft import option select karein, agar available ho.
4. Minecraft ke import-success message ko check karein aur pack ko relevant settings mein activate karein.

## Method 2 — Extract & Copy

1. Agar rename se import fail hota hai, ZIP ko extract karein.
2. Extracted folders inspect karein. Pack ka `manifest.json` aur required files expected folder level par hone chahiye; kabhi-kabhi archive ke andar extra parent folder hota hai.
3. Video mein dikhaye gaye folder types ke mutabiq target location use hoti hai: worlds `minecraftWorlds`, Resource Packs `resource_packs`, Behavior Packs `behavior_packs` ke andar.
4. Android `Android/data` access restricted ho sakta hai, isliye exact route device/Android version ke hisaab se differ kar sakta hai.

## Before You Start

- Original ZIP ko delete na karein; extracted/copy version test karein.
- **Settings → Storage → File Storage Location** ka behaviour Minecraft version ke saath change ho sakta hai. Is setting ko badalne se pehle worlds ka backup banayein.
- Tutorial ke title mein “Works Every Time” hai, lekin pack structure aur Android restrictions ke kaaran har file ke liye guarantee nahi hai.

*Thank you for reading this guide. — @notgamingplayz*
