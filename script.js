/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js (jQuery version)
   Cache-bust: v2-jquery
   ========================================================= */

const TIERS = [
  { id: "verified",   label: "Verified",   max: Infinity },
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

const ICON_HORRIFIC = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38"/></svg>';

const ICON_UNREAL = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 60,35 98,35 68,56 78,90 50,70 22,90 32,56 2,35 40,35"/></svg>';

const ICON_NIL = '<svg class="diff-icon" viewBox="0 0 100 100"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#555555" stroke-width="5" stroke-linejoin="round"/><g transform="translate(50,50) rotate(45) translate(-50,-50)"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#999999" stroke-width="5" stroke-linejoin="round"/></g></svg>';

const ICON_ERROR = '<svg class="diff-icon" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="4" fill="#cc2222" stroke="#991111" stroke-width="6"/></svg>';

const ICON_ROBLOX = '<svg class="place-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.24 0L0 19.76 19.76 24 24 4.24 4.24 0zM9.6 8.4l6 1.4-1.4 6-6-1.4 1.4-6z"/></svg>';

function parseDifficulty(raw) {
  if (!raw) return { prefix: "", base: "", full: "" };
  const str = String(raw).trim();
  const lowered = str.toLowerCase();
  const prefixMatch = lowered.match(/^(low-mid|mid-high|bottom-low|baseline|bottom|low|mid|high-peak|high|peak|base|skyline)(?:\s+|-)/);
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
  const map = { "horrific": "horrific", "unreal": "unreal", "nil": "nil", "error": "error" };
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

let visibleCount = PAGE_SIZE;
let activeTierId = "all";
let query = "";

const CHEVRON_SVG = '<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

function getFilteredLevels() {
  const q = query.trim().toLowerCase();
  return LEVELS.slice().sort((a, b) => a.rank - b.rank).filter((lvl) => {
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

function escapeHtml(str) {
  return $("<div>").text(str).html();
}

function buildDifficultyBadge(rawDifficulty) {
  const parsed = parseDifficulty(rawDifficulty);
  if (!parsed.base) return '<span class="row-difficulty">—</span>';
  const cls = difficultyClass(parsed);
  const icon = difficultyIcon(parsed);
  const badgeClass = cls ? 'diff-' + cls : "";
  return '<span class="row-difficulty"><span class="diff-badge ' + badgeClass + '">' + icon + escapeHtml(parsed.full) + '</span></span>';
}

function buildCreatorSummary(creatorStr) {
  const raw = (creatorStr || "").trim();
  if (!raw) return '<span class="row-creator">—</span>';
  const names = raw.split(",").map(n => n.trim()).filter(Boolean);
  const first = escapeHtml(names[0] || raw);
  const extra = names.length - 1;
  if (extra <= 0) return '<span class="row-creator">' + first + '</span>';
  return '<span class="row-creator"><span class="creator-first">' + first + '</span><span class="creator-more">+' + extra + '</span></span>';
}

function buildRow(level, index) {
  const tier = tierForLevel(level);
  const diffParsed = parseDifficulty(level.difficulty);
  const diffClass = difficultyClass(diffParsed);
  const rankStr = String(level.rank);
  const diffBadge = buildDifficultyBadge(level.difficulty);
  
  const $li = $("<li>")
    .addClass("level-row")
    .attr("data-tier", tier.id)
    .attr("data-diff", diffClass || "none")
    .css("animationDelay", Math.min(index, 19) * 30 + "ms");

  const $btn = $("<button>")
    .addClass("row-main")
    .attr("type", "button")
    .attr("aria-expanded", "false")
    .html('<span class="row-rank">#' + rankStr + '</span><span class="row-name">' + escapeHtml(level.name || "Unnamed") + '</span>' + diffBadge + buildCreatorSummary(level.creator) + CHEVRON_SVG);

  $btn.on("click", () => toggleRow($li, level));
  $li.append($btn);
  
  return $li;
}

function toggleRow($li, level) {
  const $btn = $li.find(".row-main");
  const isExpanded = $li.hasClass("expanded");

  if (isExpanded) {
    const $detail = $li.find(".row-detail");
    if ($detail.length) {
      const h = $detail[0].scrollHeight;
      $detail.css("maxHeight", h + "px");
      $detail[0].offsetHeight;
      $detail.css({ maxHeight: "0px", opacity: "0" });
    }
    $li.removeClass("expanded");
    $btn.attr("aria-expanded", "false");
    return;
  }

  $(".level-row.expanded").each(function() {
    const $other = $(this);
    if ($other[0] !== $li[0]) {
      $other.removeClass("expanded");
      $other.find(".row-main").attr("aria-expanded", "false");
      const $d = $other.find(".row-detail");
      if ($d.length) {
        $d.css({ maxHeight: "0px", opacity: "0" });
      }
    }
  });

  $li.addClass("expanded");
  $btn.attr("aria-expanded", "true");

  let $detail = $li.find(".row-detail");
  if (!$detail.length) {
    const videoId = extractYouTubeId(level.videoId);
    let videoMarkup;
    if (videoId) {
      videoMarkup = '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="Verification: ' + escapeHtml(level.name || "") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=' + videoId + '" class="video-fallback" target="_blank" rel="noopener">Watch on YouTube ↗</a>';
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
    
    $detail = $("<div>")
      .addClass("row-detail")
      .html('<div class="detail-video">' + videoMarkup + '</div><div class="detail-side"><dl class="detail-meta"><div class="meta-item"><dt>Creator</dt><dd>' + escapeHtml(level.creator || "—") + '</dd></div><div class="meta-item"><dt>Verifier</dt><dd>' + escapeHtml(verifierDisplay) + '</dd></div><div class="meta-item"><dt>Difficulty</dt><dd>' + escapeHtml(diffDisplay) + '</dd></div><div class="meta-item"><dt>World Record</dt><dd>' + escapeHtml(wrDisplay) + '</dd></div><div class="meta-item"><dt>Status</dt><dd>' + escapeHtml(statusDisplay) + '</dd></div></dl>' + placeMarkup + '</div>');
    
    $li.append($detail);
  }

  $detail.css({ maxHeight: "none", opacity: "0" });
  const targetH = $detail[0].scrollHeight;
  $detail.css("maxHeight", "0px");
  $detail[0].offsetHeight;
  $detail.css({ maxHeight: targetH + "px", opacity: "1" });
}

function render() {
  const filtered = getFilteredLevels();
  const toShow = filtered.slice(0, visibleCount);
  
  const $list = $("#levelList").empty();
  const $fragment = $(document.createDocumentFragment());
  
  toShow.forEach((level, i) => {
    $fragment.append(buildRow(level, i));
  });
  
  $list.append($fragment);
  $("#emptyState").prop("hidden", filtered.length !== 0);
  $("#loadMoreBtn").prop("hidden", filtered.length <= visibleCount);
}

function setupControls() {
  $("#searchInput").on("input", function() {
    query = $(this).val();
    visibleCount = PAGE_SIZE;
    render();
  });

  $("#tierFilters").on("click", ".tier-btn", function() {
    $("#tierFilters .tier-btn").removeClass("active");
    $(this).addClass("active");
    activeTierId = $(this).data("tier");
    visibleCount = PAGE_SIZE;
    render();
  });

  $("#loadMoreBtn").on("click", function() {
    visibleCount += PAGE_SIZE;
    render();
  });
}

function setupStats() {
  const $statTotal = $("#statTotal");
  if ($statTotal.length) $statTotal.text(LEVELS.length);
}

$(document).ready(function() {
  setupControls();
  setupStats();
  render();
});
