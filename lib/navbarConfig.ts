import { UserRole } from '../types';

export interface NavTab {
  key: string;
  label: string;
  icon: string;
  screen: 'home' | 'screening' | 'catalog' | 'news' | 'reward' | 'profile' | 'feature';
  title?: string;
  subtitle?: string;
  bullets?: string[];
}

export interface RoleNavbar {
  role: UserRole;
  color: string;
  tabs: NavTab[];
}

export const ROLE_NAVBARS: Record<UserRole, RoleNavbar> = {
  guest: {
    role: 'guest',
    color: '#D82B5A',
    tabs: [
      { key: 'Beranda', label: 'Beranda', icon: 'home', screen: 'home' },
      { key: 'Screening', label: 'Screening', icon: 'activity', screen: 'screening' },
      { key: 'Kelas', label: 'Kelas', icon: 'shopping-bag', screen: 'catalog' },
      { key: 'Berita', label: 'Berita', icon: 'book-open', screen: 'news' },
      { key: 'Profil', label: 'Masuk', icon: 'user-check', screen: 'profile' },
    ],
  },
  parent: {
    role: 'parent',
    color: '#D82B5A',
    tabs: [
      { key: 'Beranda', label: 'Beranda', icon: 'home', screen: 'home' },
      { key: 'Screening', label: 'Screening', icon: 'heart', screen: 'screening' },
      { key: 'Kelas', label: 'Kelas', icon: 'star', screen: 'catalog' },
      { key: 'Worksheet', label: 'Worksheet', icon: 'download', screen: 'reward' },
      { key: 'Profil', label: 'Rapor Anak', icon: 'award', screen: 'profile' },
    ],
  },
  tutor: {
    role: 'tutor',
    color: '#8B22C0',
    tabs: [
      {
        key: 'JadwalAjar',
        label: 'Jadwal Ajar',
        icon: 'calendar',
        screen: 'home',
      },
      {
        key: 'ModulAjar',
        label: 'Modul Ajar',
        icon: 'book',
        screen: 'feature',
        title: 'Modul Stimulasi Siap Ajar',
        subtitle: 'Kurikulum Level-Based & SOP kelas Mindfulness.',
        bullets: [
          'Level-Based Development Module',
          'Panduan napas & fokus indera',
          'Checklist alat peraga bahan lokal',
        ],
      },
      {
        key: 'InputRapor',
        label: 'Input Rapor',
        icon: 'clipboard',
        screen: 'screening',
      },
      {
        key: 'CoCreation',
        label: 'Co-Creation',
        icon: 'message-square',
        screen: 'feature',
        title: 'Refleksi & Saran Stimulasi Rumah',
        subtitle: 'Diskusi pasca-kelas bersama orang tua murid.',
        bullets: [
          'Follow-up stimulasi di rumah',
          'Tanya-jawab perkembangan anak',
        ],
      },
      { key: 'ProfilGuru', label: 'Profil Guru', icon: 'award', screen: 'profile' },
    ],
  },
  volunteer: {
    role: 'volunteer',
    color: '#F59E0B',
    tabs: [
      { key: 'EventTugas', label: 'Event & Tugas', icon: 'flag', screen: 'home' },
      {
        key: 'PanduanABK',
        label: 'Panduan ABK',
        icon: 'shield',
        screen: 'feature',
        title: 'Pocket Guide Pendampingan Inklusif',
        subtitle: 'SOP ramah anak & pendampingan ABK tanpa stigma.',
        bullets: [
          'Etika mendampingi anak ABK',
          'Checklist kebersihan & keamanan',
        ],
      },
      {
        key: 'Dokumentasi',
        label: 'Dokumentasi',
        icon: 'camera',
        screen: 'feature',
        title: 'Check-in & Upload Dokumentasi',
        subtitle: 'Presensi kehadiran & unggah foto/video kegiatan anak.',
        bullets: ['Check-in lokasi saat hari-H', 'Upload foto & video kelas'],
      },
      {
        key: 'Komunitas',
        label: 'Komunitas',
        icon: 'users',
        screen: 'feature',
        title: 'Briefing & Upgrading Relawan',
        subtitle: 'Agenda sosial & diskusi sesama relawan mahasiswa.',
        bullets: ['Jadwal briefing pra-event', 'Pelatihan mindfulness anak'],
      },
      { key: 'Sertifikat', label: 'Sertifikat', icon: 'award', screen: 'profile' },
    ],
  },
  mitra: {
    role: 'mitra',
    color: '#16A34A',
    tabs: [
      { key: 'BerandaMitra', label: 'Beranda Mitra', icon: 'home', screen: 'home' },
      { key: 'DataRujukan', label: 'Data Rujukan', icon: 'bar-chart-2', screen: 'screening' },
      {
        key: 'JadwalSinergi',
        label: 'Jadwal Sinergi',
        icon: 'activity',
        screen: 'feature',
        title: 'Kelola Slot Konsul & Kelas Kunjungan',
        subtitle: 'Atur jadwal psikolog & kelas stimulasi di sekolah mitra.',
        bullets: ['Slot konsultasi psikolog', 'Kelas kunjungan TK/PAUD'],
      },
      {
        key: 'Pelatihan',
        label: 'Pelatihan',
        icon: 'monitor',
        screen: 'feature',
        title: 'Pelatihan Pendidik Inklusif',
        subtitle: 'Materi workshop bagi guru TK/PAUD mitra.',
        bullets: ['Kurikulum berbasis keberagaman', 'Stimulasi bahan lokal'],
      },
      { key: 'MouProfil', label: 'MoU & Profil', icon: 'check-square', screen: 'profile' },
    ],
  },
  collab: {
    role: 'collab',
    color: '#0284C7',
    tabs: [
      { key: 'ImpactData', label: 'Impact Data', icon: 'bar-chart-2', screen: 'home' },
      {
        key: 'AgendaEvent',
        label: 'Agenda Event',
        icon: 'calendar',
        screen: 'feature',
        title: 'Kalender Peluang Kolaborasi',
        subtitle: 'Daftar event yang membuka slot sponsor/kolaborator.',
        bullets: ['Seminar Parenting', 'Outbond Ceria', 'Kids Got Talent'],
      },
      {
        key: 'AjukanCollab',
        label: 'Ajukan Collab',
        icon: 'briefcase',
        screen: 'feature',
        title: 'Form Sponsorship, Event & CSR',
        subtitle: 'Ajukan kolaborasi brand, goodie bag, atau program CSR inklusif.',
        bullets: ['Sponsorship event', 'Co-Branding Play-Kit', 'Program CSR'],
      },
      {
        key: 'MediaKit',
        label: 'Media Kit',
        icon: 'folder',
        screen: 'feature',
        title: 'Katalog Program & Dokumentasi Brand',
        subtitle: 'Unduh media kit & galeri eksposur brand event sebelumnya.',
        bullets: ['Proposal kemitraan', 'Galeri dokumentasi eksposur'],
      },
      { key: 'ProfilPartner', label: 'Profil Partner', icon: 'briefcase', screen: 'profile' },
    ],
  },
};

export const ALL_ROLE_ORDER: UserRole[] = [
  'guest',
  'parent',
  'tutor',
  'volunteer',
  'mitra',
  'collab',
];
