# Seismic Pulse — güncelleme rehberi

Bu dosya, siteyi 2 saatte bir yenileyen zamanlanmış görevin ve elle güncelleme yapan kişinin başvuru kaynağıdır.

## Hangi dosya ne işe yarar

| Dosya | Kim günceller | İçerik |
|---|---|---|
| `data/pulse.js` | Zamanlanmış görev (otomatik) | Mindshare konuları (bağlam), haberler, YouTube, X, GitHub gün sonu özetleri |
| `data/lang/<dil>.js` | Zamanlanmış görev (yalnızca `c` bölümü) | İçerik çevirileri: en, zh, ja, hi, pcm, de, fr, es, ru |
| `data/discord.js` | Elle (admin.html ile) | Discord Announcements ve Spotlight |
| `index.html`, `styles.css`, `app.js` | Değişmez | Arayüz |
| `assets/`, `favicon.svg` | Değişmez | Seismic'in özgün logosu (seismic.systems'tan alınmıştır) |

`data/discord.js` dosyasına otomatik görev asla dokunmaz.

## Kaynaklar

- Web sitesi: https://www.seismic.systems/ ve https://orchestration.seismic.systems/docs/
- GitHub: https://github.com/SeismicSystems (API: `https://api.github.com/orgs/SeismicSystems/repos?sort=pushed` ve `https://api.github.com/repos/SeismicSystems/<depo>/commits?since=<tarih>`)
- X: @SeismicSys (tüm gönderiler); @lyronctk, @xealistt, @NoxxW3, @heathcliff_eth (**yalnızca Seismic ile ilgili gönderiler**, kişisel ve başka konulardaki gönderiler alınmaz)
- YouTube: Lyron Co Ting Keh'in konuk olduğu yayınlar ("Lyron Co Ting Keh Seismic", "Lyron Seismic podcast" aramaları). Deprem bilimi ve satış yazılımı şirketi Seismic ile ilgili sonuçlar alınmaz.
- Haberler: stablecoin, gizlilik, neobank, ödeme altyapısı ve Seismic müşterileri (Brookwell, Reah, Avvio, Sedona, Prism, Specie vb.) ile ilgili son 48 saatin haberleri.

## `data/pulse.js` şeması

Dosya `window.SEISMIC_PULSE = { ... };` biçiminde tek bir nesnedir. Tarihler `YYYY-AA-GG`, zaman damgaları UTC ISO biçimindedir.

- `updatedAt`: son güncelleme zamanı.
- `lead`: üstteki büyük başlık. `{ kind, date, title, summary, url, cta }`. Doğrudan Seismic ile ilgili en yeni gelişme seçilir.
- `stats[]`: `{ value, label, url }`, dört kutu.
- `mindshare`: `{ date, note, topics[] }`. Her gün 4–6 konu. Konu: `{ id, category, title, angle, source, date, url, image?, video? }`.
  - `angle` bağlam verir: haber ne, Seismic'e nasıl bağlanıyor, nelere dikkat edilmeli. **Site içerik üretmez**: hazır gönderi taslağı, örnek tweet ya da kopyalanacak metin yazılmaz.
  - Yatırım tavsiyesi, fiyat tahmini ve Seismic'in açıklamadığı ortaklık imaları yazılmaz.
- Görseller: `image`, kaynağın kendi kapak görselidir (sayfanın og:image adresi, https). Görsele bakılır; haberle ilgisizse ya da bir kişinin fotoğrafıysa alan boş bırakılır. Kaynak bir YouTube videosuysa `image` yerine `video: "<video id>"` yazılır; site videoyu YouTube oynatıcısıyla önizler.
- `news[]`: `{ date, source, kind, title, summary, relevance, url, image?, video? }`. En fazla 14 gün geriye gidilir, en yeni en üstte.
- `press[]`: Seismic hakkındaki kalıcı basın yazıları.
- `youtube.videos[]`: `{ id, date, channel, title, duration, views, summary }`, en yeni en üstte. Başlık özgün dilinde kalır, özet Türkçedir.
- `x.accounts[]` ve `x.posts[]`: gönderi `{ handle, date, title, summary, url, likes?, reposts?, views?, pinned? }`. Başlık ve özet Türkçe yeniden yazılır; gönderi metni kopyalanmaz.
- `github`: `{ org, checkedAt, status, repos[], daily[] }`.
  - `daily[]`: gün sonu özeti `{ date, headline, summary, items[] }`; `items[]`: `{ repo, sha, message, explain, author }`.
  - `headline` o günün en önemli değişikliğini söyler; `summary` teknik olmayan okur için 2–4 cümledir; `explain` her commit'i tek cümleyle açıklar.
  - Yalnızca commit mesajında yazanlar anlatılır; tahmin yürütülmez. Değişiklik olmayan gün için kayıt açılmaz, `status` alanına "şu tarihten beri yeni commit yok" yazılır.
  - En yeni 10 gün tutulur.
- `links[]`: alt bilgideki resmi bağlantılar.

## Her güncellemede yapılacaklar

1. `data/pulse.js` dosyasını oku; mevcut kayıtları koru.
2. GitHub'da `github.checkedAt` tarihinden sonraki commit'leri bul; yeni günler için gün sonu özeti yaz.
3. X hesaplarını ve YouTube'u kontrol et; yeni kayıtları ekle.
4. Haberleri tara; yenilerini ekle, 14 günden eskileri çıkar.
5. Günde bir kez (günün ilk çalışmasında) mindshare konularını yenile, `mindshare.date` alanını güncelle. Gün içinde önemli bir Seismic gelişmesi olursa konu listesinin başına ekle.
6. `lead`, `stats`, `updatedAt` alanlarını güncelle.
7. Dosyanın geçerli JavaScript olduğunu doğrula (`node --check data/pulse.js`).
8. Yeni bir şey yoksa yalnızca `updatedAt` ve `github.checkedAt` değişir.

## Diller ve çeviriler

Site 10 dilde açılır: İngilizce (varsayılan), Çince, Japonca, Hintçe, Nijerya Pidgin'i (pcm), Almanca, Fransızca, İspanyolca, Rusça ve Türkçe.

- `data/pulse.js` her zaman **Türkçe** yazılır; kaynak metin odur.
- Her dilin dosyası `data/lang/<dil>.js` içinde iki bölüm vardır: `ui` (arayüz metinleri, elle yazılmıştır, görev dokunmaz) ve `c` (içerik çevirileri: Türkçe metin → çeviri).
- Sitede bir metnin çevirisi yoksa önce İngilizcesi, o da yoksa Türkçesi gösterilir.
- `data/lang/tr.js` yalnızca `ui` içerir.

`data/pulse.js` her değiştiğinde çeviriler de güncellenir:

1. `node tools/i18n.js missing` komutu her dil için eksik Türkçe metinleri verir.
2. Her dil için `{ "Türkçe metin": "çeviri" }` biçiminde bir JSON dosyası hazırlanır (klasörün dışında, geçici bir yerde).
3. `node tools/i18n.js add <dil> <dosya.json>` çevirileri ekler ve artık kullanılmayanları siler.
4. `node tools/i18n.js missing` yeniden çalıştırılır; çıktı `{}` olmalıdır.

Çeviri kuralları:
- İngilizce (`en`) eksiksiz olmalıdır. Özel adlar, sürüm numaraları ve süreler gibi değişmeyen metinlerde çeviri metnin kendisidir.
- Seçilen dilde ekranın tamamı o dilde görünmelidir: haberler, konular, video başlıkları ve commit açıklamaları (`explain`) her dile çevrilir. Yalnızca sayılar ve süreler isteğe bağlıdır; araç bunları eksik saymaz.
- Video başlıklarının İngilizce çevirisi başlığın kendisidir (özgün başlık İngilizce değilse çevrilir).
- Ürün, şirket, depo ve kişi adları, kod terimleri (RPC, TEE, commit, enclave, custodian vb.) çevrilmez.
- Anlam aynen korunur; "bu bir başvurudur, onay değil" gibi uyarılar atlanmaz, yeni bilgi eklenmez.
- Sayılar ve para birimleri hedef dilin alışkanlığına göre yazılır.
