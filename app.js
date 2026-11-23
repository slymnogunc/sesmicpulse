/* Seismic Pulse — arayüz.
   Veri: data/pulse.js (otomatik, Türkçe kaynak), data/discord.js (elle), data/lang/<dil>.js (çeviriler). */
(function () {
  "use strict";
  var P = window.SEISMIC_PULSE || {};
  var D = window.SEISMIC_DISCORD || { announcements: [], spotlight: [] };
  var LANGS = window.SEISMIC_LANG || {};
  var L = window.SP_LANG || "en";
  var CUR = LANGS[L] || {}, EN = LANGS.en || {};
  var LOCALE = { en: "en-GB", zh: "zh-CN", ja: "ja-JP", hi: "hi-IN", pcm: "en-NG", de: "de-DE", fr: "fr-FR", es: "es-ES", ru: "ru-RU", tr: "tr-TR" }[L] || "en-GB";
  var NAMES = { en: "English", zh: "中文", ja: "日本語", hi: "हिन्दी", pcm: "Naijá", de: "Deutsch", fr: "Français", es: "Español", ru: "Русский", tr: "Türkçe" };
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- Çeviri ---------- */
  // Arayüz metni: seçili dil → İngilizce → anahtar.
  function t(key, vars) {
    var s = (CUR.ui && CUR.ui[key]) || (EN.ui && EN.ui[key]) || key;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split("{" + k + "}").join(vars[k]); });
    return s;
  }
  // İçerik metni (kaynağı Türkçe): seçili dil → İngilizce → Türkçe özgün metin.
  function c(s) {
    if (s == null || L === "tr") return s;
    return (CUR.c && CUR.c[s]) || (EN.c && EN.c[s]) || s;
  }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : "#"; }
  function toDate(s) { return new Date(/T/.test(s) ? s : s + "T12:00:00Z"); }
  function fmtDate(s) {
    var d = toDate(s), o = { day: "numeric", month: "long", timeZone: "UTC" };
    if (d.getUTCFullYear() !== new Date().getFullYear()) o.year = "numeric";
    try { return d.toLocaleDateString(LOCALE, o); } catch (e) { return d.toISOString().slice(0, 10); }
  }
  var RTF = null;
  try { RTF = new Intl.RelativeTimeFormat([LOCALE, "en"], { numeric: "auto" }); } catch (e) {}
  function ago(s) {
    var diff = Date.now() - toDate(s).getTime();
    if (diff < 0 || !RTF) return fmtDate(s);
    var m = Math.round(diff / 60000), h = Math.round(diff / 3600000), d = Math.floor(diff / 86400000);
    if (/T/.test(s)) {
      if (m < 60) return RTF.format(-Math.max(m, 1), "minute");
      if (h < 24) return RTF.format(-h, "hour");
    }
    if (d < 30) return RTF.format(-d, "day");
    return fmtDate(s);
  }
  function isNew(s) { return Date.now() - toDate(s).getTime() < 4 * 86400000; }
  function num(n) { try { return typeof n === "number" ? n.toLocaleString(LOCALE) : n; } catch (e) { return n; } }
  function store(k, v) {
    try {
      if (v === undefined) return JSON.parse(localStorage.getItem(k));
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) { return null; }
  }
  function embed(id, title) {
    return '<iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?rel=0&hl=' + esc(L === "pcm" ? "en" : L) + '" title="' + esc(title || "YouTube") + '" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  }
  function media(o) {
    if (o.video) return '<div class="media">' + embed(o.video, o.title) + "</div>";
    if (o.image && /^https:\/\//.test(o.image)) return '<a class="media" href="' + esc(safeUrl(o.url)) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"><img loading="lazy" referrerpolicy="no-referrer" alt="" src="' + esc(o.image) + '" onerror="this.parentNode.remove()"></a>';
    return "";
  }

  // Elle girilen metinler düz yazı ya da { en: "...", tr: "..." } olabilir.
  function loc(v) {
    if (v && typeof v === "object") return v[L] || v.en || v.tr || v[Object.keys(v)[0]] || "";
    return v || "";
  }

  /* ---------- Çalışma alanım: yalnızca bu tarayıcıda saklanır ---------- */
  var WS_KEY = "sp-ws", wsMem = null, WS_SRC = {};
  function wsLoad() {
    if (wsMem) return wsMem;
    try { var d = JSON.parse(localStorage.getItem(WS_KEY)); wsMem = Array.isArray(d) ? d : []; } catch (e) { wsMem = []; }
    return wsMem;
  }
  function wsSave() { try { localStorage.setItem(WS_KEY, JSON.stringify(wsMem)); } catch (e) {} }
  function wsHas(id) { return wsLoad().some(function (x) { return x.id === id; }); }
  // k: tür, t: başlık, s: özet (ikisi de pulse.js'teki Türkçe kaynak metin ya da düz yazı), u: bağlantı, d: içerik tarihi
  function wsBtn(o) {
    if (!o.id) return "";
    WS_SRC[o.id] = o;
    var on = wsHas(o.id);
    return '<button class="ws-btn" type="button" data-ws="' + esc(o.id) + '" aria-pressed="' + on + '">' + esc(t(on ? "ws_added" : "ws_add")) + "</button>";
  }
  function wsText(src, snap, snapLang) {
    if (!src) return "";
    if (L === "tr") return src;
    return (CUR.c && CUR.c[src]) || (snapLang === L && snap) || (EN.c && EN.c[src]) || snap || src;
  }

  /* ---------- Sabit metinler, dil seçici ---------- */
  [].forEach.call(document.querySelectorAll("[data-i18n]"), function (el) { el.textContent = t(el.getAttribute("data-i18n")); });
  document.title = t("title");
  var md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", t("desc"));
  $("theme").setAttribute("aria-label", t("theme"));
  $("lang").querySelector("summary").setAttribute("aria-label", t("lang"));
  $("lang-flag").setAttribute("href", "#f-" + L);
  $("nav-ws").setAttribute("aria-label", t("ws_nav"));
  $("lang-name").textContent = NAMES[L] || L;
  [].forEach.call($("lang").querySelectorAll("[data-lang]"), function (b) { b.setAttribute("aria-current", String(b.dataset.lang === L)); });
  $("lang").addEventListener("click", function (e) {
    var b = e.target.closest("[data-lang]"); if (!b) return;
    try { localStorage.setItem("sp-lang-ui", b.dataset.lang); } catch (err) {}
    window.name = "sp-lang:" + b.dataset.lang;
    if (/[?&]lang=/.test(location.search)) location.href = location.pathname + location.hash; else location.reload();
  });
  document.addEventListener("click", function (e) { if (!e.target.closest("#lang")) $("lang").open = false; });

  /* ---------- Birleşik akış ---------- */
  var KIND = { news: t("k_news"), youtube: "YouTube", x: "X", github: "GitHub", discord: "Discord" };
  var feed = [];
  (P.news || []).forEach(function (n) { feed.push({ k: "news", date: n.date, title: c(n.title), meta: c(n.source), url: n.url }); });
  ((P.youtube && P.youtube.videos) || []).forEach(function (v) { feed.push({ k: "youtube", date: v.date, title: c(v.title), meta: c(v.channel), url: "https://www.youtube.com/watch?v=" + v.id }); });
  ((P.x && P.x.posts) || []).forEach(function (p) { feed.push({ k: "x", date: p.date, title: c(p.title), meta: "@" + p.handle, url: p.url }); });
  ((P.github && P.github.daily) || []).forEach(function (g) { feed.push({ k: "github", date: g.date, title: c(g.headline), meta: t("gh_changes", { n: g.items.length }), url: "#gh-" + g.date }); });
  (D.announcements || []).forEach(function (a) { feed.push({ k: "discord", date: a.date, title: loc(a.title), meta: t("dc_ann"), url: a.link || a.tweet || "#discord" }); });
  (D.spotlight || []).forEach(function (a) { feed.push({ k: "discord", date: a.date, title: loc(a.title) || a.author || t("dc_spot"), meta: t("dc_spot"), url: a.link || a.tweet || "#discord" }); });
  feed.sort(function (a, b) { return toDate(b.date) - toDate(a.date); });

  function rowHtml(f) {
    var ext = /^https?:/.test(f.url);
    return '<li><a href="' + esc(ext ? safeUrl(f.url) : f.url) + '"' + (ext ? ' target="_blank" rel="noopener"' : "") + ">" +
      '<span class="row-src">' + esc(KIND[f.k]) + "</span>" +
      '<span><span class="row-title">' + (isNew(f.date) ? '<span class="tag-new">' + esc(t("new")) + "</span>" : "") + esc(f.title) + "</span>" +
      '<span class="row-meta">' + esc(f.meta) + ", " + esc(ago(f.date)) + "</span></span></a></li>";
  }

  /* ---------- Üst bilgi, hero, son gelişmeler ---------- */
  if (P.updatedAt) $("updated").textContent = t("updated", { t: ago(P.updatedAt) });
  var lead = P.lead;
  if (lead) {
    $("hero-kicker").textContent = t("hero_kicker", { kind: c(lead.kind) || "", date: fmtDate(lead.date), ago: ago(lead.date) });
    $("hero-title").textContent = c(lead.title);
    $("hero-sum").textContent = c(lead.summary) || "";
    $("hero-link").href = safeUrl(lead.url);
    if (lead.cta) $("hero-link").textContent = c(lead.cta);
  }
  $("latest").innerHTML = feed.filter(function (f) { return !lead || f.url !== lead.url; }).slice(0, 6).map(rowHtml).join("");
  $("stats").innerHTML = (P.stats || []).map(function (s) {
    return '<div><a href="' + esc(safeUrl(s.url)) + '" target="_blank" rel="noopener"><dd>' + esc(c(s.value)) + "</dd><dt>" + esc(c(s.label)) + "</dt></a></div>";
  }).join("");

  /* ---------- Mindshare ---------- */
  var MS = P.mindshare || { topics: [] };
  $("ms-note").textContent = c(MS.note) || "";
  if (MS.date) $("ms-date").textContent = fmtDate(MS.date);
  $("topics").innerHTML = MS.topics.map(function (o) {
    return '<article class="topic">' + media(o) +
      '<span class="topic-cat">' + esc(c(o.category)) + "</span>" +
      "<h3>" + esc(c(o.title)) + "</h3>" +
      "<p>" + esc(c(o.angle)) + "</p>" +
      '<div class="topic-foot"><span class="topic-src">' + esc(t("src")) + ' <a href="' + esc(safeUrl(o.url)) + '" target="_blank" rel="noopener">' + esc(c(o.source)) + "</a>, " + esc(fmtDate(o.date)) + "</span>" +
      '<span class="topic-acts">' + wsBtn({ id: "topic|" + o.url, k: "Mindshare", t: o.title, s: o.angle, u: o.url, d: o.date }) +
      '<a class="btn btn-outline" href="' + esc(safeUrl(o.url)) + '" target="_blank" rel="noopener">' + esc(t("open_src")) + "</a></span></div>" +
      "</article>";
  }).join("");

  /* ---------- YouTube ---------- */
  var YT = (P.youtube && P.youtube.videos) || [];
  $("yt-note").textContent = c(P.youtube && P.youtube.note) || "";
  $("yt-grid").innerHTML = YT.map(function (v) {
    return '<li class="vid"><div class="media">' + embed(v.id, c(v.title)) + "</div>" +
      '<h3><a href="https://www.youtube.com/watch?v=' + esc(v.id) + '" target="_blank" rel="noopener">' + (isNew(v.date) ? '<span class="tag-new">' + esc(t("new")) + "</span>" : "") + esc(c(v.title)) + "</a></h3>" +
      '<span class="fine">' + esc(c(v.channel) + " · " + fmtDate(v.date) + " · " + c(v.duration) + (v.views != null ? " · " + t("views", { n: num(v.views) }) : "")) + "</span>" +
      "<p>" + esc(c(v.summary) || "") + "</p>" +
      wsBtn({ id: "yt|" + v.id, k: "YouTube", t: v.title, s: v.summary, u: "https://www.youtube.com/watch?v=" + v.id, d: v.date }) + "</li>";
  }).join("");

  /* ---------- GitHub ---------- */
  var GH = P.github || { daily: [], repos: [] };
  var ORG = GH.org || "SeismicSystems";
  $("gh-note").textContent = t("gh_note", { t: GH.checkedAt ? ago(GH.checkedAt) : "?" });
  $("gh-live-state").textContent = t("gh_loading");
  $("gh-live-note").textContent = t("gh_live_note0");
  function commitUrl(repo, sha) { return "https://github.com/" + ORG + "/" + repo + "/commit/" + sha; }
  $("gh-days").innerHTML = (GH.status ? '<p class="gh-status">' + esc(c(GH.status)) + "</p>" : "") +
    (GH.daily || []).map(function (d, i) {
      return '<details class="day" id="gh-' + esc(d.date) + '"' + (i === 0 ? " open" : "") + ">" +
        '<summary><span class="day-date">' + esc(fmtDate(d.date)) + '</span><span class="day-head">' + esc(c(d.headline)) + '</span><span class="day-count">' + esc(t("gh_changes", { n: d.items.length })) + "</span></summary>" +
        '<div class="day-body"><p>' + esc(c(d.summary)) + "</p>" +
        wsBtn({ id: "gh|" + d.date, k: "GitHub", t: d.headline, s: d.summary, u: "https://github.com/" + ORG, d: d.date }) + '<div class="changes">' +
        d.items.map(function (it) {
          return '<div class="change"><span class="change-top">' + esc(it.repo) + ' · <a href="' + esc(commitUrl(it.repo, it.sha)) + '" target="_blank" rel="noopener">' + esc(it.sha) + "</a>" + (it.author ? " · " + esc(it.author) : "") + "</span>" +
            '<span class="change-exp">' + esc(c(it.explain)) + '</span><span class="change-msg fine">' + esc(it.message) + "</span></div>";
        }).join("") + "</div></div></details>";
    }).join("");
  function openHashDay() { if (location.hash.indexOf("#gh-") === 0) { var el = document.getElementById(location.hash.slice(1)); if (el) el.open = true; } }
  openHashDay(); window.addEventListener("hashchange", openHashDay);

  var KNOWN = {}; (GH.repos || []).forEach(function (r) { KNOWN[r.name] = r.description; });
  function paintRepos(list) {
    $("gh-repos").innerHTML = list.map(function (r) {
      var desc = KNOWN[r.name] ? c(KNOWN[r.name]) : (r.description || "");
      return '<li><a href="https://github.com/' + ORG + "/" + esc(r.name) + '" target="_blank" rel="noopener"><span>' + esc(r.name) + '</span><span class="fine">★ ' + num(r.stars) + "</span></a>" +
        '<span class="fine">' + esc(desc) + (r.pushedAt ? " " + esc(t("gh_last", { t: ago(r.pushedAt) })) : "") + "</span></li>";
    }).join("");
  }
  paintRepos(GH.repos || []);

  function paintCommits(list, live, when) {
    var st = $("gh-live-state");
    st.textContent = live ? t("gh_state_live") : t("gh_state_saved");
    st.classList.toggle("is-live", !!live);
    $("gh-live-note").textContent = live ? t("gh_live_note1", { t: ago(when) }) : t("gh_live_note2");
    $("gh-live").innerHTML = list.slice(0, 12).map(function (cm) {
      return '<li><a href="' + esc(commitUrl(cm.repo, cm.sha)) + '" target="_blank" rel="noopener">' + esc(cm.message) +
        '<span class="fine">' + esc(cm.repo) + " · " + esc(cm.author || "") + " · " + esc(ago(cm.date)) + "</span></a></li>";
    }).join("") || '<li class="fine">' + esc(t("gh_none")) + "</li>";
  }
  function bakedCommits() {
    var out = [];
    (GH.daily || []).forEach(function (d) { d.items.forEach(function (it) { out.push({ repo: it.repo, sha: it.sha, message: it.message, author: it.author, date: d.date }); }); });
    return out;
  }
  function loadLive() {
    var cache = store("sp-gh");
    if (cache && Date.now() - cache.at < 20 * 60000) { paintCommits(cache.commits, true, new Date(cache.at).toISOString()); if (cache.repos) paintRepos(cache.repos); return; }
    if (!window.fetch) { paintCommits(bakedCommits(), false); return; }
    var api = "https://api.github.com/";
    var since = new Date(Date.now() - 30 * 86400000).toISOString();
    fetch(api + "orgs/" + ORG + "/repos?sort=pushed&per_page=8", { headers: { Accept: "application/vnd.github+json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (repos) {
        var active = repos.filter(function (r) { return r.pushed_at > since; }).slice(0, 6);
        var repoList = repos.slice(0, 8).map(function (r) { return { name: r.name, description: r.description, stars: r.stargazers_count, pushedAt: r.pushed_at }; });
        return Promise.all(active.map(function (r) {
          return fetch(api + "repos/" + ORG + "/" + r.name + "/commits?per_page=8&since=" + since)
            .then(function (x) { return x.ok ? x.json() : []; })
            .then(function (cs) {
              return (Array.isArray(cs) ? cs : []).map(function (cm) {
                return { repo: r.name, sha: cm.sha.slice(0, 7), message: cm.commit.message.split("\n")[0], author: (cm.author && cm.author.login) || cm.commit.author.name, date: cm.commit.author.date };
              });
            }).catch(function () { return []; });
        })).then(function (groups) {
          var all = [].concat.apply([], groups).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
          store("sp-gh", { at: Date.now(), commits: all.slice(0, 20), repos: repoList });
          paintRepos(repoList);
          paintCommits(all, true, new Date().toISOString());
        });
      })
      .catch(function () { paintCommits(bakedCommits(), false); });
  }
  loadLive();

  /* ---------- X ---------- */
  var X = P.x || { accounts: [], posts: [] };
  $("x-note").textContent = t("x_note");
  var acc = {}; X.accounts.forEach(function (a) { acc[a.handle] = a; });
  var xFilter = "";
  function paintX() {
    $("x-filters").innerHTML = '<button type="button" data-h="" aria-pressed="' + (xFilter === "") + '">' + esc(t("all")) + "</button>" +
      X.accounts.map(function (a) { return '<button type="button" data-h="' + esc(a.handle) + '" aria-pressed="' + (xFilter === a.handle) + '">' + esc(a.name) + " · " + esc(c(a.role)) + "</button>"; }).join("");
    var list = X.posts.filter(function (p) { return !xFilter || p.handle === xFilter; });
    $("x-posts").innerHTML = list.map(function (p) {
      var a = acc[p.handle] || { name: p.handle }, n = [];
      if (p.likes != null) n.push("♥ " + num(p.likes));
      if (p.reposts != null) n.push("↻ " + num(p.reposts));
      if (p.views) n.push(t("views", { n: c(p.views) }));
      return '<li class="post"><a href="' + esc(safeUrl(p.url)) + '" target="_blank" rel="noopener">' +
        '<span class="post-who"><b>' + esc(a.name) + "</b> @" + esc(p.handle) + " · " + esc(fmtDate(p.date)) + (p.pinned ? " · " + esc(t("x_pinned")) : "") + "</span>" +
        '<div class="post-t">' + esc(c(p.title)) + "</div>" +
        (p.summary ? '<div class="post-s">' + esc(c(p.summary)) + "</div>" : "") +
        (n.length ? '<div class="post-n">' + n.map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" : "") +
        "</a>" + wsBtn({ id: "x|" + p.url, k: "X", t: p.title, s: p.summary, u: p.url, d: p.date }) + "</li>";
    }).join("") || '<li class="fine" style="padding:16px 0">' + esc(t("x_empty")) + "</li>";
  }
  $("x-filters").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { xFilter = b.dataset.h; paintX(); } });
  paintX();

  /* ---------- Discord (elle girilir, çevrilmez) ---------- */
  if (D.invite) $("dc-invite").href = safeUrl(D.invite);
  // Kayıtta "tweet" alanı varsa gönderi X'in kendi gömme aracıyla önizlenir.
  function tweetHtml(url) {
    var m = /^https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([A-Za-z0-9_]{1,15})\/status\/(\d+)/.exec(url || "");
    if (!m) return "";
    var dark = document.documentElement.dataset.theme ? document.documentElement.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    var tl = { zh: "zh-cn", pcm: "en" }[L] || L;
    return '<div class="tweet"><blockquote class="twitter-tweet" data-dnt="true" data-conversation="none" data-lang="' + tl + '"' + (dark ? ' data-theme="dark"' : "") + '>' +
      '<a href="https://twitter.com/' + m[1] + "/status/" + m[2] + '" target="_blank" rel="noopener">' + esc(t("x_post")) + " · @" + esc(m[1]) + "</a></blockquote></div>";
  }
  function dcList(items, emptyKey) {
    if (!items || !items.length) return '<li class="dc-empty">' + esc(t(emptyKey)) + "</li>";
    return items.slice().sort(function (a, b) { return toDate(b.date) - toDate(a.date); }).map(function (a) {
      return '<li><span class="fine">' + esc(fmtDate(a.date)) + (a.author ? " · " + esc(a.author) : "") + "</span>" +
        (a.title ? "<h4>" + esc(loc(a.title)) + "</h4>" : "") + (a.text ? "<p>" + esc(loc(a.text)) + "</p>" : "") +
        tweetHtml(a.tweet) +
        wsBtn({ id: "dc|" + (a.tweet || a.link || a.date + loc(a.title)), k: "Discord", t: loc(a.title) || a.author || "", s: loc(a.text), u: a.tweet || a.link || "", d: a.date, plain: true }) +
        (a.link ? '<p><a class="text-link" href="' + esc(safeUrl(a.link)) + '" target="_blank" rel="noopener">' + esc(t("dc_open")) + "</a></p>" : "") + "</li>";
    }).join("");
  }
  $("dc-ann").innerHTML = dcList(D.announcements, "dc_empty_ann");
  $("dc-spot").innerHTML = dcList(D.spotlight, "dc_empty_spot");
  if (document.querySelector(".twitter-tweet")) {
    var tw = document.createElement("script");
    tw.async = true; tw.src = "https://platform.twitter.com/widgets.js"; tw.charset = "utf-8";
    document.body.appendChild(tw);
  }

  /* ---------- Haberler ---------- */
  $("news").innerHTML = (P.news || []).map(function (n) {
    return "<li><div class=\"news-meta\"><b>" + esc(c(n.kind)) + "</b>" + esc(fmtDate(n.date)) + "<br>" + esc(c(n.source)) + "</div>" +
      '<div><h3><a href="' + esc(safeUrl(n.url)) + '" target="_blank" rel="noopener">' + esc(c(n.title)) + "</a></h3>" +
      "<p>" + esc(c(n.summary)) + "</p>" + (n.relevance ? '<p class="rel">' + esc(t("nw_rel")) + " " + esc(c(n.relevance)) + "</p>" : "") +
      wsBtn({ id: "news|" + n.url, k: KIND.news, t: n.title, s: n.summary, u: n.url, d: n.date, kk: "news" }) + "</div>" +
      (media(n) || "<span></span>") + "</li>";
  }).join("");
  $("press").innerHTML = (P.press || []).map(function (n) {
    return "<li><div class=\"news-meta\"><b>" + esc(n.source) + "</b>" + esc(fmtDate(n.date)) + "</div>" +
      '<div><h3><a href="' + esc(safeUrl(n.url)) + '" target="_blank" rel="noopener">' + esc(c(n.title)) + "</a></h3><p>" + esc(c(n.summary)) + "</p></div></li>";
  }).join("");

  /* ---------- Akış ---------- */
  var kinds = ["news", "x", "youtube", "github", "discord"], fKind = "", shown = 12;
  function paintFeed() {
    $("fd-filters").innerHTML = '<button type="button" data-k="" aria-pressed="' + (fKind === "") + '">' + esc(t("all")) + "</button>" +
      kinds.map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (fKind === k) + '">' + esc(KIND[k]) + "</button>"; }).join("");
    var list = feed.filter(function (f) { return !fKind || f.k === fKind; });
    $("feed").innerHTML = list.slice(0, shown).map(rowHtml).join("") || '<li class="fine" style="padding:16px 0">' + esc(t("fd_empty")) + "</li>";
    $("feed-more").hidden = list.length <= shown;
  }
  $("fd-filters").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { fKind = b.dataset.k; shown = 12; paintFeed(); } });
  $("feed-more").addEventListener("click", function () { shown += 12; paintFeed(); });
  paintFeed();

  /* ---------- Çalışma alanım: liste ---------- */
  var MAKER = "https://seismicmaker.netlify.app/";
  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dayLabel(key) {
    var p = key.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]), txt;
    try { txt = d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" }); } catch (e) { txt = key; }
    var diff = Math.round((new Date(new Date().toDateString()) - d) / 86400000);
    if (RTF && diff >= 0 && diff < 2) txt = RTF.format(-diff, "day") + " · " + txt;
    return txt;
  }
  function paintWs() {
    var items = wsLoad().slice().sort(function (a, b) { return b.at - a.at; });
    var n = items.length;
    [].forEach.call(document.querySelectorAll("[data-ws-count]"), function (el) { el.textContent = n ? String(n) : ""; });
    $("ws-fab").hidden = !n;
    $("ws-tools").hidden = !n;
    if (!n) { $("ws-list").innerHTML = '<p class="ws-empty">' + esc(t("ws_empty")) + "</p>"; return; }
    var days = {}, order = [];
    items.forEach(function (it) { var k = dayKey(it.at); if (!days[k]) { days[k] = []; order.push(k); } days[k].push(it); });
    $("ws-list").innerHTML = order.map(function (k) {
      return '<section class="ws-day"><h3><span>' + esc(dayLabel(k)) + '</span><span class="fine">' + esc(t("ws_count", { n: days[k].length })) + "</span></h3><ol>" +
        days[k].map(function (it) {
          var title = it.plain ? it.t : wsText(it.t, it.tt, it.lang), sum = it.plain ? it.s : wsText(it.s, it.ts, it.lang);
          var kind = it.kk === "news" ? KIND.news : it.k;
          return '<li class="ws-item"><div class="ws-main"><span class="fine">' + esc(kind) + (it.d ? " · " + esc(fmtDate(it.d)) : "") + "</span>" +
            "<h4>" + (it.u ? '<a href="' + esc(safeUrl(it.u)) + '" target="_blank" rel="noopener">' + esc(title) + "</a>" : esc(title)) + "</h4>" +
            (sum ? "<p>" + esc(sum) + "</p>" : "") +
            '<label class="sr" for="wsn-' + esc(it.id) + '">' + esc(t("ws_note_ph")) + '</label><textarea id="wsn-' + esc(it.id) + '" data-ws-note="' + esc(it.id) + '" rows="2" placeholder="' + esc(t("ws_note_ph")) + '">' + esc(it.note || "") + "</textarea></div>" +
            '<div class="ws-acts"><a class="btn btn-outline" href="' + MAKER + '" target="_blank" rel="noopener">' + esc(t("ws_visual")) + "</a>" +
            '<button class="btn-link" type="button" data-ws-del="' + esc(it.id) + '">' + esc(t("ws_remove")) + "</button></div></li>";
        }).join("") + "</ol></section>";
    }).join("");
  }
  function wsSyncButtons() {
    [].forEach.call(document.querySelectorAll("[data-ws]"), function (b) {
      var on = wsHas(b.getAttribute("data-ws"));
      b.setAttribute("aria-pressed", String(on)); b.textContent = t(on ? "ws_added" : "ws_add");
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-ws]"), d = e.target.closest("[data-ws-del]"), id;
    if (b) {
      id = b.getAttribute("data-ws");
      if (wsHas(id)) wsMem = wsLoad().filter(function (x) { return x.id !== id; });
      else {
        var o = WS_SRC[id]; if (!o) return;
        wsToast(o.plain ? o.t : c(o.t));
        wsLoad().push({ id: id, k: o.k, kk: o.kk, t: o.t, s: o.s || "", u: o.u || "", d: o.d || "", plain: !!o.plain, at: Date.now(), note: "",
          lang: L, tt: o.plain ? o.t : c(o.t), ts: o.plain ? (o.s || "") : (c(o.s) || "") });
      }
      wsSave(); wsSyncButtons(); paintWs();
    } else if (d) {
      id = d.getAttribute("data-ws-del");
      wsMem = wsLoad().filter(function (x) { return x.id !== id; });
      wsSave(); wsSyncButtons(); paintWs();
    }
  });
  $("ws-list").addEventListener("input", function (e) {
    var id = e.target.getAttribute && e.target.getAttribute("data-ws-note"); if (!id) return;
    wsLoad().forEach(function (x) { if (x.id === id) x.note = e.target.value; });
    wsSave();
  });
  $("ws-clear").addEventListener("click", function () {
    if (this.dataset.armed !== "1") { this.dataset.armed = "1"; this.textContent = t("ws_clear_q"); var self = this; setTimeout(function () { self.dataset.armed = ""; self.textContent = t("ws_clear"); }, 4000); return; }
    wsMem = []; wsSave(); wsSyncButtons(); paintWs(); this.dataset.armed = ""; this.textContent = t("ws_clear");
  });
  $("ws-copy").addEventListener("click", function () {
    var btn = this, items = wsLoad().slice().sort(function (a, b) { return b.at - a.at; }), last = "", out = [];
    items.forEach(function (it) {
      var k = dayKey(it.at); if (k !== last) { out.push((out.length ? "\n" : "") + dayLabel(k)); last = k; }
      out.push("- " + (it.plain ? it.t : wsText(it.t, it.tt, it.lang)) + (it.u ? "\n  " + it.u : "") + (it.note ? "\n  " + it.note : ""));
    });
    var text = out.join("\n"), done = function () { btn.textContent = t("ws_copied"); setTimeout(function () { btn.textContent = t("ws_copy"); }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () {});
    else { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) {} ta.remove(); }
  });
  paintWs();

  // Eklendiğinde: kısa bildirim ve menüdeki düğmede vurgu.
  var toastTimer = null;
  function wsToast(title) {
    $("ws-toast-text").textContent = t("ws_toast") + (title ? ": " + (title.length > 70 ? title.slice(0, 68) + "…" : title) : "");
    $("ws-toast").hidden = false;
    var nav = $("nav-ws"); nav.classList.remove("is-bump"); void nav.offsetWidth; nav.classList.add("is-bump");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { $("ws-toast").hidden = true; }, 4500);
  }

  // Çalışma alanı kendi sayfasında açılır: #calisma adresinde sitenin geri kalanı gizlenir.
  function wsView() {
    var on = location.hash === "#calisma";
    document.body.classList.toggle("ws-view", on);
    $("calisma").hidden = !on;
    $("nav-ws").setAttribute("aria-current", on ? "page" : "false");
    if (on) { $("ws-toast").hidden = true; window.scrollTo(0, 0); document.title = t("ws_title") + " · Seismic Pulse"; }
    else {
      document.title = t("title");
      var id = location.hash.slice(1), el = id && document.getElementById(id);
      if (el && wsView.was) el.scrollIntoView();
    }
    wsView.was = on;
  }
  window.addEventListener("hashchange", wsView);
  wsView();

  /* ---------- Alt bilgi ve tema ---------- */
  $("foot-links").innerHTML = (P.links || []).map(function (l) {
    return '<li><a href="' + esc(safeUrl(l.url)) + '" target="_blank" rel="noopener">' + esc(c(l.label)) + "</a></li>";
  }).join("");
  $("theme").addEventListener("click", function () {
    var root = document.documentElement;
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("sp-theme", root.dataset.theme); } catch (e) {}
  });
})();
