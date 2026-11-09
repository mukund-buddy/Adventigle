# Enable Achievements in Any World (Mobile & PC)

Minecraft Bedrock mein kuch worlds me achievements enable nahi hote — aapko "Achievements cannot be earned in this world" message dikhta hai. Is video me mobile aur PC dono ke liye step-by-step tareeka dikhaya gaya hai jisse achievements wapas on ho jaate hain.

## Video Overview

- Issue: "Achievements cannot be earned in this world" message.
- Platforms: Minecraft Bedrock on mobile (Android/iOS) aur PC (Windows).
- Result: world files touch karke achievements eligibility restore karna.

## Step-by-Step Guide

1. Minecraft Bedrock ko latest version par update karo, aur us world me jaake confirm kar lo ki message abhi bhi aa raha hai.
2. Mobile par: ZArchiver (ya koi bhi archive app) use karke Minecraft ke storage folder kholo. PC par: file manager ya Minecraft folder directly open karo.
3. World ke andar `level.dat` file dhoondo — ye file world ki progress aur settings hold karti hai.
4. World ka ek backup bana lo (copy karke paste karo), taaki kuch galat ho to wapas aa sakte ho.
5. `level.dat` file ko ek text/code editor me kholo aur usme `achievements` ya `GameRules` se related `AchievementsDisabled` type entry dhoondo.
6. Us entry ka value `false` kar do (ya `0` ke bajaye `true` likh do, jo bhi editor me format ho) — isse achievements eligibility on ho jaati hai.
7. File save karke Minecraft me wapas jao aur world open karo.
8. Ab achievements tab me koi bhi achievement unlock karke test karo — pehle wale world me achievements turant nahi dikhte, refresh ya relogin karo.

**Important:** `level.dat` ka structure har version me thoda alag hota hai, isliye exact field name aapke game version par depend karta hai. Agar editor me file corrupt ho jaaye to backup wapas restore kar do — isliye backup step skip mat karna. Ye method har world me guaranteed kaam nahi karta.

*Thank you for reading this guide. — @notgamingplayz*
