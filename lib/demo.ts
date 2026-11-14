import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

export const DEMO_STORAGE_KEY = '@sobat_demo_user';

export const DEMO_PROFILES: Record<string, UserProfile> = {
  bunda: {
    parentName: 'Bunda Dinda (Demo)',
    fullName: 'Dinda Rahayu, S.Farm',
    email: 'dinda.demo@sobatceria.id',
    phone: '085876332598',
    role: 'parent',
    roleTitle: 'Orang Tua Murid',
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
    fullName: 'Dimas Prasetyo, S.T',
    email: 'dimas.demo@sobatceria.id',
    phone: '081234567890',
    role: 'parent',
    roleTitle: 'Orang Tua Murid',
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
  guru: {
    parentName: 'Kak Farhan, S.Pd',
    fullName: 'Farhan Alamsyah, S.Pd',
    email: 'farhan.fasilitator@sobatceria.id',
    phone: '082199887766',
    role: 'tutor',
    roleTitle: 'Guru / Fasilitator Kelas',
    institution: 'Lab FKIP UMS & Sobat Ceria',
    isDemo: true,
    children: [],
  },
  mitra: {
    parentName: 'Dr. Rahmawati, M.Pd',
    fullName: 'Dr. Rahmawati, M.Pd',
    email: 'mitra.fkip@ums.ac.id',
    phone: '081322334455',
    role: 'mitra',
    roleTitle: 'Mitra Sekolah / Klinik',
    institution: 'Lab PAUD FKIP UMS & TK Binaan',
    isDemo: true,
    children: [],
  },
  relawan: {
    parentName: 'Kak Salsabila',
    fullName: 'Salsabila Rahma, S.Psi',
    email: 'salsabila.relawan@sobatceria.id',
    phone: '085766554433',
    role: 'volunteer',
    roleTitle: 'Relawan Anak Sobat Ceria',
    institution: 'Relawan Mahasiswa UMS',
    isDemo: true,
    children: [],
  },
  collab: {
    parentName: 'Andi Wijaya',
    fullName: 'Andi Wijaya (Brand Edukasi)',
    email: 'andi.collab@sobatceria.id',
    phone: '081122334455',
    role: 'collab',
    roleTitle: 'Partner Collaboration',
    institution: 'Brand Edukasi & CSR',
    isDemo: true,
    children: [],
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
