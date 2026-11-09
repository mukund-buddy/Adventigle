# How to Export Minecraft PE Worlds on Android | Fix Data Folder Hidden

Android par Minecraft PE world ka folder nahi mil raha ya `Android/data` access blocked hai? Is tutorial mein **Shizuku** aur **ZArchiver** ko combine karke Minecraft world files locate karne aur unka backup Downloads jaise accessible folder mein copy karne ka workflow cover kiya gaya hai. Yeh normal file-manager navigation se zyada setup mangta hai, aur exact menu labels Android version/device ke mutabiq change ho sakte hain.

## Required Apps

| App | Purpose |
| ----- | --------- |
| **ZArchiver** | Files/folders browse, extract aur copy karne ke liye |
| **Shizuku** | Supported Android devices par app ko ADB/Wireless Debugging ke through elevated file access dene ke liye |

## Step-by-Step Process

1. Phone ki **Developer Options** enable karein: Settings → About Phone → Build Number par seven times tap, agar aapke device par yahi route ho.
2. Developer Options mein **Wireless Debugging** enable karein.
3. Shizuku open karke **Pairing** process start karein. Wireless Debugging settings mein pairing code use karke pairing complete karein, phir Shizuku ko start karein as directed by the app.
4. ZArchiver settings mein available **Shizuku / SUI** access option select karein, agar aapke installed version mein supported hai.
5. File browser mein yeh path locate karein: `Android/data/com.mojang.minecraftpe/files/games/com.mojang/minecraftWorlds`.
6. Required world folder ko **Copy** karke Downloads ya doosre safe backup location mein **Paste** karein. Original folder ko move/delete na karein.
7. Copy complete hone ke baad backup verify karein aur folder ko safe jagah store karein.

## Safety & Troubleshooting

- Sirf official app pages se downloads lein aur app ki permissions review karein.
- Shizuku session restart/reboot ke baad dobara start karna pad sakta hai.
- Agar path nahi milta, game ki storage location aur Android version check karein; folder names/permissions differ kar sakte hain.
- Backup copy preserve karein before editing or restoring any world.

*Thank you for reading this guide. — @notgamingplayz*
