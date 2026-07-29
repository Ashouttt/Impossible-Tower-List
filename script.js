/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js
   English, smooth animations, EToH difficulty icons.
   NOW WITH IN-PAGE ADMIN PANEL & LOCALSTORAGE!
   ========================================================= */

const TIERS = [
  { id: "verified",   label: "Verified",   max: Infinity },
  { id: "unverified", label: "Unverified", max: Infinity },
];

const PAGE_SIZE = 50;
const STORAGE_KEY = 'impossible_tower_list_data';

function tierForLevel(level) {
  const verifier = (level.verifier || "").trim();
  if (verifier.length > 0) {
    return TIERS.find(t => t.id === "verified");
  }
  return TIERS.find(t => t.id === "unverified");
}

// --- SVG Icons ---
const ICON_HORRIFIC = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38"/></svg>';

const ICON_UNREAL = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 60,35 98,35 68,56 78,90 50,70 22,90 32,56 2,35 40,35"/></svg>';

const ICON_NIL = '<svg class="diff-icon" viewBox="0 0 100 100"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#555555" stroke-width="5" stroke-linejoin="round"/><g transform="translate(50,50) rotate(45) translate(-50,-50)"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#999999" stroke-width="5" stroke-linejoin="round"/></g></svg>';

const ICON_ERROR = '<svg class="diff-icon" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="4" fill="#cc2222" stroke="#991111" stroke-width="6"/></svg>';

const ICON_ROBLOX = '<svg class="place-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.24 0L0 19.76 19.76 24 24 4.24 4.24 0zM9.6 8.4l6 1.4-1.4 6-6-1.4 1.4-6z"/></svg>';

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

// =========================================================
// LOCALSTORAGE DATA MANAGEMENT
// =========================================================

function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.levels && Array.isArray(parsed.levels)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load from localStorage:", e);
  }
  // Return default data from levels.js
  return {
    levels: typeof LEVELS !== "undefined" ? [...LEVELS] : [],
    lastUpdate: typeof LAST_UPDATE !== "undefined" ? LAST_UPDATE : new Date().toLocaleDateString("pl-PL")
  };
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
    showToast("Failed to save data! Storage might be full.", "error");
    return false;
  }
}

function getLevels() {
  return loadData().levels;
}

function setLevels(levels, lastUpdate) {
  const data = loadData();
  data.levels = levels;
  if (lastUpdate) data.lastUpdate = lastUpdate;
  saveData(data);
}

function exportToLevelsJs() {
  const data = loadData();
  const levelsStr = JSON.stringify(data.levels, null, 2);
  return `/* =========================================================
   IMPOSSIBLE TOWER LIST — levels.js
   AUTO-GENERATED FROM ADMIN PANEL
   ========================================================= */

const LAST_UPDATE = "${data.lastUpdate}";

const LEVELS = ${levelsStr};`;
}

function importFromLevelsJs(code) {
  // Try to extract LEVELS array and LAST_UPDATE
  const levelsMatch = code.match(/const\s+LEVELS\s*=\s*(\[.*?\]);?\s*$/s);
  const updateMatch = code.match(/const\s+LAST_UPDATE\s*=\s*"([^"]+)"/);

  if (!levelsMatch) {
    // Try simpler approach - just JSON
    try {
      const parsed = JSON.parse(code);
      if (Array.isArray(parsed)) {
        setLevels(parsed, new Date().toLocaleDateString("pl-PL"));
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  try {
    const levels = eval(levelsMatch[1]);
    const lastUpdate = updateMatch ? updateMatch[1] : new Date().toLocaleDateString("pl-PL");
    setLevels(levels, lastUpdate);
    return true;
  } catch (e) {
    console.error("Import error:", e);
    return false;
  }
}

// =========================================================
// ADMIN PANEL
// =========================================================

function initAdminPanel() {
  const adminToggleBtn = document.getElementById("adminToggleBtn");
  const adminPanel = document.getElementById("adminPanel");
  const adminCloseBtn = document.getElementById("adminCloseBtn");
  const tabs = document.querySelectorAll(".admin-tab");
  const tabContents = document.querySelectorAll(".admin-tab-content");

  // Open/Close panel
  adminToggleBtn.addEventListener("click", () => {
    adminPanel.classList.add("open");
    refreshAdminList();
    refreshExportCode();
    document.body.style.overflow = "hidden";
  });

  function closePanel() {
    adminPanel.classList.remove("open");
    document.body.style.overflow = "";
    // Close edit modal if open
    const editModal = document.querySelector(".edit-modal-overlay.open");
    if (editModal) editModal.classList.remove("open");
  }

  adminCloseBtn.addEventListener("click", closePanel);
  adminPanel.addEventListener("click", (e) => {
    if (e.target === adminPanel) closePanel();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  // Tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.querySelector(`.admin-tab-content[data-tab="${tab.dataset.tab}"]`).classList.add("active");

      if (tab.dataset.tab === "list") refreshAdminList();
      if (tab.dataset.tab === "import") refreshExportCode();
    });
  });

  // Add Tower Form
  const addForm = document.getElementById("addTowerForm");
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addTowerFromForm();
  });

  document.getElementById("clearFormBtn").addEventListener("click", () => {
    addForm.reset();
  });

  // Admin search
  document.getElementById("adminSearch").addEventListener("input", () => {
    refreshAdminList();
  });

  // Export buttons
  document.getElementById("copyExportBtn").addEventListener("click", () => {
    const code = document.getElementById("exportCode").value;
    navigator.clipboard.writeText(code).then(() => {
      showToast("Copied to clipboard!", "success");
    }).catch(() => {
      showToast("Failed to copy", "error");
    });
  });

  document.getElementById("downloadExportBtn").addEventListener("click", () => {
    const code = exportToLevelsJs();
    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "levels.js";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded levels.js!", "success");
  });

  // Import
  document.getElementById("importBtn").addEventListener("click", () => {
    const code = document.getElementById("importCode").value.trim();
    if (!code) {
      showToast("Paste some code first!", "error");
      return;
    }
    if (confirm("This will overwrite ALL towers. Are you sure?")) {
      if (importFromLevelsJs(code)) {
        showToast("Import successful!", "success");
        document.getElementById("importCode").value = "";
        render();
        refreshAdminList();
        refreshExportCode();
        setupStats();
      } else {
        showToast("Import failed! Check the format.", "error");
      }
    }
  });

  // Reset
  document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("This will delete ALL your changes and restore defaults. Are you sure?")) {
      localStorage.removeItem(STORAGE_KEY);
      showToast("Reset to defaults!", "success");
      render();
      refreshAdminList();
      refreshExportCode();
      setupStats();
    }
  });
}

function addTowerFromForm() {
  const rank = parseInt(document.getElementById("towerRank").value, 10);
  const name = document.getElementById("towerName").value.trim();
  const creator = document.getElementById("towerCreator").value.trim();
  const verifier = document.getElementById("towerVerifier").value.trim();
  const difficulty = document.getElementById("towerDifficulty").value.trim();
  const worldRecord = document.getElementById("towerWorldRecord").value.trim();
  const videoId = document.getElementById("towerVideoId").value.trim();
  const robloxLink = document.getElementById("towerRobloxLink").value.trim();

  if (!name || !creator) {
    showToast("Name and Creator are required!", "error");
    return;
  }

  const newTower = {
    rank: rank,
    name: name,
    creator: creator,
    verifier: verifier,
    difficulty: difficulty,
    videoId: videoId,
    worldRecord: worldRecord || "N/A",
    robloxLink: robloxLink
  };

  let levels = getLevels();

  // If rank is specified and conflicts, shift everything down
  if (rank && rank > 0) {
    // Check if any tower already has this rank
    const existingAtRank = levels.find(l => l.rank === rank);
    if (existingAtRank) {
      // Shift all towers at this rank and below down by 1
      levels = levels.map(l => {
        if (l.rank >= rank) {
          return { ...l, rank: l.rank + 1 };
        }
        return l;
      });
    }
    newTower.rank = rank;
  } else {
    // Auto-assign rank at the end
    const maxRank = levels.length > 0 ? Math.max(...levels.map(l => l.rank)) : 0;
    newTower.rank = maxRank + 1;
  }

  levels.push(newTower);

  // Sort by rank
  levels.sort((a, b) => a.rank - b.rank);

  setLevels(levels, new Date().toLocaleDateString("pl-PL"));

  showToast(`Added "${name}" at rank #${newTower.rank}!`, "success");

  // Clear form
  document.getElementById("addTowerForm").reset();

  // Refresh everything
  render();
  refreshAdminList();
  refreshExportCode();
  setupStats();
}

function deleteTower(rank) {
  if (!confirm(`Delete tower at rank #${rank}?`)) return;

  let levels = getLevels();
  levels = levels.filter(l => l.rank !== rank);

  // Re-sort and re-rank to fill gaps
  levels.sort((a, b) => a.rank - b.rank);
  levels = levels.map((l, i) => ({ ...l, rank: i + 1 }));

  setLevels(levels, new Date().toLocaleDateString("pl-PL"));

  showToast("Tower deleted!", "success");
  render();
  refreshAdminList();
  refreshExportCode();
  setupStats();
}

function editTower(rank) {
  const levels = getLevels();
  const tower = levels.find(l => l.rank === rank);
  if (!tower) return;

  // Create edit modal
  let modal = document.querySelector(".edit-modal-overlay");
  if (modal) modal.remove();

  modal = document.createElement("div");
  modal.className = "edit-modal-overlay";
  modal.innerHTML = `
    <div class="edit-modal">
      <h3>✏️ Edit Tower</h3>
      <form id="editForm" class="admin-form">
        <div class="form-row">
          <div class="form-group">
            <label>Rank</label>
            <input type="number" id="editRank" value="${tower.rank}" min="1" required>
          </div>
          <div class="form-group">
            <label>Name *</label>
            <input type="text" id="editName" value="${escapeHtml(tower.name)}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Creator(s) *</label>
            <input type="text" id="editCreator" value="${escapeHtml(tower.creator)}" required>
          </div>
          <div class="form-group">
            <label>Verifier</label>
            <input type="text" id="editVerifier" value="${escapeHtml(tower.verifier || "")}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Difficulty</label>
            <input type="text" id="editDifficulty" value="${escapeHtml(tower.difficulty || "")}">
          </div>
          <div class="form-group">
            <label>World Record</label>
            <input type="text" id="editWorldRecord" value="${escapeHtml(tower.worldRecord != null ? String(tower.worldRecord) : "N/A")}">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>YouTube Video ID/URL</label>
            <input type="text" id="editVideoId" value="${escapeHtml(tower.videoId || "")}">
          </div>
          <div class="form-group">
            <label>Roblox Link</label>
            <input type="url" id="editRobloxLink" value="${escapeHtml(tower.robloxLink || "")}">
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn-primary">💾 Save Changes</button>
          <button type="button" class="btn-secondary" id="editCancelBtn">Cancel</button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Show modal
  requestAnimationFrame(() => modal.classList.add("open"));

  // Close on backdrop click
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.remove("open");
  });

  document.getElementById("editCancelBtn").addEventListener("click", () => {
    modal.classList.remove("open");
  });

  document.getElementById("editForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const newRank = parseInt(document.getElementById("editRank").value, 10);
    const oldRank = tower.rank;

    let levels = getLevels();

    // Remove the old tower first
    levels = levels.filter(l => l.rank !== oldRank);

    // If rank changed, handle shifting
    if (newRank !== oldRank) {
      // Check if new rank is occupied
      const existingAtNewRank = levels.find(l => l.rank === newRank);
      if (existingAtNewRank) {
        if (newRank > oldRank) {
          // Moving down: shift towers between old+1 and new down by 1 (toward old rank)
          levels = levels.map(l => {
            if (l.rank > oldRank && l.rank <= newRank) {
              return { ...l, rank: l.rank - 1 };
            }
            return l;
          });
        } else {
          // Moving up: shift towers between new and old-1 up by 1
          levels = levels.map(l => {
            if (l.rank >= newRank && l.rank < oldRank) {
              return { ...l, rank: l.rank + 1 };
            }
            return l;
          });
        }
      }
    }

    // Update tower
    tower.rank = newRank;
    tower.name = document.getElementById("editName").value.trim();
    tower.creator = document.getElementById("editCreator").value.trim();
    tower.verifier = document.getElementById("editVerifier").value.trim();
    tower.difficulty = document.getElementById("editDifficulty").value.trim();
    tower.worldRecord = document.getElementById("editWorldRecord").value.trim();
    tower.videoId = document.getElementById("editVideoId").value.trim();
    tower.robloxLink = document.getElementById("editRobloxLink").value.trim();

    levels.push(tower);
    levels.sort((a, b) => a.rank - b.rank);

    setLevels(levels, new Date().toLocaleDateString("pl-PL"));

    modal.classList.remove("open");
    showToast("Tower updated!", "success");
    render();
    refreshAdminList();
    refreshExportCode();
    setupStats();
  });
}

function refreshAdminList() {
  const container = document.getElementById("adminTowerList");
  const search = document.getElementById("adminSearch").value.trim().toLowerCase();
  const levels = getLevels().sort((a, b) => a.rank - b.rank);

  const filtered = search
    ? levels.filter(l => 
        (l.name || "").toLowerCase().includes(search) ||
        (l.creator || "").toLowerCase().includes(search) ||
        (l.difficulty || "").toLowerCase().includes(search)
      )
    : levels;

  document.getElementById("adminCount").textContent = `${filtered.length} tower${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 20px;">No towers found.</p>';
    return;
  }

  container.innerHTML = filtered.map(l => `
    <div class="admin-tower-item">
      <span class="admin-tower-rank">#${l.rank}</span>
      <div class="admin-tower-info">
        <span class="admin-tower-name">${escapeHtml(l.name || "Unnamed")}</span>
        <span class="admin-tower-meta">${escapeHtml(l.creator || "—")} · ${escapeHtml(l.difficulty || "—")} · ${l.verifier ? "✓ Verified" : "○ Unverified"}</span>
      </div>
      <div class="admin-tower-actions">
        <button class="btn-edit" title="Edit" onclick="editTower(${l.rank})">✏️</button>
        <button class="btn-delete" title="Delete" onclick="deleteTower(${l.rank})">🗑️</button>
      </div>
    </div>
  `).join("");
}

function refreshExportCode() {
  const textarea = document.getElementById("exportCode");
  if (textarea) {
    textarea.value = exportToLevelsJs();
  }
}

function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (toast) toast.remove();

  toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
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

const CHEVRON_SVG = '<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

function getFilteredLevels() {
  const q = query.trim().toLowerCase();
  const levels = getLevels();
  return levels
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
  if (!parsed.base) return '<span class="row-difficulty">—</span>';

  const cls = difficultyClass(parsed);
  const icon = difficultyIcon(parsed);
  const badgeClass = cls ? 'diff-' + cls : "";

  return `
    <span class="row-difficulty">
      <span class="diff-badge ${badgeClass}">
        ${icon}
        ${escapeHtml(parsed.full)}
      </span>
    </span>
  `;
}

function buildCreatorSummary(creatorStr) {
  const raw = (creatorStr || "").trim();
  if (!raw) return '<span class="row-creator">—</span>';

  const names = raw.split(",").map(n => n.trim()).filter(Boolean);
  const first = escapeHtml(names[0] || raw);
  const extra = names.length - 1;

  if (extra <= 0) {
    return '<span class="row-creator">' + first + '</span>';
  }

  return '<span class="row-creator"><span class="creator-first">' + first + '</span><span class="creator-more">+' + extra + '</span></span>';
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

  li.innerHTML = `
    <button class="row-main" type="button" aria-expanded="false">
      <span class="row-rank">#${rankStr}</span>
      <span class="row-name">${escapeHtml(level.name || "Unnamed")}</span>
      ${diffBadge}
      ${buildCreatorSummary(level.creator)}
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
      // Measure current height for smooth collapse
      const h = detail.scrollHeight;
      detail.style.maxHeight = h + "px";
      detail.offsetHeight; // force reflow
      detail.style.maxHeight = "0px";
      detail.style.opacity = "0";
      detail.style.paddingTop = "0";
      detail.style.paddingBottom = "0";
      detail.style.gap = "0";
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
        d.style.paddingTop = "0";
        d.style.paddingBottom = "0";
        d.style.gap = "0";
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
      <iframe src="https://www.youtube.com/embed/${videoId}" title="Verification: ${escapeHtml(level.name || "")}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <a href="https://www.youtube.com/watch?v=${videoId}" class="video-fallback" target="_blank" rel="noopener">Watch on YouTube ↗</a>
    `;
    } else {
      videoMarkup = '<div class="detail-video-missing">No video added for this tower.</div>';
    }

    const diffParsed = parseDifficulty(level.difficulty);
    const diffDisplay = diffParsed.full || "—";
    const wrDisplay = level.worldRecord != null ? String(level.worldRecord) : "N/A";
    const verifierDisplay = (level.verifier || "").trim() || "—";
    const statusDisplay = verifierDisplay !== "—" ? "Verified" : "Unverified";

    const robloxLink = (level.robloxLink || "").trim();
    const placeMarkup = robloxLink
      ? '<a href="' + escapeHtml(robloxLink) + '" class="place-link" target="_blank" rel="noopener">' + ICON_ROBLOX + '<span>Play this tower ↗</span></a>'
      : '<div class="place-link place-link-missing">' + ICON_ROBLOX + '<span>No Roblox place link added</span></div>';

    detail = document.createElement("div");
    detail.className = "row-detail";
    detail.innerHTML = `
      <div class="detail-video">${videoMarkup}</div>
      <div class="detail-side">
        <dl class="detail-meta">
          <div class="meta-item">
            <dt>Creator</dt>
            <dd>${escapeHtml(level.creator || "—")}</dd>
          </div>
          <div class="meta-item">
            <dt>Verifier</dt>
            <dd>${escapeHtml(verifierDisplay)}</dd>
          </div>
          <div class="meta-item">
            <dt>Difficulty</dt>
            <dd>${escapeHtml(diffDisplay)}</dd>
          </div>
          <div class="meta-item">
            <dt>World Record</dt>
            <dd>${escapeHtml(wrDisplay)}</dd>
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

  // Measure exact content height and animate to it
  // First reset to natural height to measure
  detail.style.maxHeight = "none";
  detail.style.opacity = "0";
  detail.style.paddingTop = "0";
  detail.style.paddingBottom = "0";
  detail.style.gap = "0";
  const targetH = detail.scrollHeight;

  // Start from 0
  detail.style.maxHeight = "0px";
  detail.offsetHeight; // force reflow

  // Animate to exact measured height
  detail.style.maxHeight = targetH + "px";
  detail.style.opacity = "1";
  detail.style.paddingTop = "4px";
  detail.style.paddingBottom = "28px";
  detail.style.gap = "28px";
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
  const data = loadData();
  statTotal.textContent = data.levels.length;
  statUpdated.textContent = data.lastUpdate || "—";
}

document.addEventListener("DOMContentLoaded", () => {
  setupControls();
  setupStats();
  initAdminPanel();
  render();
});
