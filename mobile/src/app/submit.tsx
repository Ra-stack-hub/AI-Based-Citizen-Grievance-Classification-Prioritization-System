import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { MapPin, Map, Camera, Upload, Mic, Check, AlertTriangle, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import BottomNav from '@/components/BottomNav';

export default function SubmitScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{latitude: number, longitude: number, address: string} | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { token } = useAuth();
  const router = useRouter();

  const handleGetLocation = async () => {
    if (Platform.OS === 'web') {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'GPS Location Captured'
            });
          },
          (error) => {
            Alert.alert("Error", "Please enable location permissions in your browser.");
          }
        );
      } else {
        Alert.alert("Error", "Geolocation is not supported by your browser");
      }
      return;
    }

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      
      let loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        address: 'GPS Location Captured'
      });
    } catch(err) {
      console.error(err);
      Alert.alert("Error", "Could not get location. Make sure GPS is enabled.");
    }
  };

  const handleCamera = async () => {
    if (Platform.OS === 'web') {
        Alert.alert("Notice", "Direct camera capture is limited on web in this mode. Please use 'Upload Image' instead.");
        return;
    }

    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch(err) {
       console.error(err);
       Alert.alert("Error", "Could not open camera");
    }
  };

  const handleUploadImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }
    
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access gallery is required!");
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
      }
    } catch(err) {
       console.error(err);
       Alert.alert("Error", "Could not open gallery");
    }
  };

  const handleVoiceRecording = () => {
    if (Platform.OS === 'web') {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            }
          }
          if (finalTranscript) {
            setDescription(prev => prev + (prev ? " " : "") + finalTranscript.trim());
          }
        };
        recognition.onend = () => setIsRecording(false);
        recognition.onerror = () => setIsRecording(false);
        recognition.start();
        return;
      }
    }
    
    // Mobile/Simulator fallback
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setDescription(prev => prev + (prev ? " " : "") + "There is a huge pothole here causing traffic jams.");
      }, 2500);
    }
  };

  const handleAnalyze = async () => {
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!title || !description) {
      Alert.alert("Missing Fields", "Please enter a title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/complaints/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          location: location || { latitude: 21.25, longitude: 81.62, address: 'Chhattisgarh' },
          ...(imageUrl && { image_url: imageUrl })
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        Alert.alert("Error", `Failed to submit: ${errData.detail || 'Unknown error'}`);
        return;
      }

      const data = await response.json();
      setAiData(data.ai_analysis);
      setShowAnalysis(true);
      
    } catch (err) {
      console.error(err);
      Alert.alert("Connection Error", "An error occurred while submitting. Make sure the backend server is running.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="flex-1 relative bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
          
          <View className="mb-8 mt-6 border-b border-borderLight pb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-3xl font-bold text-textPrimary">File Complaint</Text>
              <Text className="text-textSecondary mt-1">Report a civic issue</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} className="bg-surfaceLight p-2 rounded-full">
              <X color="#475569" size={24} />
            </TouchableOpacity>
          </View>

          <View className="space-y-6">
            {/* Title */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-textSecondary mb-2">Complaint Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Water pipeline leakage"
                placeholderTextColor="#94a3b8"
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3.5 px-4 text-textPrimary text-base"
              />
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="text-sm font-medium text-textSecondary mb-2">Describe your complaint</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Provide details or use Voice Complaint below..."
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                className="w-full bg-surfaceLight border border-borderLight rounded-xl py-3.5 px-4 text-textPrimary text-base min-h-[100px]"
              />
            </View>

            {/* Location */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <MapPin color="#1E3A8A" size={16} className="mr-2" />
                <Text className="text-sm font-medium text-textSecondary">Location</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={handleGetLocation}
                  className={`flex-1 border rounded-xl py-3.5 flex-row items-center justify-center mr-2 ${location ? 'bg-primary/10 border-primary' : 'bg-surfaceLight border-borderLight'}`}
                >
                  <MapPin color={location ? '#1E3A8A' : '#475569'} size={16} className="mr-2" />
                  <Text className={`text-sm font-medium ${location ? 'text-primary' : 'text-textPrimary'}`}>
                    {location ? 'Captured ✓' : 'Use GPS'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-surfaceLight border border-borderLight rounded-xl py-3.5 flex-row items-center justify-center">
                  <Map color="#475569" size={16} className="mr-2" />
                  <Text className="text-sm font-medium text-textPrimary">Select Map</Text>
                </TouchableOpacity>
              </View>
              {location && (
                <Text className="mt-2 text-xs text-primary">GPS: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>
              )}
            </View>

            {/* Evidence */}
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Camera color="#1E3A8A" size={16} className="mr-2" />
                <Text className="text-sm font-medium text-textSecondary">Evidence</Text>
              </View>
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={handleCamera}
                  className="flex-1 bg-surfaceLight border border-borderLight rounded-xl py-3.5 flex-row items-center justify-center mr-2"
                >
                  <Camera color="#475569" size={16} className="mr-2" />
                  <Text className="text-sm font-medium text-textPrimary">Take Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUploadImage} className="flex-1 bg-surfaceLight border border-borderLight rounded-xl py-3.5 flex-row items-center justify-center">
                  <Upload color="#475569" size={16} className="mr-2" />
                  <Text className="text-sm font-medium text-textPrimary">Upload</Text>
                </TouchableOpacity>
              </View>
              {imageUrl ? (
                <View className="mt-4 relative self-start">
                  <Image source={{ uri: imageUrl }} className="w-32 h-32 rounded-xl border border-borderLight" />
                  <TouchableOpacity 
                    onPress={() => setImageUrl('')}
                    className="absolute -top-2 -right-2 bg-danger rounded-full p-1.5  z-10"
                  >
                    <X color="#fff" size={14} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>

            {/* Voice */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                <Mic color="#1E3A8A" size={16} className="mr-2" />
                <Text className="text-sm font-medium text-textSecondary">Voice Complaint</Text>
              </View>
              <TouchableOpacity 
                onPress={handleVoiceRecording}
                className={`w-full border rounded-xl py-4 flex-row items-center justify-center ${isRecording ? 'bg-danger/10 border-danger' : 'bg-surfaceLight border-borderLight'}`}
              >
                <View className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${isRecording ? 'bg-danger/30' : 'bg-primary/20'}`}>
                  <Mic color={isRecording ? '#DC2626' : '#1E3A8A'} size={16} />
                </View>
                <Text className={`text-sm font-medium ${isRecording ? 'text-danger' : 'text-textPrimary'}`}>
                  {isRecording ? 'Listening...' : 'Tap to Speak'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* AI Analysis Section */}
            {showAnalysis && aiData && (
              <View className="mt-4 mb-4">
                <View className="border-t border-borderLight mb-6 mt-2 relative items-center">
                  <View className="bg-surface px-3 py-1 absolute -top-3  rounded-full border border-borderLight">
                    <Text className="text-[10px] font-bold tracking-widest text-textSecondary uppercase">AI Analysis</Text>
                  </View>
                </View>
                
                <View className="bg-surfaceLight border border-borderLight rounded-xl p-5 space-y-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-textSecondary">Department</Text>
                    <Text className="text-sm font-medium text-textPrimary">{aiData?.predicted_department || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-textSecondary">Priority</Text>
                    <View className="flex-row items-center bg-danger/10 px-2 py-0.5 rounded border border-danger/20">
                      <AlertTriangle color="#DC2626" size={14} className="mr-1" />
                      <Text className="text-xs font-bold text-danger">{aiData?.predicted_priority?.toUpperCase() || 'HIGH'}</Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-textSecondary">Sentiment</Text>
                    <Text className="text-sm font-mono text-textPrimary">{aiData?.sentiment || 'Neutral'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-textSecondary">Duplicate Found</Text>
                    <Text className="text-sm font-medium text-textPrimary">{aiData?.is_duplicate ? 'Yes' : 'No'}</Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm text-textSecondary">Fake Photo</Text>
                    <Text className={`text-sm font-medium ${aiData?.is_fake_image ? 'text-danger' : 'text-success'}`}>
                      {aiData?.is_fake_image ? 'Yes (Warning)' : 'No'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity 
              onPress={handleAnalyze}
              disabled={isSubmitting}
              className={`w-full ${isSubmitting ? 'bg-primary/50' : 'bg-primary'} rounded-xl py-4 flex-row items-center justify-center mt-2  shadow-primary/30`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Check color="#ffffff" size={20} className="mr-2" />
                  <Text className="text-white font-bold text-base">Analyze & Submit</Text>
                </>
              )}
            </TouchableOpacity>
            {showAnalysis && (
              <TouchableOpacity onPress={() => router.push('/dashboard')} className="mt-4 items-center">
                <Text className="text-primary font-medium text-base">Return to Dashboard</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <BottomNav activeTab="/submit" />
    </View>
  );
}
