import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onLoginPress?: () => void;
}

export default function OnboardingScreen({ onGetStarted, onLoginPress }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* 1. Gambar Full-Bleed dari Folder Lokal Assets */}
      <View style={styles.imageWrapper}>
        <Image
          source={require('../assets/dokumentasi sobat/cooking-program.jpeg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Efek Gradasi Putih Halus (Smooth Fade-Out) Menyatu ke Bawah */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.65)',
            'rgba(255, 255, 255, 0.95)',
            '#FFFFFF',
          ]}
          locations={[0, 0.45, 0.78, 1]}
          style={styles.gradientFade}
        />
      </View>

      {/* 2. Konten Teks & Tombol Menyatu di Atas Gradasi Putih */}
      <View style={[styles.bottomContent, { paddingBottom: Math.max(insets.bottom + 20, 42) }]}>
        <View style={styles.brandRow}>
          <Image
            source={require('../assets/sobatceria.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Sobat Ceria</Text>
        </View>

        <Text style={styles.title}>
          Care For Your Child{'\n'}Optimal Development
        </Text>

        <Text style={styles.subtitle}>
          Program stimulasi tumbuh kembang anak yang inklusif berbasis Mindfulness & Family
          Co-Creation bersama fasilitator profesional.
        </Text>

        {/* Tombol Pill Utama dengan Lingkaran Panah di Kanan */}
        <TouchableOpacity style={styles.ctaButton} onPress={onGetStarted} activeOpacity={0.85}>
          <Text style={styles.ctaButtonText}>Mulai Sekarang</Text>
          <View style={styles.arrowCircle}>
            <Feather name="arrow-right" size={20} color="#D82B5A" />
          </View>
        </TouchableOpacity>

        {onLoginPress && (
          <TouchableOpacity style={styles.loginLink} onPress={onLoginPress} activeOpacity={0.7}>
            <Text style={styles.loginText}>Sudah punya akun? Masuk di sini</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageWrapper: {
    width,
    height: height * 0.76,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.32,
  },
  bottomContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: -height * 0.12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  brandLogo: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#D82B5A',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '400',
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 34,
  },
  ctaButton: {
    width: '100%',
    height: 62,
    backgroundColor: '#D82B5A',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#D82B5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  arrowCircle: {
    position: 'absolute',
    right: 8,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLink: {
    marginTop: 20,
    paddingVertical: 4,
  },
  loginText: {
    color: '#D82B5A',
    fontSize: 13,
    fontWeight: '700',
  },
});
