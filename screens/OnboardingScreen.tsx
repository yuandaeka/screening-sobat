import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  onGetStarted: () => void;
  onLoginPress?: () => void;
}

export default function OnboardingScreen({ onGetStarted }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  return (
    <View style={[styles.container, { width, height }]}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* 1. Foto Background Full Screen Mengisi Seluruh Layar */}
      <View style={[styles.imageWrapper, { width, height }]}>
        <Image
          source={require('../assets/dokumentasi sobat/cooking-program.jpeg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* 2. Gradasi Halus: Bening di Atas (Foto Jelas), Putih Lembut di Bawah */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0)',
            'rgba(255, 255, 255, 0.45)',
            'rgba(255, 255, 255, 0.88)',
            '#FFFFFF',
          ]}
          locations={[0, 0.42, 0.62, 0.8, 0.96]}
          style={styles.gradientFade}
        />
      </View>

      {/* 3. Konten Teks & Tombol di Bagian Bawah */}
      <View
        style={[
          styles.bottomContent,
          {
            paddingBottom: Math.max(insets.bottom + 20, 36),
          },
        ]}
      >
        {/* Brand Chip */}
        <View style={styles.brandRow}>
          <Image
            source={require('../assets/sobatceria.png')}
            style={styles.brandLogo}
            resizeMode="contain"
          />
          <Text style={styles.brandName}>Sobat Ceria</Text>
        </View>

        {/* Heading */}
        <Text style={styles.title}>
          Care For Your Child{'\n'}Optimal Development
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Program stimulasi tumbuh kembang anak yang inklusif berbasis Mindfulness & Family
          Co-Creation bersama fasilitator profesional.
        </Text>

        {/* Tombol Utama Pill Lebar Penuh (Full Width) */}
        <TouchableOpacity style={styles.ctaButton} onPress={onGetStarted} activeOpacity={0.88}>
          <Text style={styles.ctaButtonText}>Mulai Sekarang</Text>
          <View style={styles.arrowCircle}>
            <Feather name="arrow-right" size={20} color="#D82B5A" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
  },
  imageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 26,
    alignItems: 'center',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(216, 43, 90, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  brandLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#D82B5A',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 37,
    letterSpacing: -0.3,
    marginBottom: 12,
    maxWidth: 420,
  },
  subtitle: {
    fontSize: 14.5,
    fontWeight: '400',
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 4,
    maxWidth: 400,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 420,
    height: 62,
    backgroundColor: '#D82B5A',
    borderRadius: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: '#D82B5A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});

