import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X, Check, Clock, AlertTriangle, Play, RefreshCw, MapPin } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';

export default function ReviewScreen() {
  const { id } = useLocalSearchParams();
  const { token, user } = useAuth();
  const router = useRouter();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);
  const [isInProgressing, setIsInProgressing] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [progressNote, setProgressNote] = useState('');

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await fetch(`${API_URL}/complaints/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setComplaint(data);
        } else {
          Alert.alert("Error", "Could not load complaint details.");
          router.back();
        }
      } catch (err) {
        console.error(err);
        Alert.alert("Error", "Network error.");
      } finally {
        setLoading(false);
      }
    };
    
    if (id && token) {
      fetchComplaint();
    }
  }, [id, token]);

  const updateStatus = async (newStatus: string, reason?: string, note?: string) => {
    if (newStatus === 'rejected' && !reason) return;
    if (newStatus === 'in_progress' && !note) return;
    
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        progress_note: note,
        rejection_reason: reason,
      };

      const res = await fetch(`${API_URL}/complaints/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        Alert.alert("Success", `Status updated to ${newStatus.replace('_', ' ')}`);
        const updatedData = await res.json();
        setComplaint(updatedData);
      } else {
        const errData = await res.json();
        Alert.alert("Error", errData.detail || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to connect to backend.");
    } finally {
      setUpdating(false);
      setIsRejecting(false);
      setIsInProgressing(false);
      setRejectReason('');
      setProgressNote('');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  if (!complaint) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <View className="pt-12 pb-4 px-6 border-b border-borderLight flex-row items-center justify-between">
        <Text className="text-xl font-bold text-textPrimary">Review Grievance</Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-surfaceLight rounded-full">
          <X color="#475569" size={20} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        
        {/* Header Badges */}
        <View className="flex-row items-center mb-6">
          <View className={`px-3 py-1 rounded-full border mr-3 ${
            complaint.status === 'resolved' ? 'bg-success/10 border-success/20' :
            complaint.status === 'in_progress' ? 'bg-warning/10 border-warning/20' :
            complaint.status === 'rejected' ? 'bg-danger/10 border-danger/20' :
            'bg-primary/10 border-primary/20'
          }`}>
            <Text className={`text-xs font-bold uppercase tracking-wider ${
              complaint.status === 'resolved' ? 'text-success' :
              complaint.status === 'in_progress' ? 'text-warning' :
              complaint.status === 'rejected' ? 'text-danger' :
              'text-primary'
            }`}>{complaint.status ? complaint.status.replace('_', ' ') : 'NEW'}</Text>
          </View>
          
          <View className="bg-surface shadow-sm px-2 py-1 rounded border border-borderLight">
             <Text className="text-xs text-textSecondary font-mono">ID: {id}</Text>
          </View>
        </View>

        {/* Rejected Reason block if any */}
        {complaint.status === 'rejected' && complaint.rejection_reason && (
          <View className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl">
            <View className="flex-row items-center mb-1">
              <AlertTriangle color="#ef4444" size={16} className="mr-2" />
              <Text className="text-danger font-bold">Complaint Rejected</Text>
            </View>
            <Text className="text-sm text-textPrimary"><Text className="font-bold">Reason:</Text> {complaint.rejection_reason}</Text>
          </View>
        )}

        <Text className="text-2xl font-bold text-textPrimary mb-4">{complaint.title}</Text>
        <Text className="text-textSecondary mb-8 leading-relaxed text-base">{complaint.description}</Text>

        {/* Image Display like Web */}
        {complaint.image_url ? (
          <View className="mb-8">
            <Text className="text-sm font-medium text-textSecondary mb-3">Attached Evidence</Text>
            <Image 
              source={{ uri: complaint.image_url }} 
              className="w-full h-64 rounded-xl border border-borderLight"
              resizeMode="cover"
            />
          </View>
        ) : null}

        {/* Location & Time details */}
        <View className="flex-row justify-between mb-8">
          <View className="flex-1 bg-surfaceLight p-4 rounded-xl border border-borderLight mr-2">
            <View className="flex-row items-center mb-1">
              <MapPin color="#64748b" size={14} className="mr-2" />
              <Text className="text-textSecondary text-xs">Location</Text>
            </View>
            <Text className="text-textPrimary font-medium text-sm mt-1">{complaint.location?.address || 'N/A'}</Text>
            {complaint.location?.latitude && (
               <Text className="text-xs text-textSecondary mt-1">
                 GPS: {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
               </Text>
            )}
          </View>
          <View className="flex-1 bg-surfaceLight p-4 rounded-xl border border-borderLight ml-2">
            <View className="flex-row items-center mb-1">
              <Clock color="#64748b" size={14} className="mr-2" />
              <Text className="text-textSecondary text-xs">Reported on</Text>
            </View>
            <Text className="text-textPrimary font-medium text-sm mt-1">{new Date(complaint.created_at).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* AI Analytics */}
        <View className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6 mb-8">
          <View className="flex-row items-center mb-4">
             <RefreshCw color="#1E3A8A" size={16} className="mr-2" />
             <Text className="text-textPrimary font-medium">AI Analysis</Text>
          </View>
          
          <View className="mb-3">
            <Text className="text-xs text-textSecondary mb-1">Assigned Department</Text>
            <Text className="text-sm font-medium text-textPrimary">{complaint.ai_analysis?.predicted_department || 'General'}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-xs text-textSecondary mb-1">Priority Level</Text>
            <Text className="text-sm font-bold text-danger">{complaint.ai_analysis?.predicted_priority || 'MEDIUM'}</Text>
          </View>
          <View className="mb-3">
            <Text className="text-xs text-textSecondary mb-1">Sentiment</Text>
            <Text className="text-sm font-medium text-textPrimary">{complaint.ai_analysis?.sentiment || 'Neutral'}</Text>
          </View>

          {/* AI Warnings */}
          {complaint.ai_analysis?.is_duplicate && (
            <View className="bg-warning/10 border border-warning/20 p-3 rounded-lg mt-4 flex-row">
              <AlertTriangle color="#eab308" size={16} className="mr-2 mt-0.5" />
              <Text className="text-xs text-warning flex-1">Warning: AI detected this as a potential duplicate of an existing grievance.</Text>
            </View>
          )}
          {complaint.ai_analysis?.is_fake_image && (
            <View className="bg-danger/10 border border-danger/20 p-3 rounded-lg mt-4">
              <View className="flex-row items-center mb-1">
                <AlertTriangle color="#ef4444" size={16} className="mr-2" />
                <Text className="text-xs font-bold text-danger">Suspicious Evidence Alert</Text>
              </View>
              <Text className="text-[11px] text-danger opacity-90 ml-6">
                The attached evidence might be an AI-generated or downloaded stock image. 
                {'\n'}Reason: {complaint.ai_analysis?.image_analysis?.details || 'Failed authenticity checks.'} (Score: {complaint.ai_analysis?.image_authenticity_score})
              </Text>
            </View>
          )}
          {complaint.ai_analysis?.is_spam && (
            <View className="bg-danger/10 border border-danger/20 p-3 rounded-lg mt-4">
              <View className="flex-row items-center mb-1">
                <AlertTriangle color="#ef4444" size={16} className="mr-2" />
                <Text className="text-xs font-bold text-danger">Spam / Fake Text Alert</Text>
              </View>
              <Text className="text-[11px] text-danger opacity-90 ml-6">
                The complaint text has been flagged as potential spam or gibberish.
                {'\n'}Score: {(complaint.ai_analysis?.spam_score * 100).toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        {/* Officer Actions */}
        <View className="bg-surface shadow-sm border border-borderLight rounded-2xl p-6">
          <Text className="text-textPrimary font-medium mb-4">Officer Actions</Text>
          
          {isRejecting ? (
            <View className="space-y-3">
              <TextInput
                className="w-full bg-surfaceLight border border-borderLight rounded-xl p-3 text-sm mb-3 min-h-[80px]"
                multiline
                textAlignVertical="top"
                placeholder="Enter reason for rejection..."
                placeholderTextColor="#94a3b8"
                value={rejectReason}
                onChangeText={setRejectReason}
              />
              <View className="flex-row gap-2 space-x-2">
                <TouchableOpacity 
                  onPress={() => updateStatus('rejected', rejectReason, undefined)}
                  disabled={updating || !rejectReason.trim()}
                  className={`flex-1 ${!rejectReason.trim() ? 'bg-danger/50' : 'bg-danger'} py-3 rounded-xl items-center`}
                >
                  <Text className="text-white font-medium">Confirm Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => { setIsRejecting(false); setRejectReason(''); }}
                  disabled={updating}
                  className="flex-1 bg-surfaceLight py-3 rounded-xl items-center ml-2 border border-borderLight"
                >
                  <Text className="text-textPrimary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : isInProgressing ? (
            <View className="space-y-3">
              <TextInput
                className="w-full bg-surfaceLight border border-borderLight rounded-xl p-3 text-sm mb-3 min-h-[80px]"
                multiline
                textAlignVertical="top"
                placeholder="ETA for completion, reason for delay, or next steps..."
                placeholderTextColor="#94a3b8"
                value={progressNote}
                onChangeText={setProgressNote}
              />
              <View className="flex-row gap-2 space-x-2">
                <TouchableOpacity 
                  onPress={() => updateStatus('in_progress', undefined, progressNote)}
                  disabled={updating || !progressNote.trim()}
                  className={`flex-1 ${!progressNote.trim() ? 'bg-primary/50' : 'bg-primary'} py-3 rounded-xl items-center`}
                >
                  <Text className="text-white font-medium">Confirm Progress</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => { setIsInProgressing(false); setProgressNote(''); }}
                  disabled={updating}
                  className="flex-1 bg-surfaceLight py-3 rounded-xl items-center ml-2 border border-borderLight"
                >
                  <Text className="text-textPrimary font-medium">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View className="space-y-3">
              <TouchableOpacity 
                onPress={() => setIsInProgressing(true)}
                disabled={updating || complaint.status === 'in_progress' || complaint.status === 'resolved' || complaint.status === 'rejected'}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center border mb-3 ${
                  complaint.status === 'in_progress' || complaint.status === 'resolved' || complaint.status === 'rejected' 
                  ? 'bg-primary/10 border-primary/20 opacity-50' 
                  : 'bg-primary/20 border-primary/30'
                }`}
              >
                <Text className="text-primary font-medium">Mark In Progress</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => updateStatus('resolved')}
                disabled={updating || complaint.status === 'resolved' || complaint.status === 'rejected'}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center border mb-3 ${
                  complaint.status === 'resolved' || complaint.status === 'rejected' 
                  ? 'bg-success/10 border-success/20 opacity-50' 
                  : 'bg-success/20 border-success/30'
                }`}
              >
                <Check size={16} color={complaint.status === 'resolved' || complaint.status === 'rejected' ? '#10b981' : '#10b981'} className="mr-2" />
                <Text className="text-success font-medium">Resolve Grievance</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsRejecting(true)}
                disabled={updating || complaint.status === 'rejected' || complaint.status === 'resolved'}
                className={`w-full py-4 rounded-xl flex-row items-center justify-center border ${
                  complaint.status === 'rejected' || complaint.status === 'resolved'
                  ? 'bg-danger/10 border-danger/20 opacity-50' 
                  : 'bg-danger/10 border-danger/30'
                }`}
              >
                <Text className="text-danger font-medium">Reject Complaint</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
