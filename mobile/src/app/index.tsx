import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight, TextSelect, Gauge, CopyX, Image as ImageIcon, ShieldCheck } from 'lucide-react-native';

export default function LandingScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 40, paddingTop: 40 }}>
      {/* Hero Section */}
      <View className="pt-12 pb-8 px-6">
        <View className="flex-row items-center self-start bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full mb-6">
          <View className="w-2 h-2 rounded-full bg-primary mr-2" />
          <Text className="text-primary text-xs font-medium">NLP • Vision • Priority engine</Text>
        </View>

        <Text className="text-5xl font-bold text-textPrimary leading-[55px] mb-4">
          Every citizen{'\n'}complaint,{'\n'}
          <Text className="text-primary">routed in one second.</Text>
        </Text>

        <Text className="text-base text-textSecondary mb-8 leading-relaxed">
          GrievAI reads the grievance, understands the tone, checks the photo, removes duplicates and hands the right officer a ranked queue — no manual triage desk.
        </Text>

        <View className="flex-col gap-4 mb-12">
          <TouchableOpacity 
            onPress={() => router.push('/login')} 
            className="bg-primary flex-row items-center justify-center py-4 px-6 rounded-full w-full"
          >
            <Text className="text-white font-semibold mr-2 text-base">File a grievance / Login</Text>
            <ArrowRight color="#fff" size={18} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => router.push('/login')} 
            className="bg-surfaceLight py-4 px-6 rounded-full w-full items-center"
          >
            <Text className="text-textPrimary font-medium text-base">View control room</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row flex-wrap justify-between">
          <View className="w-[45%] mb-6">
            <Text className="text-3xl font-bold text-textPrimary mb-1">1,105</Text>
            <Text className="text-xs text-textSecondary">Grievances this month</Text>
          </View>
          <View className="w-[45%] mb-6">
            <Text className="text-3xl font-bold text-textPrimary mb-1">94.2%</Text>
            <Text className="text-xs text-textSecondary">Routing accuracy</Text>
          </View>
          <View className="w-[45%] mb-6">
            <Text className="text-3xl font-bold text-textPrimary mb-1">3.4 hrs</Text>
            <Text className="text-xs text-textSecondary">Median first response</Text>
          </View>
          <View className="w-[45%] mb-6">
            <Text className="text-3xl font-bold text-textPrimary mb-1">18%</Text>
            <Text className="text-xs text-textSecondary">Filtered as duplicates</Text>
          </View>
        </View>

        {/* Live Triage Feed */}
        <View className="mt-8 bg-surface  border border-borderLight rounded-2xl p-5">
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-textPrimary font-medium text-lg">Live triage feed</Text>
            <View className="flex-row items-center gap-1.5 bg-success/10 px-2 py-1 rounded-full">
              <View className="w-1.5 h-1.5 rounded-full bg-success" />
              <Text className="text-[10px] text-success font-medium">streaming</Text>
            </View>
          </View>
          
          <View className="space-y-3">
            {[
              { id: 'GRV-2481', title: 'Huge pothole on Main Street near bus depot', dept: 'Roads & Infrastructure', ward: 'Ward 12', priority: 'Critical', conf: '96%' },
              { id: 'GRV-2479', title: 'Garbage not collected for 5 days', dept: 'Sanitation & Waste', ward: 'Ward 7', priority: 'High', conf: '93%' },
              { id: 'GRV-2476', title: 'Street light flickering all night', dept: 'Electricity', ward: 'Ward 3', priority: 'Medium', conf: '88%' }
            ].map((ticket, i) => (
              <TouchableOpacity key={ticket.id} onPress={() => router.push('/login')} className="bg-surfaceLight border border-borderLight rounded-xl p-3 mb-3">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xs text-textSecondary font-mono">{ticket.id}</Text>
                  <View className={`px-2 py-0.5 rounded-full border ${
                    ticket.priority === 'Critical' ? 'bg-danger/10 border-danger/20' :
                    ticket.priority === 'High' ? 'bg-warning/10 border-warning/20' :
                    'bg-primary/10 border-primary/20'
                  }`}>
                    <Text className={`text-[10px] font-medium ${
                      ticket.priority === 'Critical' ? 'text-danger' :
                      ticket.priority === 'High' ? 'text-warning' :
                      'text-primary'
                    }`}>{ticket.priority}</Text>
                  </View>
                </View>
                <Text className="text-textPrimary text-sm font-medium mb-2" numberOfLines={1}>{ticket.title}</Text>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-[10px] text-textSecondary">{ticket.dept}</Text>
                    <Text className="text-[10px] text-textSecondary ml-1">• {ticket.ward}</Text>
                  </View>
                  <Text className="text-[10px] text-textSecondary font-mono">{ticket.conf} conf.</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Inside AI Engine */}
      <View className="px-6 py-10 bg-surface">
        <Text className="text-2xl font-bold text-textPrimary mb-2">Inside the AI engine</Text>
        <Text className="text-textSecondary mb-8 text-base">Four models run on every submission before a human ever opens the ticket.</Text>

        <View className="space-y-4">
          {[
            { icon: TextSelect, title: 'Text classification', desc: 'Transformer model reads the complaint and picks the right municipal department in under a second.' },
            { icon: Gauge, title: 'Priority scoring', desc: 'Sentiment, severity keywords and repeat-report volume combine into a Critical → Low score.' },
            { icon: CopyX, title: 'Duplicate detection', desc: 'Sentence embeddings cluster reports about the same issue so officers see one thread, not fifty.' },
            { icon: ImageIcon, title: 'Image analysis', desc: 'Vision model verifies potholes, garbage piles and waterlogging from the attached photo.' },
          ].map((item, idx) => (
            <View key={idx} className="bg-background border border-borderLight rounded-2xl p-5 mb-4">
              <View className="w-12 h-12 rounded-xl bg-surfaceLight items-center justify-center mb-4">
                <item.icon color="#1E3A8A" size={24} />
              </View>
              <Text className="text-textPrimary font-medium text-lg mb-2">{item.title}</Text>
              <Text className="text-sm text-textSecondary leading-relaxed">{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View className="px-6 py-8 border-t border-borderLight mt-4 items-center">
        <View className="flex-row items-center justify-center mb-2">
          <ShieldCheck color="#16A34A" size={16} />
          <Text className="text-xs text-textSecondary ml-1">Role-based access for citizens & officers.</Text>
        </View>
        <Text className="text-xs text-textSecondary">© 2026 GrievAI</Text>
      </View>
    </ScrollView>
  );
}
