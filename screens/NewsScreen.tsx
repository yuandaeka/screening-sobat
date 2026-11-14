import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Platform,
  StyleSheet,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Parenting' | 'Stimulasi' | 'Kegiatan' | 'Tips';
  date: string;
  readTime: string;
  image: string;
  author: string;
  authorRole: string;
  authorAvatar: string;
  summary: string;
  content: string;
  isFeatured?: boolean;
  viewsCount?: number;
}

export const MOCK_NEWS_DATA: NewsArticle[] = [
  {
    id: 'n1',
    title: '5 Stimulasi Sensorik Praktis di Rumah untuk Tingkatkan Fokus Belajar Anak Usia Dini',
    category: 'Stimulasi',
    date: '13 Nov 2026',
    readTime: '4 menit baca',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=900',
    author: 'Bunda Sarah, M.Psi',
    authorRole: 'Psikolog Anak & Tumbuh Kembang',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
    viewsCount: 1420,
    summary:
      'Aktivitas sederhana seperti sensory bin beras warna dan playdough alami terbukti efektif merangsang pembentukan sinapsis otak anak usia prasekolah.',
    content: `Stimulasi sensorik adalah fondasi utama bagi perkembangan kognitif, motorik, dan emosional anak. Saat anak menyentuh, meraba, mencium, dan mengeksplorasi berbagai tekstur serta material, otak mereka membentuk koneksi sinapsis baru yang memperkuat daya konsentrasi.

Berikut 5 ide stimulasi praktis yang menyenangkan untuk dicoba di rumah:

1. Sensory Bin Beras Warna & Tekstur
Sediakan wadah besar berisi beras warna-warni, pasta kering, atau biji-bijian. Berikan corong mini, sendok takar, dan mangkuk kecil. Kegiatan menuang dan menyaring melatih koordinasi bilateral dan motorik halus.

2. Melukis dengan Jari (Finger Painting Aman)
Gunakan pasta warna alami berbahan dasar tepung maizena dan pewarna makanan. Biarkan anak merasakan sensasi dingin dan lengket di atas kertas karton tebal.

3. Tebak Aroma Buah dan Bunga
Ajak anak menutup mata dan menebak aroma jeruk, vanila, atau daun mint segar. Ini mengasah memori olfaktori dan kemampuan asosiasi bahasa.

4. Eksplorasi Alam Terbuka
Ajak anak berjalan tanpa alas kaki di atas rumput berembun, merasakan halusnya pasir, atau memegang kulit kayu pohon di pekarangan.

5. Bermain Playdough Aromaterapi Alami
Buat adonan tepung terigu dengan sedikit minyak kelapa dan tetesan ekstrak stroberi atau lavender. Melatih kekuatan otot jari jemari untuk persiapan menulis di masa depan.

Lakukan sesi stimulasi ini 15-20 menit setiap hari dalam suasana riang tanpa paksaan.`,
    isFeatured: true,
  },
  {
    id: 'n2',
    title: 'Mengenal Ciri Keterlambatan Bicara (Speech Delay) dan Kapan Orang Tua Harus Screening',
    category: 'Parenting',
    date: '11 Nov 2026',
    readTime: '5 menit baca',
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=700',
    author: 'dr. Raditya Sp.A',
    authorRole: 'Dokter Spesialis Anak',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    viewsCount: 2850,
    summary:
      'Ketahui batasan wajar kosakata anak usia 18-24 bulan serta red flags awal yang perlu segera dikonsultasikan sebelum terlambat.',
    content: `Banyak orang tua merasa resah saat buah hatinya berusia 2 tahun namun belum lancar merangkai kata. Keterlambatan bicara (speech delay) dapat disebabkan oleh berbagai faktor, mulai dari minimnya stimulasi komunikasi dua arah, kebiasaan screen time berlebih, hingga kendala pada fungsi pendengaran atau oromotor.

Red Flags yang Perlu Diwaspadai:
- Usia 12 Bulan: Belum merespons saat dipanggil namanya, tidak ada babbling (ba-ba, ma-ma).
- Usia 18 Bulan: Belum menguasai minimal 6-10 kata bermakna atau tidak menunjukkan gestur menunjuk sesuatu.
- Usia 24 Bulan: Belum mampu menggabungkan 2 kata spontan (misal: "mau susu", "baba pergi").

Langkah Awal Penanganan:
Segera hentikan paparan layar gawai (gadget detox) dan perbanyak interaksi tatap muka dengan intonasi jelas. Lakukan observasi komprehensif melalui program screening berkala di Sobat Ceria untuk evaluasi tumbuh kembang objektif.`,
  },
  {
    id: 'n3',
    title: 'Keseruan Outbound Ceria: Mengasah Keberanian dan Empati Sosial di Alam Terbuka',
    category: 'Kegiatan',
    date: '09 Nov 2026',
    readTime: '3 menit baca',
    image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=700',
    author: 'Kak Farhan, S.Pd',
    authorRole: 'Koordinator Outbound Ceria',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
    viewsCount: 940,
    summary:
      'Dokumentasi seru anak-anak belajar mandiri melewati rintangan mini, tali titian keseimbangan, dan memupuk gotong royong antar teman.',
    content: `Program Outbound Ceria akhir pekan lalu diiringi sorak sorai dan tawa ceria puluhan adik-adik peserta. Belajar di alam bebas bukan hanya membakar kalori, namun menanamkan rasa percaya diri saat menghadapi tantangan fisik.

Aktivitas Utama:
- Titian Tali Pelangi: Mengasah vestibular & proprioseptif motorik kasar.
- Labirin Rumput Raksasa: Melatih problem solving & orientasi spasial.
- Menanam Bibit Bersama: Menumbuhkan kepedulian terhadap kelestarian bumi.`,
  },
  {
    id: 'n4',
    title: 'Gantikan Gadget Sebelum Tidur dengan Dongeng Interaktif: Rahasia Tidur Nyenyak & Cerdas',
    category: 'Tips',
    date: '07 Nov 2026',
    readTime: '4 menit baca',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700',
    author: 'Kak Dina, S.Pd',
    authorRole: 'Pendidik PAUD Sobat Ceria',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    viewsCount: 1670,
    summary:
      'Paparan sinar biru layar gawai merusak pola tidur alami si kecil. Ciptakan bedtime routine yang hangat dengan metode pillow story.',
    content: `Cahaya biru dari layar smartphone dan tablet menekan produksi hormon melatonin alami yang memicu rasa kantuk. Anak yang sering menatap gawai sebelum tidur cenderung mengalami gelisah malam, sulit fokus di pagi hari, dan tantrum.

Gantikan dengan Ritual Dongeng Interaktif:
1. Redupkan lampu kamar 30 menit sebelum jadwal tidur.
2. Gunakan boneka jari atau buku cerita bergambar bertema kasih sayang.
3. Berikan intonasi suara lembut bernada menenangkan.
4. Akhiri dengan afirmasi positif bahwa anak dicintai dan aman.`,
  },
  {
    id: 'n5',
    title: 'Mengenal Konsep Sensory Diet: Kunci Mengatasi Anak Tantrum Akibat Overstimulasi',
    category: 'Stimulasi',
    date: '04 Nov 2026',
    readTime: '5 menit baca',
    image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=700',
    author: 'Bunda Sarah, M.Psi',
    authorRole: 'Psikolog Anak & Tumbuh Kembang',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
    viewsCount: 2110,
    summary:
      'Tidak semua tantrum berasal dari rasa manja. Kadang sistem saraf anak mengalami kejenuhan sensorik suara, cahaya, atau keramaian.',
    content: `Sensory Diet adalah rangkaian aktivitas sensorik terencana yang dirancang oleh pakar terapi okupasi untuk membantu anak mengatur tingkat kewaspadaan dan ketenangan emosi mereka sepanjang hari.

Saat anak mengalami sensory overload di pusat perbelanjaan atau lingkungan bising, tawarkan aktivitas "heavy work" seperti mendorong troli kecil, melompat di kasur busa, atau memeluk bantal berat untuk menenangkan sistem saraf pusat.`,
  },
  {
    id: 'n6',
    title: 'Kiat Membangun Komunikasi Positif: Hindari Kata "Jangan", Ganti dengan Kalimat Solusi',
    category: 'Parenting',
    date: '02 Nov 2026',
    readTime: '3 menit baca',
    image: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=700',
    author: 'dr. Raditya Sp.A',
    authorRole: 'Dokter Spesialis Anak',
    authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200',
    viewsCount: 3200,
    summary:
      'Otak anak prasekolah sulit mencerna kata larangan abstrak. Berikan arahan konkret perilaku apa yang diharapkan darinya.',
    content: `Kalimat larangan seperti "Jangan lari!" sering kali tidak efektif karena otak anak memvisualisasikan kata kerja "lari" terlebih dahulu.

Coba ganti dengan:
- Alih-alih "Jangan lari!", katakan: "Yuk, kita jalan pelan-pelan ya sayang."
- Alih-alih "Jangan teriak!", katakan: "Pakai suara bisikan pelan ya seperti beruang tidur."
- Alih-alih "Jangan lempar mainan!", katakan: "Mainan kita letakkan pelan di keranjang."

Pendekatan ini melatih regulasi diri anak tanpa menimbulkan perasaan tertolak.`,
  },
];

const CATEGORIES = ['Semua', 'Parenting', 'Stimulasi', 'Kegiatan', 'Tips'];

export default function NewsScreen({ navigation }: { navigation?: any }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['n1']); // Set default 1 artikel tersimpan

  // Toggle Bookmark
  const toggleBookmark = (id: string, e?: any) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Share Article
  const handleShareArticle = async (article: NewsArticle) => {
    try {
      const shareMessage = `Baca artikel menarik di Sobat Ceria:\n\n"${article.title}" oleh ${article.author}.\n\nUnduh aplikasi Sobat Ceria untuk wawasan tumbuh kembang anak terlengkap!`;
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: article.title,
            text: shareMessage,
          });
        } else {
          navigator.clipboard?.writeText(shareMessage);
          window.alert('Tautan artikel berhasil disalin ke clipboard!');
        }
      } else {
        await Share.share({
          message: shareMessage,
          title: article.title,
        });
      }
    } catch {
      // dismissed
    }
  };

  // Filtered List
  const filteredArticles = useMemo(() => {
    return MOCK_NEWS_DATA.filter((article) => {
      const matchCat =
        selectedCategory === 'Semua' || article.category === selectedCategory;
      const matchQuery =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  // Featured Article
  const featuredArticle = useMemo(() => {
    return MOCK_NEWS_DATA.find((a) => a.isFeatured) || MOCK_NEWS_DATA[0];
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 110 }}
        className="p-4 md:p-6 max-w-5xl mx-auto w-full"
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================================= */}
        {/* 0. BANNER UNGU WORKSHEET GRATIS                                    */}
        {/* ================================================================= */}
        <View className="mb-6 rounded-[2.5rem] p-5 relative overflow-hidden" style={{ backgroundColor: '#4C2882' }}>
          <View className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <View className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/10" />

          <View className="relative z-10">
            <View className="bg-[#FFD100] self-start px-3 py-1 rounded-full mb-3">
              <Text className="text-[9px] font-black text-[#4C2882] uppercase tracking-wider">Gratis Printable Material</Text>
            </View>
            <Text className="text-lg font-black text-white leading-tight mb-1.5">
              Lembar Kerja & Worksheet Digital Gratis
            </Text>
            <Text className="text-[11px] text-purple-100 font-medium leading-snug mb-4">
              Latihan gunting-tempel, tracing huruf & angka, mewarnai, serta modul sensori untuk stimulasi di rumah.
            </Text>

            {/* Daftar Item Worksheet */}
            <View className="gap-2 mb-4">
              <View className="bg-white/10 border border-white/20 rounded-2xl p-3 flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center">
                  <Feather name="file-text" size={16} color="#FFD100" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-black text-white">Worksheet Motorik Halus</Text>
                  <Text className="text-[10px] text-purple-200 font-medium">PDF High Res • Gunting & Tempel</Text>
                </View>
              </View>
              <View className="bg-white/10 border border-white/20 rounded-2xl p-3 flex-row items-center gap-3">
                <View className="w-9 h-9 rounded-xl bg-white/15 items-center justify-center">
                  <Feather name="edit-3" size={16} color="#FFD100" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-black text-white">Tracing Alphabet & Angka</Text>
                  <Text className="text-[10px] text-purple-200 font-medium">PDF High Res • Latihan Menulis</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => {
                const msg = 'Mengunduh Worksheet Digital Gratis (PDF High Res) Sobat Ceria...';
                Platform.OS === 'web' ? window.alert(msg) : alert(msg);
              }}
              className="bg-[#FFD100] py-3 rounded-full items-center justify-center flex-row gap-2"
            >
              <Feather name="download" size={15} color="#4C2882" />
              <Text className="text-[#4C2882] text-xs font-black">Unduh Worksheet di Aplikasi</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================================= */}
        {/* 1. HEADER SECTION & SEARCH BAR                                    */}
        {/* ================================================================= */}
        <View className="mb-5">
          {/* Header Title & Subtitle */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-2">
              <View className="flex-row items-center gap-2 mb-1.5">
                <View className="w-2.5 h-2.5 rounded-full bg-[#D82B5A]" />
                <Text className="text-[11px] font-black text-[#D82B5A] tracking-widest uppercase">
                  Wawasan & Edukasi
                </Text>
              </View>
              <Text className="text-2xl md:text-3xl font-black text-[#162E5C] tracking-tight">
                Artikel & Berita
              </Text>
              <Text className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
                Panduan praktis parenting, stimulasi kecerdasan, dan info kegiatan ceria
              </Text>
            </View>

            {/* Icon Bookmark Collection Counter */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                // Tampilkan info tersimpan
                const savedTitles = MOCK_NEWS_DATA.filter((a) =>
                  bookmarkedIds.includes(a.id)
                ).map((a) => `• ${a.title}`).join('\n');
                const message = savedTitles
                  ? `Artikel yang kamu simpan:\n\n${savedTitles}`
                  : 'Belum ada artikel yang kamu tandai sebagai favorit.';
                if (Platform.OS === 'web') {
                  window.alert(message);
                } else {
                  alert(message);
                }
              }}
              className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-xs items-center justify-center relative"
            >
              <Feather name="bookmark" size={20} color="#D82B5A" />
              {bookmarkedIds.length > 0 && (
                <View className="absolute -top-1 -right-1 bg-[#D82B5A] w-5 h-5 rounded-full items-center justify-center border-2 border-[#FAF6F0]">
                  <Text className="text-[10px] font-black text-white">
                    {bookmarkedIds.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Minimalist Rounded-Pill Search Bar */}
          <View className="flex-row items-center bg-white rounded-full px-4 py-2.5 border border-gray-100 shadow-xs">
            <Feather name="search" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Cari tips parenting, stimulasi, speech delay..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-2.5 text-xs text-[#162E5C] font-semibold"
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                className="w-6 h-6 rounded-full bg-gray-100 items-center justify-center mr-1"
              >
                <Feather name="x" size={14} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. HORIZONTAL SCROLLABLE CATEGORY CHIPS                           */}
        {/* ================================================================= */}
        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2 }}
            className="flex-row"
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    isSelected ? styles.categoryChipActive : styles.categoryChipInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected ? styles.categoryChipTextActive : styles.categoryChipTextInactive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ================================================================= */}
        {/* 3. HERO SECTION / FEATURED ARTICLE CARD                           */}
        {/* ================================================================= */}
        {selectedCategory === 'Semua' && !searchQuery && (
          <View className="mb-7">
            <TouchableOpacity
              activeOpacity={0.92}
              onPress={() => setSelectedArticle(featuredArticle)}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm"
            >
              {/* Full-Width Image with Gradient Overlay & Badges */}
              <View className="relative h-56 w-full bg-gray-100">
                <Image
                  source={{ uri: featuredArticle.image }}
                  className="w-full h-full"
                  resizeMode="cover"
                />

                {/* Dark Gradient Overlay for Cinematic Reading Contrast */}
                <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
                  <Defs>
                    <LinearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                      <Stop offset="50%" stopColor="#000000" stopOpacity="0.25" />
                      <Stop offset="100%" stopColor="#0B132B" stopOpacity="0.85" />
                    </LinearGradient>
                  </Defs>
                  <Rect x="0" y="0" width="100%" height="100%" fill="url(#heroGrad)" />
                </Svg>

                {/* Top Badges: Category & Bookmark */}
                <View className="absolute top-4 left-4 right-4 flex-row items-center justify-between">
                  {/* Red Accent Pill Badge */}
                  <View className="bg-[#D82B5A] px-3.5 py-1.5 rounded-full flex-row items-center gap-1.5 shadow-sm">
                    <Text className="text-white text-[10px] font-black tracking-wider uppercase">
                      ⭐ ARTIKEL PILIHAN
                    </Text>
                  </View>

                  {/* Bookmark Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={(e) => toggleBookmark(featuredArticle.id, e)}
                    className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md items-center justify-center"
                  >
                    <Feather
                      name="bookmark"
                      size={16}
                      color={bookmarkedIds.includes(featuredArticle.id) ? '#FBBF24' : '#FFFFFF'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Bottom Overlay Info on Image: Category Tag & Read Time */}
                <View className="absolute bottom-4 left-5 right-5 flex-row items-center justify-between">
                  <View className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30">
                    <Text className="text-white text-[10px] font-extrabold uppercase tracking-wide">
                      {featuredArticle.category}
                    </Text>
                  </View>

                  <View className="flex-row items-center gap-1.5 bg-black/45 px-2.5 py-1 rounded-full">
                    <Feather name="clock" size={11} color="#E2E8F0" />
                    <Text className="text-slate-200 text-[10px] font-bold">
                      {featuredArticle.readTime}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Text Body: Title, Excerpt & Author Footer */}
              <View className="p-6">
                <Text className="text-lg md:text-xl font-black text-[#162E5C] leading-snug mb-2.5">
                  {featuredArticle.title}
                </Text>

                <Text
                  className="text-xs text-gray-600 font-medium leading-relaxed mb-4"
                  numberOfLines={3}
                >
                  {featuredArticle.summary}
                </Text>

                {/* Author Card & CTA */}
                <View className="pt-4 border-t border-gray-100 flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Image
                      source={{ uri: featuredArticle.authorAvatar }}
                      className="w-10 h-10 rounded-full bg-gray-200 border border-rose-100"
                    />
                    <View>
                      <Text className="text-xs font-black text-[#162E5C]">
                        {featuredArticle.author}
                      </Text>
                      <Text className="text-[10px] text-gray-500 font-semibold">
                        {featuredArticle.authorRole}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-1 bg-[#FCEEE2] px-3.5 py-2 rounded-full">
                    <Text className="text-xs font-black text-[#D82B5A]">
                      Baca
                    </Text>
                    <Feather name="arrow-right" size={14} color="#D82B5A" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ================================================================= */}
        {/* 4. MODERN COMPACT ARTICLE LIST                                    */}
        {/* ================================================================= */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-black text-[#162E5C]">
              {selectedCategory === 'Semua'
                ? 'Daftar Artikel Terbaru'
                : `Topik: ${selectedCategory}`}
            </Text>
            <Text className="text-[11px] text-gray-500 font-medium mt-0.5">
              Menampilkan {filteredArticles.length} bacaan terkurasi
            </Text>
          </View>

          {/* Quick Filter Tag */}
          {selectedCategory !== 'Semua' && (
            <TouchableOpacity
              onPress={() => setSelectedCategory('Semua')}
              className="bg-gray-200 px-3 py-1 rounded-full"
            >
              <Text className="text-[10px] font-bold text-gray-700">
                Reset Filter ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Articles List */}
        {filteredArticles.length === 0 ? (
          <View className="bg-white rounded-3xl p-10 items-center justify-center border border-gray-100 shadow-xs my-4">
            <View className="w-16 h-16 rounded-full bg-rose-50 items-center justify-center mb-3">
              <Feather name="file-text" size={28} color="#D82B5A" />
            </View>
            <Text className="text-base font-black text-[#162E5C] mb-1">
              Artikel Tidak Ditemukan
            </Text>
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              Coba gunakan kata kunci pencarian yang lain atau ubah filter kategori.
            </Text>
          </View>
        ) : (
          <View className="gap-3.5">
            {filteredArticles.map((article) => {
              const isBookmarked = bookmarkedIds.includes(article.id);
              return (
                <TouchableOpacity
                  key={article.id}
                  activeOpacity={0.86}
                  onPress={() => setSelectedArticle(article)}
                  className="bg-white p-3.5 rounded-[2rem] border border-gray-100 shadow-xs flex-row gap-3.5 items-center"
                >
                  {/* Left Side: Square Thumbnail Image with Rounded Corners */}
                  <View className="relative w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      source={{ uri: article.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                    {article.isFeatured && (
                      <View className="absolute top-1.5 left-1.5 bg-[#D82B5A] px-1.5 py-0.5 rounded-md">
                        <Text className="text-white text-[8px] font-black uppercase">
                          TOP
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Right Side: Category, Title & Metadata */}
                  <View className="flex-1 justify-between h-24 py-0.5 pr-1">
                    <View>
                      {/* Category Tag & Date */}
                      <View className="flex-row items-center justify-between mb-1">
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-[10px] font-black text-[#D82B5A] uppercase tracking-wider">
                            {article.category}
                          </Text>
                          <Text className="text-[10px] text-gray-300">•</Text>
                          <Text className="text-[10px] text-gray-400 font-medium">
                            {article.date}
                          </Text>
                        </View>

                        {/* Mini Bookmark Icon */}
                        <TouchableOpacity
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          onPress={(e) => toggleBookmark(article.id, e)}
                        >
                          <Feather
                            name="bookmark"
                            size={14}
                            color={isBookmarked ? '#D82B5A' : '#CBD5E1'}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Title: 2 lines with elegant bold typography */}
                      <Text
                        className="text-xs md:text-sm font-bold text-[#162E5C] leading-snug"
                        numberOfLines={2}
                      >
                        {article.title}
                      </Text>
                    </View>

                    {/* Metadata Footer: Author & Read Time */}
                    <View className="flex-row items-center justify-between pt-1 border-t border-gray-50">
                      <Text
                        className="text-[10px] text-gray-500 font-semibold flex-1 pr-2"
                        numberOfLines={1}
                      >
                        Oleh {article.author}
                      </Text>

                      <View className="flex-row items-center gap-1 flex-shrink-0">
                        <Feather name="clock" size={10} color="#9CA3AF" />
                        <Text className="text-[10px] text-gray-400 font-bold">
                          {article.readTime}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* ================================================================= */}
      {/* 5. INTERACTIVE ARTICLE DETAIL MODAL (FULL READING SHEET)           */}
      {/* ================================================================= */}
      {selectedArticle && (
        <Modal
          visible={!!selectedArticle}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedArticle(null)}
        >
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[3rem] max-h-[90%] w-full overflow-hidden flex-col shadow-2xl">
              {/* Header Bar */}
              <View className="p-4 px-6 border-b border-gray-100 flex-row items-center justify-between bg-white z-10">
                <View className="flex-row items-center gap-2">
                  <View className="w-2.5 h-2.5 rounded-full bg-[#D82B5A]" />
                  <Text className="text-xs font-black text-[#D82B5A] uppercase tracking-wider">
                    {selectedArticle.category}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  {/* Share Button */}
                  <TouchableOpacity
                    onPress={() => handleShareArticle(selectedArticle)}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:scale-95"
                  >
                    <Feather name="share-2" size={16} color="#374151" />
                  </TouchableOpacity>

                  {/* Bookmark Button */}
                  <TouchableOpacity
                    onPress={() => toggleBookmark(selectedArticle.id)}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:scale-95"
                  >
                    <Feather
                      name="bookmark"
                      size={16}
                      color={bookmarkedIds.includes(selectedArticle.id) ? '#D82B5A' : '#374151'}
                    />
                  </TouchableOpacity>

                  {/* Close Button */}
                  <TouchableOpacity
                    onPress={() => setSelectedArticle(null)}
                    className="w-9 h-9 rounded-full bg-gray-100 items-center justify-center active:scale-95 ml-1"
                  >
                    <Feather name="x" size={18} color="#162E5C" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Scrollable Reading Content */}
              <ScrollView
                className="p-6 flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
              >
                {/* Title */}
                <Text className="text-xl md:text-2xl font-black text-[#162E5C] leading-snug mb-3">
                  {selectedArticle.title}
                </Text>

                {/* Author Card Info */}
                <View className="flex-row items-center justify-between p-3.5 bg-[#FAF6F0] rounded-2xl mb-5 border border-amber-100/50">
                  <View className="flex-row items-center gap-3">
                    <Image
                      source={{ uri: selectedArticle.authorAvatar }}
                      className="w-10 h-10 rounded-full bg-gray-200 border border-rose-200"
                    />
                    <View>
                      <Text className="text-xs font-black text-[#162E5C]">
                        {selectedArticle.author}
                      </Text>
                      <Text className="text-[10px] text-gray-500 font-semibold">
                        {selectedArticle.authorRole}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-medium">
                      {selectedArticle.date}
                    </Text>
                    <View className="flex-row items-center gap-1 mt-0.5">
                      <Feather name="clock" size={10} color="#D82B5A" />
                      <Text className="text-[10px] font-black text-[#D82B5A]">
                        {selectedArticle.readTime}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Full Article Hero Image */}
                <View className="w-full h-56 rounded-3xl overflow-hidden mb-6 bg-gray-100 shadow-sm">
                  <Image
                    source={{ uri: selectedArticle.image }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>

                {/* Article Highlight Callout */}
                <View className="p-4 rounded-2xl bg-[#FCEEE2] border-l-4 border-[#D82B5A] mb-6">
                  <Text className="text-xs font-bold text-[#D82B5A] leading-relaxed italic">
                    "{selectedArticle.summary}"
                  </Text>
                </View>

                {/* Full Article Body Text */}
                <Text className="text-sm text-gray-800 font-normal leading-7 whitespace-pre-line mb-8">
                  {selectedArticle.content}
                </Text>

                {/* Feedback & Reaction Section */}
                <View className="p-5 rounded-3xl bg-gray-50 border border-gray-100 items-center text-center mb-6">
                  <Text className="text-xs font-black text-[#162E5C] mb-1">
                    Apakah artikel ini bermanfaat?
                  </Text>
                  <Text className="text-[10px] text-gray-500 mb-3">
                    Bantu kami menyajikan artikel edukasi anak yang lebih berkualitas
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => {
                        if (Platform.OS === 'web') alert('Terima kasih atas tanggapan positif Anda!');
                        else alert('Terima kasih atas tanggapan positif Anda!');
                      }}
                      className="flex-row items-center gap-1.5 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-xs"
                    >
                      <Feather name="thumbs-up" size={14} color="#D82B5A" />
                      <Text className="text-xs font-bold text-[#162E5C]">Sangat Bermanfaat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleShareArticle(selectedArticle)}
                      className="flex-row items-center gap-1.5 bg-[#D82B5A] px-4 py-2 rounded-full shadow-xs"
                    >
                      <Feather name="share-2" size={14} color="#FFFFFF" />
                      <Text className="text-xs font-bold text-white">Bagikan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>

              {/* Sticky Bottom Close Action */}
              <View className="p-4 bg-white border-t border-gray-100 px-6">
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => setSelectedArticle(null)}
                  className="bg-[#162E5C] py-3.5 rounded-full items-center justify-center shadow-md active:scale-95"
                >
                  <Text className="text-white text-xs font-black tracking-wide">
                    Selesai Membaca
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipActive: {
    backgroundColor: '#D82B5A',
    borderColor: '#D82B5A',
    shadowColor: '#D82B5A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  categoryChipTextInactive: {
    color: '#6B7280',
  },
});
