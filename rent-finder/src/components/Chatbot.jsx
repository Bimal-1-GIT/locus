import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Mountain, Sparkles, Home, FileText, DollarSign, HelpCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Nepali Theme Colors
const NEPALI = {
  primary: '#8B0000',
  primaryDark: '#5C0000',
  primaryLight: '#A52A2A',
  gold: '#D4AF37',
  goldLight: '#F4D87C',
  saffron: '#FF9933',
  cream: '#FDF5E6',
  creamDark: '#F5E6D3',
  brown: '#CD853F',
  text: '#2F1810',
  textMuted: '#6B4423',
  white: '#FFFAF0',
};

// Quick action buttons configuration
const QUICK_ACTIONS = [
  { id: 'find', label: 'Find Property', icon: Home, message: 'I want to find a property in Nepal' },
  { id: 'list', label: 'List Property', icon: FileText, message: 'How do I list my property for sale or rent?' },
  { id: 'pricing', label: 'Pricing Info', icon: DollarSign, message: 'What are typical property prices in Nepal?' },
  { id: 'help', label: 'How It Works', icon: HelpCircle, message: 'How does Locus work?' },
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'नमस्ते! 🙏 Welcome to Locus Assistant!\n\nI\'m here to help you find your perfect property in Nepal. How can I assist you today?',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const location = useLocation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setHasUnread(false);
    }
  }, [isOpen]);

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          conversationHistory,
          currentPage: location.pathname,
        }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response || 'I apologize, but I encountered an issue. Please try again.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'माफ गर्नुहोस्! I\'m having trouble connecting right now. Please try again in a moment. 🙏',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickAction = (action) => {
    sendMessage(action.message);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        style={{
          background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)`,
          boxShadow: `0 4px 20px rgba(139, 0, 0, 0.4)`,
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X size={24} color={NEPALI.cream} />
        ) : (
          <>
            <Mountain size={24} color={NEPALI.gold} />
            {hasUnread && (
              <span 
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full animate-pulse"
                style={{ backgroundColor: NEPALI.gold }}
              />
            )}
          </>
        )}
        
        {/* Decorative ring */}
        <span 
          className="absolute inset-0 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
          style={{ border: `2px solid ${NEPALI.gold}` }}
        />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            height: 'min(600px, calc(100vh - 140px))',
            backgroundColor: NEPALI.cream,
            border: `3px solid ${NEPALI.gold}`,
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center gap-3 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)`,
            }}
          >
            {/* Decorative mountain pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 L50 50 L10 50 Z' fill='%23D4AF37'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
                backgroundPosition: 'bottom',
              }}
            />
            
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center relative"
              style={{ 
                backgroundColor: NEPALI.cream,
                border: `2px solid ${NEPALI.gold}`,
              }}
            >
              <Mountain size={24} style={{ color: NEPALI.primary }} />
              <Sparkles 
                size={12} 
                className="absolute -top-1 -right-1"
                style={{ color: NEPALI.gold }}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white flex items-center gap-2">
                Locus Assistant
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: NEPALI.gold, color: NEPALI.primaryDark }}>
                  AI
                </span>
              </h3>
              <p className="text-sm" style={{ color: NEPALI.goldLight }}>
                लोकस सहायक • Always here to help
              </p>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full transition-colors hover:bg-white/10"
            >
              <X size={20} color={NEPALI.cream} />
            </button>
          </div>

          {/* Quick Actions */}
          <div 
            className="p-3 flex gap-2 overflow-x-auto scrollbar-hide"
            style={{ 
              backgroundColor: NEPALI.creamDark,
              borderBottom: `2px solid ${NEPALI.gold}`,
            }}
          >
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all hover:scale-105"
                style={{
                  backgroundColor: NEPALI.white,
                  color: NEPALI.primary,
                  border: `1.5px solid ${NEPALI.brown}`,
                }}
              >
                <action.icon size={14} />
                {action.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: NEPALI.cream }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.type === 'user' ? 'rounded-br-md' : 'rounded-bl-md'
                  }`}
                  style={{
                    backgroundColor: message.type === 'user' ? NEPALI.primary : NEPALI.white,
                    color: message.type === 'user' ? NEPALI.cream : NEPALI.text,
                    border: message.type === 'user' ? 'none' : `2px solid ${NEPALI.gold}`,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p 
                    className="text-xs mt-1.5 opacity-60"
                    style={{ 
                      color: message.type === 'user' ? NEPALI.goldLight : NEPALI.textMuted 
                    }}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div 
                  className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2"
                  style={{
                    backgroundColor: NEPALI.white,
                    border: `2px solid ${NEPALI.gold}`,
                  }}
                >
                  <div className="flex gap-1">
                    <span 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: NEPALI.primary, animationDelay: '0ms' }}
                    />
                    <span 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: NEPALI.primary, animationDelay: '150ms' }}
                    />
                    <span 
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{ backgroundColor: NEPALI.primary, animationDelay: '300ms' }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: NEPALI.textMuted }}>
                    typing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form 
            onSubmit={handleSubmit}
            className="p-4 flex gap-3"
            style={{ 
              backgroundColor: NEPALI.creamDark,
              borderTop: `2px solid ${NEPALI.gold}`,
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message... (English or नेपाली)"
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: NEPALI.white,
                border: `2px solid ${NEPALI.brown}`,
                color: NEPALI.text,
              }}
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              style={{
                background: inputValue.trim() 
                  ? `linear-gradient(135deg, ${NEPALI.primary} 0%, ${NEPALI.primaryDark} 100%)`
                  : NEPALI.creamDark,
                border: `2px solid ${inputValue.trim() ? NEPALI.primary : NEPALI.brown}`,
              }}
            >
              {isTyping ? (
                <Loader2 size={20} className="animate-spin" style={{ color: NEPALI.textMuted }} />
              ) : (
                <Send size={20} style={{ color: inputValue.trim() ? NEPALI.cream : NEPALI.textMuted }} />
              )}
            </button>
          </form>

          {/* Footer */}
          <div 
            className="px-4 py-2 text-center"
            style={{ backgroundColor: NEPALI.primary }}
          >
            <p className="text-xs" style={{ color: NEPALI.goldLight }}>
              🏔️ Powered by Locus • Made in Nepal 🇳🇵
            </p>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
