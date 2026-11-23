# Seismic Pulse

Seismic topluluğu için bağımsız haber ve içerik panosu. Derleme adımı olmayan, düz HTML/CSS/JS bir sitedir.

## Netlify'da yayınlama

**En hızlı yol (sürükle-bırak):** https://app.netlify.com/drop adresini aç ve bu klasörün tamamını sayfaya sürükle. Her güncellemede aynı sitenin "Deploys" sekmesine klasörü yeniden sürüklemen yeterli.

**Otomatik yayın (önerilen):** Bu klasörü bir GitHub deposuna koy ve Netlify'da "Add new site → Import an existing project" ile o depoyu bağla. Build command boş, publish directory `.` olarak kalır (`netlify.toml` bunu zaten söyler). Depoya gelen her değişiklik siteyi kendiliğinden yeniden yayınlar.

## Discord içeriklerini ekleme

`admin.html` sayfasını aç, formu doldur, `discord.js` dosyasını indir ve `data/discord.js` üzerine yaz. Ayrıntı: sayfanın kendisinde.

## Otomatik güncelleme

`data/pulse.js` dosyası zamanlanmış görevle 2 saatte bir yenilenir. Kurallar ve veri şeması: `GUNCELLEME-REHBERI.md`.
GitHub bölümündeki "Canlı commit akışı" ise sayfa her açıldığında doğrudan GitHub'dan çekilir.

## Çalışma alanım

Ziyaretçiler her içeriğin altındaki "Çalışma alanına ekle" düğmesiyle içerikleri kendi çalışma alanlarına toplar.
Liste yalnızca o kişinin tarayıcısında saklanır (sunucuya gitmez), eklenen güne göre ayrılır ve her içeriğe not yazılabilir.
"Görsel üret" düğmesi https://seismicmaker.netlify.app/ adresini yeni sekmede açar.
Tarayıcı verileri silinirse ya da başka bir cihaz kullanılırsa liste görünmez.

## Diller

Site ilk açılışta İngilizce gelir; sağ üstteki bayraklı menüden 10 dil seçilebilir ve seçim tarayıcıda saklanır.
Belirli bir dille paylaşmak için adresin sonuna `?lang=tr` (en, zh, ja, hi, pcm, de, fr, es, ru, tr) eklenebilir.
Çevirilerin nasıl güncellendiği: `GUNCELLEME-REHBERI.md`, "Diller ve çeviriler" bölümü.

## Marka

Logo, seismic.systems sitesindeki özgün SVG'dir; şekline dokunulmamıştır. Renkler Seismic Brand Kit v2'den alınmıştır
(Mauve `#825A6D`, Purple `#523542`, Black `#161616`, gri tonları). Marka kitindeki yazı tipleri Suisse Intl ve
Suisse Intl Works lisanslı olduğu için siteye gömülmedi; yerlerine Inter Tight ve Source Serif 4 kullanılıyor.
Lisansın varsa font dosyalarını ekleyip `styles.css` içindeki `--sans` ve `--serif` değişkenlerini değiştirmen yeterli.
