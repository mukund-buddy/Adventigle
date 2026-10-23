# How to Export Minecraft Mobile World using PC (Bedrock)

Minecraft Bedrock mobile world ko Windows PC par backup ya doosre device par transfer karna hai? Is video mein Android phone ko PC se connect karke Minecraft world files tak pahunchne ka file-transfer workflow dikhaya gaya hai. World backup rakhna game reinstall, device change ya save corruption ke risk se pehle useful ho sakta hai. Video record ke mutabiq method Windows 11 PC par test kiya gaya tha; har Android version par file access same nahi hota.

## Step-by-Step Workflow

1. Minecraft close karein aur pehle world ki existing backup/export copy banane ki koshish karein.
2. Phone par **Settings → About Phone → Software Information** open karein. Agar USB debugging needed ho, **Build Number** par seven times tap karke Developer Options enable karein.
3. **Developer Options → USB Debugging** enable karein, phir phone ko trusted Windows PC ke saath USB cable se connect karein.
4. Phone par USB connection mode mein **File Transfer** select karein.
5. PC par **This PC → Phone Storage → Internal Storage → Android → data → com.mojang.minecraftpe → files → games** path check karein. Agar `com.mojang`/`minecraftWorlds` folder available hai, world files ko identify karne ke liye uske andar navigate karein.
6. Required world folder ki copy PC par ek named backup folder mein paste karein. Original phone folder se files move/delete na karein.
7. Backup complete hone ke baad file count/size compare karein. World import/restore karne se pehle Minecraft version aur storage-location settings ko dhyan mein rakhein.

## Important Caution

Android 11 aur newer releases par `Android/data` ki access restrictions ho sakti hain. Agar folder visible nahi hai, iska matlab zaroori nahi ki world delete ho gaya — device storage mode ya permission restriction bhi ho sakta hai. USB debugging sirf trusted PC ke saath use karein.

*Thank you for reading this guide. — @notgamingplayz*
