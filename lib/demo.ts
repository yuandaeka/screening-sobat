import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

export const DEMO_STORAGE_KEY = '@sobat_demo_user';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  bunda: {
    parentName: 'Bunda Dinda (Demo)',
    email: 'dinda.demo@sobatceria.id',
    phone: '085876332598',
    isDemo: true,
    children: [
      {
        id: 'demo-child-arka',
        name: 'Arka',
        age: 4,
        specialNeeds: 'Speech Delay Ringan',
      },
    ],
  },
  ayah: {
    parentName: 'Ayah Dimas (Demo)',
    email: 'dimas.demo@sobatceria.id',
    phone: '081234567890',
    isDemo: true,
    children: [
      {
        id: 'demo-child-kirana',
        name: 'Kirana',
        age: 5,
        specialNeeds: '',
      },
    ],
  },
};

export async function saveDemoUser(user: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
  } catch (err) {
    console.warn('Gagal menyimpan sesi demo ke storage:', err);
  }
}

export async function getSavedDemoUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(DEMO_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn('Gagal memuat sesi demo dari storage:', err);
    return null;
  }
}

export async function clearDemoUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DEMO_STORAGE_KEY);
  } catch (err) {
    console.warn('Gagal menghapus sesi demo dari storage:', err);
  }
}
