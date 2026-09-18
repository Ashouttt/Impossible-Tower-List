/* =========================================================
   IMPOSSIBLE TOWER LIST — chat.js  (v2)
   Live chat for everyone on the page.

   - Real-time messages: Supabase Realtime (Broadcast) —
     works out of the box, no SQL needed.
   - "Online" counter: Supabase Presence.
   - OPTIONAL: create the `chat_messages` table (SQL at the
     bottom of this file) and new visitors will also see the
     last 50 messages.
   - The nickname lives only in memory (a JS variable), so it
     is gone after a page refresh.

   Must be loaded AFTER script.js (uses the global `sbClient`).
   ========================================================= */

(function () {
  "use strict";

  const CHANNEL_NAME = "tower-list-chat";
  const MAX_TEXT     = 300;
  const MAX_NICK     = 20;
  const MAX_HISTORY  = 50;
  const MAX_DOM      = 200;    // max messages kept in the DOM
  const COOLDOWN_MS  = 1000;   // min. delay between your messages
  const GROUP_MS     = 120000; // group messages from one person within 2 min
  const DOCK_MQ      = window.matchMedia("(min-width: 1024px)"); // same as chat.css

  /* ---------- DOM ---------- */
  const $ = (id) => document.getElementById(id);
  const panel      = $("chatPanel");
  const messages   = $("chatMessages");
  const empty      = $("chatEmpty");
  const newMsgBtn  = $("chatNewMsg");
  const input      = $("chatInput");
  const sendBtn    = $("chatSend");
  const hint       = $("chatHint");
  const dot        = $("chatDot");
  const onlineNum  = $("chatOnlineNum");
  const onlineBox  = $("chatOnline");
  const toggleBtn  = $("chatToggle");
  const closeBtn   = $("chatClose");
  const backdrop   = $("chatBackdrop");
  const badge      = $("chatBadge");
  const modal      = $("nickModal");
  const nickForm   = $("nickForm");
  const nickInput  = $("nickInput");
  const nickError  = $("nickError");
  const nickCancel = $("nickCancel");

  if (!panel) return;

  /* ---------- State ---------- */
  const sb = (typeof sbClient !== "undefined" && sbClient) ? sbClient : null;
  const clientId = uid();
  const seen = new Set();
  let nick = null;
  let channel = null;
  let connected = false;
  let lastSend = 0;
  let lastMsg = null;
  let unread = 0;
  let hintTimer = null;

  /* ---------- Helpers ---------- */
  function uid() {
    if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      return (c === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }

  function hueOf(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return h % 360;
  }

  function fmtTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return "";
    }
  }

  function isPanelVisible() {
    return DOCK_MQ.matches || panel.classList.contains("open");
  }

  function nearBottom() {
    return messages.scrollHeight - messages.scrollTop - messages.clientHeight < 80;
  }

  function scrollToBottom() {
    messages.scrollTop = messages.scrollHeight;
    newMsgBtn.hidden = true;
  }

  /* ---------- Hint line under the input ---------- */
  function defaultHint() {
    hint.className = "chat-hint";
    hint.textContent = "";
    if (!sb) {
      hint.textContent = "Chat is unavailable right now.";
    } else if (nick) {
      const b = document.createElement("b");
      b.textContent = nick;
      hint.appendChild(document.createTextNode("Chatting as "));
      hint.appendChild(b);
    } else {
      hint.textContent = "Click the box to pick a nickname.";
    }
  }

  function flashHint(text, isError) {
    clearTimeout(hintTimer);
    hint.className = "chat-hint" + (isError ? " error" : "");
    hint.textContent = text;
    hintTimer = setTimeout(defaultHint, 2600);
  }

  /* ---------- Status / online counter ---------- */
  function setStatus(state) {
    dot.className = "chat-dot" + (state === "on" ? " on" : state === "off" ? " off" : "");
    onlineBox.title = state === "on" ? "Connected" : state === "off" ? "Disconnected — reconnecting…" : "Connecting…";
  }

  function updateOnline() {
    if (!channel) return;
    const count = Object.keys(channel.presenceState()).length;
    onlineNum.textContent = String(Math.max(count, connected ? 1 : 0));
  }

  function takenNicks() {
    const taken = new Set();
    if (!channel) return taken;
    const state = channel.presenceState();
    Object.keys(state).forEach(function (key) {
      if (key === clientId) return;
      state[key].forEach(function (meta) {
        if (meta && meta.nick) taken.add(String(meta.nick).toLowerCase());
      });
    });
    return taken;
  }

  /* ---------- Rendering ---------- */
  function renderMessage(m, opts) {
    opts = opts || {};
    if (seen.has(m.id)) return;
    seen.add(m.id);

    empty.hidden = true;

    const mine = m.cid === clientId;
    const gap = lastMsg ? m.ts - lastMsg.ts : Infinity;
    const cont = !!lastMsg && lastMsg.nick === m.nick && lastMsg.cid === m.cid && gap >= 0 && gap < GROUP_MS;
    lastMsg = { nick: m.nick, cid: m.cid, ts: m.ts };

    const wasNearBottom = nearBottom();
    const hue = hueOf(m.nick);

    const el = document.createElement("div");
    el.className = "chat-msg" + (mine ? " mine" : "") + (cont ? " cont" : "") + (opts.history ? " no-anim" : "");

    // left column: avatar (first message of a group) or hover-time (following ones)
    if (cont) {
      const g = document.createElement("span");
      g.className = "chat-gutter";
      g.textContent = fmtTime(m.ts);
      el.appendChild(g);
    } else {
      const av = document.createElement("div");
      av.className = "chat-avatar";
      av.style.background = "hsl(" + hue + " 70% 66%)";
      av.textContent = Array.from(m.nick)[0].toUpperCase();
      el.appendChild(av);
    }

    const main = document.createElement("div");
    main.className = "chat-msg-main";

    if (!cont) {
      const head = document.createElement("div");
      head.className = "chat-msg-head";

      const n = document.createElement("span");
      n.className = "chat-nick";
      n.textContent = m.nick;
      n.style.color = "hsl(" + hue + " 75% 72%)";

      const t = document.createElement("span");
      t.className = "chat-time";
      t.textContent = fmtTime(m.ts);

      head.appendChild(n);
      head.appendChild(t);
      main.appendChild(head);
    }

    const text = document.createElement("div");
    text.className = "chat-text";
    text.textContent = m.text;
    main.appendChild(text);

    el.appendChild(main);
    messages.appendChild(el);

    while (messages.children.length > MAX_DOM) messages.removeChild(messages.firstChild);

    if (opts.history || mine || wasNearBottom) {
      scrollToBottom();
    } else {
      newMsgBtn.hidden = false;
    }

    if (!opts.history && !mine && !isPanelVisible()) {
      unread++;
      updateBadge();
    }
  }

  function updateBadge() {
    badge.textContent = unread > 9 ? "9+" : String(unread);
    badge.classList.toggle("show", unread > 0);
  }

  function clean(p) {
    if (!p || typeof p !== "object") return null;
    const n = String(p.nick || "").slice(0, MAX_NICK).trim();
    const t = String(p.text || "").slice(0, MAX_TEXT).trim();
    if (!n || !t) return null;
    return {
      id: String(p.id || uid()).slice(0, 64),
      cid: String(p.cid || "").slice(0, 64),
      nick: n,
      text: t,
      ts: Date.now() // receiver's clock (no clock-skew issues)
    };
  }

  /* ---------- Sending ---------- */
  function send() {
    if (!nick) { openNickModal(); return; }

    const text = input.value.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
    if (!text) return;

    if (!connected || !channel) { flashHint("Not connected yet — try again in a moment.", true); return; }

    const now = Date.now();
    if (now - lastSend < COOLDOWN_MS) { flashHint("Slow down a little.", true); return; }
    lastSend = now;

    const msg = { id: uid(), cid: clientId, nick: nick, text: text, ts: now };
    input.value = "";

    channel.send({ type: "broadcast", event: "msg", payload: msg }).then(function (res) {
      if (res !== "ok") {
        input.value = text;
        flashHint("Message failed to send.", true);
        return;
      }
      persist(msg);
    }).catch(function () {
      input.value = text;
      flashHint("Message failed to send.", true);
    });
  }

  // Optional: save to the `chat_messages` table so new visitors see history.
  function persist(m) {
    if (!sb) return;
    try {
      sb.from("chat_messages").insert({ id: m.id, nick: m.nick, text: m.text }).then(function (r) {
        if (r && r.error) console.info("[Chat] History not saved:", r.error.message);
      });
    } catch (e) { /* history is optional */ }
  }

  async function loadHistory() {
    if (!sb) return;
    try {
      const r = await sb
        .from("chat_messages")
        .select("id,nick,text,created_at")
        .order("created_at", { ascending: false })
        .limit(MAX_HISTORY);
      if (r.error || !r.data) return;
      r.data.reverse().forEach(function (row) {
        renderMessage({
          id: String(row.id),
          cid: "h:" + row.nick,
          nick: String(row.nick).slice(0, MAX_NICK),
          text: String(row.text).slice(0, MAX_TEXT),
          ts: new Date(row.created_at).getTime()
        }, { history: true });
      });
      scrollToBottom();
    } catch (e) { /* table may not exist — that's fine */ }
  }

  /* ---------- Realtime ---------- */
  function connect() {
    channel = sb.channel(CHANNEL_NAME, {
      config: {
        broadcast: { self: true },
        presence: { key: clientId }
      }
    });

    channel
      .on("broadcast", { event: "msg" }, function (evt) {
        const m = clean(evt && evt.payload);
        if (m) renderMessage(m);
      })
      .on("presence", { event: "sync" }, updateOnline)
      .subscribe(function (status) {
        if (status === "SUBSCRIBED") {
          connected = true;
          setStatus("on");
          channel.track({ nick: nick });
          updateOnline();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          connected = false;
          setStatus("off");
        }
      });
  }

  /* ---------- Nickname popup ---------- */
  function openNickModal() {
    nickError.textContent = "";
    nickInput.classList.remove("invalid");
    // pre-filled suggestion, selected — just type over it, or press Enter to keep it
    nickInput.value = "Guest" + (1000 + Math.floor(Math.random() * 9000));
    modal.classList.add("open");
    setTimeout(function () {
      nickInput.focus();
      nickInput.select();
    }, 30);
  }

  function closeNickModal() {
    modal.classList.remove("open");
  }

  function nickProblem(v) {
    if (v.length < 2) return "Nickname must be at least 2 characters.";
    if (v.length > MAX_NICK) return "Nickname can be at most " + MAX_NICK + " characters.";
    if (!/^[\p{L}\p{N}_\-. ]+$/u.test(v)) return "Use only letters, numbers, spaces, _ - and .";
    if (takenNicks().has(v.toLowerCase())) return "That nickname is already taken.";
    return "";
  }

  nickForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const v = nickInput.value.replace(/\s+/g, " ").trim();
    const problem = nickProblem(v);
    if (problem) {
      nickError.textContent = problem;
      nickInput.classList.add("invalid");
      nickInput.focus();
      return;
    }
    nick = v;
    if (channel && connected) channel.track({ nick: nick });
    closeNickModal();
    defaultHint();
    input.focus();
  });

  nickInput.addEventListener("input", function () {
    nickError.textContent = "";
    nickInput.classList.remove("invalid");
  });

  nickCancel.addEventListener("click", closeNickModal);

  modal.addEventListener("mousedown", function (e) {
    if (e.target === modal) closeNickModal();
  });

  /* ---------- Panel open / close (small screens) ---------- */
  function openPanel() {
    panel.classList.add("open");
    backdrop.classList.add("show");
    document.body.classList.add("chat-open");
    unread = 0;
    updateBadge();
    scrollToBottom();
  }

  function closePanel() {
    panel.classList.remove("open");
    backdrop.classList.remove("show");
    document.body.classList.remove("chat-open");
  }

  toggleBtn.addEventListener("click", openPanel);
  closeBtn.addEventListener("click", closePanel);
  backdrop.addEventListener("click", closePanel);

  const onDockChange = function () {
    closePanel();
    if (DOCK_MQ.matches) { unread = 0; updateBadge(); }
  };
  if (DOCK_MQ.addEventListener) DOCK_MQ.addEventListener("change", onDockChange);
  else if (DOCK_MQ.addListener) DOCK_MQ.addListener(onDockChange);

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (modal.classList.contains("open")) closeNickModal();
    else if (panel.classList.contains("open")) closePanel();
  });

  /* ---------- Input events ---------- */
  // Clicking the message box without a nickname opens the popup
  input.addEventListener("focus", function () {
    if (!nick) {
      input.blur();
      openNickModal();
    }
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      send();
    }
  });

  sendBtn.addEventListener("click", send);

  newMsgBtn.addEventListener("click", scrollToBottom);

  messages.addEventListener("scroll", function () {
    if (nearBottom()) newMsgBtn.hidden = true;
  });

  /* ---------- Init ---------- */
  defaultHint();

  if (!sb) {
    setStatus("off");
    input.disabled = true;
    sendBtn.disabled = true;
    input.placeholder = "Chat unavailable";
    return;
  }

  setStatus("connecting");
  loadHistory().then(connect, connect);
})();

/* =========================================================
   OPTIONAL — message history (run once in Supabase → SQL Editor)

   create table if not exists chat_messages (
     id uuid primary key,
     nick text not null check (char_length(nick) between 2 and 20),
     text text not null check (char_length(text) between 1 and 300),
     created_at timestamptz not null default now()
   );

   alter table chat_messages enable row level security;

   create policy "chat read"   on chat_messages for select using (true);
   create policy "chat insert" on chat_messages for insert with check (true);

   create index if not exists chat_messages_created_idx
     on chat_messages (created_at desc);
   ========================================================= */
