/* Seismic Pulse — Discord içerikleri için yerel düzenleyici. Hiçbir yere veri göndermez. */
(function () {
  "use strict";
  var KEY = "sp-discord-draft";
  var base = window.SEISMIC_DISCORD || { invite: "https://discord.com/invite/seismic", announcements: [], spotlight: [] };
  var $ = function (id) { return document.getElementById(id); };
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function load() { try { var d = JSON.parse(localStorage.getItem(KEY)); if (d && d.announcements && d.spotlight) return d; } catch (e) {} return clone(base); }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {} }
  var data = load();
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function paint() {
    ["announcements", "spotlight"].forEach(function (k) {
      data[k].sort(function (a, b) { return a.date < b.date ? 1 : -1; });
      $("l-" + k).innerHTML = data[k].map(function (a, i) {
        return '<div class="admin-item"><div><span class="fine">' + esc(a.date) + (a.author ? " · " + esc(a.author) : "") + "</span><br><b>" + esc(a.title) + "</b><br><span class=\"fine\">" + esc(a.text || "") + "</span></div>" +
          '<button class="btn btn-outline" type="button" data-k="' + k + '" data-i="' + i + '">Sil</button></div>';
      }).join("") || '<p class="fine">Henüz kayıt yok.</p>';
    });
  }
  $("date").value = new Date().toISOString().slice(0, 10);
  $("f").addEventListener("submit", function (e) {
    e.preventDefault();
    var link = $("link").value.trim();
    if (link && !/^https?:\/\//i.test(link)) { $("msg").textContent = "Bağlantı https:// ile başlamalı."; return; }
    var item = { date: $("date").value, title: $("title").value.trim(), text: $("text").value.trim() };
    if ($("author").value.trim()) item.author = $("author").value.trim();
    if (link) item.link = link;
    var tweet = $("tweet").value.trim().split("?")[0];
    if (tweet) {
      if (!/^https?:\/\/(www\.)?(x|twitter)\.com\/[A-Za-z0-9_]+\/status\/\d+/.test(tweet)) { $("msg").textContent = "X bağlantısı https://x.com/kullanici/status/... biçiminde olmalı."; return; }
      item.tweet = tweet;
    }
    data[$("kind").value].unshift(item);
    save(); paint();
    $("title").value = ""; $("text").value = ""; $("author").value = ""; $("link").value = ""; $("tweet").value = "";
    $("msg").textContent = "Eklendi. Yayınlamak için dosyayı indirip data/discord.js üzerine yaz.";
  });
  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-k]"); if (!b) return;
    data[b.dataset.k].splice(+b.dataset.i, 1); save(); paint();
  });
  $("reset").addEventListener("click", function () { try { localStorage.removeItem(KEY); } catch (e) {} data = clone(base); paint(); $("msg").textContent = ""; });
  $("dl").addEventListener("click", function () {
    var head = "/* Seismic Pulse — Discord içerikleri (ELLE girilir). admin.html ile üretildi: " + new Date().toISOString() + "\n   Zamanlanmış görev bu dosyaya dokunmaz. */\n";
    var blob = new Blob([head + "window.SEISMIC_DISCORD = " + JSON.stringify(data, null, 2) + ";\n"], { type: "text/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "discord.js";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  paint();
})();
