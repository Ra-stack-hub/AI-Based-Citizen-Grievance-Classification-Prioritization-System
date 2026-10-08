import { View, Text } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';
import CitizenDashboard from '@/components/dashboard/CitizenDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

export default function DashboardScreen() {
  const { user, token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc' }} />
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'officer';

  return (
    <View style={{ flex: 1 }}>
      {isAdmin ? <AdminDashboard /> : <CitizenDashboard />}
    </View>
  );
}
