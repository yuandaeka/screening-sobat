import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { ScreeningResult } from '../types';
import { fetchScreeningResults } from '../lib/data';

const MOCK_RESULTS: ScreeningResult[] = [
  {
    id: 's1',
    childName: 'Arka',
    category: 'Motorik Kasar & Halus',
    status: 'Berkembang Sesuai Harapan',
    scoreDate: '01 Aug 2026',
    psychologistNotes: 'Koordinasi jemari Arka sangat baik saat memegang kuas melukis dan membentuk tanah liat. Kekuatan fisik kasar dan keseimbangan sudah matang.'
  },
  {
    id: 's2',
    childName: 'Arka',
    category: 'Bahasa & Bicara (Speech)',
    status: 'Mulai Berkembang',
    scoreDate: '01 Aug 2026',
    psychologistNotes: 'Arka dapat memahami instruksi fasilitator dengan lancar. Disarankan latihan rutin percakapan dua arah di rumah dan membatasi screen time gadget.'
  },
  {
    id: 's3',
    childName: 'Arka',
    category: 'Sosial Emosional & Mindfulness',
    status: 'Berkembang Sesuai Harapan',
    scoreDate: '01 Aug 2026',
    psychologistNotes: 'Arka menunjukkan empati tinggi saat sesi lingkaran cerita dan dengan sabar mau antre berbagi alat mainan bersama teman sebaya.'
  }
];

export default function ScreeningScreen({ navigation, user }: { navigation: any; user: any }) {
  const child = user?.children?.[0] || { name: 'Arka', age: 4 };
  const [results, setResults] = useState<ScreeningResult[]>(MOCK_RESULTS);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchScreeningResults();
        if (mounted && data.length > 0) setResults(data);
      } catch {
        // fallback mock
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Berkembang Sesuai Harapan':
        return { text: 'text-[#30B864]', bg: 'bg-[#30B864]/10 border-[#30B864]/20', bar: 'bg-[#30B864] w-full' };
      case 'Mulai Berkembang':
        return { text: 'text-[#2DA9E9]', bg: 'bg-[#2DA9E9]/10 border-[#2DA9E9]/20', bar: 'bg-[#2DA9E9] w-3/4' };
      default:
        return { text: 'text-[#D82B5A]', bg: 'bg-[#D82B5A]/10 border-[#D82B5A]/20', bar: 'bg-[#D82B5A] w-1/2' };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} className="p-4 md:p-8 max-w-5xl mx-auto w-full" showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-xs mb-6 flex-row items-center justify-between">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-2 mb-1.5">
              <View className="w-2.5 h-2.5 rounded-full bg-[#D82B5A]" />
              <Text className="text-[10px] font-black text-[#D82B5A] tracking-widest uppercase">Fitur Aplikasi Terpadu</Text>
            </View>
            <Text className="text-lg md:text-xl font-extrabold text-[#162E5C]">Screening STPPA Digital Si Kecil</Text>
            <Text className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">
              Pantau 6 aspek perkembangan anak usia 2–7 tahun oleh psikolog & fasilitator Sobat Ceria.
            </Text>
          </View>

          <View className="bg-[#D82B5A]/10 px-3.5 py-1.5 rounded-full border border-[#D82B5A]/20">
            <Text className="text-xs font-black text-[#D82B5A]">{child.name} ({child.age} Thn)</Text>
          </View>
        </View>

        {/* Ringkasan Status Capaian */}
        <View className="mb-6">
          <Text className="text-base font-extrabold text-[#162E5C] mb-3">Ringkasan Status Capaian</Text>
          <View className="gap-3">
            {/* 1. Sensorik & Motorik Halus */}
            <View className="bg-white rounded-3xl border border-gray-100 shadow-xs p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 rounded-2xl bg-[#30B864]/15 items-center justify-center">
                    <Feather name="zap" size={16} color="#30B864" />
                  </View>
                  <Text className="text-xs font-black text-[#162E5C]">Sensorik & Motorik Halus</Text>
                </View>
                <View className="bg-[#30B864]/10 px-3 py-1 rounded-full border border-[#30B864]/20">
                  <Text className="text-[10px] font-black text-[#30B864]">Optimal (88%)</Text>
                </View>
              </View>
              <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-[#30B864] rounded-full" style={{ width: '88%' }} />
              </View>
            </View>

            {/* 2. Komunikasi & Kosa Kata */}
            <View className="bg-white rounded-3xl border border-gray-100 shadow-xs p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 rounded-2xl bg-[#2DA9E9]/15 items-center justify-center">
                    <Feather name="message-circle" size={16} color="#2DA9E9" />
                  </View>
                  <Text className="text-xs font-black text-[#162E5C]">Komunikasi & Kosa Kata</Text>
                </View>
                <View className="bg-[#2DA9E9]/10 px-3 py-1 rounded-full border border-[#2DA9E9]/20">
                  <Text className="text-[10px] font-black text-[#2DA9E9]">Sangat Baik (92%)</Text>
                </View>
              </View>
              <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-[#2DA9E9] rounded-full" style={{ width: '92%' }} />
              </View>
            </View>

            {/* 3. Kemandirian & Sosialisasi */}
            <View className="bg-white rounded-3xl border border-gray-100 shadow-xs p-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2.5">
                  <View className="w-9 h-9 rounded-2xl bg-[#F77712]/15 items-center justify-center">
                    <Feather name="users" size={16} color="#F77712" />
                  </View>
                  <Text className="text-xs font-black text-[#162E5C]">Kemandirian & Sosialisasi</Text>
                </View>
                <View className="bg-[#F77712]/10 px-3 py-1 rounded-full border border-[#F77712]/20">
                  <Text className="text-[10px] font-black text-[#F77712]">Perlu Stimulasi</Text>
                </View>
              </View>
              <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <View className="h-full bg-[#F77712] rounded-full" style={{ width: '62%' }} />
              </View>
            </View>
          </View>
        </View>

        {/* Info Banner STPPA */}
        <View className="bg-[#162E5C] p-6 rounded-[2.5rem] mb-6 shadow-md text-white flex-col justify-between">
          <View className="flex-row items-center gap-2 mb-2">
            <Feather name="shield" size={18} color="#FFD100" />
            <Text className="text-white text-sm font-extrabold">Standar Tingkat Pencapaian Perkembangan Anak (STPPA)</Text>
          </View>
          <Text className="text-gray-300 text-xs leading-relaxed font-medium mb-4">
            Pemantauan berkala 6 aspek perkembangan utama: Nilai Agama & Moral, Motorik, Kognitif, Bahasa, Sosial-Emosional, serta Seni.
          </Text>
          <View className="bg-white/10 p-3 rounded-2xl border border-white/20 flex-row items-center gap-2">
            <Feather name="check-circle" size={14} color="#30B864" />
            <Text className="text-[11px] text-white font-semibold">Tersusun otomatis oleh Tim Psikolog FKIP UMS</Text>
          </View>
        </View>

        {/* Screening Results List */}
        <Text className="text-base font-extrabold text-[#162E5C] mb-3">Laporan Hasil Sesi Terbaru</Text>
        <View className="grid grid-cols-1 gap-4 mb-6">
          {results.map((result) => {
            const badge = getStatusBadge(result.status);
            return (
              <View key={result.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xs p-6 card-hover-effect">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 mr-2">
                    <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{result.scoreDate}</Text>
                    <Text className="text-base font-extrabold text-[#162E5C] mt-0.5">{result.category}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full border ${badge.bg}`}>
                    <Text className={`text-[10px] font-black ${badge.text}`}>{result.status}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                  <View className={`h-full rounded-full ${badge.bar}`} />
                </View>

                {/* Psychologist Notes */}
                <View className="bg-[#FAF6F0] p-4 rounded-2xl border border-gray-200/60">
                  <View className="flex-row items-center gap-2 mb-1.5">
                    <Feather name="edit-3" size={14} color="#D82B5A" />
                    <Text className="text-xs font-extrabold text-[#162E5C]">Catatan Fasilitator / Psikolog:</Text>
                  </View>
                  <Text className="text-xs text-gray-600 leading-relaxed italic font-medium">
                    "{result.psychologistNotes}"
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Kuesioner Interaktif 6 Aspek STPPA */}
        <View className="mb-6">
          <View className="mb-3">
            <Text className="text-base font-extrabold text-[#162E5C]">Kuesioner Observasi 6 Aspek STPPA</Text>
            <Text className="text-[11px] text-gray-500 font-medium">Isi observasi sesuai perkembangan si kecil</Text>
          </View>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {[
              { icon: 'heart', color: '#D82B5A', title: 'Nilai Agama & Moral' },
              { icon: 'activity', color: '#2DA9E9', title: 'Fisik-Motorik' },
              { icon: 'cpu', color: '#8B22C0', title: 'Kognitif' },
              { icon: 'message-circle', color: '#30B864', title: 'Bahasa' },
              { icon: 'users', color: '#F77712', title: 'Sosial-Emosional' },
              { icon: 'music', color: '#EAB308', title: 'Seni' },
            ].map((aspect) => (
              <TouchableOpacity
                key={aspect.title}
                style={{ width: '48%' }}
                activeOpacity={0.85}
                onPress={() => {
                  const msg = `Form observasi "${aspect.title}" akan segera dibuka.\n(Fitur interaktif kuesioner tersedia pada tahap berikutnya)`;
                  Platform.OS === 'web' ? window.alert(msg) : alert(msg);
                }}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs"
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: `${aspect.color}15` }}>
                  <Feather name={aspect.icon as any} size={18} color={aspect.color} />
                </View>
                <Text className="text-xs font-black text-[#162E5C]" numberOfLines={2}>{aspect.title}</Text>
                <View className="flex-row items-center gap-1 mt-1.5">
                  <Text className="text-[10px] font-black text-[#D82B5A]">Isi Observasi</Text>
                  <Feather name="chevron-right" size={12} color="#D82B5A" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Konsultasi Psikolog */}
        <View className="bg-[#162E5C] p-5 rounded-[2.5rem] mb-6 flex-row items-center justify-between shadow-md">
          <View className="flex-1 pr-3">
            <Text className="text-white text-sm font-extrabold mb-1">Konsultasi Psikolog Anak</Text>
            <Text className="text-blue-100 text-[11px] font-medium leading-snug">
              Jadwalkan konsultasi strategi stimulasi lanjutan bersama psikolog tumbuh kembang.
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              const url = 'https://wa.me/6285876332598?text=Halo%20Sobat%20Ceria,%20saya%20ingin%20menjadwalkan%20konsultasi%20psikolog%20anak.';
              Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
            }}
            className="bg-white px-4 py-2.5 rounded-full shadow-xs active:scale-95"
          >
            <Text className="text-xs font-black text-[#162E5C]">Jadwalkan</Text>
          </TouchableOpacity>
        </View>

        {/* Download PDF Action Button */}
        <TouchableOpacity 
          className="bg-[#D82B5A] p-4 rounded-full items-center shadow-md hover:bg-[#B01E49] transition-transform active:scale-98 flex-row justify-center gap-2"
          onPress={() => {
            if (Platform.OS === 'web') {
              window.alert('Mengunduh Laporan PDF STPPA Sobat Ceria...');
            } else {
              alert('Mengunduh Laporan PDF STPPA Sobat Ceria...');
            }
          }}
        >
          <Feather name="download" size={18} color="#FFFFFF" />
          <Text className="text-white text-xs font-extrabold">Unduh Laporan PDF STPPA Lengkap</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
