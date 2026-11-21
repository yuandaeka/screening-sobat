import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Image, 
  Modal, 
  Platform,
  Linking 
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BookItem, Course, UserProfile, UserRole } from '../types';
import { getRoleMeta } from '../lib/roles';
import CheckoutModal from '../components/CheckoutModal';

const bannerImg = require('../assets/online_learning_banner.png');

// --- DATA PROGRAM KELAS LENGKAP ---
const OFFICIAL_PROGRAMS = [
  {
    id: 'p-science',
    title: 'Science Class',
    subtitle: 'Eksperimen STEAM Ceria',
    category: 'STEAM',
    age: 'Usia 3-7 Thn',
    price: 69000,
    seatsLeft: 3,
    date: '24 Agu 2026',
    time: '09:00 - 11:00 WIB',
    location: 'Lab FKIP UMS Lt. 2',
    image: require('../assets/dokumentasi sobat/program-science.jpeg'),
    facilitator: 'Bunda Sarah, M.Psi',
  },
  {
    id: 'p-seminar',
    title: 'Seminar Parenting',
    subtitle: 'Edukasi Pola Asuh & Emosi',
    category: 'Parenting',
    age: 'Untuk Ortu',
    price: 49000,
    seatsLeft: 8,
    date: '30 Agu 2026',
    time: '13:00 - 15:30 WIB',
    location: 'Auditorium Sobat Ceria',
    image: require('../assets/dokumentasi sobat/seminarparenting-program.jpeg'),
    facilitator: 'dr. Raditya, Sp.A',
  },
  {
    id: 'p-cooking',
    title: 'Cooking Class',
    subtitle: 'Kemandirian & Life Skill',
    category: 'Sensory',
    age: 'Usia 3-7 Thn',
    price: 85000,
    seatsLeft: 4,
    date: '06 Sep 2026',
    time: '09:30 - 11:30 WIB',
    location: 'Kitchen Studio Ceria',
    image: require('../assets/dokumentasi sobat/cooking-program.jpeg'),
    facilitator: 'Chef Kak Dina, S.Pd',
  },
  {
    id: 'p-outbond',
    title: 'Outbond Ceria',
    subtitle: 'Permainan Fisik & Motorik',
    category: 'Motorik',
    age: 'Usia 2-7 Thn',
    price: 69000,
    seatsLeft: 5,
    date: '13 Sep 2026',
    time: '07:30 - 10:30 WIB',
    location: 'Taman Edukasi Alam',
    image: require('../assets/dokumentasi sobat/outbondceria-program.jpeg'),
    facilitator: 'Kak Farhan, S.Pd',
  },
  {
    id: 'p-art',
    title: 'Art & Craft Class',
    subtitle: 'Kreativitas & Sensorik Halus',
    category: 'Art',
    age: 'Usia 2-6 Thn',
    price: 59000,
    seatsLeft: 6,
    date: '20 Sep 2026',
    time: '10:00 - 11:30 WIB',
    location: 'Studio Seni Sobat Ceria',
    image: require('../assets/dokumentasi sobat/program-art.jpeg'),
    facilitator: 'Kak Dina, S.Pd',
  },
];

// --- MOCK BUKU PANDUAN EDUKASI ---
export const MOCK_BOOKS: BookItem[] = [
  {
    id: 'b1',
    title: 'Stimulasi Emas 1000 Hari Pertama',
    author: 'Tim Psikolog FKIP UMS',
    category: 'Tumbuh Kembang & Emosi',
    rating: 4.9,
    reviewsCount: 382,
    pages: 180,
    coverType: 'Hard Cover',
    language: 'Indonesia',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    description: 'Panduan lengkap melatih sensorik, motorik, dan afektif anak usia 0-3 tahun bebas kecanduan gawai.',
    isBestSeller: true,
    ownerInfo: {
      name: 'Bunda Sarah, M.Psi',
      role: 'Psikolog Tumbuh Kembang',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200',
      location: 'Lab FKIP UMS'
    }
  },
  {
    id: 'b2',
    title: 'Dongeng Karakter & Empati Anak',
    author: 'Kak Dina & Tim Sobat Ceria',
    category: 'Karakter & Nilai Moral',
    rating: 4.8,
    reviewsCount: 245,
    pages: 140,
    coverType: 'Soft Cover',
    language: 'Indonesia',
    price: 49000,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
    description: 'Kumpulan cerita interaktif sebelum tidur untuk mengasah empati, keberanian berkata jujur, dan regulasi emosi si kecil.',
    isBestSeller: true,
    ownerInfo: {
      name: 'Kak Dina, S.Pd',
      role: 'Pendidik PAUD Sobat Ceria',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      location: 'Studio Sobat Ceria'
    }
  }
];

export default function HomeScreen({ 
  user, 
  navigation,
  onLoginUser,
  onOpenOnboarding,
}: { 
  user: UserProfile | null; 
  navigation?: any;
  onLoginUser?: (u: UserProfile | null) => void;
  onOpenOnboarding?: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeClassFilter, setActiveClassFilter] = useState<string>('Semua');
  const [aboutTab, setAboutTab] = useState<'visi' | 'misi'>('visi');
  
  // State Interaktif: Tantangan Harian & Poin
  const [points, setPoints] = useState<number>(150);
  const [isChallengeDone, setIsChallengeDone] = useState<boolean>(false);

  // State Modal Buku & Checkout
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState<boolean>(false);
  const [selectedCourseForCheckout, setSelectedCourseForCheckout] = useState<Course | null>(null);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState<boolean>(false);

  // Status Autentikasi Pengguna: Apakah sudah login atau masih tamu umum?
  const isLoggedIn = !!user;
  const userRole: UserRole = user?.role || (isLoggedIn ? 'parent' : 'guest');
  const roleColor = getRoleMeta(userRole).color;

  // Filter program kelas
  const filteredPrograms = OFFICIAL_PROGRAMS.filter((prog) => {
    if (activeClassFilter === 'Semua') return true;
    return prog.category === activeClassFilter;
  });

  // Handle Klik Selesaikan Tantangan Harian (khusus ortu yang login)
  const handleCompleteChallenge = () => {
    if (!isChallengeDone) {
      setIsChallengeDone(true);
      setPoints((prev) => prev + 25);
      const msg = '🎉 Hebat! Tantangan harian selesai! Kamu mendapatkan +25 Poin Ceria.';
      Platform.OS === 'web' ? window.alert(msg) : alert(msg);
    }
  };

  // Buka checkout kelas
  const handleRegisterCourse = (prog: typeof OFFICIAL_PROGRAMS[0]) => {
    const courseObj: Course = {
      id: prog.id,
      title: prog.title,
      category: prog.category,
      ageRange: prog.age,
      price: prog.price,
      seats: prog.seatsLeft,
      image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=700',
      description: `${prog.subtitle}. Tanggal: ${prog.date} (${prog.time}) di ${prog.location}.`,
      facilitator: prog.facilitator,
    };
    setSelectedCourseForCheckout(courseObj);
    setCheckoutModalVisible(true);
  };

  const childName = user?.children?.[0]?.name || 'Arka';
  const childAge = user?.children?.[0]?.age || 4;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
      {/* ================================================================= */}
      {/* 1. TOP HEADER                                                     */}
      {/* ================================================================= */}
      <View 
        className="px-5 pb-3 bg-[#FAF6F0] border-b border-amber-100/60 flex-row items-center justify-between"
        style={{ paddingTop: Math.max(insets.top + 8, 16) }}
      >
        <View className="flex-1 pr-2">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation?.navigate('Profil')}
            className="flex-row items-center gap-1.5 mb-1 self-start px-2.5 py-1 rounded-full border"
            style={{ backgroundColor: `${roleColor}14`, borderColor: `${roleColor}40` }}
          >
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: roleColor }} />
            <Text className="text-[9.5px] font-black tracking-wider uppercase" style={{ color: roleColor }}>
              {isLoggedIn ? (user?.roleTitle || 'Sobat Ceria Fun Learning') : 'Sobat Ceria (Umum)'}
            </Text>
            <Feather name="chevron-down" size={10} color={roleColor} />
          </TouchableOpacity>
          <Text className="text-xl md:text-2xl font-black text-[#162E5C] tracking-tight">
            Discover
          </Text>
          <Text className="text-[11px] text-gray-500 font-semibold mt-0.5" numberOfLines={1}>
            {isLoggedIn
              ? `Halo, ${user?.parentName || user?.fullName} 👋` 
              : 'Eksplorasi Kelas & Edukasi Anak 👋'}
          </Text>
        </View>
        
        {/* Action Buttons: Poin, Info Onboarding, Pencarian, & Profil / Tombol Masuk */}
        <View className="flex-row items-center gap-1.5">
          {/* Badge Poin Ceria (Hanya jika login sebagai Orang Tua) */}
          {isLoggedIn && userRole === 'parent' && (
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => {
                const msg = `Saldo Poin Ceria kamu: ${points} Poin.\nPoin ini dapat digunakan untuk potongan harga pendaftaran kelas atau voucher reward!`;
                Platform.OS === 'web' ? window.alert(msg) : alert(msg);
              }}
              className="flex-row items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 h-9 rounded-xl shadow-xs"
            >
              <Text className="text-xs">🪙</Text>
              <Text className="text-xs font-black text-amber-700">{points}</Text>
            </TouchableOpacity>
          )}

          {/* Tombol Info / Onboarding (Akses Panduan Awal) */}
          {onOpenOnboarding && (
            <TouchableOpacity 
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-xs active:scale-95"
              onPress={onOpenOnboarding}
              accessibilityLabel="Buka Panduan Onboarding"
            >
              <Feather name="info" size={16} color="#C81E45" />
            </TouchableOpacity>
          )}

          {/* Tombol Pencarian */}
          <TouchableOpacity 
            className="w-9 h-9 rounded-xl bg-white border border-gray-200 items-center justify-center shadow-xs active:scale-95"
            onPress={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Feather name={isSearchOpen ? 'x' : 'search'} size={16} color="#162E5C" />
          </TouchableOpacity>

          {/* Tombol Profil (Jika Login) ATAU Tombol Masuk (Jika Belum Login) */}
          {isLoggedIn ? (
            <TouchableOpacity 
              className="w-9 h-9 rounded-xl items-center justify-center shadow-xs active:scale-95"
              style={{ backgroundColor: roleColor }}
              onPress={() => navigation?.navigate('Profil')}
            >
              <Feather name="user" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.85}
              onPress={() => navigation?.navigate('Profil')}
              className="bg-[#C81E45] h-9 px-3.5 rounded-xl shadow-xs active:scale-95 flex-row items-center gap-1.5"
            >
              <Feather name="log-in" size={13} color="#FFFFFF" />
              <Text className="text-xs font-black text-white">Masuk</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <View className="px-5 py-3 bg-white border-b border-gray-100">
          <View className="bg-[#FDECF2] rounded-2xl px-4 flex-row items-center border border-[#F6D4E0]">
            <Feather name="search" size={16} color="#D82B5A" className="mr-2" />
            <TextInput
              className="flex-1 h-11 text-xs font-semibold text-gray-800"
              placeholder="Cari program kelas, aktivitas stimulasi, parenting..."
              placeholderTextColor="#C97B95"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Feather name="x-circle" size={16} color="#C97B95" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }} 
        showsVerticalScrollIndicator={false}
        className="flex-1"
      >
        {/* ================================================================= */}
        {/* 1. HERO BANNER PROGRAM UNGGULAN (LEBIH RAMPING, LEGA & PROPORSIONAL) */}
        {/* ================================================================= */}
        <View className="px-5 pt-3 pb-1">
          <View 
            className="rounded-[2.2rem] py-5 px-5 shadow-sm relative overflow-hidden flex-row items-center justify-between" 
            style={{ backgroundColor: '#C81E45' }}
          >
            {/* Decorative Subtle Rings */}
            <View className="absolute -top-10 -left-10 w-28 h-28 rounded-full bg-white/10" />
            <View className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-white/10" />

            {/* Left Content Column */}
            <View className="flex-1 pr-3 z-10 justify-center">
              <View className="bg-white/20 self-start px-2.5 py-1 rounded-full mb-2 border border-white/30">
                <Text className="text-white text-[9px] font-black uppercase tracking-wider">
                  Program Stimulasi Terpadu
                </Text>
              </View>
              <Text className="text-[17px] md:text-xl font-black text-white leading-[23px] mb-1.5">
                Stimulasi Tumbuh Kembang Anak Usia Dini
              </Text>
              <Text className="text-[11px] text-rose-100 font-medium leading-[16px] mb-3.5" numberOfLines={2}>
                Belajar inklusif berbasis Mindfulness & Family Co-Creation bersama fasilitator profesional.
              </Text>

              {/* 1 Baris Sejajar Tombol */}
              <View className="flex-row items-center gap-2">
                <TouchableOpacity 
                  className="bg-white rounded-full px-3.5 py-2 shadow-xs active:scale-95 flex-row items-center gap-1.5"
                  onPress={() => navigation?.navigate('Screening')}
                >
                  <Feather name="activity" size={12} color="#C81E45" />
                  <Text className="text-[11.5px] font-black text-[#C81E45]">Buka Screening</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  className="rounded-full px-3.5 py-2 bg-white/15 active:scale-95 flex-row items-center gap-1 border border-white/60"
                  onPress={() => navigation?.navigate('Kelas')}
                >
                  <Text className="text-[11.5px] font-bold text-white">Kelas Trial</Text>
                  <Feather name="arrow-right" size={12} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Graphic */}
            <View className="w-24 h-24 z-10 items-center justify-center shrink-0">
              <Image 
                source={bannerImg} 
                style={{ width: 88, height: 88, borderRadius: 16 }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Dots Pagination */}
          <View className="flex-row justify-center items-center gap-1.5 mt-3 mb-1">
            <View style={{ width: 18, height: 5, borderRadius: 3, backgroundColor: '#C81E45' }} />
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#CBD5E1' }} />
            <View style={{ width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#CBD5E1' }} />
          </View>
        </View>

        {/* ================================================================= */}
        {/* 2. GRID 6 AKSES CEPAT FITUR APLIKASI                              */}
        {/* ================================================================= */}
        <View className="mt-4 px-5">
          <View className="flex-row items-center justify-between mb-2.5">
            <Text className="text-base font-black text-[#162E5C]">Akses Cepat Fitur</Text>
            <Text className="text-[11px] text-gray-500 font-semibold">6 Layanan Utama</Text>
          </View>

          <View className="flex-row flex-wrap justify-between gap-y-2.5">
            {/* 1. Screening STPPA */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => navigation?.navigate('Screening')}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#2DA9E9]/15 border border-[#2DA9E9]/30 items-center justify-center mb-1.5">
                <Feather name="activity" size={18} color="#2DA9E9" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>Screening</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">6 Aspek STPPA</Text>
            </TouchableOpacity>

            {/* 2. 8 Program Kelas */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => navigation?.navigate('Kelas')}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#D82B5A]/15 border border-[#D82B5A]/30 items-center justify-center mb-1.5">
                <Feather name="shopping-bag" size={18} color="#D82B5A" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>8 Kelas</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">Stimulasi Terpadu</Text>
            </TouchableOpacity>

            {/* 3. Berita & Tips */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => navigation?.navigate('Berita')}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#30B864]/15 border border-[#30B864]/30 items-center justify-center mb-1.5">
                <Feather name="book-open" size={18} color="#30B864" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>Berita & Tips</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">Panduan Ortu</Text>
            </TouchableOpacity>

            {/* 4. Tanya Ahli */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => {
                const url = 'https://wa.me/6281234567890?text=Halo%20Admin%20Sobat%20Ceria,%20saya%20ingin%20konsultasi%20tumbuh%20kembang%20anak.';
                Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
              }}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#8B22C0]/15 border border-[#8B22C0]/30 items-center justify-center mb-1.5">
                <Feather name="message-circle" size={18} color="#8B22C0" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>Tanya Ahli</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">Psikolog PAUD</Text>
            </TouchableOpacity>

            {/* 5. Lembar Worksheet */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => {
                const msg = 'Lembar Printable Worksheet PDF gratis dapat diunduh langsung di materi masing-masing program kelas.';
                Platform.OS === 'web' ? window.alert(msg) : alert(msg);
              }}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#EAB308]/15 border border-[#EAB308]/30 items-center justify-center mb-1.5">
                <Feather name="file-text" size={18} color="#CA8A04" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>Worksheet</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">Printable Gratis</Text>
            </TouchableOpacity>

            {/* 6. Dokumentasi Galeri */}
            <TouchableOpacity
              style={{ width: '31%' }}
              className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs items-center text-center active:scale-95"
              onPress={() => {
                const url = 'https://www.instagram.com/sobatceria__?igsh=ZzFmMW5jcXZ6ampp';
                Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
              }}
            >
              <View className="w-10 h-10 rounded-2xl bg-[#F77712]/15 border border-[#F77712]/30 items-center justify-center mb-1.5">
                <Feather name="image" size={18} color="#F77712" />
              </View>
              <Text className="text-[11px] font-black text-[#162E5C]" numberOfLines={1}>Dokumentasi</Text>
              <Text className="text-[9px] text-gray-500 font-medium mt-0.5">Foto & Video</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================================= */}
        {/* JIKA LOGIN SEBAGAI ORANG TUA -> TAMPILKAN RAPOR ANAK & TANTANGAN */}
        {/* ================================================================= */}
        {isLoggedIn && userRole === 'parent' && (
          <>
            {/* Widget Rapor Tumbuh Kembang */}
            <View className="px-5 mt-2">
              <View className="bg-white p-4.5 rounded-[2rem] border border-amber-100 shadow-xs">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center gap-2.5">
                    <View className="w-10 h-10 rounded-2xl bg-[#E2F1F8] items-center justify-center border border-blue-100">
                      <Text className="text-base">👶</Text>
                    </View>
                    <View>
                      <Text className="text-xs font-black text-[#162E5C]">
                        {childName} ({childAge} Tahun)
                      </Text>
                      <Text className="text-[10px] text-gray-500 font-semibold">
                        Hasil Screening STPPA Terakhir
                      </Text>
                    </View>
                  </View>

                  <View className="bg-[#DDF5E6] px-2.5 py-1 rounded-full border border-green-200">
                    <Text className="text-[9px] font-black text-[#166534]">
                      88% Sesuai Usia
                    </Text>
                  </View>
                </View>

                {/* 3 Aspek Progress Ringkas */}
                <View className="bg-[#FAF6F0] p-3 rounded-2xl gap-2 mb-3">
                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-[10px] font-bold text-gray-700">Fisik & Motorik</Text>
                      <Text className="text-[10px] font-black text-[#D82B5A]">90% Optimal</Text>
                    </View>
                    <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <View className="w-[90%] h-full bg-[#D82B5A] rounded-full" />
                    </View>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-[10px] font-bold text-gray-700">Bahasa & Komunikasi</Text>
                      <Text className="text-[10px] font-black text-[#2DA9E9]">84% Berkembang</Text>
                    </View>
                    <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <View className="w-[84%] h-full bg-[#2DA9E9] rounded-full" />
                    </View>
                  </View>

                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-[10px] font-bold text-gray-700">Kognitif & Logika</Text>
                      <Text className="text-[10px] font-black text-[#30B864]">88% Mandiri</Text>
                    </View>
                    <View className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <View className="w-[88%] h-full bg-[#30B864] rounded-full" />
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between pt-1">
                  <Text className="text-[10px] text-gray-400 font-medium">
                    Diperbarui oleh Tim Psikolog FKIP UMS
                  </Text>
                  <TouchableOpacity 
                    onPress={() => navigation?.navigate('Screening')}
                    className="flex-row items-center gap-1 bg-[#D82B5A]/10 px-3 py-1.5 rounded-full"
                  >
                    <Text className="text-[10px] font-black text-[#D82B5A]">Cek Ulang Screening</Text>
                    <Feather name="chevron-right" size={12} color="#D82B5A" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Tantangan Stimulasi Harian */}
            <View className="px-5 mt-3">
              <View className="p-4 rounded-[2rem] shadow-xs flex-row items-center justify-between" style={{ backgroundColor: '#F97316' }}>
                <View className="flex-1 pr-3">
                  <View className="bg-white/20 self-start px-2 py-0.5 rounded-full mb-1">
                    <Text className="text-[9px] font-black text-white uppercase">
                      🎯 Tantangan Hari Ini • +25 Poin
                    </Text>
                  </View>
                  <Text className="text-xs md:text-sm font-black text-white leading-snug">
                    Tebak Tekstur & Bentuk Benda di Rumah
                  </Text>
                  <Text className="text-[10px] text-amber-100 font-medium mt-0.5">
                    Stimulasi sensorik taktil 15 menit bersama Ayah/Bunda.
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleCompleteChallenge}
                  className={`px-3 py-2 rounded-2xl items-center justify-center shadow-xs ${
                    isChallengeDone ? 'bg-green-600' : 'bg-white'
                  }`}
                >
                  <Text className={`text-[10px] font-black ${isChallengeDone ? 'text-white' : 'text-orange-600'}`}>
                    {isChallengeDone ? '✓ Selesai' : 'Tandai Selesai'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* ================================================================= */}
        {/* JIKA LOGIN SEBAGAI GURU / FASILITATOR                             */}
        {/* ================================================================= */}
        {isLoggedIn && userRole === 'tutor' && (
          <View className="px-5 mt-2">
            <View className="bg-white p-5 rounded-[2rem] border border-purple-100 shadow-xs">
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-2xl bg-purple-50 items-center justify-center border border-purple-200">
                    <Feather name="award" size={20} color="#8B22C0" />
                  </View>
                  <View>
                    <Text className="text-xs font-black text-[#162E5C]">Tugas Mengajar Minggu Ini</Text>
                    <Text className="text-[10px] text-purple-700 font-bold">Fasilitator Utama Science Class</Text>
                  </View>
                </View>
                <View className="bg-purple-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#8B22C0]">Aktif Bertugas</Text>
                </View>
              </View>

              <View className="bg-[#FAF6F0] p-3.5 rounded-2xl mb-3">
                <Text className="text-xs font-black text-[#162E5C] mb-1">
                  Science Class (Sabtu, 24 Agu • 09:00 WIB)
                </Text>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Lokasi: Lab FKIP UMS Lantai 2 • Topik: Eksperimen STEAM
                </Text>

                <View className="flex-row justify-between bg-white p-2.5 rounded-xl border border-gray-100">
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#162E5C]">12</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Siswa Terdaftar</Text>
                  </View>
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#D82B5A]">4</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Belum Screening</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-xs font-black text-[#30B864]">100%</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Modul Siap</Text>
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => navigation?.navigate('Screening')}
                  className="bg-[#8B22C0] py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="edit-3" size={14} color="#FFFFFF" />
                    <Text className="text-xs font-black text-white">Input Observasi STPPA Siswa</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const msg = 'Daftar Presensi Kelas: 12 murid hadir, 0 izin. Data tersinkron ke spreadsheet admin.';
                    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                  }}
                  className="bg-gray-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="check-square" size={14} color="#374151" />
                    <Text className="text-xs font-bold text-gray-800">Absensi & Presensi Kehadiran</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================================================================= */}
        {/* JIKA LOGIN SEBAGAI MITRA / SEKOLAH                                */}
        {/* ================================================================= */}
        {isLoggedIn && userRole === 'mitra' && (
          <View className="px-5 mt-2">
            <View className="bg-white p-5 rounded-[2rem] border border-green-100 shadow-xs">
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-2xl bg-green-50 items-center justify-center border border-green-200">
                    <Feather name="briefcase" size={20} color="#16A34A" />
                  </View>
                  <View>
                    <Text className="text-xs font-black text-[#162E5C]">Kemitraan Lab & Sekolah Binaan</Text>
                    <Text className="text-[10px] text-green-700 font-bold">FKIP UMS & Lembaga PAUD Mitra</Text>
                  </View>
                </View>
                <View className="bg-green-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#16A34A]">MoU Aktif</Text>
                </View>
              </View>

              <View className="bg-[#FAF6F0] p-3.5 rounded-2xl mb-3">
                <Text className="text-xs font-black text-[#162E5C] mb-2">
                  Dampak Program Kemitraan 2026:
                </Text>
                <View className="flex-row justify-between bg-white p-2.5 rounded-xl border border-gray-100">
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#16A34A]">128</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Siswa Terscreening</Text>
                  </View>
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#162E5C]">4</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Sesi In-House</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-xs font-black text-[#30B864]">98%</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Kepuasan Ortu</Text>
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const msg = 'Mengunduh Franchise & Partnership Toolkit Sobat Ceria (Kurikulum, SOP Fasilitator, Brosur)...';
                    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                  }}
                  className="bg-[#16A34A] py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="download-cloud" size={14} color="#FFFFFF" />
                    <Text className="text-xs font-black text-white">Unduh Franchise Toolkit & SOP</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const url = 'https://wa.me/6285876332598?text=Halo%20Sobat%20Ceria,%20kami%20dari%20sekolah/lembaga%20ingin%20mengajukan%20kerjasama%20program.';
                    Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                  }}
                  className="bg-gray-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="mail" size={14} color="#374151" />
                    <Text className="text-xs font-bold text-gray-800">Ajukan Event Bersama / MoU</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================================================================= */}
        {/* JIKA LOGIN SEBAGAI VOLUNTEER / RELAWAN                             */}
        {/* ================================================================= */}
        {isLoggedIn && userRole === 'volunteer' && (
          <View className="px-5 mt-2">
            <View className="bg-white p-5 rounded-[2rem] border border-amber-100 shadow-xs">
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-2xl bg-amber-50 items-center justify-center border border-amber-200">
                    <Feather name="heart" size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text className="text-xs font-black text-[#162E5C]">Jadwal Event & Learning Corners</Text>
                    <Text className="text-[10px] text-amber-700 font-bold">Relawan Anak Sobat Ceria</Text>
                  </View>
                </View>
                <View className="bg-amber-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#F59E0B]">3 Event Aktif</Text>
                </View>
              </View>

              <View className="bg-[#FAF6F0] p-3.5 rounded-2xl mb-3">
                <Text className="text-xs font-black text-[#162E5C] mb-1">
                  Outbond Ceria (Minggu, 20 Sep • 07:30 WIB)
                </Text>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Tugas: Art Corner & Pottery Corner • Lokasi: Taman Edukasi Alam
                </Text>

                <View className="flex-row justify-between bg-white p-2.5 rounded-xl border border-gray-100">
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#162E5C]">18</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Relawan Siap</Text>
                  </View>
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#F59E0B]">6</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Posisi Terbuka</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-xs font-black text-[#30B864]">12 Jam</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Jam Sosial Saya</Text>
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const msg = 'Check-in kehadiran relawan berhasil! Dokumentasi foto/video dapat diunggah ke galeri event.';
                    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                  }}
                  className="bg-[#F59E0B] py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="camera" size={14} color="#FFFFFF" />
                    <Text className="text-xs font-black text-white">Check-in & Upload Dokumentasi</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const msg = 'Pocket Guide pendampingan inklusif & etika mendampingi ABK dapat diunduh di menu Profil.';
                    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                  }}
                  className="bg-gray-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="book-open" size={14} color="#374151" />
                    <Text className="text-xs font-bold text-gray-800">Panduan Pendampingan Inklusif</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================================================================= */}
        {/* JIKA LOGIN SEBAGAI PARTNER COLLABORATION                           */}
        {/* ================================================================= */}
        {isLoggedIn && userRole === 'collab' && (
          <View className="px-5 mt-2">
            <View className="bg-white p-5 rounded-[2rem] border border-sky-100 shadow-xs">
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-100">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-10 h-10 rounded-2xl bg-sky-50 items-center justify-center border border-sky-200">
                    <Feather name="trending-up" size={20} color="#0284C7" />
                  </View>
                  <View>
                    <Text className="text-xs font-black text-[#162E5C]">Impact Dashboard Sobat Ceria</Text>
                    <Text className="text-[10px] text-sky-700 font-bold">Partner Collaboration & CSR</Text>
                  </View>
                </View>
                <View className="bg-sky-100 px-2.5 py-1 rounded-full">
                  <Text className="text-[9px] font-black text-[#0284C7]">417+ Peserta</Text>
                </View>
              </View>

              <View className="bg-[#FAF6F0] p-3.5 rounded-2xl mb-3">
                <Text className="text-xs font-black text-[#162E5C] mb-2">Metrik Dampak Sosial (Solo Raya):</Text>
                <View className="flex-row justify-between bg-white p-2.5 rounded-xl border border-gray-100">
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#0284C7]">417+</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Peserta Aktif</Text>
                  </View>
                  <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-xs font-black text-[#162E5C]">80%</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">Sangat Puas</Text>
                  </View>
                  <View className="items-center flex-1">
                    <Text className="text-xs font-black text-[#30B864]">5</Text>
                    <Text className="text-[9px] text-gray-500 font-medium">SDGs Terdukung</Text>
                  </View>
                </View>
              </View>

              <View className="gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const url = 'https://wa.me/6285876332598?text=Halo%20Sobat%20Ceria,%20kami%20ingin%20mengajukan%20kolaborasi%20event/CSR/sponsorship.';
                    Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                  }}
                  className="bg-[#0284C7] py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="briefcase" size={14} color="#FFFFFF" />
                    <Text className="text-xs font-black text-white">Ajukan Collaboration / CSR</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const msg = 'Media Kit & katalog partnership Sobat Ceria sedang diunduh (proposal, brosur, dokumentasi eksposur brand).';
                    Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                  }}
                  className="bg-gray-100 py-2.5 px-4 rounded-xl flex-row items-center justify-between active:scale-98"
                >
                  <View className="flex-row items-center gap-2">
                    <Feather name="download" size={14} color="#374151" />
                    <Text className="text-xs font-bold text-gray-800">Unduh Media Kit & Katalog</Text>
                  </View>
                  <Feather name="chevron-right" size={14} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}



        {/* ================================================================= */}
        {/* 4. SECTION KELAS TERDEKAT (HIGHLIGHT & CAROUSEL)                  */}
        {/* ================================================================= */}
        <View className="mt-5 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-lg font-black text-[#162E5C]">Kelas Terdekat</Text>
              <Text className="text-[11px] text-gray-500 font-medium">Sesi tatap muka yang akan datang</Text>
            </View>
            <TouchableOpacity onPress={() => navigation?.navigate('Kelas')}>
              <Text className="text-xs font-bold text-[#D82B5A]">Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {/* Kartu Highlight Kelas Terdekat (Science Class) */}
          <View className="bg-white rounded-[2.5rem] p-4.5 mb-4 border border-rose-100 shadow-xs">
            <View className="flex-row items-center gap-3.5 mb-3">
              <View className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 relative">
                <Image 
                  source={require('../assets/dokumentasi sobat/program-science.jpeg')} 
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <View className="absolute top-1 left-1 bg-[#D82B5A] px-1.5 py-0.5 rounded-md">
                  <Text className="text-[8px] font-black text-white">TERDEKAT</Text>
                </View>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px] font-extrabold text-[#D82B5A] uppercase">STEAM Eksperimen</Text>
                  <View className="bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    <Text className="text-[9px] font-black text-[#D82B5A]">Sisa 3 Kursi!</Text>
                  </View>
                </View>
                <Text className="text-sm font-black text-[#162E5C] leading-snug mt-0.5">
                  Science Class: Eksperimen Gunung Berapi & Warna
                </Text>
                <Text className="text-[10px] text-gray-500 font-medium mt-1">
                  Oleh Bunda Sarah, M.Psi • Usia 3-7 Thn
                </Text>
              </View>
            </View>

            {/* Info Tanggal, Waktu, Lokasi */}
            <View className="bg-[#FAF6F0] p-3 rounded-2xl gap-1.5 mb-3">
              <View className="flex-row items-center gap-2">
                <Feather name="calendar" size={12} color="#D82B5A" />
                <Text className="text-[11px] font-bold text-[#162E5C]">Sabtu, 24 Agu 2026 • 09:00 - 11:00 WIB</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Feather name="map-pin" size={12} color="#D82B5A" />
                <Text className="text-[10px] text-gray-600 font-medium">Lab FKIP UMS Lantai 2 (Kampus Pabelan)</Text>
              </View>
            </View>

            {/* Price & Action Button */}
            <View className="flex-row items-center justify-between pt-1">
              <View>
                <Text className="text-[10px] text-gray-400 font-semibold">Investasi Belajar</Text>
                <Text className="text-base font-black text-[#D82B5A]">Rp 69.000</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => handleRegisterCourse(OFFICIAL_PROGRAMS[0])}
                className="bg-[#D82B5A] px-5 py-2.5 rounded-full shadow-xs active:scale-95 flex-row items-center gap-1.5"
              >
                <Text className="text-xs font-black text-white">
                  {isLoggedIn ? 'Daftar Sekarang' : 'Detail & Daftar'}
                </Text>
                <Feather name="arrow-right" size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Filter Kategori Program */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-3">
            {['Semua', 'STEAM', 'Sensory', 'Parenting', 'Motorik', 'Art'].map((cat) => {
              const isSelected = activeClassFilter === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveClassFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-full mr-2 ${
                    isSelected ? 'bg-[#162E5C]' : 'bg-white border border-gray-200'
                  }`}
                >
                  <Text className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Horizontal Program Carousel */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 14 }}
            className="pb-1"
          >
            {filteredPrograms.map((program) => (
              <TouchableOpacity
                key={program.id}
                className="w-44 bg-white p-3 rounded-3xl border border-gray-100 shadow-xs active:scale-95"
                onPress={() => handleRegisterCourse(program)}
              >
                <View className="w-full h-28 rounded-2xl overflow-hidden bg-gray-100 relative mb-2">
                  <Image 
                    source={program.image} 
                    className="w-full h-full object-cover" 
                    style={{ width: '100%', height: '100%' }} 
                  />
                  <View className="absolute top-2 right-2 bg-[#D82B5A] px-2 py-0.5 rounded-full shadow-xs">
                    <Text className="text-[8px] font-black text-white">{program.age}</Text>
                  </View>
                </View>

                <Text className="text-[10px] text-gray-500 font-semibold" numberOfLines={1}>
                  {program.subtitle}
                </Text>

                <Text className="text-xs font-black text-[#162E5C] leading-tight mt-0.5" numberOfLines={1}>
                  {program.title}
                </Text>

                <View className="flex-row items-center justify-between mt-2 pt-1 border-t border-gray-50">
                  <Text className="text-[10px] font-extrabold text-[#D82B5A]">
                    Rp {program.price.toLocaleString('id-ID')}
                  </Text>
                  <View className="bg-rose-50 px-2 py-0.5 rounded-full">
                    <Text className="text-[8px] font-bold text-[#D82B5A]">Sisa {program.seatsLeft}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ================================================================= */}
        {/* LAYANAN & FASILITAS UNGGULAN (HORIZONTAL CAROUSEL BEBAS ELIPSIS)  */}
        {/* ================================================================= */}
        <View className="mt-5 px-5">
          <View className="mb-3">
            <Text className="text-base font-black text-[#162E5C]">Layanan & Fasilitas Unggulan</Text>
            <Text className="text-[11px] text-gray-500 font-medium">Fasilitas terstandar untuk kenyamanan tumbuh kembang anak</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
            className="pb-1"
          >
            {[
              { 
                icon: 'users', 
                color: '#D82B5A', 
                title: 'Kelas Tatap Muka', 
                desc: 'Belajar interaktif sambil bermain terarah bersama fasilitator' 
              },
              { 
                icon: 'box', 
                color: '#EAB308', 
                title: 'Sensory Learning Kit', 
                desc: 'Alat permainan edukatif terstandar & aman untuk si kecil' 
              },
              { 
                icon: 'activity', 
                color: '#2DA9E9', 
                title: 'Screening Tumbuh Kembang', 
                desc: 'Pemantauan 6 aspek perkembangan STPPA secara berkala' 
              },
              { 
                icon: 'message-circle', 
                color: '#8B22C0', 
                title: 'Konsultasi Psikolog', 
                desc: 'Pendampingan privat pola asuh & psikologi perkembangan anak' 
              },
              { 
                icon: 'home', 
                color: '#30B864', 
                title: 'Ruangan Ramah Anak', 
                desc: 'Lingkungan bermain aman, bersih & bebas resiko cedera' 
              },
            ].map((item) => (
              <View 
                key={item.title} 
                style={{ width: 210, minHeight: 135 }} 
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs justify-between"
              >
                <View>
                  <View 
                    className="w-10 h-10 rounded-2xl items-center justify-center mb-2.5" 
                    style={{ backgroundColor: `${item.color}18` }}
                  >
                    <Feather name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <Text className="text-xs font-black text-[#162E5C] leading-snug mb-1">
                    {item.title}
                  </Text>
                </View>
                <Text className="text-[10px] text-gray-500 font-medium leading-relaxed">
                  {item.desc}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ================================================================= */}
        {/* 5. REKOMENDASI BUKU & PANDUAN TUMBUH KEMBANG                     */}
        {/* ================================================================= */}
        <View className="mt-5 px-5">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-base font-black text-[#162E5C]">Panduan & Buku Pilihan</Text>
              <Text className="text-[11px] text-gray-500 font-medium">Bahan ajar & bacaan stimulasi anak</Text>
            </View>
          </View>

          <View className="gap-3">
            {MOCK_BOOKS.map((book) => (
              <TouchableOpacity
                key={book.id}
                activeOpacity={0.88}
                onPress={() => {
                  setSelectedBook(book);
                  setDetailModalVisible(true);
                }}
                className="bg-white p-3.5 rounded-3xl border border-gray-100 shadow-xs flex-row gap-3.5 items-center"
              >
                <Image 
                  source={{ uri: book.image }}
                  className="w-20 h-24 rounded-2xl bg-gray-100"
                  resizeMode="cover"
                />
                <View className="flex-1 justify-between h-24 py-0.5">
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-0.5">
                      <Text className="text-[10px] font-black text-[#D82B5A] uppercase">{book.category}</Text>
                      <Text className="text-[10px] text-gray-400">• ⭐ {book.rating}</Text>
                    </View>
                    <Text className="text-xs font-black text-[#162E5C] leading-snug" numberOfLines={2}>
                      {book.title}
                    </Text>
                  </View>

                  <View className="flex-row items-center justify-between pt-1 border-t border-gray-50">
                    <Text className="text-xs font-black text-[#D82B5A]">
                      Rp {book.price.toLocaleString('id-ID')}
                    </Text>
                    <View className="bg-gray-100 px-2.5 py-1 rounded-full">
                      <Text className="text-[9px] font-bold text-gray-700">Detail Buku</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ================================================================= */}
        {/* 6. PROFIL TEPERCAYA: TENTANG KAMI, VISI MISI & 3 PILAR KEUNGGULAN  */}
        {/* ================================================================= */}
        <View className="mt-6 px-5">
          <View className="mb-3">
            <Text className="text-base font-black text-[#162E5C]">Tentang Sobat Ceria</Text>
            <Text className="text-[11px] text-gray-500 font-medium">Pusat stimulasi tumbuh kembang emas anak usia 2–7 tahun</Text>
          </View>

          <View className="bg-white rounded-[2.2rem] overflow-hidden border border-gray-100 shadow-xs">
            <Image
              source={require('../assets/dokumentasi sobat/tentang-sobat-ceria.jpeg')}
              style={{ width: '100%', height: 165 }}
              resizeMode="cover"
            />
            <View className="p-4.5">
              <Text className="text-sm font-black text-[#162E5C] mb-1.5">
                Sobat Ceria Fun Learning
              </Text>
              <Text className="text-xs text-gray-600 leading-relaxed font-medium mb-3.5">
                Platform terpadu stimulasi tumbuh kembang anak usia 2–7 tahun berbasis STPPA di bawah binaan Lab Tumbuh Kembang FKIP UMS. Kami memadukan stimulasi sensorik-motorik, kelas kriya, komunikasi, dan pendampingan intensif bersama psikolog anak.
              </Text>

              {/* 3 Pilar Keunggulan Badge */}
              <View className="flex-row flex-wrap gap-1.5 mb-3.5">
                <View className="bg-[#30B864]/10 px-3 py-1 rounded-full border border-[#30B864]/20 flex-row items-center gap-1">
                  <Text className="text-[10px]">🌱</Text>
                  <Text className="text-[9.5px] font-black text-[#166534]">Inklusif (ABK Welcome)</Text>
                </View>
                <View className="bg-[#7C3AED]/10 px-3 py-1 rounded-full border border-[#7C3AED]/20 flex-row items-center gap-1">
                  <Text className="text-[10px]">🧘‍♂️</Text>
                  <Text className="text-[9.5px] font-black text-[#6D28D9]">Mindfulness Kids</Text>
                </View>
                <View className="bg-[#EA580C]/10 px-3 py-1 rounded-full border border-[#EA580C]/20 flex-row items-center gap-1">
                  <Text className="text-[10px]">👨‍👩‍👧</Text>
                  <Text className="text-[9.5px] font-black text-[#C2410C]">Family Co-Creation</Text>
                </View>
              </View>

              {/* Tab Toggle Visi / Misi */}
              <View className="bg-[#FAF6F0] p-1.5 rounded-2xl flex-row gap-1.5 mb-3 border border-amber-100">
                <TouchableOpacity
                  onPress={() => setAboutTab('visi')}
                  className={`flex-1 py-1.5 rounded-xl items-center justify-center ${
                    aboutTab === 'visi' ? 'bg-[#132A5E] shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-[10px] font-black ${aboutTab === 'visi' ? 'text-white' : 'text-gray-600'}`}>
                    Visi Kami
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setAboutTab('misi')}
                  className={`flex-1 py-1.5 rounded-xl items-center justify-center ${
                    aboutTab === 'misi' ? 'bg-[#132A5E] shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text className={`text-[10px] font-black ${aboutTab === 'misi' ? 'text-white' : 'text-gray-600'}`}>
                    Misi Kami
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Konten Tab Visi / Misi */}
              <View className="bg-[#132A5E] p-3.5 rounded-2xl mb-3.5">
                {aboutTab === 'visi' ? (
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Feather name="target" size={13} color="#FBBF24" />
                      <Text className="text-[11px] font-black text-amber-300">Visi Sobat Ceria</Text>
                    </View>
                    <Text className="text-[10.5px] text-blue-100 leading-relaxed font-medium">
                      Menjadi ekosistem pembelajaran ramah anak yang menumbuhkan generasi cerdas, ceria, mandiri, dan berkarakter mulia.
                    </Text>
                  </View>
                ) : (
                  <View>
                    <View className="flex-row items-center gap-1.5 mb-1">
                      <Feather name="compass" size={13} color="#FBBF24" />
                      <Text className="text-[11px] font-black text-amber-300">Misi Sobat Ceria</Text>
                    </View>
                    <Text className="text-[10.5px] text-blue-100 leading-relaxed font-medium">
                      Menghadirkan stimulasi sensorik-motorik terpadu, kelas kriya, komunikasi, serta pemantauan tumbuh kembang inklusif bagi setiap anak.
                    </Text>
                  </View>
                )}
              </View>

              {/* Lokasi Utama Lab UMS */}
              <View className="flex-row items-center gap-2 bg-[#FAF6F0] p-2.5 rounded-2xl border border-amber-100">
                <Feather name="map-pin" size={13} color="#D82B5A" />
                <Text className="text-[10.5px] text-gray-700 font-semibold flex-1">
                  Lab Tumbuh Kembang FKIP UMS Lantai 2, Kampus Pabelan, Sukoharjo
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* BANNER BANTUAN WHATSAPP (SEJAJAR RAPI 1 BARIS)                    */}
        {/* ================================================================= */}
        <View className="px-5 mt-4">
          <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs flex-row items-center justify-between">
            <View className="flex-row items-center gap-2.5 flex-1 pr-3">
              <View className="w-9 h-9 rounded-2xl bg-rose-50 items-center justify-center">
                <Feather name="headphones" size={16} color="#D82B5A" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-black text-[#162E5C]">Butuh Bantuan Pendaftaran?</Text>
                <Text className="text-[10px] text-gray-500 font-medium">Konsultasi jadwal & info program</Text>
              </View>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                const url = 'https://wa.me/6281234567890?text=Halo%20Sobat%20Ceria,%20saya%20ingin%20bertanya%20informasi%20kelas.';
                Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
              }}
              className="bg-[#16A34A] px-4 py-2 rounded-full flex-row items-center gap-1.5 shrink-0 active:scale-95 shadow-xs"
            >
              <Feather name="message-circle" size={13} color="#FFFFFF" />
              <Text className="text-xs font-black text-white">Chat WA</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ================================================================= */}
        {/* KATA ORANG TUA (TESTIMONI DENGAN 5 BINTANG GOLD)                  */}
        {/* ================================================================= */}
        <View className="px-5 mt-6">
          <View className="mb-3">
            <Text className="text-base font-black text-[#162E5C]">Kata Orang Tua</Text>
            <Text className="text-[11px] text-gray-500 font-medium">Cerita nyata dari keluarga Sobat Ceria</Text>
          </View>

          <View className="bg-white p-5 rounded-[2.2rem] border border-gray-100 shadow-xs">
            <View className="flex-row items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Ionicons key={s} name="star" size={16} color="#F59E0B" />
              ))}
            </View>
            <Text className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium mb-4">
              "Sobat Ceria benar-benar jawaban untuk masalah kecanduan gadget anak saya. Sejak ikut kelas sensory & rutin dipantau via grafik STPPA, Arka jadi jauh lebih aktif bicaranya dan makin berani bersosialisasi."
            </Text>
            <View className="flex-row items-center gap-3">
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' }}
                className="w-10 h-10 rounded-full bg-gray-200 border border-rose-100"
              />
              <View>
                <Text className="text-xs font-black text-[#162E5C]">Bunda Dinda & Arka (4 Thn)</Text>
                <Text className="text-[10px] text-gray-500 font-semibold">Orang Tua Murid - Sesi Sensory Play</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ================================================================= */}
        {/* JEJARING MITRA & SEKOLAH                                          */}
        {/* ================================================================= */}
        <View className="px-5 mt-6">
          <View className="mb-3">
            <Text className="text-base font-black text-[#162E5C]">Jejaring Mitra & Sekolah</Text>
            <Text className="text-[11px] text-gray-500 font-medium">Berkolaborasi bersama lembaga PAUD terpercaya</Text>
          </View>

          <View className="bg-white p-4.5 rounded-[2.2rem] border border-gray-100 shadow-xs">
            <View className="flex-row flex-wrap gap-2">
              {[
                'TK Intan Permata',
                'TK Aisyiyah Kampung Sewu',
                'TK Alam Surya Mentari',
                'Bebimart',
                'TK Bintangku',
                'TK IT Al Muhsin Klaten',
              ].map((mitra) => (
                <View key={mitra} className="bg-[#FAF6F0] px-3.5 py-1.5 rounded-full border border-amber-100">
                  <Text className="text-[10.5px] font-bold text-[#162E5C]">{mitra}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ================================================================= */}
      {/* 7. MODAL DETAIL BUKU & PANDUAN                                    */}
      {/* ================================================================= */}
      {selectedBook && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View className="flex-1 bg-black/50 justify-end md:justify-center md:items-center">
            <View className="bg-white w-full md:w-[480px] max-h-[90%] rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden flex-col shadow-2xl relative">
              <View className="bg-[#D82B5A] pt-6 pb-16 px-6 relative items-center justify-center">
                <TouchableOpacity 
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 items-center justify-center active:scale-95 z-20"
                  onPress={() => setDetailModalVisible(false)}
                >
                  <Feather name="x" size={18} color="#FFFFFF" />
                </TouchableOpacity>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-black uppercase">Panduan Pilihan</Text>
                </View>
              </View>

              <View className="items-center -mt-14 z-10">
                <View className="w-28 h-36 rounded-2xl overflow-hidden shadow-xl bg-white border-2 border-white">
                  <Image 
                    source={{ uri: selectedBook.image }} 
                    style={{ width: '100%', height: '100%' }} 
                    resizeMode="cover"
                  />
                </View>
              </View>

              <View className="items-center px-6 pt-3 pb-1">
                <Text className="text-[11px] font-bold text-gray-500">{selectedBook.author}</Text>
                <Text className="text-lg font-black text-[#162E5C] text-center mt-0.5 leading-snug">
                  {selectedBook.title}
                </Text>
              </View>

              <ScrollView className="p-6 flex-1" showsVerticalScrollIndicator={false}>
                <View className="bg-[#FAF6F0] p-3 rounded-2xl flex-row justify-around mb-4 border border-amber-100">
                  <View className="items-center">
                    <Text className="text-xs font-black text-[#162E5C]">⭐ {selectedBook.rating}</Text>
                    <Text className="text-[9px] text-gray-500 font-semibold">Rating</Text>
                  </View>
                  <View className="w-px h-6 bg-gray-200" />
                  <View className="items-center">
                    <Text className="text-xs font-black text-[#162E5C]">{selectedBook.pages} Hal</Text>
                    <Text className="text-[9px] text-gray-500 font-semibold">Halaman</Text>
                  </View>
                  <View className="w-px h-6 bg-gray-200" />
                  <View className="items-center">
                    <Text className="text-xs font-black text-[#162E5C]">{selectedBook.coverType}</Text>
                    <Text className="text-[9px] text-gray-500 font-semibold">Cover</Text>
                  </View>
                </View>

                <Text className="text-xs font-black text-[#162E5C] mb-1">Sinopsis</Text>
                <Text className="text-xs text-gray-600 leading-relaxed font-medium mb-6">
                  {selectedBook.description}
                </Text>
              </ScrollView>

              <View className="p-4 bg-white border-t border-gray-100 px-6 flex-row items-center justify-between">
                <View>
                  <Text className="text-[10px] text-gray-400 font-semibold">Harga Buku</Text>
                  <Text className="text-base font-black text-[#D82B5A]">
                    Rp {selectedBook.price.toLocaleString('id-ID')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setDetailModalVisible(false);
                    const courseObj: Course = {
                      id: selectedBook.id,
                      title: `Buku: ${selectedBook.title}`,
                      category: selectedBook.category,
                      ageRange: 'Semua Usia',
                      price: selectedBook.price,
                      seats: 50,
                      image: selectedBook.image,
                      description: selectedBook.description,
                      facilitator: selectedBook.author,
                    };
                    setSelectedCourseForCheckout(courseObj);
                    setCheckoutModalVisible(true);
                  }}
                  className="bg-[#D82B5A] px-6 py-3 rounded-full shadow-xs active:scale-95"
                >
                  <Text className="text-xs font-black text-white">Beli Sekarang</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Checkout Modal */}
      {selectedCourseForCheckout && (
        <CheckoutModal
          visible={checkoutModalVisible}
          course={selectedCourseForCheckout}
          user={user}
          onClose={() => {
            setCheckoutModalVisible(false);
            setSelectedCourseForCheckout(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}
