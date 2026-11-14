import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { UserProfile, UserRole } from '../types';
import { supabase } from '../lib/supabase';
import { signInWithGoogle } from '../lib/auth';
import { fetchUserProfile, upsertProfile } from '../lib/profile';
import { DEMO_PROFILES, saveDemoUser, clearDemoUser } from '../lib/demo';

// Daftar 6 Mode / Role untuk Demo Cepat
const DEMO_ROLES: {
  id: UserRole;
  label: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  demoKey: string | null;
}[] = [
  { id: 'guest', label: 'Umum (Guest)', color: '#64748B', icon: 'globe', demoKey: null },
  { id: 'parent', label: 'Orang Tua', color: '#C81E45', icon: 'users', demoKey: 'bunda' },
  { id: 'tutor', label: 'Guru / Tutor', color: '#5B21B6', icon: 'award', demoKey: 'guru' },
  { id: 'volunteer', label: 'Volunteer', color: '#1E293B', icon: 'heart', demoKey: 'relawan' },
  { id: 'mitra', label: 'Mitra TK/Klinik', color: '#16A34A', icon: 'activity', demoKey: 'mitra' },
  { id: 'collab', label: 'Collaboration', color: '#0284C7', icon: 'trending-up', demoKey: 'collab' },
];

const PRIMARY_COLOR = '#C81E45';

interface AuthScreenProps {
  onBack?: () => void;
  onAuthed: (profile: UserProfile | null) => void;
}

export default function AuthScreen({ onBack, onAuthed }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<UserRole>('parent');
  const [loading, setLoading] = useState(false);

  const isLogin = authMode === 'login';

  const alertMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const promptDemoMode = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}: ${message}\n\nIngin masuk Mode Demo?`);
      if (confirmed) handleQuickDemo(selectedDemo);
    } else {
      Alert.alert(title, `${message}\n\nIngin masuk Mode Demo?`, [
        { text: 'Tutup', style: 'cancel' },
        { text: 'Masuk Mode Demo', onPress: () => handleQuickDemo(selectedDemo) },
      ]);
    }
  };

  const handleQuickDemo = async (roleId: UserRole) => {
    setSelectedDemo(roleId);
    const item = DEMO_ROLES.find((r) => r.id === roleId);
    if (!item || !item.demoKey) {
      await clearDemoUser();
      onAuthed(null);
      return;
    }
    const demoUser = DEMO_PROFILES[item.demoKey] || DEMO_PROFILES.bunda;
    await saveDemoUser(demoUser);
    onAuthed(demoUser);
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const session = await signInWithGoogle();
      if (Platform.OS === 'web') return;
      if (!session?.user) throw new Error('Session tidak ditemukan.');
      const { profile } = await fetchUserProfile(session.user.id);
      onAuthed(profile);
    } catch (error: any) {
      promptDemoMode('Login Google Gagal', error?.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false);
    }
  };

  const handleApple = () => {
    alertMessage('Login Apple', 'Masuk dengan Apple tersedia pada tahap berikutnya.');
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      alertMessage('Form Belum Lengkap', 'Harap isi email dan password.');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      alertMessage('Password Tidak Cocok', 'Konfirmasi password tidak sama dengan password.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        if (!data.user) throw new Error('User tidak ditemukan.');
        const { profile } = await fetchUserProfile(data.user.id);
        onAuthed(profile);
      } else {
        const regName = email.split('@')[0] || 'Member Ceria';
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: { data: { full_name: regName, role: selectedDemo } },
        });
        if (error) throw error;
        if (!data.session?.user) {
          alertMessage('Cek Email Anda', 'Pendaftaran berhasil. Silakan verifikasi email untuk masuk.');
          setLoading(false);
          return;
        }
        const userId = data.session.user.id;
        await upsertProfile(userId, { parentName: regName, email: email.trim() });
        const { profile } = await fetchUserProfile(userId);
        onAuthed({ ...profile, role: selectedDemo });
      }
    } catch (error: any) {
      promptDemoMode(isLogin ? 'Login Gagal' : 'Pendaftaran Gagal', error?.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Background Soft Warm Gradient */}
      <LinearGradient
        colors={['#F7EFE1', '#FAF7F2', '#FDFBF7']}
        start={{ x: 0.9, y: 0 }}
        end={{ x: 0.1, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 24, 36) }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Tombol Back Bulat di Kiri Atas */}
            {onBack && (
              <View style={styles.topBar}>
                <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.8}>
                  <Feather name="arrow-left" size={20} color="#1E293B" />
                </TouchableOpacity>
              </View>
            )}

            {/* Logo App di Tengah */}
            <View style={styles.logoWrapper}>
              <View style={[styles.logoBox, { backgroundColor: PRIMARY_COLOR }]}>
                <Image
                  source={require('../assets/sobatceria.png')}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Heading & Subtitle */}
            <View style={styles.headerTextContainer}>
              <Text style={styles.titleText}>
                {isLogin ? 'Welcome Back' : 'Sobat Ceria Families'}
              </Text>
              <Text style={styles.subtitleText}>
                {isLogin
                  ? 'Pendampingan stimulasi tumbuh kembang anak inklusif berbasis Mindfulness & Family Co-Creation.'
                  : 'Buat akun untuk memantau 6 aspek STPPA si kecil, booking kelas tematik, dan unduh worksheet gratis.'}
              </Text>
            </View>

            {/* Form Input Fields */}
            <View style={styles.formContainer}>
              {/* Email */}
              <View style={styles.inputBox}>
                <Feather name="mail" size={19} color="#64748B" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your gmail"
                  placeholderTextColor="#94A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.inputBox}>
                <Feather name="lock" size={19} color="#64748B" style={styles.inputIconLeft} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                  <Feather name={showPassword ? 'eye-off' : 'eye'} size={19} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Confirm Password (Register only) */}
              {!isLogin && (
                <View style={styles.inputBox}>
                  <Feather name="lock" size={19} color="#64748B" style={styles.inputIconLeft} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Confirm Password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Feather name={showConfirmPassword ? 'eye-off' : 'eye'} size={19} color="#64748B" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Remember Me & Forget Password (Login only) */}
              {isLogin && (
                <View style={styles.rememberRow}>
                  <TouchableOpacity
                    style={styles.rememberLeft}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        rememberMe && { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
                      ]}
                    >
                      {rememberMe && <Feather name="check" size={12} color="#FFFFFF" />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.7}>
                    <Text style={[styles.forgetText, { color: PRIMARY_COLOR }]}>Forget Password</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Tombol Utama */}
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: PRIMARY_COLOR }]}
                onPress={handleSubmit}
                activeOpacity={0.9}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider "or" */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={handleGoogle}>
                <Text style={styles.googleLogoText}>G</Text>
                <Text style={styles.socialButtonText}>Log in with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton} activeOpacity={0.85} onPress={handleApple}>
                <Text style={styles.appleLogoText}></Text>
                <Text style={styles.socialButtonText}>Log in with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* PANEL MODE DEMO CEPAT (6 Role) */}
            <View style={styles.demoPanel}>
              <View style={styles.demoHeaderRow}>
                <Feather name="star" size={15} color="#C81E45" />
                <Text style={styles.demoTitle}>Mode Demo Cepat (Langsung Masuk Tanpa Isi Form):</Text>
              </View>
              <View style={styles.demoChipsWrap}>
                {DEMO_ROLES.map((item) => {
                  const isSelected = selectedDemo === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.demoChip,
                        isSelected && { backgroundColor: item.color, borderColor: item.color },
                      ]}
                      onPress={() => handleQuickDemo(item.id)}
                      activeOpacity={0.85}
                    >
                      <Feather name={item.icon} size={13} color={isSelected ? '#FFFFFF' : item.color} />
                      <Text style={[styles.demoChipText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Footer Toggle Login <-> Sign Up */}
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <TouchableOpacity
                onPress={() => setAuthMode(isLogin ? 'register' : 'login')}
                activeOpacity={0.7}
              >
                <Text style={[styles.footerActionText, { color: PRIMARY_COLOR }]}>
                  {isLogin ? 'Sign up' : 'Login'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  logoWrapper: {
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  logoBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C81E45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  logoImage: {
    width: 48,
    height: 48,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  titleText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitleText: {
    fontSize: 13.5,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  inputIconLeft: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    color: '#1E293B',
    height: '100%',
  },
  eyeButton: {
    padding: 6,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  rememberText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  forgetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#C81E45',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 14,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  googleLogoText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EA4335',
    marginRight: 10,
  },
  appleLogoText: {
    fontSize: 20,
    color: '#000000',
    marginRight: 10,
  },
  socialButtonText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
  },
  demoPanel: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  demoChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoChipText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 26,
  },
  footerLabel: {
    fontSize: 13.5,
    color: '#64748B',
  },
  footerActionText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
