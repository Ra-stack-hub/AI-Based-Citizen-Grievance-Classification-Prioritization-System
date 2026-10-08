import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Camera, Mic, ChevronDown, CheckCircle2, AlertTriangle, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Action = {
  label: string;
  type: string;
  payload?: any;
};

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actions?: Action[];
  isCard?: boolean;
  cardData?: any;
};

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am GrievAI AI. I can help you file a complaint, track an existing complaint, understand its priority, or answer grievance-related questions.",
      actions: [
        { label: 'File a Complaint', type: 'QUICK_REPLY', payload: 'File a Complaint' },
        { label: 'Track Complaint', type: 'QUICK_REPLY', payload: 'Track Complaint' },
        { label: 'My Complaints', type: 'QUICK_REPLY', payload: 'My Complaints' },
        { label: 'Department Help', type: 'QUICK_REPLY', payload: 'Department Help' }
      ]
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isOpen]);

  const handleVoiceInput = () => {
    // @ts-ignore - Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in your browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Default to Indian English, which handles Hinglish decently
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Call Backend API
    try {
      const token = localStorage.getItem('token') || '';
      
      const response = await fetch('http://localhost:8000/api/v1/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text, conversation_id: 'local_conv_1' })
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      
      setIsTyping(false);
      const aiMsg: Message = {
        id: Date.now().toString(),
        sender: 'ai',
        text: data.message,
        actions: data.actions,
        isCard: data.is_card,
        cardData: data.card_data
      };
      setMessages(prev => [...prev, aiMsg]);
      
    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        text: "I'm unable to connect to the server right now. Make sure you are logged in."
      }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary hover:bg-accent text-background font-semibold py-3 px-5 rounded-full shadow-lg shadow-primary/30 transition-transform ${isOpen ? 'scale-0' : 'scale-100'}`}
        onClick={() => setIsOpen(true)}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">GrievAI AI</span>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-48px)] bg-background border border-borderLight rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-surface/90 backdrop-blur border-b border-borderLight p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-background"></span>
                </div>
                <div>
                  <h3 className="text-textPrimary font-medium text-sm">GrievAI AI</h3>
                  <p className="text-xs text-textSecondary">Your Grievance Assistant</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-textSecondary hover:text-textPrimary p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surfaceLight/5">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center mt-1 ${
                      msg.sender === 'user' ? 'bg-surfaceLight/50' : 'bg-primary/20'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-3 h-3 text-textPrimary" /> : <Bot className="w-3 h-3 text-primary" />}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-background rounded-tr-none' 
                        : 'bg-surfaceLight shadow-sm text-textPrimary rounded-tl-none border border-borderLight'
                    }`}>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                  
                  {/* Actions / Buttons below AI message */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2 ml-8 flex flex-wrap gap-2 max-w-[85%]">
                      {msg.actions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(action.payload)}
                          className="bg-surfaceLight hover:bg-primary/20 text-textSecondary hover:text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-borderLight transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 shrink-0 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-surfaceLight shadow-sm border border-borderLight flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-surface/90 backdrop-blur border-t border-borderLight shrink-0">
              <div className="relative flex items-end bg-surfaceLight border border-borderLight rounded-2xl">
                <button className="text-textSecondary hover:text-textPrimary p-3 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent py-3 px-1 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none resize-none max-h-32 min-h-[44px]"
                  rows={1}
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={!input.trim()}
                  className={`p-3 transition-colors ${
                    input.trim() ? 'text-primary' : 'text-textSecondary'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
                <button 
                  onClick={handleVoiceInput}
                  className={`p-3 transition-colors ${isListening ? 'text-danger animate-pulse' : 'text-textSecondary hover:text-textPrimary'}`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingChatbot;
