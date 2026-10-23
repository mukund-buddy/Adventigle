# Resource Pack Import Nahi Ho Raha? UUID Generator Se Fix Karo — Minecraft Bedrock

Minecraft Bedrock mein Resource Pack ya Behavior Pack import nahi ho raha? Issue ka ek possible reason `manifest.json` mein missing, invalid ya duplicate UUID ho sakta hai. UUID har pack/module ki unique identity hoti hai; isliye sirf pack ka naam badal dena ya kisi doosre pack ka UUID copy karna reliable fix nahi hai. Is short tutorial mein UUID Generator se identifiers banana aur unhe manifest mein sahi jagah rakhna dikhaya gaya hai.

## Step-by-Step Process

1. **UUID Generator** open karein aur ek naya UUID generate karein.
2. Apne pack ke `manifest.json` mein `header.uuid` ke liye ek unique UUID rakhein.
3. `modules` section ke andar module ke `uuid` field ke liye doosra, alag UUID use karein.
4. Agar Resource Pack aur Behavior Pack dono hain, toh unke identifiers bhi ek-doosre se unique rakhein. Dependency define ki ho toh uska UUID bhi matching pack ke header UUID se match hona chahiye.
5. File save karne ke baad confirm karein ki `manifest.json` pack ke root folder mein hai aur JSON syntax valid hai.
6. Pack ko dobara import karke check karein. Error rahe toh UUID ke saath file structure, JSON commas/quotes aur game-version compatibility bhi verify karein.

## Tools

**Important:** Header UUID aur Module UUID same nahi hone chahiye. Har pack/module ke liye naya UUID generate karein. UUID fix karne se har import error solve nahi hota; manifest syntax ya incorrect folder structure bhi cause ho sakta hai.

*Thank you for reading this guide. — @notgamingplayz*
