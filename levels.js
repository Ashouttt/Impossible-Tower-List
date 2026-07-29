/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Each tower is one object { ... } in the LEVELS array below.
   Fields:

     rank         (required) — position in ranking, 1 = hardest
     name         (required) — tower name
     creator      (required) — tower creator(s)
     verifier     (optional) — who verified the tower (empty = unverified)
     difficulty   (optional) — EToH-style difficulty
     videoId      (optional) — YouTube link OR 11-character video ID
     worldRecord  (optional) — best completion, e.g. "Floor 7", "N/A"
     robloxLink   (optional) — link to the Roblox place where this
                                tower is located, e.g.
                                "https://www.roblox.com/games/XXXXXXXX/Place-Name"

   Order of objects in the array doesn't matter — the page
   sorts them by "rank". You can have unlimited entries.
   ========================================================= */

const LAST_UPDATE = "29.07.2026";

const LEVELS = [
  {
    rank: 1,
    name: "Tower of Jungle Gyms",
    creator: "Macloux, Higherthanblox, D_yni, Eccapin, Findabletag, Kinjiture, Melvinalsgamer, PoptartPunt, Empyrae, pacovepowered5, rohanmishrr, Yellow78Dog, SungazedUwU, Exhaustedsleepybear, Delukes51, CUGASTheLooney",
    verifier: "",
    difficulty: "Mid-High Error",
    videoId: "B0VpzdvwrC0",
    worldRecord: "N/A",
    robloxLink: "https://www.roblox.com/games/99982773118045/Tower-of-Jungle-Gyms-The-Big-Climb",
  },
  {
    rank: 2,
    name: "Citadel of Void",
    creator: "bLockerman666, Karinriine, IceNsalt, ciel_azulsky, Feodoric, tintom495, PPtTenshi, popop614, latomludo, macalads, Coatesultimate1, KittenLord420, nott_vy, Heksi",
    verifier: "",
    difficulty: "Peak Nil",
    videoId: "bJPgQlqkQxI",
    worldRecord: "Floor 7",
    robloxLink: "https://www.roblox.com/games/4597361034/Citadel-of-Void-OFFICIAL",
  },
  {
    rank: 3,
    name: "Tower of It Never Ends",
    creator: "ciel_azulsky",
    verifier: "MonsterIsABlock",
    difficulty: "Mid Unreal",
    videoId: "bwDpQOuQaGg",
    worldRecord: "Winpad",
    robloxLink: "https://www.roblox.com/games/107705095969573/tower-of-IT-NEVER-ENDS",
  },
];
