import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useState } from 'react';
import { Target, Lock, User as UserIcon, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { API_URL } from '@/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'citizen' | 'admin'>('citizen');

  if (token) {
    return <Redirect href="/dashboard" />;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
      });

      const data = await response.json();

      if (response.ok) {
        const userRole = data.user?.role || role; 
        await login(data.access_token, { id: data.user?.id || '1', email, role: userRole });
        // The component will re-render and return <Redirect href="/dashboard" />
      } else {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert("Connection Error", `Failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background justify-center items-center px-6">
      <View className="items-center mb-8 mt-10">
        <View className="bg-primary/20 p-4 rounded-full mb-4  shadow-primary/20">
          <Target color="#1E3A8A" size={56} />
        </View>
        <Text className="text-4xl font-extrabold text-textPrimary tracking-tight">GrievAI</Text>
        <Text className="text-textSecondary mt-2 text-base text-center px-4">Login to continue</Text>
      </View>

      <View className="w-full max-w-sm">
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
            onPress={handleLogin}
            disabled={loading}
            className={`${role === 'admin' ? 'bg-danger' : 'bg-primary'} rounded-xl py-4  items-center justify-center`}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">{role === 'admin' ? 'Secure Admin Login' : 'Login to Continue'}</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push('/register')} className="mt-4 items-center">
             <Text className="text-primary font-medium">Don't have an account? Register</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/')} className="mt-2 items-center">
             <Text className="text-textSecondary font-medium">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
