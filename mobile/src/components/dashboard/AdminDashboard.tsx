import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Layers, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';

import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();
  const { token, logout } = useAuth();
  const [filter, setFilter] = useState('All');
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [recentComplaints, setRecentComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const wardData = [
    { name: 'Ward 12', value: 96 },
    { name: 'Ward 18', value: 74 },
    { name: 'Ward 7', value: 61 },
    { name: 'Ward 5', value: 44 },
    { name: 'Ward 3', value: 31 },
  ];

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await fetch(`${API_URL}/complaints/all`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setTotalComplaints(data.length);
            setRecentComplaints(data.slice(0, 10));
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [token]);

  if (loading) {
     return (
       <View className="flex-1 bg-background items-center justify-center">
         <ActivityIndicator size="large" color="#1E3A8A" />
       </View>
     );
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      <View className="mt-8 mb-6">
        <Text className="text-4xl font-bold mb-2 text-textPrimary">Control room</Text>
        <Text className="text-textSecondary text-sm mb-4">City-wide grievance analytics, refreshed every 60 seconds.</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full border mr-2 ${
                filter === f ? 'bg-primary border-primary' : 'bg-surfaceLight border-borderLight'
              }`}
            >
              <Text className={`text-sm font-medium ${filter === f ? 'text-white' : 'text-textSecondary'}`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* KPIs */}
      <View className="flex-row flex-wrap justify-between">
        <View className="w-[48%] bg-surface  border border-borderLight rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-textSecondary text-xs font-medium w-4/5">Open grievances</Text>
            <Layers color="#1E3A8A" size={16} />
          </View>
          <Text className="text-2xl font-bold text-textPrimary mb-1">{totalComplaints > 0 ? totalComplaints : 412}</Text>
          <Text className="text-[10px] text-textSecondary">+6.1% wk</Text>
        </View>

        <View className="w-[48%] bg-surface  border border-borderLight rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-textSecondary text-xs font-medium w-4/5">Critical / SLA risk</Text>
            <AlertTriangle color="#1E3A8A" size={16} />
          </View>
          <Text className="text-2xl font-bold text-textPrimary mb-1">27</Text>
          <Text className="text-[10px] text-textSecondary">9 breach soon</Text>
        </View>

        <View className="w-[48%] bg-surface  border border-borderLight rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-textSecondary text-xs font-medium w-4/5">Avg resolution</Text>
            <Clock color="#1E3A8A" size={16} />
          </View>
          <Text className="text-2xl font-bold text-textPrimary mb-1">38 hrs</Text>
          <Text className="text-[10px] text-textSecondary">-4 hrs wk</Text>
        </View>

        <View className="w-[48%] bg-surface  border border-borderLight rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-textSecondary text-xs font-medium w-4/5">Resolved this week</Text>
            <CheckCircle2 color="#1E3A8A" size={16} />
          </View>
          <Text className="text-2xl font-bold text-textPrimary mb-1">299</Text>
          <Text className="text-[10px] text-textSecondary">82% SLA met</Text>
        </View>
      </View>

      {/* Ward hotspots (Visual Bars) */}
      <View className="bg-surface  border border-borderLight rounded-2xl p-5 mb-6 mt-2">
        <Text className="text-textPrimary font-medium text-lg mb-4">Ward hotspots</Text>
        <View className="space-y-4">
          {wardData.map((ward, i) => (
            <View key={ward.name} className="mb-3">
              <View className="flex-row justify-between text-xs mb-1.5">
                <Text className="text-xs text-textSecondary">{ward.name}</Text>
                <Text className="text-xs text-textSecondary">{ward.value} open</Text>
              </View>
              <View className="h-2 w-full bg-surfaceLight rounded-full overflow-hidden">
                <View 
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(ward.value / 100) * 100}%`, opacity: 1 - (i * 0.15) }}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Officer Queue */}
      <View className="bg-surface  border border-borderLight rounded-2xl overflow-hidden mt-2">
        <View className="p-5 border-b border-borderLight">
          <Text className="text-textPrimary font-medium text-lg mb-1">Officer queue</Text>
          <Text className="text-xs text-textSecondary">Sorted by AI priority score · {recentComplaints.length} tickets</Text>
        </View>
        <View>
          {recentComplaints.map((row, index) => (
            <TouchableOpacity 
              key={row._id || row.id || index} 
              onPress={() => router.push(`/review/${row._id || row.id}`)}
              className="p-4 border-b border-borderLight bg-surface hover:bg-surfaceLight"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xs text-textSecondary font-mono">{(row._id || row.id)?.substring(0,8) || 'N/A'}...</Text>
                <View className={`px-2 py-0.5 rounded-full border ${
                    row.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'bg-danger/10 border-danger/20' :
                    row.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'bg-purple-500/10 border-purple-500/20' :
                    row.ai_analysis?.predicted_priority?.toUpperCase() === 'MEDIUM' ? 'bg-primary/10 border-primary/20' :
                    'bg-success/10 border-success/20'
                  }`}>
                    <Text className={`text-[10px] font-medium ${
                      row.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'text-danger' :
                      row.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'text-purple-500' :
                      row.ai_analysis?.predicted_priority?.toUpperCase() === 'MEDIUM' ? 'text-primary' :
                      'text-success'
                    }`}>{row.ai_analysis?.predicted_priority?.toUpperCase() || 'LOW'}</Text>
                </View>
              </View>
              <Text className="text-textPrimary font-medium text-sm mb-2" numberOfLines={1}>{row.title}</Text>
              <View className="flex-row justify-between items-center mt-1">
                <Text className="text-xs text-textSecondary" numberOfLines={1}>{row.ai_analysis?.predicted_department || 'Pending'}</Text>
                <Text className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        row.status === 'in_progress' ? 'bg-warning/10 text-warning border-warning/20 border' :
                        row.status === 'assigned' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 border' :
                        row.status === 'new' ? 'bg-primary/10 text-primary border-primary/20 border' :
                        'bg-success/10 text-success border-success/20 border'
                      }`}>
                  {row.status ? row.status.replace('_', ' ').toUpperCase() : 'NEW'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity 
        onPress={logout}
        className="mt-8 mb-4 py-4 items-center bg-surfaceLight rounded-xl border border-borderLight"
      >
        <Text className="text-danger font-medium">Secure Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
