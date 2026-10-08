import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CitizenChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', sender: 'ai', text: "Namaste! I am the Citizen Support Bot. I can help you report issues like water leaks, potholes, and track your complaints." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'user', text }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/chat/citizen', {
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
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'ai', text: "Error: Could not connect to AI backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 sm:px-5 rounded-full shadow-lg ${isOpen ? 'hidden' : 'block'}`}
        onClick={() => setIsOpen(true)}
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Citizen Help</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[350px] h-[75vh] sm:h-[500px] max-h-[600px] bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-blue-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold text-sm sm:text-base">Citizen Support</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-blue-700 rounded-full p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-xl max-w-[85%] text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-700 dark:text-white border dark:border-gray-600 rounded-bl-none shadow-sm'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask for help..." 
                className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <button onClick={() => handleSend(input)} className="text-blue-600 p-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-full"><Send className="w-5 h-5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default CitizenChatbot;
