/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js
   Simplified, smooth, no tower SVG nonsense.
   ========================================================= */

const TIERS = [
  { id: "summit",      label: "Szczyt",           max: 10   },
  { id: "upper",       label: "Górne Piętra",      max: 50   },
  { id: "middle",      label: "Środkowe Piętra",   max: 200  },
  { id: "foundations", label: "Fundamenty",        max: Infinity },
];

const PAGE_SIZE = 50;

function tierForRank(rank) {
  for (const tier of TIERS) {
    if (rank <= tier.max) return tier;
  }
  return TIERS[TIERS.length - 1];
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
      return name.includes(q) || creator.includes(q);
    });
}

function extractYouTubeId(input) {
  if (!input) return "";
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const match = input.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

function buildRow(level, index) {
  const tier = tierForRank(level.rank);
  const li = document.createElement("li");
  li.className = "level-row";
  li.dataset.tier = tier.id;
  li.style.animationDelay = `${Math.min(index, 19) * 30}ms`;

  const rankStr = String(level.rank).padStart(3, "0");

  li.innerHTML = `
    <button class="row-main" type="button" aria-expanded="false">
      <span class="row-rank">#${rankStr}</span>
      <span class="row-name">${escapeHtml(level.name || "Bez nazwy")}</span>
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

  // Close any other expanded row for cleaner UX
  document.querySelectorAll(".level-row.expanded").forEach(other => {
    if (other !== li) {
      other.classList.remove("expanded");
      other.querySelector(".row-main").setAttribute("aria-expanded", "false");
    }
  });

  li.classList.add("expanded");
  btn.setAttribute("aria-expanded", "true");

  // Only build detail once
  if (li.querySelector(".row-detail")) return;

  const videoId = extractYouTubeId(level.videoId);
  const videoMarkup = videoId
    ? `<iframe src="https://www.youtube.com/embed/${videoId}" title="Weryfikacja: ${escapeHtml(level.name || "")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    : `<div class="detail-video-missing">Brak dodanego wideo dla tego poziomu.</div>`;

  const detail = document.createElement("div");
  detail.className = "row-detail";
  detail.innerHTML = `
    <div class="detail-video">${videoMarkup}</div>
    <dl class="detail-meta">
      <div class="meta-item">
        <dt>Twórca</dt>
        <dd>${escapeHtml(level.creator || "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>Weryfikacja</dt>
        <dd>${escapeHtml(level.verifier || "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>ID poziomu</dt>
        <dd>${escapeHtml(level.levelId != null ? String(level.levelId) : "—")}</dd>
      </div>
      <div class="meta-item">
        <dt>Punkty</dt>
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
