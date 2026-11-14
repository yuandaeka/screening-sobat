import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { UserProfile, UserRole } from '../types';
import { ROLE_META, ROLE_LIST, getRoleTitle } from '../lib/roles';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/auth';
import { fetchUserProfile, upsertProfile, addChild } from '../lib/profile';
import { DEMO_PROFILES, saveDemoUser } from '../lib/demo';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  onExploreGuest?: () => void;
  initialPage?: 'welcome' | 'login' | 'register';
}

const DEMO_KEY_BY_ROLE: Record<UserRole, string> = {
  guest: 'bunda',
  parent: 'bunda',
  tutor: 'guru',
  volunteer: 'relawan',
  mitra: 'mitra',
  collab: 'collab',
};

export default function LoginScreen({ 
  onLogin, 
  onExploreGuest,
  initialPage = 'welcome' 
}: LoginScreenProps) {
  // 3-Page Flow State: 'welcome' (Page 1) | 'login' (Page 2) | 'register' (Page 3)
  const [page, setPage] = useState<'welcome' | 'login' | 'register'>(initialPage);

  // Form States
  const [parentName, setParentName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('parent');
  const [institution, setInstitution] = useState<string>('');
  const [childName, setChildName] = useState<string>('');
  const [childAge, setChildAge] = useState<string>('');
  const [specialNeeds, setSpecialNeeds] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // --- DEMO LOGIN HANDLER ---
  const handleDemoLogin = async (type: 'bunda' | 'ayah' | 'guru' | 'mitra' | 'relawan' | 'collab' | 'custom' = 'bunda') => {
    let demoUser: UserProfile;

    if (type === 'custom') {
      const pName = parentName.trim() || 'Bunda Dinda (Demo)';
      const cName = childName.trim() || 'Arka';
      const cAge = parseInt(childAge.trim()) || 4;
      demoUser = {
        parentName: pName,
        fullName: pName,
        email: email.trim() || 'demo@sobatceria.id',
        phone: phone.trim() || '085876332598',
        role: selectedRole,
        roleTitle: getRoleTitle(selectedRole),
        institution: institution.trim() || undefined,
        isDemo: true,
        children: selectedRole === 'parent' ? [
          {
            id: 'demo-child-custom',
            name: cName,
            age: cAge,
            specialNeeds: specialNeeds.trim() || undefined,
          },
        ] : [],
      };
    } else {
      demoUser = DEMO_PROFILES[type] || DEMO_PROFILES.bunda;
    }

    await saveDemoUser(demoUser);
    onLogin(demoUser);
  };

  const promptDemoMode = (title: string, message: string) => {
    const errorText = `${title}: ${message}\n\n💡 Supabase sedang offline. Ingin langsung masuk menggunakan Mode Demo?`;
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(errorText);
      if (confirmed) {
        handleDemoLogin(parentName.trim() ? 'custom' : 'bunda');
      }
    } else {
      Alert.alert(
        title,
        `${message}\n\n💡 Supabase sedang offline. Ingin langsung masuk menggunakan Mode Demo?`,
        [
          { text: 'Tutup', style: 'cancel' },
          {
            text: 'Masuk Mode Demo',
            onPress: () => handleDemoLogin(parentName.trim() ? 'custom' : 'bunda'),
          },
        ]
      );
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      if (Platform.OS === 'web') return;

      if (!session?.user) throw new Error('Session tidak ditemukan.');
      const { profile } = await fetchUserProfile(session.user.id);
      onLogin(profile);
    } catch (error: any) {
      promptDemoMode('Login Google Gagal', error?.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    alertMessage(
      'Login Media Sosial',
      'Masuk menggunakan Google atau akun email Anda untuk kemudahan integrasi dengan platform Sobat Ceria.'
    );
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim()) {
      alertMessage('Form Belum Lengkap', 'Harap isi Email dan Password!');
      return;
    }

    setLoading(true);
    try {
      const regName = parentName.trim() || (email.split('@')[0] || 'Member Ceria');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: { 
            full_name: regName,
            role: selectedRole,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.session?.user) {
        alertMessage('Cek Email Anda', 'Pendaftaran berhasil. Silakan verifikasi email untuk masuk.');
        setLoading(false);
        return;
      }

      const userId = signUpData.session.user.id;
      await upsertProfile(userId, { parentName: regName, email: email.trim(), phone: phone.trim() || undefined });

      const ageNumber = parseInt(childAge.trim()) || 4;
      if (selectedRole === 'parent' && childName.trim()) {
        await addChild(userId, {
          name: childName.trim(),
          age: ageNumber,
          specialNeeds: specialNeeds.trim() || undefined,
        });
      }

      const { profile } = await fetchUserProfile(userId);
      const enrichedProfile: UserProfile = {
        ...profile,
        role: selectedRole,
        roleTitle: getRoleTitle(selectedRole),
        institution: institution.trim() || undefined,
      };
      onLogin(enrichedProfile);
    } catch (error: any) {
      promptDemoMode('Pendaftaran Gagal (Supabase Error)', error?.message || 'Terjadi kesalahan pada Supabase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alertMessage('Form Belum Lengkap', 'Harap isi Email dan Password!');
      return;
    }

    setLoading(true);
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });
      if (signInError) throw signInError;
      if (!signInData.user) throw new Error('User tidak ditemukan.');

      const { profile } = await fetchUserProfile(signInData.user.id);
      onLogin(profile);
    } catch (error: any) {
      promptDemoMode('Login Gagal (Supabase Error)', error?.message || 'Email atau password salah / koneksi Supabase terganggu.');
    } finally {
      setLoading(false);
    }
  };

  const alertMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View className="flex-1 bg-[#D82B5A]">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* =================================================================== */}
      {/* 0. TOP PREVIEW SWITCHER PILL (1. Welcome | 2. Login | 3. Register)  */}
      {/* =================================================================== */}
      <SafeAreaView edges={['top']} className="px-5 pt-1 z-30">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-2">
            {page !== 'welcome' && (
              <TouchableOpacity
                onPress={() => setPage('welcome')}
                className="w-8 h-8 rounded-full bg-white/20 items-center justify-center border border-white/30 active:scale-95"
              >
                <Feather name="arrow-left" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <Text className="text-[11px] font-black tracking-widest text-white/90 uppercase">
              {page === 'welcome' ? 'Welcome Gateway' : page === 'login' ? 'Masuk Akun' : 'Daftar Akun'}
            </Text>
          </View>

          {/* 3-Page Switcher Buttons (Sesuai Referensi Pengguna) */}
          <View className="flex-row bg-black/25 backdrop-blur-md p-1 rounded-full border border-white/20">
            {(['welcome', 'login', 'register'] as const).map((p, idx) => {
              const isActive = page === p;
              const labels = ['1. Welcome', '2. Login', '3. Register'];
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPage(p)}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    isActive ? 'bg-white shadow-xs' : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`text-[9px] font-black ${
                      isActive ? 'text-[#D82B5A]' : 'text-white/80'
                    }`}
                  >
                    {labels[idx]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </SafeAreaView>

      {/* =================================================================== */}
      {/* TOP HEADER SECTION (WARNA MERAH MAROON KHAS SOBAT CERIA)            */}
      {/* =================================================================== */}
      <View 
        className="w-full px-6 pt-2 pb-5 items-center justify-center relative overflow-hidden"
        style={{
          minHeight: page === 'welcome' ? Math.min(screenHeight * 0.40, 310) : 180,
        }}
      >
        {/* Decorative Rings */}
        <View className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10" />
        <View className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-white/10" />

        {/* Logo Card & Brand Name */}
        <View className="items-center z-10 mb-2">
          <View className="w-14 h-14 rounded-2xl bg-white shadow-lg items-center justify-center p-1.5 mb-2 border border-rose-100">
            <Image
              source={require('../assets/sobatceria.png')}
              style={{ width: '100%', height: '100%', borderRadius: 12 }}
              resizeMode="contain"
            />
          </View>
          <Text className="text-xl md:text-2xl font-black text-white tracking-wide">
            Sobat Ceria
          </Text>
          <Text className="text-[11px] font-medium text-rose-100 mt-0.5">
            Fun Learning & Stimulasi Tumbuh Kembang
          </Text>
        </View>

        {/* PAGE 1 ONLY: Karakter / Ilustrasi Belajar Ceria (Sesuai Referensi Kiri) */}
        {page === 'welcome' && (
          <View className="w-full items-center justify-center z-10 mt-1">
            <View className="w-48 h-32 md:h-36 rounded-2xl overflow-hidden bg-white/15 border border-white/25 p-2 items-center justify-center shadow-xs">
              <Image
                source={require('../assets/online_learning_banner.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain"
              />
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full mt-2 border border-white/30">
              <Text className="text-[9px] font-black text-white uppercase tracking-wider">
                🌱 Inklusif • Mindfulness • Family Co-Creation
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* =================================================================== */}
      {/* BOTTOM SHEET / OVERLAY CARD (PUTIH BERSIH DENGAN ROUNDED CORNERS)    */}
      {/* =================================================================== */}
      <View 
        className="flex-1 bg-white rounded-t-[2.75rem] px-6 pt-6 pb-6 shadow-2xl border-t border-rose-100"
        style={{
          paddingBottom: Math.max(insets.bottom + 8, 20),
        }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
        >
          {/* =============================================================== */}
          {/* TAMPILAN 1: WELCOME / SOCIAL GATEWAY SCREEN (PAGE KIRI)         */}
          {/* =============================================================== */}
          {page === 'welcome' && (
            <View className="flex-1 justify-between">
              <View className="gap-3 pt-2">
                {/* 1. Continue with Facebook */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleFacebookLogin}
                  className="w-full bg-white border border-gray-200 py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-3 shadow-xs active:bg-gray-50"
                >
                  <FontAwesome name="facebook-square" size={20} color="#1877F2" />
                  <Text className="text-xs md:text-sm font-bold text-[#162E5C]">
                    Continue with Facebook
                  </Text>
                </TouchableOpacity>

                {/* 2. Continue with Google */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  className="w-full bg-white border border-gray-200 py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-3 shadow-xs active:bg-gray-50"
                >
                  <Image
                    source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                  />
                  <Text className="text-xs md:text-sm font-bold text-[#162E5C]">
                    Continue with Google
                  </Text>
                </TouchableOpacity>

                {/* 3. Primary Button: Create Account */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setPage('register')}
                  className="w-full bg-[#D82B5A] py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-md active:bg-[#B01E49]"
                >
                  <Feather name="mail" size={16} color="#FFFFFF" />
                  <Text className="text-xs md:text-sm font-black text-white">
                    Create Account
                  </Text>
                </TouchableOpacity>

                {/* Text Link: Already have an account? Log in */}
                <View className="flex-row items-center justify-center gap-1.5 mt-2">
                  <Text className="text-xs text-gray-500 font-medium">
                    Already have an account?
                  </Text>
                  <TouchableOpacity onPress={() => setPage('login')}>
                    <Text className="text-xs font-black text-[#D82B5A]">
                      Log in
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Portal Pilih Peran (Uji Coba Cepat) */}
                <View className="mt-4 pt-4 border-t border-gray-100">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5 text-center">
                    Uji Coba Cepat — Pilih Peran
                  </Text>
                  <View className="flex-row flex-wrap justify-center gap-2">
                    {ROLE_LIST.map((role) => {
                      const meta = ROLE_META[role];
                      const demoKey = DEMO_KEY_BY_ROLE[role];
                      return (
                        <TouchableOpacity
                          key={role}
                          onPress={() => handleDemoLogin(demoKey as any)}
                          className="py-2 px-3 rounded-2xl border flex-row items-center gap-1.5"
                          style={{ backgroundColor: `${meta.color}12`, borderColor: `${meta.color}40` }}
                        >
                          <Text className="text-[11px] font-black" style={{ color: meta.color }}>
                            {meta.emoji} {meta.shortLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Tombol Lewati / Jelajahi sebagai Tamu */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (onExploreGuest) onExploreGuest();
                  }}
                  className="self-center py-2 px-4 rounded-full bg-amber-50 border border-amber-200 mt-1 flex-row items-center gap-1.5"
                >
                  <Text className="text-[11px] font-bold text-amber-900">
                    Jelajahi Aplikasi Sebagai Tamu (Tanpa Login)
                  </Text>
                  <Feather name="arrow-right" size={12} color="#78350F" />
                </TouchableOpacity>
              </View>

              {/* Policy Footer */}
              <Text className="text-[10px] text-gray-400 text-center leading-relaxed font-medium mt-6">
                By signing up, you agree to Sobat Ceria's{' '}
                <Text className="text-[#D82B5A] font-bold">License Policy</Text> and{' '}
                <Text className="text-[#D82B5A] font-bold">Privacy Policy</Text>.
              </Text>
            </View>
          )}

          {/* =============================================================== */}
          {/* TAMPILAN 2: LOGIN SCREEN (PAGE TENGAH)                          */}
          {/* =============================================================== */}
          {page === 'login' && (
            <View className="flex-1 justify-between">
              <View>
                {/* Heading */}
                <Text className="text-lg md:text-xl font-black text-[#162E5C] mb-4">
                  Log in to Sobat Ceria
                </Text>

                {/* Email Field */}
                <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1.5 uppercase tracking-wider">
                  Email
                </Text>
                <TextInput
                  className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-3 text-xs text-[#162E5C] mb-3.5 font-medium"
                  placeholder="dinda@sobatceria.id"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Password Field with Eye Toggle */}
                <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1.5 uppercase tracking-wider">
                  Password
                </Text>
                <View className="relative mb-3">
                  <TextInput
                    className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-3 pr-11 text-xs text-[#162E5C] font-medium"
                    placeholder="Masukkan password akun"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5"
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* Options Row: Remember Me & Forgot Password */}
                <View className="flex-row items-center justify-between mb-4">
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center gap-2"
                  >
                    <View
                      className={`w-4 h-4 rounded border items-center justify-center ${
                        rememberMe
                          ? 'bg-[#D82B5A] border-[#D82B5A]'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {rememberMe && <Feather name="check" size={11} color="#FFFFFF" />}
                    </View>
                    <Text className="text-[11px] font-semibold text-gray-600">
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      alertMessage(
                        'Lupa Password',
                        'Hubungi admin WhatsApp Sobat Ceria (0858-7633-2598) untuk verifikasi dan reset kata sandi Anda.'
                      )
                    }
                  >
                    <Text className="text-[11px] font-bold text-[#162E5C]">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Button: Login */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleLogin}
                  disabled={loading}
                  className="w-full bg-[#D82B5A] py-3.5 rounded-2xl items-center justify-center shadow-md active:bg-[#B01E49] mb-3"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-xs md:text-sm font-black">
                      Login
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Link to Register */}
                <View className="flex-row items-center justify-center gap-1.5 mb-4">
                  <Text className="text-xs text-gray-500 font-medium">
                    Already have a Sobat Ceria ID?
                  </Text>
                  <TouchableOpacity onPress={() => setPage('register')}>
                    <Text className="text-xs font-black text-[#D82B5A]">
                      Create account
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider: or continue with */}
                <View className="flex-row items-center gap-3 mb-4">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    or continue with
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social Buttons Row (Google & Facebook/WhatsApp) */}
                <View className="flex-row gap-3 mb-4">
                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    className="flex-1 bg-white border border-gray-200 py-2.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-xs"
                  >
                    <Image
                      source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                    <Text className="text-xs font-bold text-[#162E5C]">Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleFacebookLogin}
                    className="flex-1 bg-white border border-gray-200 py-2.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-xs"
                  >
                    <FontAwesome name="facebook-square" size={17} color="#1877F2" />
                    <Text className="text-xs font-bold text-[#162E5C]">Facebook</Text>
                  </TouchableOpacity>
                </View>

                {/* Quick Demo Mode Box (Uji Coba Cepat 1-Klik) */}
                <View className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3 mb-2">
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-[10px] font-black text-amber-900 tracking-wider uppercase">
                      ⚡ Masuk Cepat (Mode Demo)
                    </Text>
                    <Text className="text-[9px] font-extrabold text-amber-800">1-Klik</Text>
                  </View>
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => handleDemoLogin('bunda')}
                      className="flex-1 bg-white border border-amber-300 py-1.5 px-2 rounded-xl items-center active:bg-amber-100"
                    >
                      <Text className="text-[10px] font-bold text-amber-950">👨‍👩‍👧 Bunda Dinda</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDemoLogin('guru')}
                      className="flex-1 bg-white border border-amber-300 py-1.5 px-2 rounded-xl items-center active:bg-amber-100"
                    >
                      <Text className="text-[10px] font-bold text-amber-950">👨‍🏫 Kak Farhan</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDemoLogin('mitra')}
                      className="flex-1 bg-white border border-amber-300 py-1.5 px-2 rounded-xl items-center active:bg-amber-100"
                    >
                      <Text className="text-[10px] font-bold text-amber-950">🤝 Dr. Rahmawati</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Policy Footer */}
              <Text className="text-[10px] text-gray-400 text-center leading-relaxed font-medium mt-3">
                By signing up, you agree to Sobat Ceria's{' '}
                <Text className="text-[#D82B5A] font-bold">License Policy</Text> and{' '}
                <Text className="text-[#D82B5A] font-bold">Privacy Policy</Text>.
              </Text>
            </View>
          )}

          {/* =============================================================== */}
          {/* TAMPILAN 3: CREATE ACCOUNT SCREEN (PAGE KANAN)                  */}
          {/* =============================================================== */}
          {page === 'register' && (
            <View className="flex-1 justify-between">
              <View>
                {/* Heading */}
                <Text className="text-lg md:text-xl font-black text-[#162E5C] mb-3">
                  Create Account
                </Text>

                {/* Role Selector Pills */}
                <View className="mb-3">
                  <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1.5 uppercase tracking-wider">
                    Daftar Sebagai Peran:
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {ROLE_LIST.map((role) => {
                      const active = selectedRole === role;
                      const meta = ROLE_META[role];
                      return (
                        <TouchableOpacity
                          key={role}
                          onPress={() => setSelectedRole(role)}
                          className={`py-1.5 px-3 rounded-xl items-center border ${
                            active
                              ? 'bg-[#162E5C] border-[#162E5C]'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <Text
                            className={`text-[9px] font-black ${
                              active ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {meta.shortLabel}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Name Field */}
                <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider">
                  {selectedRole === 'tutor'
                    ? 'Nama Fasilitator'
                    : selectedRole === 'volunteer'
                    ? 'Nama Relawan'
                    : selectedRole === 'mitra'
                    ? 'Nama Perwakilan Mitra'
                    : selectedRole === 'collab'
                    ? 'Nama Partner (Brand/Organisasi)'
                    : 'Nama Lengkap Orang Tua'}
                </Text>
                <TextInput
                  className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-[#162E5C] mb-2.5 font-medium"
                  placeholder={
                    selectedRole === 'tutor'
                      ? 'e.g. Kak Farhan, S.Pd'
                      : selectedRole === 'volunteer'
                      ? 'e.g. Kak Salsabila'
                      : selectedRole === 'mitra'
                      ? 'e.g. Dr. Rahmawati'
                      : selectedRole === 'collab'
                      ? 'e.g. Andi Wijaya'
                      : 'e.g. Bunda Dinda'
                  }
                  placeholderTextColor="#9CA3AF"
                  value={parentName}
                  onChangeText={setParentName}
                />

                {/* Email Field */}
                <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider">
                  Email
                </Text>
                <TextInput
                  className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-2.5 text-xs text-[#162E5C] mb-2.5 font-medium"
                  placeholder="kabir252@gmail.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />

                {/* Password Field with Eye Toggle */}
                <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider">
                  Password
                </Text>
                <View className="relative mb-3">
                  <TextInput
                    className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-2.5 pr-11 text-xs text-[#162E5C] font-medium"
                    placeholder="Buat password (min. 6 karakter)"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3"
                  >
                    <Feather
                      name={showPassword ? 'eye' : 'eye-off'}
                      size={16}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* Extra fields based on role */}
                {selectedRole === 'parent' && (
                  <View className="flex-row gap-2 mb-3">
                    <View className="flex-[2]">
                      <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider">
                        Nama Anak
                      </Text>
                      <TextInput
                        className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-3 py-2 text-xs text-[#162E5C] font-medium"
                        placeholder="Arka"
                        placeholderTextColor="#9CA3AF"
                        value={childName}
                        onChangeText={setChildName}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider text-center">
                        Usia (Thn)
                      </Text>
                      <TextInput
                        className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-3 py-2 text-xs text-[#162E5C] text-center font-medium"
                        placeholder="4"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={childAge}
                        onChangeText={setChildAge}
                      />
                    </View>
                  </View>
                )}

                {selectedRole !== 'parent' && (
                  <View className="mb-3">
                    <Text className="text-[10px] font-extrabold text-[#162E5C] mb-1 uppercase tracking-wider">
                      Instansi / Asal Sekolah
                    </Text>
                    <TextInput
                      className="bg-[#FAF6F0] border border-gray-200 rounded-2xl px-4 py-2 text-xs text-[#162E5C] font-medium"
                      placeholder="e.g. FKIP UMS / TK Pertiwi"
                      placeholderTextColor="#9CA3AF"
                      value={institution}
                      onChangeText={setInstitution}
                    />
                  </View>
                )}

                {/* Options Row: Remember Me & Forgot Password */}
                <View className="flex-row items-center justify-between mb-3.5">
                  <TouchableOpacity
                    onPress={() => setRememberMe(!rememberMe)}
                    className="flex-row items-center gap-2"
                  >
                    <View
                      className={`w-4 h-4 rounded border items-center justify-center ${
                        rememberMe
                          ? 'bg-[#D82B5A] border-[#D82B5A]'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {rememberMe && <Feather name="check" size={11} color="#FFFFFF" />}
                    </View>
                    <Text className="text-[11px] font-semibold text-gray-600">
                      Remember me
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      alertMessage(
                        'Bantuan Akun',
                        'Jika ada kendala saat pendaftaran, hubungi hotline WhatsApp kami di 0858-7633-2598.'
                      )
                    }
                  >
                    <Text className="text-[11px] font-bold text-[#162E5C]">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Primary Button: Create Account */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={handleRegister}
                  disabled={loading}
                  className="w-full bg-[#D82B5A] py-3.5 rounded-2xl items-center justify-center shadow-md active:bg-[#B01E49] mb-3"
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-xs md:text-sm font-black">
                      Create Account
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Link to Login */}
                <View className="flex-row items-center justify-center gap-1.5 mb-3.5">
                  <Text className="text-xs text-gray-500 font-medium">
                    Already have a Sobat Ceria ID?
                  </Text>
                  <TouchableOpacity onPress={() => setPage('login')}>
                    <Text className="text-xs font-black text-[#D82B5A]">
                      Login
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Divider: or continue with */}
                <View className="flex-row items-center gap-3 mb-3">
                  <View className="flex-1 h-px bg-gray-200" />
                  <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    or continue with
                  </Text>
                  <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social Buttons Row */}
                <View className="flex-row gap-3 mb-2">
                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    className="flex-1 bg-white border border-gray-200 py-2.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-xs"
                  >
                    <Image
                      source={{ uri: 'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg' }}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                    <Text className="text-xs font-bold text-[#162E5C]">Google</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleFacebookLogin}
                    className="flex-1 bg-white border border-gray-200 py-2.5 rounded-2xl flex-row items-center justify-center gap-2 active:bg-gray-50 shadow-xs"
                  >
                    <FontAwesome name="facebook-square" size={17} color="#1877F2" />
                    <Text className="text-xs font-bold text-[#162E5C]">Facebook</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Policy Footer */}
              <Text className="text-[10px] text-gray-400 text-center leading-relaxed font-medium mt-3">
                By signing up, you agree to Sobat Ceria's{' '}
                <Text className="text-[#D82B5A] font-bold">License Policy</Text> and{' '}
                <Text className="text-[#D82B5A] font-bold">Privacy Policy</Text>.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
