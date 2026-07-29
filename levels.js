/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Each level is one object { ... } in the LEVELS array below.
   Fields:

     rank       (required) — position in ranking, 1 = hardest
     name       (required) — level name
     creator    (required) — level creator
     verifier   (optional) — who verified the level
     difficulty (optional) — EToH-style difficulty. Full list:
                              Low Horrific, Mid Horrific, High Horrific, Peak Horrific
                              Low Unreal, Mid Unreal, High Unreal, Peak Unreal
                              Low Nil, Mid Nil, High Nil, Peak Nil
                              Low Error, Mid Error, High Error, Peak Error
                              The prefix (Low/Mid/High/Peak) is optional.
     videoId    (optional) — YouTube link OR 11-character video ID
     levelId    (optional) — numeric Geometry Dash level ID
     points     (optional) — list points, if you track them

   Tier thresholds (Summit / Upper / Middle / Foundations)
   are set in script.js in the TIERS object.

   Order of objects in the array doesn't matter — the page
   sorts them by "rank". You can have 1 to 1000 entries.
   ========================================================= */

const LAST_UPDATE = "29.07.2026";

const LEVELS = [
  {
    rank: 1,
    name: "Example Level #1",
    creator: "CreatorA",
    verifier: "VerifierA",
    difficulty: "Peak Error",
    videoId: "",
    levelId: null,
    points: 1000,
  },
  {
    rank: 2,
    name: "Example Level #2",
    creator: "CreatorB",
    verifier: "CreatorB",
    difficulty: "High Error",
    videoId: "",
    levelId: null,
    points: 950,
  },
  {
    rank: 3,
    name: "Example Level #3",
    creator: "CreatorC",
    verifier: "VerifierC",
    difficulty: "Mid Error",
    videoId: "",
    levelId: null,
    points: 900,
  },
  {
    rank: 4,
    name: "Example Level #4",
    creator: "CreatorD",
    verifier: "VerifierD",
    difficulty: "Low Error",
    videoId: "",
    levelId: null,
    points: 875,
  },
  {
    rank: 5,
    name: "Example Level #5",
    creator: "CreatorE",
    verifier: "VerifierE",
    difficulty: "Peak Nil",
    videoId: "",
    levelId: null,
    points: 850,
  },
  {
    rank: 6,
    name: "Example Level #6",
    creator: "CreatorF",
    verifier: "VerifierF",
    difficulty: "High Nil",
    videoId: "",
    levelId: null,
    points: 825,
  },
  {
    rank: 7,
    name: "Example Level #7",
    creator: "CreatorG",
    verifier: "VerifierG",
    difficulty: "Mid Nil",
    videoId: "",
    levelId: null,
    points: 800,
  },
  {
    rank: 8,
    name: "Example Level #8",
    creator: "CreatorH",
    verifier: "VerifierH",
    difficulty: "Low Nil",
    videoId: "",
    levelId: null,
    points: 775,
  },
  {
    rank: 9,
    name: "Example Level #9",
    creator: "CreatorI",
    verifier: "VerifierI",
    difficulty: "Peak Unreal",
    videoId: "",
    levelId: null,
    points: 750,
  },
  {
    rank: 10,
    name: "Example Level #10",
    creator: "CreatorJ",
    verifier: "VerifierJ",
    difficulty: "High Unreal",
    videoId: "",
    levelId: null,
    points: 725,
  },
  {
    rank: 11,
    name: "Example Level #11",
    creator: "CreatorK",
    verifier: "VerifierK",
    difficulty: "Mid Unreal",
    videoId: "",
    levelId: null,
    points: 600,
  },
  {
    rank: 12,
    name: "Example Level #12",
    creator: "CreatorL",
    verifier: "CreatorL",
    difficulty: "Low Unreal",
    videoId: "",
    levelId: null,
    points: 580,
  },
  {
    rank: 13,
    name: "Example Level #13",
    creator: "CreatorM",
    verifier: "VerifierM",
    difficulty: "Peak Horrific",
    videoId: "",
    levelId: null,
    points: 560,
  },
  {
    rank: 14,
    name: "Example Level #14",
    creator: "CreatorN",
    verifier: "VerifierN",
    difficulty: "High Horrific",
    videoId: "",
    levelId: null,
    points: 540,
  },
  {
    rank: 15,
    name: "Example Level #15",
    creator: "CreatorO",
    verifier: "VerifierO",
    difficulty: "Mid Horrific",
    videoId: "",
    levelId: null,
    points: 520,
  },
  {
    rank: 16,
    name: "Example Level #16",
    creator: "CreatorP",
    verifier: "VerifierP",
    difficulty: "Low Horrific",
    videoId: "",
    levelId: null,
    points: 500,
  },

    {
    rank: 1,
    name: "Tower of Jungle Gyms",
    creator: "Macloux, Higherthanblox, D_yni, Eccapin, Findabletag, Kinjiture, Melvinalsgamer, PoptartPunt, Empyrae, pacovepowered5, rohanmishrr, Yellow78Dog, SungazedUwU, Exhaustedsleepybear, Delukes51, CUGASTheLooney",
    verifier: "",
    difficulty: "Mid-High Error",
    videoId: "B0VpzdvwrC0",
    levelId: null,
    points: 1000,
  },

// Add more levels below, in this exact format:
  //
  // {
  //   rank: 17,
  //   name: "Level Name",
  //   creator: "Creator",
  //   verifier: "Verifier",
  //   difficulty: "Mid Unreal",
  //   videoId: "youtube_id_or_link",
  //   levelId: 12345678,
  //   points: 875,
  // },
];
