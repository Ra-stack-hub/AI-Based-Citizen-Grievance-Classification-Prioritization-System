import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { Send, Camera, Bot, User, CheckCircle2, AlertTriangle, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isCard?: boolean;
  cardData?: any;
};

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I am the GrievAI AI Agent. Please describe the civic issue you are facing. (You can type in English, Hindi, or Hinglish)",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(1);
  const scrollViewRef = useRef<ScrollView>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    Keyboard.dismiss();

    // Simulate Agentic AI reasoning process
    setTimeout(() => {
      setIsTyping(false);
      
      if (step === 1) {
        // AI asks for missing information
        const aiMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: "I understand there is an issue. To process this effectively and route it to the correct department, could you please provide the exact location or your ward number?",
        };
        setMessages(prev => [...prev, aiMsg]);
        setStep(2);
      } else if (step === 2) {
        // AI finalizes and shows summary card
        const aiMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: "Thank you. I have analyzed your complaint, assigned a priority, and prepared a structured grievance for the municipal officers. Your complaint has been assigned to the concerned department.",
          isCard: true,
          cardData: {
            id: `GRV-${Math.floor(1000 + Math.random() * 9000)}`,
            category: "Solid Waste / Sanitation",
            priority: "High",
            department: "Solid Waste Management Department",
            status: "Pending Officer Approval"
          }
        };
        setMessages(prev => [...prev, aiMsg]);
        setStep(3);
      } else {
        // Default reply after completion
        const aiMsg: Message = {
          id: Date.now().toString(),
          sender: 'ai',
          text: "If you have another issue to report, you can describe it below. Or you can track your existing complaint.",
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    }, 1500);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-background">
      {/* Header */}
      <View className="bg-surface  border-b border-borderLight px-4 py-4 pt-12 flex-row items-center justify-between z-10">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <ChevronLeft color="#475569" size={24} />
          </TouchableOpacity>
          <View className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <Bot color="#1E3A8A" size={18} />
          </View>
          <View>
            <Text className="text-textPrimary font-bold text-[15px]">GrievAI AI Assistant</Text>
            <View className="flex-row items-center">
              <View className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              <Text className="text-[10px] text-success font-medium tracking-wide uppercase">Online</Text>
            </View>
          </View>
        </View>
        <View className="px-2.5 py-1 bg-surfaceLight rounded-full border border-borderLight">
          <Text className="text-[10px] text-textSecondary font-bold tracking-wider">AGENTIC AI</Text>
        </View>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 bg-background px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View key={msg.id} className={`mb-4 flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <View className={`flex-row max-w-[85%] ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              
              {msg.sender === 'ai' && (
                <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1">
                  <Bot color="#1E3A8A" size={14} />
                </View>
              )}

              <View className="flex-col max-w-[90%]">
                <View className={`px-4 py-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-primary rounded-tr-sm ' 
                    : 'bg-surfaceLight border border-borderLight rounded-tl-sm'
                }`}>
                  <Text className={`text-sm leading-relaxed ${msg.sender === 'user' ? 'text-white' : 'text-textPrimary'}`}>
                    {msg.text}
                  </Text>
                </View>

                {msg.isCard && msg.cardData && (
                  <View className="bg-surface  border border-borderLight rounded-xl p-4 mt-2 w-full">
                    <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-borderLight">
                      <Text className="text-[10px] text-textSecondary font-mono tracking-wider font-bold">TICKET GENERATED</Text>
                      <Text className="text-textPrimary font-mono font-bold text-xs">{msg.cardData.id}</Text>
                    </View>
                    
                    <View className="space-y-3 mb-4">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-textSecondary">Category</Text>
                        <Text className="text-xs text-textPrimary font-medium max-w-[65%] text-right">{msg.cardData.category}</Text>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-textSecondary">Priority Score</Text>
                        <View className="px-2 py-0.5 rounded border bg-danger/10 border-danger/20 flex-row items-center">
                          <AlertTriangle color="#DC2626" size={10} className="mr-1" />
                          <Text className="text-[10px] font-bold text-danger tracking-wider uppercase">{msg.cardData.priority}</Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xs text-textSecondary">Routed to</Text>
                        <Text className="text-xs text-textPrimary font-medium max-w-[65%] text-right">{msg.cardData.department}</Text>
                      </View>
                    </View>
                    
                    <View className="bg-surfaceLight rounded-lg p-2.5 flex-row items-center mb-4 border border-borderLight">
                      <CheckCircle2 color="#16A34A" size={14} className="mr-2" />
                      <Text className="text-[10px] text-textSecondary flex-1 leading-relaxed">Assigned officer notified for human-in-the-loop verification.</Text>
                    </View>

                    <TouchableOpacity 
                      onPress={() => router.push('/track')}
                      className="w-full py-3 bg-primary/10 border border-primary/20 rounded-xl items-center"
                    >
                      <Text className="text-primary text-xs font-bold uppercase tracking-wider">Track Status</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {msg.sender === 'user' && (
                <View className="w-8 h-8 rounded-full bg-surfaceLight flex items-center justify-center ml-2 mt-1 border border-borderLight">
                  <User color="#475569" size={14} />
                </View>
              )}
            </View>
          </View>
        ))}

        {isTyping && (
          <View className="flex-row items-end mb-4">
            <View className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mb-1">
              <Bot color="#1E3A8A" size={14} />
            </View>
            <View className="px-5 py-4 rounded-2xl rounded-tl-sm bg-surfaceLight border border-borderLight flex-row items-center space-x-1.5">
              <View className="w-1.5 h-1.5 rounded-full bg-textSecondary" />
              <View className="w-1.5 h-1.5 rounded-full bg-textSecondary opacity-75" />
              <View className="w-1.5 h-1.5 rounded-full bg-textSecondary opacity-50" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <View className="bg-surface border-t border-borderLight p-4 pb-8">
        <View className="flex-row items-center relative">
          <TouchableOpacity className="absolute left-3 z-10 p-2">
            <Camera color="#94a3b8" size={20} />
          </TouchableOpacity>
          
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Describe issue (e.g. Kachra nahi utha...)"
            placeholderTextColor="#94a3b8"
            className="flex-1 bg-surfaceLight border border-borderLight rounded-full py-3.5 pl-12 pr-14 text-textPrimary text-sm h-[50px]"
            onSubmitEditing={handleSend}
          />
          
          <TouchableOpacity 
            onPress={handleSend}
            disabled={!input.trim()}
            className={`absolute right-1.5 p-2.5 rounded-full ${input.trim() ? 'bg-primary' : 'bg-transparent'}`}
          >
            <Send color={input.trim() ? '#fff' : '#94a3b8'} size={input.trim() ? 16 : 20} />
          </TouchableOpacity>
        </View>
        <Text className="text-center text-[10px] text-textSecondary mt-3 font-medium tracking-wider uppercase">
          Powered by Generative AI • Multilingual (EN/HI)
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}
