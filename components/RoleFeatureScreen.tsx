import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getRoleMeta } from '../lib/roles';
import { NavTab } from '../lib/navbarConfig';

interface RoleFeatureScreenProps {
  tab: NavTab;
  role: string;
  navigation?: any;
}

/**
 * Layar generik untuk tab khusus role (Jadwal Ajar, Modul Ajar, Dokumentasi, dll.)
 * Menampilkan identitas role, judul fitur, dan daftar poin fungsionalitas.
 */
export default function RoleFeatureScreen({ tab, role, navigation }: RoleFeatureScreenProps) {
  const meta = getRoleMeta(role as any);
  const bullets = tab.bullets || [];

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#FAF6F0]">
      <ScrollView contentContainerStyle={{ paddingBottom: 110 }} className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Fitur */}
        <View className="px-5 pt-4 pb-2">
          <View
            className="rounded-[2rem] p-6 relative overflow-hidden"
            style={{ backgroundColor: meta.color }}
          >
            <View className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <View className="absolute -bottom-10 -left-6 w-28 h-28 rounded-full bg-white/10" />

            <View className="relative z-10">
              <View className="flex-row items-center gap-2 mb-3">
                <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center border border-white/30">
                  <Feather name={tab.icon as any} size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/70 text-[10px] font-black uppercase tracking-widest">
                    {meta.emoji} {meta.roleTitle}
                  </Text>
                  <Text className="text-lg font-black text-white leading-tight">
                    {tab.title || tab.label}
                  </Text>
                </View>
              </View>
              <Text className="text-[11px] text-white/85 font-medium leading-snug">
                {tab.subtitle}
              </Text>
            </View>
          </View>
        </View>

        {/* Poin Fungsionalitas */}
        <View className="px-5 mt-4">
          <Text className="text-sm font-extrabold text-[#162E5C] mb-3">Fitur & Komponen</Text>
          <View className="gap-2.5">
            {bullets.map((b, i) => (
              <View key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex-row items-center gap-3">
                <View
                  className="w-8 h-8 rounded-xl items-center justify-center"
                  style={{ backgroundColor: `${meta.color}15` }}
                >
                  <Feather name="check" size={15} color={meta.color} />
                </View>
                <Text className="flex-1 text-xs font-bold text-[#162E5C]">{b}</Text>
              </View>
            ))}
          </View>

          {/* CTA Placeholder */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => {
              const msg = `Fitur "${tab.title || tab.label}" tersedia pada tahap pengembangan berikutnya.`;
              Platform.OS === 'web' ? window.alert(msg) : alert(msg);
            }}
            className="mt-5 py-3.5 rounded-full items-center justify-center flex-row gap-2"
            style={{ backgroundColor: meta.color }}
          >
            <Text className="text-white text-xs font-black">Mulai {tab.title || tab.label}</Text>
            <Feather name="arrow-right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
