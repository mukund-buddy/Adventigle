# Remove Command Block Feedback || Easy || All Editions

Command blocks execute hone par chat mein baar-baar status/output messages aa rahe hain? Minecraft ka **Command Block Feedback / command block output** gamerule in messages ko control karta hai. Is video ka goal chat ko cleaner rakhne ke liye command block output disable karna hai — command blocks ko completely turn off karna nahi.

## Command

**Minecraft Bedrock:**

```text
/gamerule commandblockoutput false
```

**Minecraft Java Edition:**

```text
/gamerule commandBlockOutput false
```

## Steps

1. Apni world open karein aur ensure karein ki aapke paas required command permission hai.
2. Chat/command input open karein.
3. Apne edition ke liye upar diya gamerule enter karein aur submit karein.
4. Command block se koi test command run karke check karein ki chat feedback disable hua hai.
5. Agar messages dobara chahiye, gamerule ko `true` set karein.

## Important Notes

- Command ka capitalization/syntax edition ke mutabiq different ho sakta hai; current Bedrock documentation `commandblockoutput` name use karti hai.
- Yeh gamerule output messages control karta hai, command blocks ko disable nahi karta.
- Multiplayer servers par required permissions milna zaroori ho sakta hai.

*Thank you for reading this guide. — @notgamingplayz*
