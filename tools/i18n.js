#!/usr/bin/env node
/* Seismic Pulse — çeviri yardımcısı.
   data/pulse.js içindeki Türkçe metinleri çıkarır ve data/lang/<dil>.js dosyalarıyla karşılaştırır.

   node tools/i18n.js list                 → çevrilecek tüm Türkçe metinler (JSON dizi)
   node tools/i18n.js missing              → her dil için eksik metinler (JSON nesne)
   node tools/i18n.js add <dil> <dosya>    → <dosya> içindeki { "türkçe metin": "çeviri" } çiftlerini ekler,
                                             artık kullanılmayan çevirileri siler; "ui" bölümüne dokunmaz. */
"use strict";
var fs = require("fs"), path = require("path");
var ROOT = path.join(__dirname, "..");
var LANGS = ["en", "zh", "ja", "hi", "pcm", "de", "fr", "es", "ru"];

function loadPulse() {
  global.window = {};
  delete require.cache[require.resolve(path.join(ROOT, "data/pulse.js"))];
  require(path.join(ROOT, "data/pulse.js"));
  return global.window.SEISMIC_PULSE;
}
// Her metin { s, opt } olarak döner. opt: İngilizce dışındaki dillerde çevrilmesi şart olmayan
// (çevrilmezse İngilizcesi gösterilen) metinler: sayılar ve süreler.
function strings(P) {
  var out = [], seen = {};
  function add(s, opt) { if (typeof s === "string" && s.trim() && !(s in seen)) { seen[s] = 1; out.push({ s: s, opt: !!opt }); } }
  function each(list, keys, opt) { (list || []).forEach(function (o) { keys.forEach(function (k) { add(o[k], opt); }); }); }
  if (P.lead) ["kind", "title", "summary", "cta"].forEach(function (k) { add(P.lead[k]); });
  each(P.stats, ["label"]); each(P.stats, ["value"], true);
  if (P.mindshare) { add(P.mindshare.note); each(P.mindshare.topics, ["category", "title", "angle", "source"]); }
  each(P.news, ["kind", "title", "summary", "relevance", "source"]);
  each(P.press, ["title", "summary"]);
  if (P.youtube) { add(P.youtube.note); each(P.youtube.videos, ["title", "channel", "summary"]); each(P.youtube.videos, ["duration"], true); }
  if (P.x) { each(P.x.accounts, ["role"]); each(P.x.accounts, ["followers"], true); each(P.x.posts, ["title", "summary"]); each(P.x.posts, ["views"], true); }
  if (P.github) {
    add(P.github.status); each(P.github.repos, ["description"]);
    (P.github.daily || []).forEach(function (d) { add(d.headline); add(d.summary); each(d.items, ["explain"]); });
  }
  each(P.links, ["label"]);
  return out;
}
function langFile(l) { return path.join(ROOT, "data/lang", l + ".js"); }
function loadLang(l) {
  global.window = { SEISMIC_LANG: {} };
  var f = langFile(l);
  if (!fs.existsSync(f)) return { ui: {}, c: {} };
  delete require.cache[require.resolve(f)];
  require(f);
  var d = global.window.SEISMIC_LANG[l] || {};
  return { ui: d.ui || {}, c: d.c || {} };
}
function saveLang(l, d) {
  fs.writeFileSync(langFile(l), "/* Seismic Pulse — " + l + " çevirileri. \"ui\": arayüz metinleri (elle), \"c\": içerik çevirileri (tools/i18n.js ile). */\n" +
    "window.SEISMIC_LANG = window.SEISMIC_LANG || {};\nwindow.SEISMIC_LANG[" + JSON.stringify(l) + "] = " + JSON.stringify(d, null, 1) + ";\n");
}
var cmd = process.argv[2];
var all = strings(loadPulse());
var keys = all.map(function (x) { return x.s; });
if (cmd === "list") { console.log(JSON.stringify(keys, null, 1)); }
else if (cmd === "missing") {
  // en: her metin gerekli (özel adlar ve değişmeyenler için çeviri = metnin kendisi).
  // Diğer diller: İngilizcesi Türkçesiyle aynı olanlar ve "opt" olanlar gerekmez.
  var res = {}, en = loadLang("en").c;
  LANGS.forEach(function (l) {
    var c = loadLang(l).c;
    var m = all.filter(function (x) {
      if (x.s in c) return false;
      if (l === "en") return true;
      return !x.opt && en[x.s] !== x.s;
    }).map(function (x) { return x.s; });
    if (m.length) res[l] = m;
  });
  console.log(JSON.stringify(res, null, 1));
}
else if (cmd === "add") {
  var l = process.argv[3], f = process.argv[4];
  if (LANGS.indexOf(l) < 0 || !f) { console.error("Kullanım: node tools/i18n.js add <" + LANGS.join("|") + "> <dosya.json>"); process.exit(1); }
  var extra = JSON.parse(fs.readFileSync(f, "utf8")), d = loadLang(l), c = {}, added = 0;
  keys.forEach(function (s) {
    if (typeof extra[s] === "string" && extra[s].trim()) { c[s] = extra[s]; added++; }
    else if (s in d.c) c[s] = d.c[s];
  });
  d.c = c; saveLang(l, d);
  console.log(l + ": " + added + " çeviri eklendi, toplam " + Object.keys(c).length + "/" + keys.length);
}
else { console.error("Komutlar: list | missing | add <dil> <dosya.json>"); process.exit(1); }
