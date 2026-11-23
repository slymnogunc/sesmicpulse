/* Seismic Pulse — Discord içerikleri (ELLE girilir).
   Zamanlanmış görev bu dosyaya dokunmaz.

   Eklemenin iki yolu var:
   1) admin.html sayfasını açın, formu doldurun, "discord.js dosyasını indir" düğmesiyle
      yeni dosyayı alıp bu dosyanın üzerine yazın.
   2) Aşağıdaki listelere elle yeni bir kayıt ekleyin. En yeni kayıt en üstte olsun.

   Kayıt biçimi:
   { "date": "2026-11-20", "title": "Başlık", "text": "Kısa açıklama", "author": "Paylaşan / üye adı",
     "tweet": "https://x.com/kullanici/status/123...", "link": "https://discord.com/channels/..." }
   "text", "author", "tweet" ve "link" isteğe bağlıdır. "tweet" verilirse gönderi sitede önizlenir.
   "title" ve "text" düz yazı olabilir ya da dile göre yazılabilir: { "en": "...", "tr": "...", "de": "..." }.
   Düz yazı her dilde aynen görünür. */
window.SEISMIC_DISCORD = {
  "invite": "https://discord.com/invite/seismic",
  "announcements": [],
  "spotlight": [
    {
      "date": "2026-10-28",
      "title": "TROTSKY",
      "author": "@dtrxtsky",
      "tweet": "https://x.com/dtrxtsky/status/2115418960846024877"
    },
    {
      "date": "2026-10-14",
      "title": "Seismic Maker",
      "text": {
        "en": "250 templates, mascots and brand assets for Seismic posts, built by cryptolaps for the community.",
        "tr": "Seismic gönderileri için 250 şablon, maskot ve marka görseli; cryptolaps tarafından topluluk için hazırlandı.",
        "de": "250 Vorlagen, Maskottchen und Marken-Assets für Seismic-Beiträge, von cryptolaps für die Community gebaut.",
        "fr": "250 modèles, mascottes et éléments de marque pour les publications Seismic, créés par cryptolaps pour la communauté.",
        "es": "250 plantillas, mascotas y recursos de marca para publicaciones de Seismic, creados por cryptolaps para la comunidad.",
        "ru": "250 шаблонов, маскотов и фирменных материалов для постов о Seismic, созданных cryptolaps для сообщества.",
        "zh": "cryptolaps 为社区制作的 250 个模板、吉祥物和品牌素材，可用于 Seismic 相关帖子。",
        "ja": "cryptolaps がコミュニティ向けに作った、Seismic の投稿用テンプレート・マスコット・ブランド素材 250 点。",
        "hi": "Seismic पोस्ट के लिए 250 टेम्पलेट, मैस्कॉट और ब्रांड एसेट, जिन्हें cryptolaps ने समुदाय के लिए बनाया है।",
        "pcm": "250 templates, mascots and brand assets for Seismic posts, wey cryptolaps build for di community."
      },
      "author": "@cryptolaps_",
      "tweet": "https://x.com/cryptolaps_/status/2110327093531746624"
    }
  ]
};
