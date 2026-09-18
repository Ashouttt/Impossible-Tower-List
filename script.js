/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js (jQuery + Supabase version)
   Safe storage + modal fix
   ========================================================= */

/* =========================================================
   SAFE STORAGE
   ========================================================= */

const memoryStorage = {};
let canUseLocalStorage = false;

try {
  const testKey = "__tower_storage_test__";
  localStorage.setItem(testKey, "1");
  localStorage.removeItem(testKey);
  canUseLocalStorage = true;
} catch (error) {
  console.warn("[Storage] localStorage is unavailable; using memory storage.");
}

function storageGet(key) {
  if (canUseLocalStorage) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("[Storage] Failed to read:", key);
    }
  }

  return Object.prototype.hasOwnProperty.call(memoryStorage, key)
    ? memoryStorage[key]
    : null;
}

function storageSet(key, value) {
  if (canUseLocalStorage) {
    try {
      localStorage.setItem(key, value);
      return;
    } catch (error) {
      console.warn("[Storage] Failed to save:", key);
    }
  }

  memoryStorage[key] = String(value);
}

function storageRemove(key) {
  if (canUseLocalStorage) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("[Storage] Failed to remove:", key);
    }
  }

  delete memoryStorage[key];
}

/* =========================================================
   SUPABASE CONFIG
   ========================================================= */

const SUPABASE_URL = "https://tpvtcnjvndsabtvsgsqo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdnRjbmp2bmRzYWJ0dnNnc3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNTA5MjksImV4cCI6MjEwMTcyNjkyOX0.CMMOnMYpZPF5g[...]" ;

/* =========================================================
   USERNAME MODAL
   ========================================================= */

function checkAndShowUsernameModal() {
  setTimeout(() => {
    const $modal = $("#usernameModal");
    const $input = $("#usernameInput");

    if ($modal.length) {
      $modal.addClass("show");
    }

    if ($input.length) {
      $input.trigger("focus");
    }
  }, 300);
}

function saveUsername() {
  const $input = $("#usernameInput");
  const username = String($input.val() || "").trim();

  if (!username) {
    $input.css("border-color", "#ef4444");

    if ($input[0] && typeof $input[0].animate === "function") {
      $input[0].animate([
        { transform: "translateX(0)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(-10px)" },
        { transform: "translateX(10px)" },
        { transform: "translateX(0)" }
      ], {
        duration: 400,
        easing: "ease-in-out"
      });
    }

    setTimeout(() => {
      $input.css("border-color", "");
    }, 1000);

    return;
  }

  storageSet("tower_username", username);
  $("#usernameModal").removeClass("show");
  console.log("Username saved:", username);
}

// Event listeners
$(document).ready(function() {
  checkAndShowUsernameModal();

  $("#usernameSubmit").on("click", saveUsername);

  $("#usernameInput").on("keypress", function(e) {
    if (e.which === 13) {
      saveUsername();
    }
  });

  setupControls();
  setupStats();
  render();
});

/* =========================================================
   SUPABASE CLIENT
   ========================================================= */

let sbClient = null;
if (typeof window.supabase !== "undefined") {
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

/* =========================================================
   TIER + DIFFICULTY HELPERS
   ========================================================= */

const TIERS = [
  { id: "verified", label: "Verified", max: Infinity },
  { id: "unverified", label: "Unverified", max: Infinity }
];

const PAGE_SIZE = 50;

function tierForLevel(level) {
  const verifier = (level.verifier || "").trim();
  if (verifier.length > 0) {
    return TIERS.find(t => t.id === "verified");
  }
  return TIERS.find(t => t.id === "unverified");
}

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
  const map = {
    horrific: "horrific",
    unreal: "unreal",
    nil: "nil",
    error: "error"
  };
  return map[(parsed.base || "").toLowerCase()] || "";
}

function difficultyIcon(parsed) {
  if (parsed.prefix === "High-Peak") return ICON_UNREAL;
  const b = (parsed.base || "").toLowerCase();
  if (b === "horrific") return ICON_HORRIFIC;
  if (b === "unreal") return ICON_UNREAL;
  if (b === "nil") return ICON_NIL;
  if (b === "error") return ICON_ERROR;
  return "";
}

function getQualityClass(quality) {
  if (!quality) return "";
  const q = quality.trim().toUpperCase();

  if (q === "SS+" || q === "SS" || q === "SS-") return "quality-gold";
  if (q === "S+" || q === "S" || q === "S-") return "quality-silver";
  if (q === "A+" || q === "A" || q === "A-") return "quality-bronze";

  return "";
}

/* =========================================================
   ICONS
   ========================================================= */

const ICON_HORRIFIC = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" /></svg>';
const ICON_UNREAL = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 60,35 98,35 68,56 78,90 50,70 22,90 3,56 35,35 2,35" /></svg>';
const ICON_NIL = '<svg class="diff-icon" viewBox="0 0 100 100"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#555555" stroke-width="5" stroke-linejoin="round"/></svg>';
const ICON_ERROR = '<svg class="diff-icon" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="4" fill="#cc2222" stroke="#991111" stroke-width="6"/></svg>';
const ICON_ROBLOX = '<svg class="place-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.24 0L0 19.76 19.76 24 24 4.24 4.24 0zM9.6 8.4l6 1.4-1.4 6-6-1.4 1.4-6z"/></svg>';
const ICON_HEART_EMPTY = '<svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 20.25s-7.5-4.35-9.75-8.27C.3 9.13 2.2 4.5 6.38 4.5c2.15 0 3.37 1.06 4.12 2.17.75-1.11 1.97-2.17 4.12-2.17 4.18 0 6.08 4.63 4.13 7.48-2.25 3.92-9.75 8.27-9.75 8.27z"/></svg>';
const ICON_HEART_FILLED = '<svg class="like-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 20.25s-7.5-4.35-9.75-8.27C.3 9.13 2.2 4.5 6.38 4.5c2.15 0 3.37 1.06 4.12 2.17.75-1.11 1.97-2.17 4.12-2.17 4.18 0 6.08 4.63 4.13 7.48-2.25 3.92-9.75 8.27-9.75 8.27z"/></svg>';
const CHEVRON_SVG = '<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

/* =========================================================
   STORAGE FOR LIKES
   ========================================================= */

const likesCache = {};

function getUserId() {
  let fp = storageGet("tower_fp_id");
  if (fp) return fp;

  fp = generateFingerprint();
  storageSet("tower_fp_id", fp);
  return fp;
}

function generateFingerprint() {
  const components = [];
  components.push(navigator.userAgent);
  components.push(navigator.language || navigator.userLanguage);
  components.push(screen.width + "x" + screen.height + "x" + screen.colorDepth);
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  components.push(navigator.platform);
  components.push(navigator.hardwareConcurrency || "unknown");
  components.push(navigator.deviceMemory || "unknown");
  components.push("ontouchstart" in window ? "touch" : "no-touch");

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 200;
    canvas.height = 50;
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(10, 10, 50, 20);
    ctx.fillStyle = "#069";
    ctx.fillText("Tower Likes FP v1", 10, 30);
    ctx.strokeStyle = "#c00";
    ctx.beginPath();
    ctx.moveTo(100, 10);
    ctx.lineTo(150, 40);
    ctx.stroke();
    components.push(canvas.toDataURL().slice(-50));
  } catch (e) {
    components.push("no-canvas");
  }

  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
      }
    }
  } catch (e) {
    components.push("no-webgl");
  }

  if (navigator.plugins) {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    components.push(plugins.join(","));
  }

  const raw = components.join("||");
  return "fp_" + cyrb53(raw).toString(36);
}

function cyrb53(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

function hasLiked(towerId) {
  return storageGet("liked_" + towerId) === "true";
}

function setLiked(towerId, liked) {
  if (liked) {
    storageSet("liked_" + towerId, "true");
  } else {
    storageRemove("liked_" + towerId);
  }
}

/* =========================================================
   LIKE SYSTEM — SUPABASE
   ========================================================= */

async function fetchLikeCount(towerId) {
  if (likesCache[towerId] !== undefined) {
    return likesCache[towerId];
  }
  if (!sbClient) {
    likesCache[towerId] = 0;
    return 0;
  }
  try {
    const { data, error } = await sbClient
      .from("tower_likes")
      .select("count")
      .eq("tower_id", towerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        likesCache[towerId] = 0;
        return 0;
      }
      console.warn("[Likes] Fetch error:", error.message);
      likesCache[towerId] = 0;
      return 0;
    }

    const count = data ? (data.count || 0) : 0;
    likesCache[towerId] = count;
    return count;
  } catch (e) {
    console.warn("[Likes] Failed to fetch count for", towerId, e.message);
    likesCache[towerId] = 0;
    return 0;
  }
}

async function sendLike(towerId, liked) {
  if (!sbClient) return likesCache[towerId] || 0;

  const userId = getUserId();

  try {
    if (liked) {
      const { error } = await sbClient
        .from("tower_likes_users")
        .upsert({ tower_id: towerId, user_id: userId }, { onConflict: "tower_id,user_id" });
      if (error) {
        console.warn("[Likes] Upsert error:", error.message, error);
        return null;
      }
    } else {
      const { error } = await sbClient
        .from("tower_likes_users")
        .delete()
        .eq("tower_id", towerId)
        .eq("user_id", userId);
      if (error) {
        console.warn("[Likes] Delete error:", error.message, error);
        return null;
      }
    }

    await new Promise(r => setTimeout(r, 100));

    const { data, error } = await sbClient
      .from("tower_likes")
      .select("count")
      .eq("tower_id", towerId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        likesCache[towerId] = 0;
        return 0;
      }
      console.warn("[Likes] Count error:", error.message);
      return likesCache[towerId] || 0;
    }

    const count = data ? (data.count || 0) : 0;
    likesCache[towerId] = count;
    return count;
  } catch (e) {
    console.warn("[Likes] Failed to send like for", towerId, e.message);
    return likesCache[towerId] || 0;
  }
}

function updateLikeButton($btn, count, liked) {
  $btn.toggleClass("liked", liked);
  $btn.find(".like-icon").html(liked ? ICON_HEART_FILLED : ICON_HEART_EMPTY);
  $btn.find(".like-count").text(count);
  $btn.prop("disabled", false);
}

function buildLikeButton(level) {
  const towerId = "tower_" + level.rank;
  const liked = hasLiked(towerId);
  const icon = liked ? ICON_HEART_FILLED : ICON_HEART_EMPTY;
  const $btn = $("<button>")
    .addClass("like-btn")
    .toggleClass("liked", liked)
    .attr("type", "button")
    .attr("data-tower", towerId)
    .html(icon + '<span class="like-count">—</span>');

  fetchLikeCount(towerId).then(function(count) {
    $btn.find(".like-count").text(count);
  });

  $btn.on("click", function(e) {
    e.stopPropagation();
    if ($btn.prop("disabled")) return;

    const currentlyLiked = hasLiked(towerId);
    const newLiked = !currentlyLiked;

    const currentCount = parseInt($btn.find(".like-count").text()) || 0;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    updateLikeButton($btn, newCount, newLiked);
    setLiked(towerId, newLiked);
    $btn.prop("disabled", true);

    sendLike(towerId, newLiked).then(function(serverCount) {
      if (serverCount !== null) {
        updateLikeButton($btn, serverCount, newLiked);
      }
    }).catch(function() {
      updateLikeButton($btn, currentCount, currentlyLiked);
      setLiked(towerId, currentlyLiked);
    });
  });

  return $btn;
}

/* =========================================================
   LIST RENDERING
   ========================================================= */

let visibleCount = PAGE_SIZE;
let activeTierId = "all";
let query = "";

function getFilteredLevels() {
  const q = (query || "").trim().toLowerCase();

  return LEVELS.slice()
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

function escapeHtml(str) {
  return $("<div>").text(String(str || "")).html();
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

  if (level.special) {
    $li.addClass(level.special);
  }

  const qualityClass = getQualityClass(level.quality);
  if (qualityClass) {
    $li.addClass(qualityClass);
  }

  const $likeBtn = buildLikeButton(level);

  const $btn = $("<button>")
    .addClass("row-main")
    .attr("type", "button")
    .attr("aria-expanded", "false")
    .html('<span class="row-rank">#' + rankStr + '</span><span class="row-name">' + escapeHtml(level.name || "Unnamed") + '</span>' + diffBadge + buildCreatorSummary(level.creator) + '<span class="col-likes-wrap"></span><span class="row-chevron">' + CHEVRON_SVG + '</span>');

  $btn.find(".col-likes-wrap").append($likeBtn);

  $btn.on("click", function(e) {
    if ($(e.target).closest(".like-btn").length) return;
    toggleRow($li, level);
  });

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
      videoMarkup = '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="Verification: ' + escapeHtml(level.name || "") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    } else {
      videoMarkup = '<div class="detail-video-missing">No video added for this tower.</div>';
    }

    const diffParsed = parseDifficulty(level.difficulty);
    const diffDisplay = diffParsed.full || "—";
    const wrDisplay = level.worldRecord != null ? String(level.worldRecord) : "N/A";
    const verifierDisplay = (level.verifier || "").trim() || "—";
    const statusDisplay = verifierDisplay !== "—" ? "Verified" : "Unverified";
    const qualityDisplay = (level.quality || "").trim() || "N/A";
    const qualitySafeClass = qualityDisplay.toLowerCase().replace(/[^a-z0-9]/g, "");
    const robloxLink = (level.robloxLink || "").trim();
    const placeMarkup = robloxLink
      ? '<a href="' + escapeHtml(robloxLink) + '" class="place-link" target="_blank" rel="noopener">' + ICON_ROBLOX + '<span>Play this tower ↗</span></a>'
      : '<div class="place-link place-link-missing">' + ICON_ROBLOX + '<span>No Roblox place link added</span></div>';

    $detail = $("<div>")
      .addClass("row-detail")
      .html(
        '<div class="detail-video">' + videoMarkup + '</div>' +
        '<div class="detail-side">' +
          '<dl class="detail-meta">' +
            '<div class="meta-item"><dt>Creator</dt><dd>' + escapeHtml(level.creator || "—") + '</dd></div>' +
            '<div class="meta-item"><dt>Difficulty</dt><dd>' + escapeHtml(diffDisplay) + '</dd></div>' +
            '<div class="meta-item"><dt>Verifier</dt><dd>' + escapeHtml(verifierDisplay) + '</dd></div>' +
            '<div class="meta-item"><dt>Status</dt><dd>' + escapeHtml(statusDisplay) + '</dd></div>' +
            '<div class="meta-item"><dt>WR</dt><dd>' + escapeHtml(wrDisplay) + '</dd></div>' +
            '<div class="meta-item"><dt>Quality</dt><dd class="quality-' + qualitySafeClass + '">' + escapeHtml(qualityDisplay) + '</dd></div>' +
          '</dl>' +
          placeMarkup +
        '</div>'
      );

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
    try {
      $fragment.append(buildRow(level, i));
    } catch (error) {
      console.error("[Render] Failed to render tower:", level, error);
    }
  });

  $list.append($fragment);
  $("#emptyState").prop("hidden", $list.children().length !== 0);
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

/* =========================================================
   END
   ========================================================= */
