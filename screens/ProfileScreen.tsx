import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { UserProfile } from '../types';
import { getRoleMeta } from '../lib/roles';
import { signOut } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { upsertProfile, updateChild, addChild, fetchUserProfile } from '../lib/profile';
import { fetchOrders, OrderData } from '../lib/data';
import { syncProfileToSheet } from '../lib/sheets';
import { clearDemoUser, saveDemoUser, DEMO_PROFILES } from '../lib/demo';

interface ProfileScreenProps {
  user: UserProfile | null;
  onLogout: () => void;
  onLogin?: (user: UserProfile) => void;
  onOpenOnboarding?: () => void;
  onOpenAuth?: () => void;
}

export default function ProfileScreen({ user, onLogout, onLogin, onOpenOnboarding, onOpenAuth }: ProfileScreenProps) {
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, paddingBottom: 110 }}
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-20 h-20 rounded-3xl bg-[#D82B5A] items-center justify-center mb-5">
            <Feather name="user" size={32} color="#FFFFFF" />
          </View>
          <Text className="text-lg font-black text-[#162E5C] mb-2 text-center">Masuk ke Sobat Ceria</Text>
          <Text className="text-xs text-gray-500 text-center leading-relaxed mb-6 max-w-xs">
            Pilih peran Anda untuk mengakses fitur lengkap — Orang Tua, Guru/Tutor, Volunteer, Mitra, atau Collaboration.
          </Text>
          <TouchableOpacity
            onPress={onOpenAuth}
            className="bg-[#D82B5A] px-8 py-3.5 rounded-full shadow-md active:scale-95"
          >
            <Text className="text-white text-sm font-black">Masuk / Pilih Peran</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <ProfileView 
      key={user.email} 
      user={user} 
      onLogout={onLogout} 
      onLogin={onLogin || (() => {})} 
      onOpenOnboarding={onOpenOnboarding}
    />
  );
}

function ProfileView({ 
  user, 
  onLogout, 
  onLogin,
  onOpenOnboarding,
}: { 
  user: UserProfile; 
  onLogout: () => void; 
  onLogin: (user: UserProfile) => void;
  onOpenOnboarding?: () => void;
}) {
  const child = user?.children?.[0] || { name: 'Arka', age: 4, specialNeeds: '' };
  const roleMeta = getRoleMeta(user?.role);

  // Edit mode state
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [parentName, setParentName] = useState<string>(user?.parentName || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [childName, setChildName] = useState<string>(child.name || '');
  const [childAge, setChildAge] = useState<string>(String(child.age || 4));
  const [specialNeeds, setSpecialNeeds] = useState<string>(child.specialNeeds || '');

  // Order history state
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchOrders();
        if (mounted) {
          if (data && data.length > 0) {
            setOrders(data);
          } else if (user?.isDemo) {
            // Berikan contoh riwayat order untuk pengguna mode demo
            setOrders([
              {
                id: 'demo-ord-1',
                course_id: 'c1',
                child_name: child.name || 'Arka',
                whatsapp: user?.phone || '085876332598',
                voucher_code: 'CERIA10K',
                discount: 10000,
                total_amount: 110000,
                status: 'paid',
                created_at: new Date().toISOString(),
                courses: {
                  title: 'Sensory Fun & Tactile Play',
                  category: 'Mini Stimulation',
                  image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600',
                },
              },
            ]);
          }
        }
      } catch {
        // fallback: biarkan kosong
      } finally {
        if (mounted) setOrdersLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);

  const alertMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const startEdit = () => {
    setParentName(user?.parentName || '');
    setPhone(user?.phone || '');
    setChildName(child.name || '');
    setChildAge(String(child.age || 4));
    setSpecialNeeds(child.specialNeeds || '');
    setEditing(true);
  };

  const handleSave = async () => {
    if (!parentName.trim() || !childName.trim()) {
      alertMessage('Form Belum Lengkap', 'Harap isi Nama Orang Tua dan Nama Anak.');
      return;
    }

    setSaving(true);
    try {
      if (user?.isDemo) {
        const ageNumber = parseInt(childAge.trim()) || child.age || 4;
        const updatedUser: UserProfile = {
          ...user,
          parentName: parentName.trim(),
          phone: phone.trim() || user.phone,
          children: [
            {
              id: child.id || 'demo-child-1',
              name: childName.trim(),
              age: ageNumber,
              specialNeeds: specialNeeds.trim() || undefined,
            },
          ],
        };
        await saveDemoUser(updatedUser);
        onLogin(updatedUser);
        setEditing(false);
        alertMessage('Profil Tersimpan (Mode Demo)', 'Data profil Anda berhasil diperbarui di mode demo.');
        return;
      }

      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) throw new Error('Sesi tidak ditemukan.');

      const ageNumber = parseInt(childAge.trim()) || child.age || 4;

      await upsertProfile(userId, {
        parentName: parentName.trim(),
        phone: phone.trim() || undefined,
      });

      if (child.id) {
        await updateChild(child.id, {
          name: childName.trim(),
          age: ageNumber,
          specialNeeds: specialNeeds.trim() || undefined,
        });
      } else {
        // Anak belum ada (login Google pertama kali tanpa data anak) → buat baru
        await addChild(userId, {
          name: childName.trim(),
          age: ageNumber,
          specialNeeds: specialNeeds.trim() || undefined,
        });
      }

      const { profile } = await fetchUserProfile(userId);
      onLogin(profile);

      // Sinkronkan data profil ke Google Sheet
      await syncProfileToSheet(profile);

      setEditing(false);
      alertMessage('Profil Tersimpan', 'Data profil Anda berhasil diperbarui.');
    } catch (error: any) {
      alertMessage('Gagal Menyimpan', error?.message || 'Terjadi kesalahan. Coba lagi nanti.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // ignore
    }
    await clearDemoUser();
    onLogout();
  };

  const handleOpenDrive = () => {
    if (Platform.OS === 'web') {
      window.open('https://www.instagram.com/sobatceria__?igsh=ZzFmMW5jcXZ6ampp', '_blank');
    } else {
      Linking.openURL('https://www.instagram.com/sobatceria__?igsh=ZzFmMW5jcXZ6ampp');
    }
  };

  const inputCls = "bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#162E5C] font-medium mb-3.5 focus:border-[#D82B5A]";
  const labelCls = "text-[10px] font-extrabold text-[#162E5C] mb-1.5 uppercase tracking-wider";

  // Inisial untuk avatar
  const initials = (user?.parentName || 'S')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase() || 'S';

  const infoCard = (icon: any, color: string, bg: string, label: string, value: string, valueCls = 'text-xs font-bold text-[#162E5C]') => (
    <View className="bg-[#FAF7F3] rounded-2xl px-4 py-3.5 flex-row items-center gap-3">
      <View className={`w-10 h-10 rounded-xl ${bg} items-center justify-center shrink-0`}>
        <Feather name={icon} size={17} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">{label}</Text>
        <Text className={`${valueCls} mt-0.5 leading-snug`} numberOfLines={2}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} className="p-4 md:p-8 max-w-5xl mx-auto w-full" showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center gap-2">
            <View className="w-2.5 h-2.5 rounded-full bg-[#D82B5A]" />
            <Text className="text-lg md:text-xl font-extrabold text-[#162E5C]">Profil Saya</Text>
          </View>
          {!editing ? (
            <TouchableOpacity
              className="bg-[#162E5C] px-4 py-2 rounded-full flex-row items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
              onPress={startEdit}
            >
              <Feather name="edit-3" size={13} color="#FFFFFF" />
              <Text className="text-white font-extrabold text-[11px]">Edit Profil</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-2">
              <TouchableOpacity
                className="bg-gray-200 px-4 py-2 rounded-full items-center active:scale-95 transition-transform"
                onPress={() => setEditing(false)}
              >
                <Text className="text-gray-600 font-extrabold text-[11px]">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#D82B5A] px-4 py-2 rounded-full flex-row items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather name="check" size={13} color="#FFFFFF" />
                )}
                <Text className="text-white font-extrabold text-[11px]">Simpan</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Profile Hero Card */}
        <View className="rounded-[2rem] overflow-hidden mb-6 relative">
          {/* Background Gradient */}
          <View
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(135deg, #D82B5A 0%, #8B22C0 60%, #162E5C 100%)' } as any}
          />
          {/* Decorative Circles */}
          <View className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <View className="absolute bottom-4 -left-6 w-24 h-24 rounded-full bg-white/10" />

          <View className="p-6 md:p-7 relative z-10">
            <View className="flex-row items-center gap-4">
              {/* Avatar */}
              <View className="w-16 h-16 rounded-2xl bg-white/95 items-center justify-center shadow-lg">
                <Text className="text-xl font-black text-[#D82B5A]">{initials}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest">Selamat Datang</Text>
                <Text className="text-lg md:text-xl font-extrabold text-white leading-tight mt-0.5">
                  {user?.parentName || 'Bunda Dinda'}
                </Text>
                <Text className="text-white/80 text-[11px] font-medium mt-0.5">{user?.email}</Text>
              </View>
            </View>

            {/* Badge Member */}
            <View className="flex-row items-center gap-2 mt-5">
              <View className="bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 self-start flex-row items-center gap-1.5">
                <Feather name="star" size={12} color="#FFD100" />
                <Text className="text-white text-[10px] font-black uppercase tracking-wide">
                  {`${roleMeta.emoji} ${roleMeta.roleTitle}`}
                </Text>
              </View>
              {user?.isDemo && (
                <View className="bg-amber-400 border border-amber-300 rounded-full px-3 py-1.5 self-start flex-row items-center gap-1.5 shadow-sm">
                  <Feather name="zap" size={12} color="#78350F" />
                  <Text className="text-amber-950 text-[10px] font-black uppercase tracking-wide">Mode Demo</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* TAMPILAN KHUSUS BERDASARKAN PERAN (ROLE)                        */}
        {/* ============================================================== */}

        {/* 1. JIKA PERAN GURU / FASILITATOR */}
        {user?.role === 'tutor' ? (
          <>
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Informasi Pendidik & Fasilitator</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="flex-col gap-3">
                {infoCard('user', '#8B22C0', 'bg-[#8B22C0]/10', 'Nama Lengkap Fasilitator', user?.fullName || user?.parentName, 'text-xs font-black text-[#162E5C]')}
                {infoCard('mail', '#8B22C0', 'bg-[#8B22C0]/10', 'Email Terdaftar', user?.email)}
                {infoCard('message-circle', '#2DA9E9', 'bg-[#2DA9E9]/10', 'No. WhatsApp Kontak', user?.phone || '-')}
                {infoCard('briefcase', '#F77712', 'bg-[#F77712]/10', 'Instansi / Kampus', user?.institution || 'Lab PAUD FKIP UMS & Sobat Ceria')}
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Penugasan Kelas Mengajar</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="bg-white rounded-[1.75rem] p-4.5 border border-purple-100 shadow-xs mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-black text-[#162E5C]">Science Class (Eksperimen STEAM)</Text>
                  <View className="bg-purple-100 px-2 py-0.5 rounded-full">
                    <Text className="text-[9px] font-black text-[#8B22C0]">Sabtu Depan</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Waktu: 09:00 - 11:00 WIB • Lokasi: Lab FKIP UMS Lantai 2 • 12 Murid
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => alertMessage('Presensi', 'Daftar presensi 12 siswa tersinkronisasi ke Google Sheet admin.')}
                    className="flex-1 bg-[#8B22C0] py-2 px-3 rounded-xl items-center"
                  >
                    <Text className="text-white text-[10px] font-bold">Input Presensi</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => alertMessage('Modul', 'Modul pembelajaran STEAM & materi eksperimen gunung berapi telah diunduh.')}
                    className="flex-1 bg-purple-50 border border-purple-200 py-2 px-3 rounded-xl items-center"
                  >
                    <Text className="text-[#8B22C0] text-[10px] font-bold">Lihat Modul Ajar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : user?.role === 'mitra' ? (
          /* 2. JIKA PERAN MITRA / KOLABORASI */
          <>
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Informasi Lembaga & Kemitraan</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="flex-col gap-3">
                {infoCard('user', '#16A34A', 'bg-[#16A34A]/10', 'Nama Perwakilan Mitra', user?.fullName || user?.parentName, 'text-xs font-black text-[#162E5C]')}
                {infoCard('briefcase', '#16A34A', 'bg-[#16A34A]/10', 'Lembaga / Sekolah Mitra', user?.institution || 'Lab FKIP UMS & TK Binaan')}
                {infoCard('mail', '#8B22C0', 'bg-[#8B22C0]/10', 'Email Kontak', user?.email)}
                {infoCard('message-circle', '#2DA9E9', 'bg-[#2DA9E9]/10', 'WhatsApp Kerjasama', user?.phone || '-')}
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Status Kemitraan & Fasilitas</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="bg-white rounded-[1.75rem] p-4.5 border border-green-100 shadow-xs mb-3">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-black text-[#162E5C]">MoU Program Screening PAUD 2026</Text>
                  <View className="bg-green-100 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[9px] font-black text-green-700">Aktif Berlaku</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Cakupan: 128 Siswa Terscreening • Akses Kurikulum Terpadu Sobat Ceria
                </Text>
                <TouchableOpacity
                  onPress={() => alertMessage('Unduh Toolkit', 'Toolkit kemitraan & kurikulum (PDF) sedang diunduh...')}
                  className="bg-[#16A34A] py-2 px-3 rounded-xl items-center"
                >
                  <Text className="text-white text-[10px] font-bold">Unduh Franchise Toolkit & SOP (PDF)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : user?.role === 'volunteer' ? (
          /* 4. JIKA PERAN VOLUNTEER / RELAWAN */
          <>
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Informasi Relawan</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="flex-col gap-3">
                {infoCard('user', '#F59E0B', 'bg-[#F59E0B]/10', 'Nama Relawan', user?.fullName || user?.parentName, 'text-xs font-black text-[#162E5C]')}
                {infoCard('mail', '#F59E0B', 'bg-[#F59E0B]/10', 'Email Terdaftar', user?.email)}
                {infoCard('message-circle', '#2DA9E9', 'bg-[#2DA9E9]/10', 'WhatsApp Kontak', user?.phone || '-')}
                {infoCard('heart', '#F59E0B', 'bg-[#F59E0B]/10', 'Jam Sosial Terkumpul', '12 Jam • 3 Event')}
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Tugas Event Mendatang</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="bg-white rounded-[1.75rem] p-4.5 border border-amber-100 shadow-xs mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs font-black text-[#162E5C]">Outbond Ceria - Art & Pottery Corner</Text>
                  <View className="bg-amber-100 px-2 py-0.5 rounded-full">
                    <Text className="text-[9px] font-black text-[#F59E0B]">Minggu Depan</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Waktu: 07:30 WIB • Lokasi: Taman Edukasi Alam • 18 Relawan Siap
                </Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => alertMessage('Check-in', 'Presensi kehadiran relawan tersimpan. Terima kasih!')}
                    className="flex-1 bg-[#F59E0B] py-2 px-3 rounded-xl items-center"
                  >
                    <Text className="text-white text-[10px] font-bold">Check-in</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => alertMessage('E-Sertifikat', 'E-Sertifikat Relawan Sobat Ceria berhasil diunduh.')}
                    className="flex-1 bg-amber-50 border border-amber-200 py-2 px-3 rounded-xl items-center"
                  >
                    <Text className="text-[#F59E0B] text-[10px] font-bold">E-Sertifikat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </>
        ) : user?.role === 'collab' ? (
          /* 5. JIKA PERAN PARTNER COLLABORATION */
          <>
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Informasi Partner Collaboration</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="flex-col gap-3">
                {infoCard('user', '#0284C7', 'bg-[#0284C7]/10', 'Nama Partner', user?.fullName || user?.parentName, 'text-xs font-black text-[#162E5C]')}
                {infoCard('briefcase', '#0284C7', 'bg-[#0284C7]/10', 'Brand / Organisasi', user?.institution || 'Brand Edukasi & CSR')}
                {infoCard('mail', '#0284C7', 'bg-[#0284C7]/10', 'Email Kontak', user?.email)}
              </View>
            </View>

            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Status Pengajuan Kolaborasi</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="bg-white rounded-[1.75rem] p-4.5 border border-sky-100 shadow-xs mb-3">
                <View className="flex-row items-center justify-between mb-1.5">
                  <Text className="text-xs font-black text-[#162E5C]">Seminar Parenting - Sponsorship</Text>
                  <View className="bg-sky-100 px-2.5 py-0.5 rounded-full">
                    <Text className="text-[9px] font-black text-[#0284C7]">Dalam Review</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-gray-500 font-medium mb-3">
                  Paket: Co-Branding Play-Kit • Estimasi 417+ peserta Solo Raya
                </Text>
                <TouchableOpacity
                  onPress={() => alertMessage('Media Kit', 'Media kit & katalog partnership sedang diunduh...')}
                  className="bg-[#0284C7] py-2 px-3 rounded-xl items-center"
                >
                  <Text className="text-white text-[10px] font-bold">Unduh Media Kit & Katalog</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          /* 3. JIKA PERAN ORANG TUA */
          <>
            {/* Informasi Orang Tua */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Informasi Orang Tua</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>

              {editing ? (
                <View className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-gray-100">
                  <Text className={labelCls}>Nama Lengkap</Text>
                  <TextInput
                    className={inputCls}
                    placeholder="Nama lengkap orang tua"
                    placeholderTextColor="#9CA3AF"
                    value={parentName}
                    onChangeText={setParentName}
                  />

                  <Text className={labelCls}>Email Terdaftar</Text>
                  <View className="bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3 mb-3.5 flex-row items-center gap-2">
                    <Feather name="lock" size={12} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 font-medium">{user?.email}</Text>
                  </View>

                  <Text className={labelCls}>No. WhatsApp</Text>
                  <TextInput
                    className={inputCls}
                    placeholder="e.g. 085876332598"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              ) : (
                <View className="flex-col gap-3">
                  {infoCard('user', '#D82B5A', 'bg-[#D82B5A]/10', 'Nama Lengkap', user?.parentName || 'Bunda Dinda', 'text-xs font-black text-[#162E5C]')}
                  {infoCard('mail', '#8B22C0', 'bg-[#8B22C0]/10', 'Email Terdaftar', user?.email || 'dinda@sobatceria.id')}
                  {infoCard('message-circle', '#2DA9E9', 'bg-[#2DA9E9]/10', 'No. WhatsApp', user?.phone || '- belum diisi -')}
                </View>
              )}
            </View>

            {/* Data Pendampingan Anak */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Data Pendampingan Anak</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>

              {editing ? (
                <View className="bg-white rounded-[1.75rem] p-5 shadow-sm border border-gray-100">
                  <View className="flex-row gap-3 mb-3.5">
                    <View className="flex-[2]">
                      <Text className={labelCls}>Nama Anak</Text>
                      <TextInput
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#162E5C] font-medium"
                        placeholder="Nama anak"
                        placeholderTextColor="#9CA3AF"
                        value={childName}
                        onChangeText={setChildName}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className={`${labelCls} text-center`}>Usia (Thn)</Text>
                      <TextInput
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#162E5C] text-center font-medium"
                        placeholder="4"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={childAge}
                        onChangeText={setChildAge}
                      />
                    </View>
                  </View>

                  <Text className={labelCls}>Kebutuhan Khusus / ABK</Text>
                  <TextInput
                    className={inputCls}
                    placeholder="e.g. Speech Delay / ADHD / Kosong"
                    placeholderTextColor="#9CA3AF"
                    value={specialNeeds}
                    onChangeText={setSpecialNeeds}
                  />
                </View>
              ) : (
                <View className="flex-col gap-3">
                  {infoCard('smile', '#30B864', 'bg-[#30B864]/10', 'Nama Anak', child.name, 'text-xs font-black text-[#162E5C]')}
                  {infoCard('calendar', '#F77712', 'bg-[#F77712]/10', 'Usia Anak', `${child.age} Tahun (Jenjang Usia 2–7 Thn)`)}
                  <View className="bg-[#FAF7F3] rounded-2xl px-4 py-3.5 flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-xl bg-[#5A3B8B]/10 items-center justify-center shrink-0">
                      <Feather name="heart" size={17} color="#5A3B8B" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Kebutuhan Khusus / ABK</Text>
                      <Text className={`text-xs font-extrabold mt-0.5 ${child.specialNeeds ? 'text-[#F77712]' : 'text-[#30B864]'}`}>
                        {child.specialNeeds || 'Anak Tipikal (Inklusif Welcome)'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
            {/* Grafik Progres STPPA */}
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-sm font-extrabold text-[#162E5C]">Grafik Progres STPPA</Text>
                <View className="flex-1 h-px bg-gray-200/80" />
              </View>
              <View className="bg-white rounded-[1.75rem] p-5 border border-gray-100 shadow-xs gap-3">
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-[11px] font-bold text-gray-700">Sensorik & Motorik Halus</Text>
                    <Text className="text-[11px] font-black text-[#30B864]">88%</Text>
                  </View>
                  <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <View className="h-full bg-[#30B864] rounded-full" style={{ width: '88%' }} />
                  </View>
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-[11px] font-bold text-gray-700">Komunikasi & Kosa Kata</Text>
                    <Text className="text-[11px] font-black text-[#2DA9E9]">92%</Text>
                  </View>
                  <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <View className="h-full bg-[#2DA9E9] rounded-full" style={{ width: '92%' }} />
                  </View>
                </View>
                <View>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-[11px] font-bold text-gray-700">Kemandirian & Sosialisasi</Text>
                    <Text className="text-[11px] font-black text-[#F77712]">Perlu Stimulasi</Text>
                  </View>
                  <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <View className="h-full bg-[#F77712] rounded-full" style={{ width: '62%' }} />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Riwayat Order / Receipt */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-sm font-extrabold text-[#162E5C]">Riwayat Order</Text>
            <View className="flex-1 h-px bg-gray-200/80" />
            {orders.length > 0 && (
              <View className="bg-[#30B864]/15 px-2.5 py-1 rounded-full">
                <Text className="text-[9px] font-black text-[#30B864]">{orders.length} Order</Text>
              </View>
            )}
          </View>

          {ordersLoading ? (
            <View className="items-center py-10 bg-white rounded-[1.75rem] shadow-sm border border-gray-100">
              <ActivityIndicator size="small" color="#D82B5A" />
            </View>
          ) : orders.length === 0 ? (
            <View className="items-center py-10 bg-white rounded-[1.75rem] shadow-sm border border-gray-100">
              <View className="w-14 h-14 rounded-2xl bg-[#FAF6F0] items-center justify-center mb-3">
                <Feather name="inbox" size={24} color="#C4C4C4" />
              </View>
              <Text className="text-xs font-bold text-gray-400">Belum ada order</Text>
              <Text className="text-[10px] text-gray-400 mt-1 text-center px-8 leading-relaxed">
                Order kelas akan muncul di sini setelah Anda daftar.
              </Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} className="bg-white rounded-[1.75rem] p-4 mb-3 shadow-sm border border-gray-100 flex-row items-center gap-3.5">
                {/* Course Thumb */}
                <View className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D82B5A] to-[#8B22C0] items-center justify-center shrink-0">
                  <Feather name="book-open" size={20} color="#FFFFFF" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-0.5">
                    <Text className="text-xs font-black text-[#162E5C] flex-1 mr-2" numberOfLines={1}>
                      {order.courses?.title || 'Kelas Sobat Ceria'}
                    </Text>
                    <View className="bg-[#30B864]/15 px-2 py-0.5 rounded-full ml-1">
                      <Text className="text-[8px] font-black text-[#30B864] uppercase">{order.status}</Text>
                    </View>
                  </View>

                  <Text className="text-[10px] text-gray-500 font-medium">
                    {order.courses?.category || ''} • Anak: {order.child_name || '-'}
                  </Text>

                  <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <View className="flex-row items-center gap-1.5">
                      <Feather name="calendar" size={10} color="#9CA3AF" />
                      <Text className="text-[9px] text-gray-500 font-medium">
                        {new Date(order.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      {order.voucher_code ? (
                        <View className="bg-[#F77712]/10 px-1.5 py-0.5 rounded-md">
                          <Text className="text-[8px] font-bold text-[#F77712]">{order.voucher_code}</Text>
                        </View>
                      ) : null}
                      <Text className="text-xs font-black text-[#D82B5A]">
                        Rp {order.total_amount.toLocaleString('id-ID')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Vault Dokumentasi */}
        <View className="rounded-[1.75rem] overflow-hidden mb-6 relative">
          <View
            className="absolute inset-0"
            style={{ backgroundImage: 'linear-gradient(135deg, #162E5C 0%, #1B254B 100%)' } as any}
          />
          <View className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
          <View className="p-6 relative z-10 flex-row items-center gap-4">
            <View className="w-12 h-12 rounded-2xl bg-white/15 items-center justify-center border border-white/20 shrink-0">
              <Feather name="image" size={20} color="#FFFFFF" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-white">Vault Dokumentasi Activity</Text>
              <Text className="text-[10px] text-gray-300 font-medium mt-0.5 leading-relaxed">
                Lihat rekaman momen belajar sambil bermain si kecil selama mengikuti kelas stimulasi Sobat Ceria di Instagram & Drive official kami.
              </Text>
            </View>
          </View>
          <View className="px-6 pb-6 relative z-10">
            <TouchableOpacity
              className="bg-[#D82B5A] py-3 rounded-full items-center shadow-md hover:bg-[#B01E49] transition-transform active:scale-95 flex-row justify-center gap-2"
              onPress={handleOpenDrive}
            >
              <Feather name="instagram" size={16} color="#FFFFFF" />
              <Text className="text-white text-xs font-extrabold">Buka Dokumentasi Official</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Voucher Repeat Order */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-sm font-extrabold text-[#162E5C]">Voucher Repeat Order</Text>
            <View className="flex-1 h-px bg-gray-200/80" />
          </View>
          <View className="bg-white rounded-[1.75rem] p-5 border border-gray-100 shadow-xs">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2.5">
                <View className="w-11 h-11 rounded-2xl bg-[#F77712]/10 items-center justify-center">
                  <Feather name="tag" size={20} color="#F77712" />
                </View>
                <View>
                  <Text className="text-xs font-black text-[#162E5C]">Kode Promo REPEATORDER10</Text>
                  <Text className="text-[10px] text-gray-500 font-medium">Diskon Rp 10.000 untuk pendaftaran kelas berikutnya</Text>
                </View>
              </View>
              <View className="bg-[#F77712]/10 px-2.5 py-1 rounded-full">
                <Text className="text-[9px] font-black text-[#F77712]">Aktif</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => alertMessage('Voucher', 'Kode REPEATORDER10 berhasil disalin. Gunakan saat checkout pendaftaran kelas!')}
              className="bg-[#D82B5A] py-3 rounded-full items-center flex-row justify-center gap-2"
            >
              <Feather name="copy" size={14} color="#FFFFFF" />
              <Text className="text-white text-xs font-extrabold">Klaim Voucher Hemat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Join Us & Tumbuh Bersama Sobat Ceria */}
        <View className="mb-6">
          <View className="mb-3">
            <Text className="text-sm font-extrabold text-[#162E5C]">Join Us & Tumbuh Bersama Sobat Ceria</Text>
            <Text className="text-[10px] text-gray-500 font-medium">Partner Collaboration Hub</Text>
          </View>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {[
              { icon: 'users', color: '#2DA9E9', title: 'Daftar Volunteer', desc: 'Relawan Anak' },
              { icon: 'book-open', color: '#8B22C0', title: 'Daftar Tutor/Guru', desc: 'Tenaga Pendidik' },
              { icon: 'briefcase', color: '#F77712', title: 'Daftar Collaboration', desc: 'Project & Media' },
              { icon: 'award', color: '#30B864', title: 'Daftar Mitra', desc: 'Klinis & Sekolah' },
            ].map((item) => (
              <TouchableOpacity
                key={item.title}
                style={{ width: '48%' }}
                activeOpacity={0.85}
                onPress={() => {
                  const url = `https://wa.me/6285876332598?text=Halo%20Sobat%20Ceria,%20saya%20ingin%20mendaftar%20sebagai%20${encodeURIComponent(item.title)}.`;
                  Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                }}
                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-xs"
              >
                <View className="w-10 h-10 rounded-2xl items-center justify-center mb-2" style={{ backgroundColor: `${item.color}15` }}>
                  <Feather name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text className="text-xs font-black text-[#162E5C]" numberOfLines={1}>{item.title}</Text>
                <Text className="text-[10px] text-gray-500 font-medium mt-0.5">{item.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pusat Kontak & Lokasi */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-sm font-extrabold text-[#162E5C]">Pusat Kontak & Lokasi</Text>
            <View className="flex-1 h-px bg-gray-200/80" />
          </View>
          <View className="bg-white rounded-[1.75rem] p-5 border border-gray-100 shadow-xs">
            <View className="flex-row items-center gap-3 mb-3">
              <View className="w-10 h-10 rounded-xl bg-[#D82B5A]/10 items-center justify-center shrink-0">
                <Feather name="map-pin" size={17} color="#D82B5A" />
              </View>
              <Text className="text-xs text-gray-600 font-medium flex-1 leading-relaxed">
                Lab Tumbuh Kembang FKIP UMS Lantai 2, Jl. A. Yani Tromol Pos 1 Pabelan, Sukoharjo
              </Text>
            </View>

            <View className="gap-2">
              <TouchableOpacity
                onPress={() => {
                  const url = 'https://wa.me/6285876332598';
                  Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                }}
                className="bg-[#FAF7F3] rounded-2xl px-4 py-3 flex-row items-center gap-3"
              >
                <Feather name="message-circle" size={16} color="#2DA9E9" />
                <Text className="text-xs font-bold text-[#162E5C]">+62 858-7633-2598</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  const url = 'mailto:sobatceria25@gmail.com';
                  Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                }}
                className="bg-[#FAF7F3] rounded-2xl px-4 py-3 flex-row items-center gap-3"
              >
                <Feather name="mail" size={16} color="#8B22C0" />
                <Text className="text-xs font-bold text-[#162E5C]">sobatceria25@gmail.com</Text>
              </TouchableOpacity>

              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => {
                    const url = 'https://www.instagram.com/sobatceria__?igsh=ZzFmMW5jcXZ6ampp';
                    Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                  }}
                  className="flex-1 bg-[#FAF7F3] rounded-2xl px-4 py-3 flex-row items-center justify-center gap-2"
                >
                  <Feather name="instagram" size={16} color="#D82B5A" />
                  <Text className="text-xs font-bold text-[#162E5C]">Instagram</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const url = 'https://www.tiktok.com/@sobatceria';
                    Platform.OS === 'web' ? window.open(url, '_blank') : Linking.openURL(url);
                  }}
                  className="flex-1 bg-[#FAF7F3] rounded-2xl px-4 py-3 flex-row items-center justify-center gap-2"
                >
                  <Feather name="music" size={16} color="#162E5C" />
                  <Text className="text-xs font-bold text-[#162E5C]">TikTok</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Switcher Peran Demo (Khusus Mode Demo) */}
        {user?.isDemo && (
          <View className="mb-6 bg-amber-50/90 border border-amber-200 rounded-[1.75rem] p-4.5 shadow-xs">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <Feather name="refresh-cw" size={13} color="#92400E" />
                <Text className="text-xs font-black text-amber-900">Uji Coba Peran Lain (Mode Demo)</Text>
              </View>
              <Text className="text-[9px] font-bold text-amber-700">Ganti Instan</Text>
            </View>
            <Text className="text-[10px] text-amber-800 mb-3 font-medium">
              Uji bagaimana dashboard Beranda & Profil beradaptasi otomatis sesuai peran yang login:
            </Text>

            <View className="gap-2">
              {[
                { demoKey: 'bunda', role: 'parent', color: '#D82B5A', label: '👨‍👩‍👧 Orang Tua: Bunda Dinda & Arka' },
                { demoKey: 'guru', role: 'tutor', color: '#8B22C0', label: '👨‍🏫 Guru / Fasilitator: Kak Farhan, S.Pd' },
                { demoKey: 'relawan', role: 'volunteer', color: '#F59E0B', label: '🙌 Relawan: Kak Salsabila' },
                { demoKey: 'mitra', role: 'mitra', color: '#16A34A', label: '🤝 Mitra Sekolah: Dr. Rahmawati' },
                { demoKey: 'collab', role: 'collab', color: '#0284C7', label: '💼 Partner Collab: Andi Wijaya' },
              ].map((item) => {
                const isActive = user.role === item.role;
                return (
                  <TouchableOpacity
                    key={item.role}
                    onPress={async () => {
                      const u = DEMO_PROFILES[item.demoKey] || DEMO_PROFILES.bunda;
                      await saveDemoUser(u);
                      onLogin(u);
                    }}
                    style={isActive ? { backgroundColor: item.color, borderColor: item.color } : undefined}
                    className={`py-2 px-3 rounded-xl flex-row items-center justify-between border ${isActive ? '' : 'bg-white border-amber-200'}`}
                  >
                    <Text className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-gray-800'}`}>
                      {item.label}
                    </Text>
                    {isActive && <Feather name="check" size={13} color="#FFFFFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {onOpenOnboarding && (
          <TouchableOpacity
            className="bg-white border border-gray-200 py-3 rounded-[1.75rem] items-center flex-row justify-center gap-2 mb-3 shadow-xs active:scale-98"
            onPress={onOpenOnboarding}
          >
            <Feather name="star" size={14} color="#162E5C" />
            <Text className="text-[#162E5C] text-xs font-extrabold">Lihat Welcome / Onboarding Screen</Text>
          </TouchableOpacity>
        )}

        {/* Log Out Button */}
        <TouchableOpacity
          className="bg-white border border-rose-200 py-3.5 rounded-[1.75rem] items-center flex-row justify-center gap-2 shadow-sm transition-transform active:scale-98"
          onPress={handleLogout}
        >
          <Feather name="log-out" size={15} color="#D82B5A" />
          <Text className="text-[#D82B5A] text-xs font-extrabold">Keluar dari Akun (Kembali ke Tampilan Umum)</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
