# Design Own Animated Start Screen Minecraft Bedrock || latest version

Minecraft Bedrock ka apna animated start screen banana sikhao gaya hai — layout, colors, logo aur animation frames set karke apni design build karna, phir usse pack ke roop me import karke game me activate karna.

## Video Overview

- Platform: Minecraft Bedrock (latest versions).
- Result: apni design ka animated start screen / main menu pack.
- Tools: koi basic image editor (frame-by-frame PNG export) + text editor + file manager.

## Step-by-Step Guide

1. Minecraft Bedrock ka latest version par game update kar lo, taaki UI structure match kare.
2. Apna start screen design banao: background image(s), logo, button layout aur colors decide karo. Animated effect ke liye multiple frames banao aur unhe same size me export karo (jaise 256×256 ya game ki expected resolution).
3. Frames ko ek `textures/` folder me rakho aur har frame ka naam `frame_0.png`, `frame_1.png` ... aise sequence me rakho.
4. `ui/` folder me ek JSON file banao jisme frame list aur timing (frames per second) define karo.
5. `manifest.json` banao: `format_version`, `header` (uuid, name, version, description) aur `modules` array. Header uuid aur module uuid alag hone chahiye.
6. Folder ko `.mcpack` me pack karo (zip karke extension badlo).
7. Minecraft me `Global Resources` me jaake pack import karke activate karo.
8. Settings > Global Resources ya pack settings me jaake apna UI select karo, phir game restart karo.
9. Start screen test karo: animation smooth chal rahi hai ya nahi, buttons kaam kar rahe hain ya nahi.

**Important:** Bedrock ka menu layout har update me change hota hai, isliye exact JSON fields aapke version se match karne chahiye — warna menu load nahi hoga ya kuch buttons kaam nahi karenge. Ye listing koi ready-made design nahi deti, sirf process explain karti hai. Har download link pehle video me verify karein.

*Thank you for reading this guide. — @notgamingplayz*
