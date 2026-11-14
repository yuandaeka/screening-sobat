import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { UserProfile, UserRole } from '../types';
import { ROLE_NAVBARS, NavTab } from '../lib/navbarConfig';
import { CustomBottomTabBar, TabConfig } from './CustomBottomNavBar';
import { saveDemoUser, clearDemoUser } from '../lib/demo';
import HomeScreen from '../screens/HomeScreen';
import ScreeningScreen from '../screens/ScreeningScreen';
import CatalogScreen from '../screens/CatalogScreen';
import NewsScreen from '../screens/NewsScreen';
import RewardScreen from '../screens/RewardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RoleFeatureScreen from './RoleFeatureScreen';

const Tab = createBottomTabNavigator();

interface RoleBasedTabsProps {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  onOpenOnboarding: () => void;
}

/**
 * Navigasi dinamis berdasarkan role: setiap role punya 5 tab sendiri,
 * dengan tab ke-3 (tengah) menjadi tombol floating utama ala QRIS GoPay.
 * Pemilihan role dilakukan lewat halaman Login (bukan switcher di atas).
 */
export default function RoleBasedTabs({ user, setUser, onOpenOnboarding }: RoleBasedTabsProps) {
  const role: UserRole = user?.role || 'guest';
  const navbar = ROLE_NAVBARS[role] || ROLE_NAVBARS.guest;

  const renderScreen = (tab: NavTab) => (props: any) => {
    switch (tab.screen) {
      case 'home':
        return (
          <HomeScreen
            {...props}
            user={user}
            onLoginUser={setUser}
            onOpenOnboarding={onOpenOnboarding}
          />
        );
      case 'screening':
        return <ScreeningScreen {...props} user={user} />;
      case 'catalog':
        return <CatalogScreen {...props} user={user} />;
      case 'news':
        return <NewsScreen {...props} />;
      case 'reward':
        return <RewardScreen {...props} user={user} />;
      case 'profile':
        return (
          <ProfileScreen
            {...props}
            user={user}
            onLogout={async () => {
              await clearDemoUser();
              setUser(null);
            }}
            onLogin={async (profile) => {
              if (profile.isDemo) {
                await saveDemoUser(profile);
              }
              setUser(profile);
            }}
            onOpenOnboarding={onOpenOnboarding}
          />
        );
      case 'feature':
      default:
        return <RoleFeatureScreen tab={tab} role={role} navigation={props.navigation} />;
    }
  };

  const navTabs: TabConfig[] = navbar.tabs.map((t) => ({
    key: t.key,
    label: t.label,
    icon: t.icon as any,
  }));

  return (
    <Tab.Navigator
      key={role}
      tabBar={(props) => (
        <CustomBottomTabBar
          {...props}
          tabs={navTabs}
          primaryColor={navbar.color}
          activeColor={navbar.color}
        />
      )}
      screenOptions={{ headerShown: false }}
    >
      {navbar.tabs.map((tab) => (
        <Tab.Screen key={tab.key} name={tab.key}>
          {renderScreen(tab)}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}
