/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   TO JEST JEDYNY PLIK, KTÓRY MUSISZ EDYTOWAĆ.

   Każdy poziom to jeden obiekt { ... } w tablicy LEVELS poniżej.
   Pola:

     rank      (wymagane) — pozycja w rankingu, 1 = najtrudniejszy
                             (im mniejsza liczba, tym wyżej w wieży)
     name      (wymagane) — nazwa poziomu
     creator   (wymagane) — twórca poziomu
     verifier  (opcjonalne) — kto zweryfikował (może być inny niż twórca)
     videoId   (opcjonalne) — link do YouTube ALBO samo 11-znakowe ID
                             np. "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                             albo po prostu "dQw4w9WgXcQ"
     levelId   (opcjonalne) — numeryczne ID poziomu z Geometry Dash
     points    (opcjonalne) — punkty listy, jeśli prowadzisz taki system

   Progi "pięter" wieży (Szczyt / Górne Piętra / Środkowe Piętra /
   Fundamenty) ustawiasz w script.js w obiekcie TIERS — tutaj
   wystarczy, że nadasz poziomowi poprawny "rank".

   Kolejność obiektów w tablicy nie ma znaczenia — strona sama
   sortuje je po polu "rank". Możesz mieć od 1 do 1000 wpisów.
   ========================================================= */

const LAST_UPDATE = "29.07.2026";

const LEVELS = [
  {
    rank: 1,
    name: "Przykładowy poziom #1",
    creator: "TwórcaA",
    verifier: "WeryfikatorA",
    videoId: "",
    levelId: null,
    points: 1000,
  },
  {
    rank: 2,
    name: "Przykładowy poziom #2",
    creator: "TwórcaB",
    verifier: "TwórcaB",
    videoId: "",
    levelId: null,
    points: 950,
  },
  {
    rank: 3,
    name: "Przykładowy poziom #3",
    creator: "TwórcaC",
    verifier: "WeryfikatorC",
    videoId: "",
    levelId: null,
    points: 900,
  },
  {
    rank: 11,
    name: "Przykładowy poziom #11",
    creator: "TwórcaD",
    verifier: "WeryfikatorD",
    videoId: "",
    levelId: null,
    points: 600,
  },
  {
    rank: 51,
    name: "Przykładowy poziom #51",
    creator: "TwórcaE",
    verifier: "TwórcaE",
    videoId: "",
    levelId: null,
    points: 300,
  },
  {
    rank: 201,
    name: "Przykładowy poziom #201",
    creator: "TwórcaF",
    verifier: "WeryfikatorF",
    videoId: "",
    levelId: null,
    points: 50,
  },
  {
    rank: 1000,
    name: "Przykładowy poziom #1000",
    creator: "TwórcaG",
    verifier: "WeryfikatorG",
    videoId: "",
    levelId: null,
    points: 1,
  },

  // Dodawaj kolejne poziomy poniżej, w dokładnie takim formacie:
  //
  // {
  //   rank: 4,
  //   name: "Nazwa poziomu",
  //   creator: "Twórca",
  //   verifier: "Weryfikator",
  //   videoId: "ID_lub_link_z_YouTube",
  //   levelId: 12345678,
  //   points: 875,
  // },

];
