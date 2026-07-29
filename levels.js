/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Each level is one object { ... } in the LEVELS array below.
   Fields:

     rank         (required) — position in ranking, 1 = hardest
     name         (required) — level name
     creator      (required) — level creator(s)
     verifier     (optional) — who verified the level
     difficulty   (optional) — EToH-style difficulty
     videoId      (optional) — YouTube link OR 11-character video ID
     worldRecord  (optional) — best completion, e.g. "Floor 7", "N/A"

   Tier thresholds (Summit / Upper / Middle / Foundations)
   are set in script.js in the TIERS object.

   Order of objects in the array doesn't matter — the page
   sorts them by "rank". You can have 1 to 1000 entries.
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
  },
  {
    rank: 2,
    name: "Citadel of Void",
    creator: "bLockerman666, Karinriine, IceNsalt, ciel_azulsky, Feodoric, tintom495, PPtTenshi, popop614, latomludo, macalads, Coatesultimate1, KittenLord420, nott_vy, Heksi",
    verifier: "",
    difficulty: "Peak Nil",
    videoId: "bJPgQlqkQxI",
    worldRecord: "Floor 7",
  },
];
