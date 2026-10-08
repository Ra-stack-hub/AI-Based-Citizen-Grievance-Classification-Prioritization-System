import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Home, PlusCircle, Search, Map, MessageSquare } from 'lucide-react-native';

export default function BottomNav({ activeTab }: { activeTab?: string }) {
  const pathname = activeTab || '/dashboard';

  const tabs = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Submit', path: '/submit', icon: PlusCircle },
    { name: 'Track', path: '/track', icon: Search },
    { name: 'Map', path: '/explore', icon: Map },
    { name: 'AI Chat', path: '/chatbot', icon: MessageSquare },
  ];

  return (
    <View className="flex-row bg-surface border-t border-borderLight px-2 py-3 justify-between items-center absolute bottom-0 w-full pb-8">
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;
        const Icon = tab.icon;
        return (
          <TouchableOpacity 
            key={tab.name}
            onPress={() => router.replace(tab.path as any)}
            className="items-center justify-center w-1/5"
          >
            <Icon color={isActive ? '#1E3A8A' : '#94a3b8'} size={24} strokeWidth={isActive ? 2.5 : 2} />
            <Text className={`text-[10px] mt-1 font-medium ${isActive ? 'text-primary' : 'text-textSecondary'}`}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
