import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, MapPin, Clock, Info } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';
import { useRouter } from 'expo-router';

export default function CitizenDashboard() {
  const router = useRouter();
  const { token, user, logout } = useAuth();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`${API_URL}/complaints/`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setComplaints(data);
        }
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
      <View className="flex-row justify-between items-end mb-6 border-b border-borderLight pb-4 mt-8">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-textPrimary mb-1">My Grievances</Text>
          <Text className="text-textSecondary">Welcome back, {user?.email?.split('@')[0] || 'Citizen'}.</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/submit')}
          className="bg-primary py-2 px-4 rounded-full ml-2"
        >
          <Text className="text-white font-semibold text-xs">+ New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#1E3A8A" />
        </View>
      ) : complaints.length === 0 ? (
        <View className="bg-surface  border border-borderLight rounded-2xl p-8 items-center mt-4">
          <Info color="#94a3b8" size={48} className="mb-4 opacity-50" />
          <Text className="text-lg font-medium text-textPrimary mb-2">No complaints filed yet</Text>
          <Text className="text-textSecondary mb-6 text-center">When you report an issue, it will appear here so you can track its progress.</Text>
          <TouchableOpacity onPress={() => router.push('/submit')}>
             <Text className="text-primary font-medium text-base">File your first grievance</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="space-y-4">
          {complaints.map((complaint, i) => (
            <View 
              key={complaint._id || complaint.id || i}
              className="bg-surfaceLight border border-borderLight  rounded-xl p-5 mb-4"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className={`px-2.5 py-1 rounded-full border ${
                    complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'critical' ? 'bg-danger/20 border-danger/30' :
                    complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'high' ? 'bg-warning/20 border-warning/30' :
                    'bg-primary/20 border-primary/30'
                  }`}>
                    <Text className={`text-[10px] font-bold uppercase tracking-wider ${
                      complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'critical' ? 'text-danger' :
                      complaint.ai_analysis?.predicted_priority?.toLowerCase() === 'high' ? 'text-warning' :
                      'text-primary'
                    }`}>
                      {complaint.ai_analysis?.predicted_priority || 'MEDIUM'}
                    </Text>
                  </View>
                  <Text className="text-xs text-textSecondary font-mono uppercase bg-surface  px-2 py-1 rounded ml-2">
                    ID: {(complaint._id || complaint.id)?.substring(0, 8)}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 rounded-full bg-warning mr-1" />
                  <Text className="text-xs font-medium text-warning">Pending Review</Text>
                </View>
              </View>

              <Text className="text-lg font-medium text-textPrimary mb-2">{complaint.title}</Text>
              <Text className="text-sm text-textSecondary mb-4" numberOfLines={2}>{complaint.description}</Text>
              
              <View className="flex-row flex-wrap gap-y-2 text-xs text-textSecondary">
                <View className="flex-row items-center w-1/2">
                  <MapPin color="#475569" size={14} className="mr-1.5" />
                  <Text className="text-xs text-textSecondary" numberOfLines={1}>{complaint.location?.address || 'Unknown'}</Text>
                </View>
                <View className="flex-row items-center w-1/2">
                  <AlertTriangle color="#475569" size={14} className="mr-1.5" />
                  <Text className="text-xs text-textSecondary" numberOfLines={1}>{complaint.ai_analysis?.predicted_department || 'General'}</Text>
                </View>
                <View className="flex-row items-center mt-2">
                  <Clock color="#475569" size={14} className="mr-1.5" />
                  <Text className="text-xs text-textSecondary">{new Date(complaint.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity 
        onPress={logout}
        className="mt-8 py-4 items-center bg-surfaceLight rounded-xl border border-borderLight"
      >
        <Text className="text-danger font-medium">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
