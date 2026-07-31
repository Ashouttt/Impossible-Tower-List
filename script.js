/* =========================================================
 IMPOSSIBLE TOWER LIST — script.js
 English, smooth animations, EToH difficulty icons.
 ========================================================= */

const TIERS = [
 { id: "verified", label: "Verified", max: Infinity },
 { id: "unverified", label: "Unverified", max: Infinity },
];

const PAGE_SIZE = 50;

function tierForLevel(level) {
 const verifier = (level.verifier || "").trim();
 if (verifier.length > 0) {
 return TIERS.find(t => t.id === "verified");
 }
 return TIERS.find(t => t.id === "unverified");
}

// --- SVG Icons ---
const ICON_HORRIFIC = `<svg class="diff-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5Z"/></svg>`;

const ICON_UNREAL = `<svg class="diff-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L13.5 8.5L20 7L15.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L8.5 12L4 7L10.5 8.5Z"/></svg>`;

const ICON_NIL = `<svg class="diff-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L14 9L21 12L14 15L12 22L10 15L3 12L10 9Z" opacity="0.5"/><path d="M12 5L13.5 10.5L19 12L13.5 13.5L12 19L10.5 13.5L5 12L10.5 10.5Z"/></svg>`;

const ICON_ERROR = `<svg class="diff-icon" viewBox="0 0 24 24" fill="none" stroke="#ff5555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>`;

const ICON_ROBLOX = `<svg class="place-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.8 0L0 19.2L19.2 24L24 4.8L4.8 0ZM15.6 15.6L7.2 13.2L9.6 4.8L18 7.2L15.6 15.6Z"/></svg>`;

// --- Difficulty parsing ---
function parseDifficulty(raw) {
 if (!raw) return { prefix: "", base: "", full: "" };
 const str = String(raw).trim();
 const lowered = str.toLowerCase();

 const prefixMatch = lowered.match(/^(low-mid|mid-high|bottom-low|baseline|bottom|low|mid|high-peak|high|peak|base)(?:\s+|-)/);
 let prefix = "";
 let base = lowered;

 if (prefixMatch) {
 prefix = prefixMatch[1];
 base = lowered.slice(prefixMatch[0].length).trim();
 }

 const capPrefix = prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : "";
 const capBase = base.charAt(0).toUpperCase() + base.slice(1);
 const full = capPrefix ? capPrefix + " " + capBase : capBase;

 return { prefix: capPrefix, base: capBase, full };
}

function difficultyClass(parsed) {
 if (parsed.prefix === "High-Peak") return "high-peak";
 const map = {
 "horrific": "horrific",
 "unreal": "unreal",
 "nil": "nil",
 "error": "error",
 };
 return map[parsed.base.toLowerCase()] || "";
}

function difficultyIcon(parsed) {
 if (parsed.prefix === "High-Peak") return ICON_UNREAL;
 const b = parsed.base.toLowerCase();
 if (b === "horrific") return ICON_HORRIFIC;
 if (b === "unreal") return ICON_UNREAL;
 if (b === "nil") return ICON_NIL;
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

const CHEVRON_SVG = `<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

function getFilteredLevels() {
 const q = query.trim().toLowerCase();
 return LEVELS
 .slice()
 .sort((a, b) => a.rank - b.rank)
 .filter((lvl) => {
 const tier = tierForLevel(lvl);
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
 if (!parsed.base) return "—";

 const cls = difficultyClass(parsed);
 const icon = difficultyIcon(parsed);
 const badgeClass = cls ? "diff-" + cls : "";

 return `<span class="diff-badge ${badgeClass}">${icon}<span>${escapeHtml(parsed.full)}</span></span>`;
}

function buildCreatorSummary(creatorStr) {
 const raw = (creatorStr || "").trim();
 if (!raw) return "—";

 const names = raw.split(",").map(n => n.trim()).filter(Boolean);
 const first = escapeHtml(names[0] || raw);
 const extra = names.length - 1;

 if (extra <= 0) {
 return `<span class="creator-first">${first}</span>`;
 }

 return `<span class="creator-first">${first}</span><span class="creator-more">+${extra}</span>`;
}

function buildRow(level, index) {
 const tier = tierForLevel(level);
 const diffParsed = parseDifficulty(level.difficulty);
 const diffClass = difficultyClass(diffParsed);

 const li = document.createElement("li");
 li.className = "level-row";
 li.dataset.tier = tier.id;
 li.dataset.diff = diffClass || "none";
 li.style.animationDelay = Math.min(index, 19) * 30 + "ms";

 const rankStr = String(level.rank);
 const diffBadge = buildDifficultyBadge(level.difficulty);
 const creatorSummary = buildCreatorSummary(level.creator);

 li.innerHTML = `
 <button class="row-main" aria-expanded="false">
 <span class="row-rank">${escapeHtml(rankStr)}</span>
 <span class="row-name">${escapeHtml(level.name || "—")}</span>
 <span class="row-difficulty">${diffBadge}</span>
 <span class="row-creator">${creatorSummary}</span>
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

 // Collapse this row if already expanded
 if (isExpanded) {
 const detail = li.querySelector(".row-detail");
 if (detail) {
 const h = detail.scrollHeight;
 detail.style.maxHeight = h + "px";
 detail.offsetHeight;
 detail.style.maxHeight = "0px";
 detail.style.opacity = "0";
 }
 li.classList.remove("expanded");
 btn.setAttribute("aria-expanded", "false");
 return;
 }

 // Collapse any other expanded rows
 document.querySelectorAll(".level-row.expanded").forEach(other => {
 if (other !== li) {
 other.classList.remove("expanded");
 other.querySelector(".row-main").setAttribute("aria-expanded", "false");
 const d = other.querySelector(".row-detail");
 if (d) {
 d.style.maxHeight = "0px";
 d.style.opacity = "0";
 }
 }
 });

 li.classList.add("expanded");
 btn.setAttribute("aria-expanded", "true");

 let detail = li.querySelector(".row-detail");

 // Build detail if not present
 if (!detail) {
 const videoId = extractYouTubeId(level.videoId);
 let videoMarkup;

 if (videoId) {
 videoMarkup = `
 <div class="detail-video">
 <iframe src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
 <a class="video-fallback" href="https://youtu.be/${videoId}" target="_blank">Watch on YouTube ↗</a>
 </div>
 `;
 } else {
 videoMarkup = `<div class="detail-video"><div class="detail-video-missing">No video added for this tower.</div></div>`;
 }

 const diffParsed = parseDifficulty(level.difficulty);
 const diffDisplay = diffParsed.full || "—";
 const wrDisplay = level.worldRecord != null ? String(level.worldRecord) : "N/A";
 const verifierDisplay = (level.verifier || "").trim() || "—";
 const statusDisplay = verifierDisplay !== "—" ? "Verified" : "Unverified";

 const robloxLink = (level.robloxLink || "").trim();
 const placeMarkup = robloxLink
 ? `<a class="place-link" href="${escapeHtml(robloxLink)}" target="_blank">${ICON_ROBLOX}Play this tower ↗</a>`
 : `<span class="place-link place-link-missing">${ICON_ROBLOX}No Roblox place link added</span>`;

 detail = document.createElement("div");
 detail.className = "row-detail";
 detail.innerHTML = `
 <div class="detail-video-wrap">
 ${videoMarkup}
 </div>
 <div class="detail-side">
 <dl class="detail-meta">
 <div class="meta-item">
 <dt>Difficulty</dt>
 <dd>${escapeHtml(diffDisplay)}</dd>
 </div>
 <div class="meta-item">
 <dt>World Record</dt>
 <dd>${escapeHtml(wrDisplay)}</dd>
 </div>
 <div class="meta-item">
 <dt>Verifier</dt>
 <dd>${escapeHtml(verifierDisplay)}</dd>
 </div>
 <div class="meta-item">
 <dt>Status</dt>
 <dd>${escapeHtml(statusDisplay)}</dd>
 </div>
 </dl>
 ${placeMarkup}
 </div>
 `;
 li.appendChild(detail);
 }

 detail.style.maxHeight = "none";
 detail.style.opacity = "0";
 const targetH = detail.scrollHeight;

 detail.style.maxHeight = "0px";
 detail.offsetHeight;

 detail.style.maxHeight = targetH + "px";
 detail.style.opacity = "1";
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
