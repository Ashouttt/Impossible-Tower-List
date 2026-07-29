/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   THIS IS THE ONLY FILE YOU NEED TO EDIT.

   Each level is one object { ... } in the LEVELS array below.
   Fields:

     rank       (required) — position in ranking, 1 = hardest
                              (lower number = higher in the tower)
     name       (required) — level name
     creator    (required) — level creator
     verifier   (optional) — who verified the level
     difficulty (optional) — EToH-style difficulty. Examples:
                              "Low Unreal", "Mid Unreal", "High Unreal",
                              "Peak Unreal", "Low Nil", "Mid Nil",
                              "High Horrific", "Low Terrifying",
                              "Mid Catastrophic", "Catastrophic"
                              The prefix (Low/Mid/High/Peak) is optional.
     videoId    (optional) — YouTube link OR 11-character video ID
                              e.g. "https://youtube.com/watch?v=dQw4w9WgXcQ"
                              or just "dQw4w9WgXcQ"
     levelId    (optional) — numeric Geometry Dash level ID
     points     (optional) — list points, if you track them

   Tier thresholds (Summit / Upper / Middle / Foundations)
   are set in script.js in the TIERS object — just give
   each level the correct "rank" here.

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
    difficulty: "Peak Nil",
    videoId: "",
    levelId: null,
    points: 1000,
  },
  {
    rank: 2,
    name: "Example Level #2",
    creator: "CreatorB",
    verifier: "CreatorB",
    difficulty: "High Nil",
    videoId: "",
    levelId: null,
    points: 950,
  },
  {
    rank: 3,
    name: "Example Level #3",
    creator: "CreatorC",
    verifier: "VerifierC",
    difficulty: "Mid Nil",
    videoId: "",
    levelId: null,
    points: 900,
  },
  {
    rank: 4,
    name: "Example Level #4",
    creator: "CreatorD",
    verifier: "VerifierD",
    difficulty: "Low Nil",
    videoId: "",
    levelId: null,
    points: 875,
  },
  {
    rank: 5,
    name: "Example Level #5",
    creator: "CreatorE",
    verifier: "VerifierE",
    difficulty: "Peak Unreal",
    videoId: "",
    levelId: null,
    points: 850,
  },
  {
    rank: 6,
    name: "Example Level #6",
    creator: "CreatorF",
    verifier: "VerifierF",
    difficulty: "High Unreal",
    videoId: "",
    levelId: null,
    points: 825,
  },
  {
    rank: 7,
    name: "Example Level #7",
    creator: "CreatorG",
    verifier: "VerifierG",
    difficulty: "Mid Unreal",
    videoId: "",
    levelId: null,
    points: 800,
  },
  {
    rank: 8,
    name: "Example Level #8",
    creator: "CreatorH",
    verifier: "VerifierH",
    difficulty: "Low Unreal",
    videoId: "",
    levelId: null,
    points: 775,
  },
  {
    rank: 9,
    name: "Example Level #9",
    creator: "CreatorI",
    verifier: "VerifierI",
    difficulty: "High Horrific",
    videoId: "",
    levelId: null,
    points: 750,
  },
  {
    rank: 10,
    name: "Example Level #10",
    creator: "CreatorJ",
    verifier: "VerifierJ",
    difficulty: "Mid Horrific",
    videoId: "",
    levelId: null,
    points: 725,
  },
  {
    rank: 11,
    name: "Example Level #11",
    creator: "CreatorK",
    verifier: "VerifierK",
    difficulty: "Low Horrific",
    videoId: "",
    levelId: null,
    points: 600,
  },
  {
    rank: 51,
    name: "Example Level #51",
    creator: "CreatorL",
    verifier: "CreatorL",
    difficulty: "Mid Terrifying",
    videoId: "",
    levelId: null,
    points: 300,
  },
  {
    rank: 201,
    name: "Example Level #201",
    creator: "CreatorM",
    verifier: "VerifierM",
    difficulty: "Low Catastrophic",
    videoId: "",
    levelId: null,
    points: 50,
  },
  {
    rank: 1000,
    name: "Example Level #1000",
    creator: "CreatorN",
    verifier: "VerifierN",
    difficulty: "Catastrophic",
    videoId: "",
    levelId: null,
    points: 1,
  },

  // Add more levels below, in this exact format:
  //
  // {
  //   rank: 4,
  //   name: "Level Name",
  //   creator: "Creator",
  //   verifier: "Verifier",
  //   difficulty: "Mid Unreal",
  //   videoId: "youtube_id_or_link",
  //   levelId: 12345678,
  //   points: 875,
  // },
];
