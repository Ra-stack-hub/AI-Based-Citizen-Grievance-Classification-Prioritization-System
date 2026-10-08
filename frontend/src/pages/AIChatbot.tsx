import { useState, useRef, useEffect } from 'react';
import { Send, Camera, Bot, User, CheckCircle2, AlertTriangle, Paperclip, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Message = {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  isCard?: boolean;
  cardData?: any;
};

const AIChatbot = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background flex justify-center py-6 lg:py-12 px-4">
      <div className="w-full max-w-3xl flex flex-col h-[calc(100vh-140px)] border border-borderLight rounded-2xl overflow-hidden bg-surface/30">
        
        {/* Chat Header */}
        <div className="bg-surface shadow-md backdrop-blur-sm border-b border-borderLight px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-textPrimary font-medium">GrievAI AI Assistant</h2>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <div className="text-xs text-textSecondary px-3 py-1 bg-surfaceLight rounded-full border border-borderLight">
            Agentic Workflow Active
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                
                {/* Avatar */}
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center mt-1 ${
                  msg.sender === 'user' ? 'bg-surfaceLight/50' : 'bg-primary/20'
                }`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4 text-textPrimary" /> : <Bot className="w-4 h-4 text-primary" />}
                </div>
                
                {/* Message Bubble */}
                <div className="flex flex-col gap-2">
                  <div className={`px-4 py-3 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-background rounded-tr-none' 
                      : 'bg-surfaceLight shadow-sm text-textPrimary rounded-tl-none border border-borderLight'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                  
                  {/* Rich Card from AI */}
                  {msg.isCard && msg.cardData && (
                    <div className="bg-surfaceLight border border-borderLight rounded-xl p-5 w-full mt-2 shadow-lg">
                      <div className="flex justify-between items-center mb-4 pb-4 border-b border-borderLight">
                        <span className="text-xs text-textSecondary font-mono font-medium tracking-wider">TICKET GENERATED</span>
                        <span className="text-textPrimary font-mono font-bold">{msg.cardData.id}</span>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-textSecondary">Category</span>
                          <span className="text-textPrimary font-medium">{msg.cardData.category}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-textSecondary">AI Priority Score</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-danger/10 text-danger border border-danger/20 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> {msg.cardData.priority}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-textSecondary">Routed to</span>
                          <span className="text-textPrimary font-medium">{msg.cardData.department}</span>
                        </div>
                      </div>
                      
                      <div className="bg-surface shadow-sm rounded-lg p-3 flex items-center gap-3 text-xs mb-4 border border-borderLight">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-textSecondary">The assigned officer has been notified for human-in-the-loop verification.</span>
                      </div>

                      <Link 
                        to="/track" 
                        className="block w-full py-2.5 bg-surfaceLight hover:bg-surfaceLight text-textPrimary text-center text-sm font-medium rounded-lg transition-colors border border-borderLight"
                      >
                        Track Status
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] flex-row">
                <div className="w-8 h-8 shrink-0 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="px-4 py-3.5 rounded-2xl rounded-tl-none bg-surfaceLight shadow-sm border border-borderLight flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-textSecondary animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-surface shadow-sm border-t border-borderLight p-4">
          <div className="relative flex items-center">
            <button className="absolute left-3 text-textSecondary hover:text-textPrimary transition-colors p-2 rounded-full hover:bg-surfaceLight">
              <Camera className="w-5 h-5" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe the issue (e.g., Hamare ward mein kachra nahi utha hai...)"
              className="w-full bg-surfaceLight border border-borderLight rounded-full py-4 pl-14 pr-14 text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none overflow-hidden h-[54px] leading-[22px]"
              rows={1}
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className={`absolute right-2 p-2 rounded-full transition-all ${
                input.trim() 
                  ? 'bg-primary text-background hover:scale-105' 
                  : 'bg-surfaceLight text-textSecondary'
              }`}
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
          <div className="text-center mt-2 text-[10px] text-textSecondary flex justify-center items-center gap-3">
             <span>Powered by NLP & Generative AI</span>
             <span className="w-1 h-1 rounded-full bg-white/20"></span>
             <span>Multilingual (EN/HI)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIChatbot;
