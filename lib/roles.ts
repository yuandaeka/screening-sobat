import { UserRole } from '../types';

export interface RoleMeta {
  key: UserRole;
  label: string;
  shortLabel: string;
  roleTitle: string;
  color: string;
  emoji: string;
}

export const ROLE_META: Record<UserRole, RoleMeta> = {
  guest: {
    key: 'guest',
    label: 'Umum (Pengunjung)',
    shortLabel: 'Umum',
    roleTitle: 'Sobat Ceria (Umum)',
    color: '#D82B5A',
    emoji: '🌐',
  },
  parent: {
    key: 'parent',
    label: 'Orang Tua & Anak',
    shortLabel: 'Orang Tua',
    roleTitle: 'Orang Tua Murid',
    color: '#D82B5A',
    emoji: '🌟',
  },
  tutor: {
    key: 'tutor',
    label: 'Tutor / Guru',
    shortLabel: 'Tutor',
    roleTitle: 'Guru / Fasilitator Kelas',
    color: '#8B22C0',
    emoji: '👨‍🏫',
  },
  volunteer: {
    key: 'volunteer',
    label: 'Volunteer (Relawan)',
    shortLabel: 'Relawan',
    roleTitle: 'Relawan Anak Sobat Ceria',
    color: '#F59E0B',
    emoji: '🙌',
  },
  mitra: {
    key: 'mitra',
    label: 'Mitra Klinis & Sekolah',
    shortLabel: 'Mitra',
    roleTitle: 'Mitra Sekolah / Klinik',
    color: '#16A34A',
    emoji: '🤝',
  },
  collab: {
    key: 'collab',
    label: 'Collaboration (Partner)',
    shortLabel: 'Collab',
    roleTitle: 'Partner Collaboration',
    color: '#0284C7',
    emoji: '💼',
  },
};

/** Daftar role yang bisa dipilih (di luar guest) */
export const ROLE_LIST: UserRole[] = ['parent', 'tutor', 'volunteer', 'mitra', 'collab'];

export function getRoleMeta(role?: UserRole): RoleMeta {
  return ROLE_META[role || 'guest'] || ROLE_META.guest;
}

export function getRoleTitle(role?: UserRole): string {
  return getRoleMeta(role).roleTitle;
}
