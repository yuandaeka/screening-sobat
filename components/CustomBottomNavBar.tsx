import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

export type TabKey = string;

export interface TabConfig {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  badge?: number | string;
}

export const DEFAULT_NAV_TABS: TabConfig[] = [
  { key: 'Beranda', label: 'Beranda', icon: 'home' },
  { key: 'Screening', label: 'Screening', icon: 'activity' },
  { key: 'Kelas', label: 'Kelas', icon: 'shopping-bag' },
  { key: 'Berita', label: 'Berita', icon: 'book-open' },
  { key: 'Profil', label: 'Profil', icon: 'user' },
];

export interface CustomBottomNavBarProps {
  /** Tab yang sedang aktif saat ini */
  activeTab: TabKey | string;
  /** Callback saat pengguna menekan salah satu tab */
  onTabPress: (tabKey: TabKey) => void;
  /** Daftar konfigurasi tab (opsional, default 5 menu) */
  tabs?: TabConfig[];
  /** Warna aksen utama (misal: warna maroon Sobat Ceria #D82B5A) */
  primaryColor?: string;
  /** Warna teks & icon saat tab aktif */
  activeColor?: string;
  /** Warna teks & icon saat tab tidak aktif */
  inactiveColor?: string;
  /** Warna latar belakang navbar */
  backgroundColor?: string;
  /** Warna garis border halus di atas navbar */
  borderColor?: string;
  /** Tampilkan label teks 'Kelas' di bawah floating button */
  showCenterLabel?: boolean;
}

/**
 * ============================================================================
 * Custom Bottom Navigation Bar bergaya GoPay (Floating Center Button)
 * ============================================================================
 * - Menggunakan SVG Path (react-native-svg) untuk lekukan kurva cekung di tengah.
 * - Tombol tengah (Kelas) mengapung (floating circular button) dengan bayangan kontras.
 * - 5 Navigasi: Beranda | Screening | [ KELAS ] | Worksheet | Profil
 * - Desain pixel-perfect, responsif di berbagai ukuran layar & aman di notch HP (Safe Area).
 */
export const CustomBottomNavBar: React.FC<CustomBottomNavBarProps> = ({
  activeTab,
  onTabPress,
  tabs = DEFAULT_NAV_TABS,
  primaryColor = '#D82B5A',
  activeColor = '#D82B5A',
  inactiveColor = '#94A3B8',
  backgroundColor = '#FFFFFF',
  borderColor = '#F0F2F5',
  showCenterLabel = true,
}) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Dimensi Geometri
  const PEAK_OFFSET = 18; // Tonjolan tombol tengah di atas garis navbar
  const BAR_HEIGHT = 64; // Tinggi body navbar utama
  const bottomInset = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);
  const totalContainerHeight = PEAK_OFFSET + BAR_HEIGHT + bottomInset;
  const svgCanvasHeight = BAR_HEIGHT + bottomInset;

  // Parameter Lengkungan Cekungan Tengah (Notch Cradle)
  const NOTCH_WIDTH = 92; // Lebar total cekungan
  const NOTCH_DEPTH = 36; // Kedalaman cekungan kurva

  const cx = width / 2;
  const x0 = cx - NOTCH_WIDTH / 2; // Mulai turun dari garis lurus kiri
  const x3 = cx + NOTCH_WIDTH / 2; // Selesai naik ke garis lurus kanan

  // Titik kontrol bezier untuk lengkungan organik nan mulus (G1 continuous spline)
  const filletWidth = 14;
  const x1 = x0 + filletWidth;
  const x2 = x3 - filletWidth;

  // Path SVG Latar Belakang Navbar
  const navBarBgPath = `
    M 0 0
    L ${x0} 0
    C ${x0 + 8} 0, ${x1 - 4} 10, ${x1} 18
    C ${x1 + 6} 28, ${cx - 16} ${NOTCH_DEPTH}, ${cx} ${NOTCH_DEPTH}
    C ${cx + 16} ${NOTCH_DEPTH}, ${x2 - 6} 28, ${x2} 18
    C ${x2 + 4} 10, ${x3 - 8} 0, ${x3} 0
    L ${width} 0
    L ${width} ${svgCanvasHeight}
    L 0 ${svgCanvasHeight}
    Z
  `;

  // Path SVG Garis Border Halus di Puncak Lengkungan
  const navBarBorderPath = `
    M 0 0
    L ${x0} 0
    C ${x0 + 8} 0, ${x1 - 4} 10, ${x1} 18
    C ${x1 + 6} 28, ${cx - 16} ${NOTCH_DEPTH}, ${cx} ${NOTCH_DEPTH}
    C ${cx + 16} ${NOTCH_DEPTH}, ${x2 - 6} 28, ${x2} 18
    C ${x2 + 4} 10, ${x3 - 8} 0, ${x3} 0
    L ${width} 0
  `;

  // Pemetaan Tombol
  const leftItems = tabs.slice(0, 2);
  const centerItem = tabs.find((t) => t.key === 'Kelas') || tabs[2];
  const rightItems = tabs.slice(3, 5);

  const isCenterActive = activeTab === centerItem?.key;

  return (
    <View style={[styles.rootContainer, { height: totalContainerHeight }]}>
      {/* 1. LAYER LATAR BELAKANG: SVG Canvas Lengkung */}
      <View
        style={[
          styles.svgWrapper,
          {
            top: PEAK_OFFSET,
            height: svgCanvasHeight,
          },
        ]}
        pointerEvents="none"
      >
        <Svg width={width} height={svgCanvasHeight}>
          <Defs>
            {/* Gradien Mewah untuk Floating Button */}
            <SvgLinearGradient id="gopayGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#EA3868" />
              <Stop offset="100%" stopColor={primaryColor} />
            </SvgLinearGradient>
          </Defs>

          {/* Latar Belakang Putih Bersih */}
          <Path d={navBarBgPath} fill={backgroundColor} />

          {/* Garis Border Halus Melengkung */}
          <Path
            d={navBarBorderPath}
            fill="none"
            stroke={borderColor}
            strokeWidth={1.2}
          />
        </Svg>
      </View>

      {/* 2. LAYER INTERAKTIF: Baris Tombol Menu Navigasi */}
      <View style={[styles.navItemsRow, { height: BAR_HEIGHT + PEAK_OFFSET, width }]}>
        {/* === SISI KIRI: Beranda & Screening === */}
        <View style={styles.sideGroupContainer}>
          {leftItems.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => onTabPress(tab.key)}
                style={styles.navButton}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <View style={styles.iconContainer}>
                  <Feather
                    name={tab.icon}
                    size={22}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  {/* Indikator Titik Aktif Halus */}
                  {isActive && (
                    <View
                      style={[
                        styles.tabIndicatorDot,
                        { backgroundColor: activeColor },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tabTitle,
                    {
                      color: isActive ? activeColor : inactiveColor,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* === TENGAH: Tombol Utama Mengapung (Kelas) === */}
        <View style={styles.centerButtonWrapper}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => onTabPress(centerItem.key)}
            style={[
              styles.floatingCircleButton,
              {
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
              },
              isCenterActive && styles.floatingCircleActive,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${centerItem.label}, Tombol Utama`}
          >
            <Feather
              name={centerItem.icon}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* Label Teks di Bawah Floating Button */}
          {showCenterLabel && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onTabPress(centerItem.key)}
              style={styles.centerTextWrapper}
            >
              <Text
                style={[
                  styles.centerTitle,
                  {
                    color: isCenterActive ? primaryColor : inactiveColor,
                    fontWeight: isCenterActive ? '700' : '600',
                  },
                ]}
                numberOfLines={1}
              >
                {centerItem.label}
              </Text>
              {isCenterActive && (
                <View
                  style={[
                    styles.centerIndicatorDot,
                    { backgroundColor: primaryColor },
                  ]}
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* === SISI KANAN: Worksheet & Profil === */}
        <View style={styles.sideGroupContainer}>
          {rightItems.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => onTabPress(tab.key)}
                style={styles.navButton}
                accessibilityRole="button"
                accessibilityLabel={tab.label}
              >
                <View style={styles.iconContainer}>
                  <Feather
                    name={tab.icon}
                    size={22}
                    color={isActive ? activeColor : inactiveColor}
                  />
                  {/* Indikator Titik Aktif Halus */}
                  {isActive && (
                    <View
                      style={[
                        styles.tabIndicatorDot,
                        { backgroundColor: activeColor },
                      ]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.tabTitle,
                    {
                      color: isActive ? activeColor : inactiveColor,
                      fontWeight: isActive ? '700' : '500',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

/**
 * ============================================================================
 * Adapter untuk React Navigation (@react-navigation/bottom-tabs)
 * ============================================================================
 * Pasangkan langsung ke properti `tabBar` pada Tab.Navigator:
 *
 * ```tsx
 * <Tab.Navigator
 *   tabBar={(props) => <CustomBottomTabBar {...props} />}
 *   screenOptions={{ headerShown: false }}
 * >
 *   <Tab.Screen name="Beranda" component={HomeScreen} />
 *   <Tab.Screen name="Screening" component={ScreeningScreen} />
 *   <Tab.Screen name="Kelas" component={CatalogScreen} />
 *   <Tab.Screen name="Worksheet" component={RewardScreen} />
 *   <Tab.Screen name="Profil" component={ProfileScreen} />
 * </Tab.Navigator>
 * ```
 */
export const CustomBottomTabBar: React.FC<
  BottomTabBarProps & {
    tabs?: TabConfig[];
    primaryColor?: string;
    activeColor?: string;
    inactiveColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    showCenterLabel?: boolean;
  }
> = ({
  state,
  navigation,
  tabs,
  primaryColor = '#D82B5A',
  activeColor = '#D82B5A',
  inactiveColor = '#94A3B8',
  backgroundColor = '#FFFFFF',
  borderColor = '#F0F2F5',
  showCenterLabel = true,
}) => {
  const currentRouteName = state.routes[state.index]?.name as TabKey;

  const handleTabPress = (tabKey: TabKey) => {
    const route = state.routes.find((r) => r.name === tabKey);
    const isFocused = currentRouteName === tabKey;

    if (route) {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    }
  };

  return (
    <CustomBottomNavBar
      activeTab={currentRouteName}
      onTabPress={handleTabPress}
      tabs={tabs}
      primaryColor={primaryColor}
      activeColor={activeColor}
      inactiveColor={inactiveColor}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      showCenterLabel={showCenterLabel}
    />
  );
};

export default CustomBottomNavBar;

const styles = StyleSheet.create({
  rootContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    // Shadow luar yang halus dan elegan
    shadowColor: '#1B254B',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 99,
  },
  svgWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  navItemsRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sideGroupContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 28, // Agar sejajar vertikal setelah garis kurva
    height: '100%',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
  },
  tabTitle: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  tabIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: -6,
  },
  centerButtonWrapper: {
    width: 86,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  floatingCircleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2, // Mengapung di atas cekungan navbar
    // Drop shadow aksen tebal
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.38,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
  },
  floatingCircleActive: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.55,
    shadowRadius: 12,
    elevation: 14,
  },
  centerTextWrapper: {
    alignItems: 'center',
    marginTop: 4,
  },
  centerTitle: {
    fontSize: 10,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  centerIndicatorDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});
