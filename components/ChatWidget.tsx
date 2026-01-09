import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { getGeminiRecommendation } from '../services/geminiService';
import { Manhua } from '../types';

interface ChatWidgetProps {
  apiKey: string;
  manhuas: Manhua[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ apiKey, manhuas }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'سڵاو! من یاریدەدەری KurdManhua م. چۆن دەتوانم یارمەتیت بدەم؟' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const reply = await getGeminiRecommendation(apiKey, userMsg, manhuas);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'کێشەیەک هەیە لە کلیلەکەی API.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-80 md:w-96 h-[500px] glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Bot className="text-indigo-400" />
          <h3 className="font-bold text-white">یاریدەدەری زیرەک</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-6 ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-700 text-slate-200 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-end">
             <div className="bg-slate-700 text-slate-200 p-3 rounded-xl rounded-bl-none text-xs animate-pulse">
               دەنووسێت...
             </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="پرسیارێک بکە..."
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white p-2 rounded-lg transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
      
      {!apiKey && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center p-6 text-center z-10">
          <p className="text-red-400 mb-2 font-bold">API Key نەدۆزرایەوە</p>
          <p className="text-sm text-slate-400">تکایە لە بەشی ڕێکخستنەکان Gemini API Key زیاد بکە.</p>
          <button onClick={() => setIsOpen(false)} className="mt-4 bg-slate-700 px-4 py-2 rounded text-sm">داخستن</button>
        </div>
      )}
    </div>
  );
};