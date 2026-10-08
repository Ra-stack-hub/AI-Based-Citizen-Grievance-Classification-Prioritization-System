import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Search, ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import BottomNav from '@/components/BottomNav';

export default function TrackScreen() {
  const [search, setSearch] = useState('');
  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const response = await fetch(`${API_URL}/complaints/public`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setComplaints(data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch complaints", err);
      } finally {
        setLoading(false);
      }
    };
    fetchComplaints();
  }, [token]);

  const filteredComplaints = complaints.map(c => {
    if (!search.trim()) return { ...c, _searchScore: 1 };
    
    let score = 0;
    const searchTerms = search.toLowerCase().split(' ').filter(t => t);
    
    searchTerms.forEach(s => {
      if ((c._id || c.id)?.toLowerCase().includes(s)) score += 10;
      if (c.title?.toLowerCase().includes(s)) score += 5;
      if (c.description?.toLowerCase().includes(s)) score += 3;
      if (c.ai_analysis?.predicted_department?.toLowerCase().includes(s)) score += 2;
    });
    
    return { ...c, _searchScore: score };
  })
  .filter(c => c._searchScore > 0)
  .sort((a, b) => b._searchScore - a._searchScore)
  .slice(0, 50);

  const renderTimelineItem = (
    title: string, 
    desc: string, 
    isActive: boolean, 
    isLast: boolean, 
    isRejected: boolean = false,
    extraContent?: React.ReactNode
  ) => {
    return (
      <View className="flex-row">
        <View className="items-center mr-4">
          <View className={`w-8 h-8 rounded-full items-center justify-center border-2 ${
            isRejected ? 'border-danger bg-background' : 
            isActive ? 'border-primary bg-background' : 'border-borderLight bg-surface'
          }`}>
            {isActive && !isRejected && <View className="w-3 h-3 rounded-full bg-primary" />}
            {isRejected && <View className="w-3 h-3 rounded-full bg-danger" />}
          </View>
          {!isLast && (
            <View className={`w-0.5 flex-1 my-1 ${isActive ? 'bg-primary/50' : 'bg-borderLight'}`} />
          )}
        </View>
        <View className={`flex-1 pb-8 ${!isActive && !isRejected ? 'opacity-50' : ''}`}>
          <Text className={`text-base font-bold mb-1 ${isRejected ? 'text-danger' : 'text-textPrimary'}`}>{title}</Text>
          <Text className="text-sm text-textSecondary mb-2">{desc}</Text>
          {extraContent}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background pt-12">
      {selectedTicket ? (
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          <TouchableOpacity 
            onPress={() => setSelectedTicket(null)}
            className="flex-row items-center mb-6 bg-surfaceLight self-start px-3 py-2 rounded-full border border-borderLight"
          >
            <ChevronLeft color="#475569" size={20} />
            <Text className="text-textPrimary font-medium ml-1">Back to List</Text>
          </TouchableOpacity>

          <View className="mb-8">
            <Text className="text-2xl font-bold text-textPrimary mb-2">Ticket Trail</Text>
            <Text className="text-sm font-mono text-textSecondary uppercase">ID: {(selectedTicket._id || selectedTicket.id)?.substring(0,8)}</Text>
          </View>

          <View className="pl-2">
            {/* Submitted */}
            {renderTimelineItem(
              "Submitted",
              `Complaint received on ${new Date(selectedTicket.created_at).toLocaleDateString()}`,
              true,
              false,
              false,
              selectedTicket.image_url ? (
                <Image source={{ uri: selectedTicket.image_url }} className="w-full h-40 rounded-xl mt-2 border border-borderLight bg-surfaceLight" resizeMode="cover" />
              ) : null
            )}

            {/* Classified */}
            {renderTimelineItem(
              "Classified",
              "AI Engine analysis completed.",
              true,
              false,
              false,
              <View className="mt-3 bg-surfaceLight border border-borderLight rounded-xl p-4 space-y-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-textSecondary">Department</Text>
                  <Text className="text-xs font-medium text-textPrimary">{selectedTicket.ai_analysis?.predicted_department || 'Pending'}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-textSecondary">Priority</Text>
                  <View className={`px-2 py-0.5 rounded border ${
                    selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'bg-danger/10 border-danger/20' : 
                    selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'bg-purple-500/10 border-purple-500/20' : 
                    'bg-primary/10 border-primary/20'
                  }`}>
                    <Text className={`text-[10px] font-bold ${
                      selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'CRITICAL' ? 'text-danger' : 
                      selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() === 'HIGH' ? 'text-purple-500' : 
                      'text-primary'
                    }`}>{selectedTicket.ai_analysis?.predicted_priority?.toUpperCase() || 'PENDING'}</Text>
                  </View>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-xs text-textSecondary">Sentiment</Text>
                  <Text className="text-xs text-textPrimary capitalize">{selectedTicket.ai_analysis?.sentiment || 'N/A'}</Text>
                </View>
              </View>
            )}

            {/* Assigned / Rejected */}
            {selectedTicket.status === 'rejected' ? (
              renderTimelineItem(
                "Rejected",
                "Complaint was rejected by the officer.",
                false,
                true,
                true,
                selectedTicket.rejection_reason ? (
                  <View className="mt-2 bg-danger/10 border border-danger/20 rounded-xl p-3">
                    <Text className="text-danger font-bold text-[10px] mb-1 tracking-wider">REASON FOR REJECTION</Text>
                    <Text className="text-sm text-textPrimary">{selectedTicket.rejection_reason}</Text>
                  </View>
                ) : null
              )
            ) : (
              <>
                {renderTimelineItem(
                  "Assigned",
                  "Ward officer assignment.",
                  selectedTicket.status !== 'new',
                  false
                )}
                {renderTimelineItem(
                  "In Progress",
                  "Field team dispatched, work order raised.",
                  selectedTicket.status === 'in_progress' || selectedTicket.status === 'resolved',
                  false,
                  false,
                  selectedTicket.progress_note ? (
                    <View className="mt-2 bg-primary/10 border border-primary/20 rounded-xl p-3">
                      <Text className="text-primary font-bold text-[10px] mb-1 tracking-wider">OFFICER NOTE</Text>
                      <Text className="text-sm text-textPrimary">{selectedTicket.progress_note}</Text>
                    </View>
                  ) : null
                )}
                {renderTimelineItem(
                  "Resolved",
                  "Closure photo uploaded and citizen notified.",
                  selectedTicket.status === 'resolved',
                  true
                )}
              </>
            )}
          </View>
        </ScrollView>
      ) : (
        <View className="flex-1 px-6">
          <View className="flex-row items-center justify-between mb-6 mt-4">
            <View>
              <Text className="text-3xl font-bold text-textPrimary mb-1">Track Grievance</Text>
              <Text className="text-textSecondary text-sm">Search by ID or keyword</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/dashboard')} className="bg-surfaceLight p-2 rounded-full border border-borderLight">
              <ChevronLeft color="#475569" size={24} />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center bg-surface border border-borderLight rounded-xl px-4 py-3 mb-6 ">
            <Search color="#94a3b8" size={20} className="mr-3" />
            <TextInput
              className="flex-1 text-textPrimary text-base"
              placeholder="GRV-2481 or 'pothole'"
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            {filteredComplaints.length === 0 ? (
              <View className="items-center justify-center py-10">
                <Text className="text-textSecondary">No complaints found.</Text>
              </View>
            ) : (
              filteredComplaints.map(ticket => (
                <TouchableOpacity 
                  key={ticket._id || ticket.id} 
                  onPress={() => setSelectedTicket(ticket)}
                  className="bg-surface border border-borderLight rounded-xl p-4 mb-3  hover:bg-surfaceLight"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-mono text-textSecondary uppercase tracking-wider">{(ticket._id || ticket.id)?.substring(0,8)}</Text>
                    <View className={`px-2 py-0.5 rounded-full border ${
                        ticket.status === 'in_progress' ? 'bg-warning/10 border-warning/20' :
                        ticket.status === 'assigned' ? 'bg-purple-500/10 border-purple-500/20' :
                        ticket.status === 'new' ? 'bg-primary/10 border-primary/20' :
                        'bg-success/10 border-success/20'
                      }`}>
                      <Text className={`text-[9px] font-bold tracking-wider ${
                        ticket.status === 'in_progress' ? 'text-warning' :
                        ticket.status === 'assigned' ? 'text-purple-500' :
                        ticket.status === 'new' ? 'text-primary' :
                        'text-success'
                      }`}>
                        {ticket.status?.replace('_', ' ').toUpperCase() || 'NEW'}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-medium text-textPrimary text-base mb-2" numberOfLines={2}>{ticket.title}</Text>
                  <View className="flex-row justify-between items-center mt-2">
                    <Text className="text-[11px] text-textSecondary">{new Date(ticket.created_at).toLocaleDateString()}</Text>
                    <Text className="text-[11px] bg-surfaceLight text-textSecondary px-2 py-1 rounded-md overflow-hidden" numberOfLines={1}>
                      {ticket.ai_analysis?.predicted_department?.replace(' Department', '') || 'Unassigned'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
      <BottomNav activeTab="/track" />
    </View>
  );
}
