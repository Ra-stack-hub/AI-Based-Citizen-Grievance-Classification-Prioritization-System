import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Target, Lock, User as UserIcon, ShieldAlert, Mail } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');

  const handleRegister = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Account created successfully. Please login.");
        router.replace('/login');
      } else {
        Alert.alert("Registration Failed", data.detail || "Could not create account");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Connection Error", `Failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center mb-8 mt-10">
          <View className="bg-primary/20 p-4 rounded-full mb-4  shadow-primary/20">
            <Target color="#1E3A8A" size={56} />
          </View>
          <Text className="text-4xl font-extrabold text-textPrimary tracking-tight">GrievAI</Text>
          <Text className="text-textSecondary mt-2 text-base text-center px-4">Create your account</Text>
        </View>

        <View className="w-full max-w-sm self-center">
          <View className="flex-row bg-surfaceLight p-1 rounded-xl mb-6">
            <TouchableOpacity 
              onPress={() => setRole('citizen')}
              className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${role === 'citizen' ? 'bg-primary ' : ''}`}
            >
              <UserIcon color={role === 'citizen' ? '#fff' : '#475569'} size={18} className="mr-2" />
              <Text className={`font-semibold ${role === 'citizen' ? 'text-white' : 'text-textSecondary'}`}>Citizen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setRole('admin')}
              className={`flex-1 py-3 rounded-lg flex-row justify-center items-center ${role === 'admin' ? 'bg-danger ' : ''}`}
            >
              <ShieldAlert color={role === 'admin' ? '#fff' : '#475569'} size={18} className="mr-2" />
              <Text className={`font-semibold ${role === 'admin' ? 'text-white' : 'text-textSecondary'}`}>Admin / Officer</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-4">
            <View className="bg-surface flex-row items-center border border-borderLight rounded-xl px-4 py-3.5 mb-4">
              <UserIcon color="#475569" size={22} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#475569"
                className="flex-1 text-textPrimary ml-3 text-base"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View className="bg-surface flex-row items-center border border-borderLight rounded-xl px-4 py-3.5 mb-4">
              <Mail color="#475569" size={22} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#475569"
                className="flex-1 text-textPrimary ml-3 text-base"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="bg-surface flex-row items-center border border-borderLight rounded-xl px-4 py-3.5 mb-6">
              <Lock color="#475569" size={22} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#475569"
                secureTextEntry
                className="flex-1 text-textPrimary ml-3 text-base"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity 
              onPress={handleRegister}
              disabled={loading}
              className={`${role === 'admin' ? 'bg-danger' : 'bg-primary'} rounded-xl py-4  items-center justify-center`}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Create Account</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push('/login')} className="mt-4 items-center">
               <Text className="text-textSecondary font-medium">Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
