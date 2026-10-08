import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { Map, AlertTriangle, MapPin, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';

export default function ExploreScreen() {
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/hotspots`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Sort critical first
          const sorted = (data.all_clusters || []).sort((a: any, b: any) => {
            if (a.severity === 'critical') return -1;
            if (b.severity === 'critical') return 1;
            return 0;
          });
          setHotspots(sorted);
        }
      } catch (err) {
        console.error("Failed to fetch hotspots", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHotspots();
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Map Header Graphic */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop' }} 
        className="h-48 w-full justify-end"
      >
        <View className="absolute inset-0 bg-primary/60" />
        <View className="absolute inset-0 bg-black/40" />
        
        <View className="px-6 pb-6 pt-12 flex-row justify-between items-end relative z-10">
          <View>
            <TouchableOpacity onPress={() => router.push('/dashboard')} className="mb-2 bg-white/20 self-start p-1.5 rounded-full backdrop-blur-sm">
              <ChevronLeft color="#fff" size={20} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-white mb-1">City Hotspots</Text>
            <Text className="text-white/80 text-sm">AI-detected grievance clusters</Text>
          </View>
          <View className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
            <Map color="#fff" size={24} />
          </View>
        </View>
      </ImageBackground>

      <ScrollView className="flex-1 -mt-4 px-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        {hotspots.length === 0 ? (
          <View className="bg-surface border border-borderLight rounded-2xl p-8 items-center mt-4">
            <MapPin color="#94a3b8" size={48} className="mb-4 opacity-50" />
            <Text className="text-textPrimary font-medium text-lg">No active hotspots</Text>
            <Text className="text-textSecondary text-center mt-2">The city is currently clear of major grievance clusters.</Text>
          </View>
        ) : (
          hotspots.map((cluster, index) => {
            const isCritical = cluster.severity === 'critical';
            return (
              <View 
                key={cluster.id || index}
                className={`bg-surface border rounded-2xl p-5 mb-4  ${
                  isCritical ? 'border-danger/30' : 'border-borderLight'
                }`}
              >
                <View className="flex-row justify-between items-start mb-3 border-b border-borderLight/50 pb-3">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                      isCritical ? 'bg-danger/10' : 'bg-primary/10'
                    }`}>
                      <MapPin color={isCritical ? '#DC2626' : '#1E3A8A'} size={20} />
                    </View>
                    <View>
                      <Text className={`font-bold text-base tracking-tight ${isCritical ? 'text-danger' : 'text-textPrimary'}`}>
                        {isCritical ? 'CRITICAL HOTSPOT' : 'Complaint Area'}
                      </Text>
                      <Text className="text-[10px] text-textSecondary font-mono mt-0.5">
                        {cluster.center_lat.toFixed(4)}, {cluster.center_lon.toFixed(4)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className={`px-2 py-0.5 rounded-full border mt-1 ${
                    isCritical ? 'bg-danger/10 border-danger/20' : 
                    cluster.severity === 'high' ? 'bg-warning/10 border-warning/20' : 
                    'bg-primary/10 border-primary/20'
                  }`}>
                    <Text className={`text-[9px] font-bold tracking-wider uppercase ${
                      isCritical ? 'text-danger' : 
                      cluster.severity === 'high' ? 'text-warning' : 
                      'text-primary'
                    }`}>
                      {cluster.severity || 'NORMAL'}
                    </Text>
                  </View>
                </View>

                <View className="space-y-2 mt-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-textSecondary">Affected Department</Text>
                    <Text className="text-xs font-medium text-textPrimary text-right max-w-[60%]">
                      {cluster.department}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-xs text-textSecondary">Active Complaints</Text>
                    <Text className="text-xs font-bold text-textPrimary">{cluster.count} tickets</Text>
                  </View>
                </View>

                {isCritical && (
                  <View className="mt-4 bg-danger/10 border border-danger/20 rounded-xl p-3 flex-row items-center">
                    <AlertTriangle color="#DC2626" size={14} className="mr-2" />
                    <Text className="text-[10px] text-danger font-medium flex-1">
                      Auto-detected by AI: Pipeline Burst / Major Outage Suspected.
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
      <BottomNav activeTab="/explore" />
    </View>
  );
}
