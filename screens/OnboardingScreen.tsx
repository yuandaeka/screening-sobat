import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* 1. Foto Full Screen 100% Mengisi Seluruh Layar */}
      <Image
        source={require('../assets/dokumentasi sobat/cooking-program.jpeg')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* 2. Gradasi Halus Menyeluruh dari Atas ke Bawah */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(255, 255, 255, 0.15)',
          'rgba(255, 255, 255, 0.75)',
          'rgba(255, 255, 255, 0.96)',
          '#FFFFFF',
        ]}
        locations={[0, 0.35, 0.58, 0.78, 0.95]}
        style={StyleSheet.absoluteFill}
      />

      {/* 3. Konten Teks & Tombol di Bagian Bawah */}
      <View
        style={[
          styles.bottomContent,
          {
            paddingBottom: Math.max(insets.bottom + 24, 40),
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
  },
  bottomContent: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(216, 43, 90, 0.15)',
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
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 6,
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
