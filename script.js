/* =========================================================
   IMPOSSIBLE TOWER LIST — script.js (jQuery + Supabase version)
   Cache-bust: v12-fixed-like-animation
   ========================================================= */

/* =========================================================
   KONFIGURACJA SUPABASE - DWA PROJEKTY
   ========================================================= */

// PROJEKT 1: Feedback + Online counter
const SUPABASE_URL_MAIN = "https://xcemcdyjgmdzbbdleypt.supabase.co";
const SUPABASE_KEY_MAIN = "sb_publishable_wzfNuTNN1O-zvKjZDA-DxA_Y7MMmmd1";

// PROJEKT 2: Likes
const SUPABASE_URL_LIKES = "https://tpvtcnjvndsabtvsgsqo.supabase.co";
const SUPABASE_KEY_LIKES = "sb_publishable_EG7GAcecDH63HYLMjRIfYA_4TcYSFuw";

// Inicjalizacja klientów Supabase
window.sbClient = null;      // Dla feedback + online (projekt 1)
let sbClientLikes = null;    // Dla likes (projekt 2)

if (typeof window.supabase !== "undefined") {
  try {
    // Klient główny (feedback + online counter)
    window.sbClient = window.supabase.createClient(SUPABASE_URL_MAIN, SUPABASE_KEY_MAIN);
    console.log("[Supabase] Main client (feedback) initialized ✅");
    
    // Klient dla likes (osobny projekt)
    sbClientLikes = window.supabase.createClient(SUPABASE_URL_LIKES, SUPABASE_KEY_LIKES);
    console.log("[Supabase] Likes client initialized ✅");
  } catch (e) {
    console.error("[Supabase] Initialization failed:", e);
  }
} else {
  console.warn("[Supabase] SDK not loaded!");
}

/* =========================================================
   KONFIGURACJA
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

/* =========================================================
   IKONY SVG I OBRAZKI
   ========================================================= */

const ICON_HORRIFIC = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linejoin="round"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38"/></svg>';

const ICON_UNREAL = '<svg class="diff-icon" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linejoin="round"><polygon points="50,2 60,35 98,35 68,56 78,90 50,70 22,90 32,56 2,35 40,35"/></svg>';

const ICON_NIL = '<svg class="diff-icon" viewBox="0 0 100 100"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#555555" stroke-width="5" stroke-linejoin="round"/><g transform="translate(50,50) rotate(45) translate(-50,-50)"><polygon points="50,5 62,38 95,50 62,62 50,95 38,62 5,50 38,38" fill="#0a0a0a" stroke="#999999" stroke-width="5" stroke-linejoin="round"/></g></svg>';

const ICON_ERROR = '<svg class="diff-icon" viewBox="0 0 100 100"><rect x="8" y="8" width="84" height="84" rx="4" fill="#cc2222" stroke="#991111" stroke-width="6"/></svg>';

// ========== IKONY DIFFICULTY (IMGUR - NAPRAWIONE) ==========
const ICON_LITERAL = '<img class="diff-icon" src="https://i.imgur.com/1D7vy3V.png" alt="">';
const ICON_WHY = '<img class="diff-icon" src="https://i.imgur.com/p0RyBgd.png" alt="">';
const ICON_NO = '<img class="diff-icon" src="https://i.imgur.com/GdKvmTl.png" alt="">';
const ICON_DEATH = '<img class="diff-icon" src="https://i.imgur.com/qy37t7y.png" alt="">';
const ICON_HELL = '<img class="diff-icon" src="https://i.imgur.com/QJMlFZC.png" alt="">';
const ICON_TARTARUS = '<img class="diff-icon" src="https://i.imgur.com/JOZcqpe.png" alt="">';
const ICON_UNIMAGINABLE = '<img class="diff-icon" src="https://i.imgur.com/T9BTvyJ.png" alt="">';
const ICON_ALEPH = '<img class="diff-icon" src="https://i.imgur.com/cAKdch2.png" alt="">';
const ICON_IMMEASURABLE = '<img class="diff-icon" src="https://i.imgur.com/zpLMCz0.png" alt="">';
const ICON_MALICIOUS = '<img class="diff-icon" src="https://i.imgur.com/xITLLi3.png" alt="">';
const ICON_ROORXD = '<img class="diff-icon" src="https://i.imgur.com/BRAKUJE_TEGO.png" alt="">'; // ⚠️ DODAJ LINK!

const ICON_ROBLOX = '<svg class="place-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M4.24 0L0 19.76 19.76 24 24 4.24 4.24 0zM9.6 8.4l6 1.4-1.4 6-6-1.4 1.4-6z"/></svg>';

const ICON_HEART_EMPTY = '<svg class="like-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

const ICON_HEART_FILLED = '<svg class="like-icon" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';

/* =========================================================
   PARSOWANIE DIFFICULTY
   ========================================================= */

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
  const base = parsed.base.toLowerCase();
  
  const map = { 
    "horrific": "horrific", 
    "unreal": "unreal", 
    "nil": "nil", 
    "error": "error",
    "literal": "literal",
    "why": "why",
    "no": "no",
    "death": "death",
    "hell": "hell",
    "tartarus": "tartarus",
    "unimaginable": "unimaginable",
    "aleph-null": "aleph-null",
    "immeasurable": "immeasurable",
    "malicious": "malicious",
    "roorxd": "roorxd"
  };
  
  return map[base] || "";
}

function difficultyIcon(parsed) {
  if (parsed.prefix === "High-Peak") return ICON_UNREAL;
  const b = parsed.base.toLowerCase();
  
  // Istniejące
  if (b === "horrific") return ICON_HORRIFIC;
  if (b === "unreal") return ICON_UNREAL;
  if (b === "nil") return ICON_NIL;
  if (b === "error") return ICON_ERROR;
  
  // Nowe difficulty (IMGUR)
  if (b === "literal") return ICON_LITERAL;
  if (b === "why") return ICON_WHY;
  if (b === "no") return ICON_NO;
  if (b === "death") return ICON_DEATH;
  if (b === "hell") return ICON_HELL;
  if (b === "tartarus") return ICON_TARTARUS;
  if (b === "unimaginable") return ICON_UNIMAGINABLE;
  if (b === "aleph-null") return ICON_ALEPH;
  if (b === "immeasurable") return ICON_IMMEASURABLE;
  if (b === "malicious") return ICON_MALICIOUS;
  if (b === "roorxd") return ICON_ROORXD;
  
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

let visibleCount = PAGE_SIZE;
let activeTierId = "all";
let query = "";

const CHEVRON_SVG = '<svg class="row-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

/* =========================================================
   SYSTEM LIKÓW — używa sbClientLikes (PROJEKT 2)
   ========================================================= */

const likesCache = {};

function getUserId() {
  let fp = localStorage.getItem("tower_fp_id");
  if (fp) return fp;
  fp = generateFingerprint();
  localStorage.setItem("tower_fp_id", fp);
  return fp;
}

function generateFingerprint() {
  if (window.crypto && crypto.randomUUID) {
    return "fp_" + crypto.randomUUID();
  }
  return "fp_" + Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function hasLiked(towerId) {
  return localStorage.getItem("liked_" + towerId) === "true";
}

function setLiked(towerId, liked) {
  if (liked) {
    localStorage.setItem("liked_" + towerId, "true");
  } else {
    localStorage.removeItem("liked_" + towerId);
  }
}

async function fetchLikeCount(towerId) {
  if (likesCache[towerId] !== undefined) {
    return likesCache[towerId];
  }
  if (!sbClientLikes) {
    likesCache[towerId] = 0;
    return 0;
  }
  try {
    const { data, error } = await sbClientLikes
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
  if (!sbClientLikes) return likesCache[towerId] || 0;

  const userId = getUserId();

  try {
    if (liked) {
      const { error } = await sbClientLikes
        .from("tower_likes_users")
        .upsert({ tower_id: towerId, user_id: userId }, { onConflict: "tower_id,user_id" });
      if (error) {
        console.warn("[Likes] Upsert error:", error.message, error);
        return null;
      }
    } else {
      const { error } = await sbClientLikes
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

    const { data, error } = await sbClientLikes
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

    // ✅ NAPRAWIONA ANIMACJA - dodaj klasę i usuń po zakończeniu
    $btn.addClass("like-animate");
    setTimeout(function() {
      $btn.removeClass("like-animate");
    }, 380); // Tyle trwa animacja (zgodnie z CSS)

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
   RENDERING
   ========================================================= */

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
    .html('<span class="row-rank">#' + rankStr + '</span><span class="row-name">' + escapeHtml(level.name || "Unnamed") + '</span>' + diffBadge + buildCreatorSummary(level.creator) + '<span class="col-likes-wrap"></span>' + CHEVRON_SVG);

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
      videoMarkup = '<iframe src="https://www.youtube.com/embed/' + videoId + '" title="Verification: ' + escapeHtml(level.name || "") + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><a href="https://www.youtube.com/watch?v=' + videoId + '" class="video-fallback" target="_blank" rel="noopener">Watch on YouTube ↗</a>';
    } else {
      videoMarkup = '<div class="detail-video-missing">No video added for this tower.</div>';
    }
    const diffParsed = parseDifficulty(level.difficulty);
    const diffDisplay = diffParsed.full || "—";
    const wrDisplay = level.worldRecord != null ? String(level.worldRecord) : "N/A";
    const verifierDisplay = (level.verifier || "").trim() || "—";
    const statusDisplay = verifierDisplay !== "—" ? "Verified" : "Unverified";
    const qualityDisplay = (level.quality || "").trim() || "N/A";
    const qualitySafeClass = qualityDisplay.toLowerCase().replace(/[^a-z0-9]/g, '');
    const robloxLink = (level.robloxLink || "").trim();
    const placeMarkup = robloxLink
      ? '<a href="' + escapeHtml(robloxLink) + '" class="place-link" target="_blank" rel="noopener">' + ICON_ROBLOX + '<span>Play this tower ↗</span></a>'
      : '<div class="place-link place-link-missing">' + ICON_ROBLOX + '<span>No Roblox place link added</span></div>';

    $detail = $("<div>")
      .addClass("row-detail")
      .html('<div class="detail-video">' + videoMarkup + '</div><div class="detail-side"><dl class="detail-meta"><div class="meta-item"><dt>Creator</dt><dd>' + escapeHtml(level.creator || "—") + '</dd></div><div class="meta-item"><dt>Verifier</dt><dd>' + escapeHtml(verifierDisplay) + '</dd></div><div class="meta-item"><dt>Difficulty</dt><dd>' + escapeHtml(diffDisplay) + '</dd></div><div class="meta-item"><dt>World Record</dt><dd>' + escapeHtml(wrDisplay) + '</dd></div><div class="meta-item"><dt>Quality</dt><dd class="quality-badge quality-' + qualitySafeClass + '">' + escapeHtml(qualityDisplay) + '</dd></div><div class="meta-item"><dt>Status</dt><dd>' + escapeHtml(statusDisplay) + '</dd></div></dl>' + placeMarkup + '</div>');

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
