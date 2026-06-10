'use client';

import React, { useState, useRef, useEffect } from 'react';
import { api } from '@/lib/api';
import { MessageSquare, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Namaste! I am your DVYUG Vedic Wellness Assistant. I can help guide you with Ayurvedic tips, recommend products matching your body type (Dosha), or answer FAQs. How may I assist your well-being journey today?'
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { sender: 'user', text: textToSend }]);
    setMessage('');
    setLoading(true);

    try {
      // Fetch response from Express AI Chatbot
      const res = await api.ai.chat({ message: textToSend });
      if (res.success && res.message) {
        setChatHistory((prev) => [...prev, { sender: 'bot', text: res.message }]);
      } else {
        setChatHistory((prev) => [
          ...prev,
          { sender: 'bot', text: 'I apologize, but my spiritual channel is currently blocked. Please try asking again shortly!' }
        ]);
      }
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: 'bot', text: 'I apologize, but my spiritual channel is currently blocked. Please try asking again shortly!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply);
  };

  const quickReplies = [
    'Ayurvedic Doshas',
    'Immunity Herbs',
    'What is Bilona Ghee?',
    'Track Order'
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      
      {/* Chat Bubble Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2D5A27] text-white hover:bg-[#2D5A27]/95 shadow-xl hover:scale-105 transition-all duration-300 relative group animate-bounce"
          aria-label="Chat with AI Wellness Assistant"
        >
          <MessageSquare className="w-6 h-6" />
          <Sparkles className="w-4 h-4 text-[#C9A227] absolute -top-1 -right-1" />
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-[#2B2B2B] text-white text-[10px] py-1.5 px-3 rounded shadow-md transition-all duration-200 whitespace-nowrap">
            Ask wellness coach
          </span>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] rounded-2xl glass-panel shadow-2xl flex flex-col overflow-hidden animate-slide-up border border-[#F5EFE2]">
          
          {/* Chat Header */}
          <div className="bg-[#2D5A27] text-[#FAF8F2] p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#FAF8F2]/10 rounded-full">
                <Sparkles className="w-4 h-4 text-[#C9A227]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-wide">Vedic Wellness Coach</h3>
                <span className="text-[10px] text-[#F5EFE2]/75 font-light">Online &bull; DVYUG AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#FAF8F2]/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Scrolling Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F2]/50">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#2D5A27] text-white rounded-tr-none'
                      : 'bg-[#F5EFE2] text-[#2B2B2B] rounded-tl-none border border-[#e5dfd2]'
                  }`}
                >
                  {msg.text.split('\n').map((line, key) => (
                    <span key={key} className="block mt-0.5">{line}</span>
                  ))}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#F5EFE2] text-[#2B2B2B]/70 rounded-2xl rounded-tl-none p-3 text-xs border border-[#e5dfd2] flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D5A27]" />
                  <span>Consulting ancient scriptures...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Quick Reply Pills */}
          {chatHistory.length < 5 && !loading && (
            <div className="px-4 py-2 flex gap-1.5 overflow-x-auto bg-[#FAF8F2] border-t border-[#F5EFE2]/60 scrollbar-none">
              {quickReplies.map((pill) => (
                <button
                  key={pill}
                  onClick={() => handleQuickReply(pill)}
                  className="flex-shrink-0 text-[10px] font-medium text-[#2D5A27] bg-[#F5EFE2] hover:bg-[#2D5A27] hover:text-white px-3 py-1.5 rounded-full transition-all duration-200 border border-[#e0dacd] cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(message);
            }}
            className="p-3 bg-[#FAF8F2] border-t border-[#F5EFE2] flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about herbs, doshas, etc..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 bg-[#F5EFE2]/60 text-xs px-3 py-2.5 rounded-full border border-[#e5dfd2] focus:outline-none focus:ring-1 focus:ring-[#2D5A27] focus:bg-[#FAF8F2] text-[#2B2B2B]"
            />
            <button
              type="submit"
              disabled={!message.trim() || loading}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2D5A27] text-white hover:bg-[#2D5A27]/90 disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
      
    </div>
  );
};
