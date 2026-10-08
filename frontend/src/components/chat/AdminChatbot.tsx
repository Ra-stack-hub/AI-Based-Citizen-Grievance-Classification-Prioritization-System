import React, { useState } from 'react';
import { Database, X, Send, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'ai', text: "System Online. I am the Admin Analytics Bot. I can fetch data, predict complaint surges, and analyze officer performance." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/chat/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: text })
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: data.reply }]);
      } else {
        throw new Error('Failed');
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "ERROR: Admin AI module offline." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-semibold py-3 px-4 sm:px-5 rounded-md shadow-lg shadow-indigo-500/20 ${isOpen ? 'hidden' : 'block'}`}
        onClick={() => setIsOpen(true)}
      >
        <Database className="w-5 h-5" />
        <span className="hidden sm:inline">Admin Terminal</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[75vh] sm:h-[550px] max-h-[650px] bg-slate-900 border border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden font-mono">
            <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between text-indigo-400">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-xs sm:text-sm">Analytics Assistant</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-md max-w-[85%] text-xs leading-relaxed ${msg.sender === 'user' ? 'bg-indigo-600/20 text-indigo-200 border border-indigo-500/30' : 'bg-slate-950 text-emerald-400 border border-slate-800 shadow-inner'}`}>
                    {msg.sender === 'ai' && <BarChart3 className="inline w-4 h-4 mr-2 mb-1" />}
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-950">
              <span className="text-indigo-500 font-bold hidden sm:inline">$</span>
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Query database..." 
                className="flex-1 p-2 bg-transparent text-slate-300 text-sm outline-none placeholder-slate-600 focus:placeholder-slate-800"
              />
              <button onClick={() => handleSend(input)} className="text-slate-500 hover:text-indigo-400 p-2"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default AdminChatbot;
