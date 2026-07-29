/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js
   English, smooth animations, EToH difficulty icons.
   ========================================================= */

const TIERS = [
  { id: "summit",      label: "Summit",       max: 10   },
  { id: "upper",       label: "Upper",        max: 50   },
  { id: "middle",      label: "Middle",       max: 200  },
  { id: "foundations", label: "Foundations",  max: Infinity },
];

const PAGE_SIZE = 50;

function tierForRank(rank) {
  for (const tier of TIERS) {
    if (rank <= tier.max) return tier;
  }
  return TIERS[TIERS.length - 1];
}

// --- SVG Icons ---
const ICON_8STAR = `<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 61,35 98,35 68,57 79,90 50,68 21,90 32,57 2,35 39,35"/></svg>`;

const ICON_4STAR = `<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 65,35 98,50 65,65 50,98 35,65 2,50 35,35"/></svg>`;

const ICON_ERROR = `<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="50" cy="50" r="38"/><path d="M32 32 L68 68 M68 32 L32 68"/><circle cx="38" cy="42" r="5" fill="currentColor"/><circle cx="62" cy="42" r="5" fill="currentColor"/></svg>`;

// --- Difficulty parsing (EToH style) ---
function parseDifficulty(raw) {
  if (!raw) return { prefix: "", base: "", full: "" };
  const str = String(raw).trim();
  const lowered = str.toLowerCase();

  const prefixes = ["bottom", "low", "mid", "high", "peak"];
  let prefix = "";
  let base = lowered;

  for (const p of prefixes) {
    if (lowered.startsWith(p + " ")) {
      prefix = p;
      base = lowered.slice(p.length).trim();
      break;
    }
  }

  const capPrefix = prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "";
  const capBase = base.charAt(0).toUpperCase() + base.slice(1);
  const full = capPrefix ? capPrefix + " " + capBase : capBase;

  return { prefix: capPrefix, base: capBase, full };
}

function difficultyClass(base) {
  const map = {
    "horrific": "horrific",
    "unreal": "unreal",
    "nil": "nil",
    "error": "error",
  };
  return map[base.toLowerCase()] || "";
}

function difficultyIcon(base) {
  const b = base.toLowerCase();
  if (b === "horrific") return ICON_4STAR;
  if (b === "unreal" || b === "nil") return ICON_8STAR;
  if (b === "error") return ICON_ERROR;
  return "";
}

// --- state ---
let visibleCount = PAGE_SIZE;
let activeTierId = "all";
let query = "";

const listEl = document.getElementById("levelList");
const emptyStateEl = document.getElementById("emptyState");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const tierFiltersEl = document.getElementById("tierFilters");
const statTotal = document.getElementById("statTotal");
const statUpdated = document.getElementById("statUpdated");

const CHEVRON_SVG = `<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;

function getFilteredLevels() {
  const q = query.trim().toLowerCase();
  return LEVELS
    .slice()
    .sort((a, b) => a.rank - b.rank)
    .filter((lvl) => {
      const tier = tierForRank(lvl.rank);
      if (activeTierId !== "all" && tier.id !== activeTierId) return false;
      if (!q) return true;
      const name = (lvl.name || "").toLowerCase();
      const creator = (lvl.creator || "").toLowerCase();
      const diff = (lvl.difficulty || "").toLowerCase();
      return name.includes(q) || creator.includes(q) || diff.includes(q);
    });
}

function extractYouTubeId(input) {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const match = input.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

function buildDifficultyBadge(rawDifficulty) {
  const parsed = parseDifficulty(rawDifficulty);
  if (!parsed.base) return `<span class="row-difficulty">—</span>`;

  const cls = difficultyClass(parsed.base);
  const icon = difficultyIcon(parsed.base);
  const badgeClass = cls ? `diff-${cls}` : "";

  return `
    <span class="row-difficulty">
      <span class="diff-badge ${badgeClass}">
        ${icon}
        ${escapeHtml(parsed.full)}
      </span>
    </span>
  `;
}

function buildRow(level, index) {
  const tier = tierForRank(level.rank);
  const li = document.createElement("li");
  li.className = "level-row";
  li.dataset.tier = tier.id;
  li.style.animationDelay = `${Math.min(index, 19) * 30}ms`;

  const rankStr = String(level.rank).padStart(3, "0");
  const diffBadge = buildDifficultyBadge(level.difficulty);

  li.innerHTML = `
    <button class="row-main" type="button" aria-expanded="false">
      <span class="row-rank">#${rankStr}</span>
      <span class="row-name">${escapeHtml(level.name || "Unnamed")}</span>
      ${diffBadge}
      <span class="row-creator">${escapeHtml(level.creator || "—")}</span>
      ${CHEVRON_SVG}
    </button>
  `;

  const btn = li.querySelector(".row-main");
  btn.addEventListener("click", () => toggleRow(li, level));

  return li;
}

function toggleRow(li, level) {
  const btn = li.querySelector(".row-main");
  const isExpanded = li.classList.contains("expanded");

  if (isExpanded) {
    li.classList.remove("expanded");
    btn.setAttribute("aria-expanded", "false");
    return;
  }

  document.querySelectorAll(".level-row.expanded").forEach(other => {
    if (other !== li) {
      other.classList.remove("expanded");
      other.querySelector(".row-main").setAttribute("aria-expanded", "false");
    }
  });

  li.classList.add("expanded");
  btn.setAttribute("aria-expanded", "true");

  if (li.querySelector(".row-detail")) return;

  const videoId = extractYouTubeId(level.videoId);
  const videoMarkup = videoId
    ? `<iframe src="https://www.youtube.com/embed/${videoId}" title="Verification: ${escapeHtml(level.name || "")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : `<div class="detail-video-missing">No video added for this level.</div>`;

  const diffParsed = parseDifficulty(level.difficulty);
  const diffDisplay = diffParsed.full || "—";

  const detail = document.createElement("div");
  detail.className = "row-detail";
  detail.innerHTML = `
    <div class="detail-video">${videoMarkup}</div>
    <dl class="detail-meta">
      <div class="meta-item">
        <dt>Creator</dt>
        <dd>${escapeHtml(level.creator || "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>Verifier</dt>
        <dd>${escapeHtml(level.verifier || "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>Difficulty</dt>
        <dd>${escapeHtml(diffDisplay)}</dd>
      </div>
      <div class="meta-item">
        <dt>Level ID</dt>
        <dd>${escapeHtml(level.levelId != null ? String(level.levelId) : "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>Points</dt>
        <dd>${escapeHtml(level.points != null ? String(level.points) : "—")}</dd>
      </div>
    </dl>
  `;
  li.appendChild(detail);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function render() {
  const filtered = getFilteredLevels();
  const toShow = filtered.slice(0, visibleCount);

  listEl.innerHTML = "";
  const fragment = document.createDocumentFragment();
  toShow.forEach((level, i) => fragment.appendChild(buildRow(level, i)));
  listEl.appendChild(fragment);

  emptyStateEl.hidden = filtered.length !== 0;
  loadMoreBtn.hidden = filtered.length <= visibleCount;
}

function setupControls() {
  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    visibleCount = PAGE_SIZE;
    render();
  });

  tierFiltersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".tier-btn");
    if (!btn) return;
    tierFiltersEl.querySelectorAll(".tier-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeTierId = btn.dataset.tier;
    visibleCount = PAGE_SIZE;
    render();
  });

  loadMoreBtn.addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    render();
  });
}

function setupStats() {
  statTotal.textContent = LEVELS.length;
  statUpdated.textContent = typeof LAST_UPDATE !== "undefined" ? LAST_UPDATE : "—";
}

document.addEventListener("DOMContentLoaded", () => {
  setupControls();
  setupStats();
  render();
});
