import { useState } from 'react';
import { MessageSquare, Search, Send, Phone, Video, MoreVertical } from 'lucide-react';
import { useMode } from '../context/ModeContext';

// Mock conversations
const mockConversations = [
  {
    id: 1,
    name: 'Sarah Chen',
    role: 'Property Manager',
    property: 'Modern Loft in Downtown',
    avatar: 'SC',
    lastMessage: 'The property is available for viewing this weekend.',
    timestamp: '2 hours ago',
    unread: 2,
  },
  {
    id: 2,
    name: 'Marcus Johnson',
    role: 'Landlord',
    property: 'Cozy Studio Near Transit',
    avatar: 'MJ',
    lastMessage: 'Your application has been approved!',
    timestamp: '1 day ago',
    unread: 0,
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Real Estate Agent',
    property: 'Victorian Townhouse',
    avatar: 'ER',
    lastMessage: 'I can arrange a private showing for you.',
    timestamp: '3 days ago',
    unread: 0,
  },
];

const mockMessages = [
  {
    id: 1,
    senderId: 'other',
    text: 'Hi! I saw you were interested in the Modern Loft in Downtown.',
    timestamp: '10:30 AM',
  },
  {
    id: 2,
    senderId: 'me',
    text: 'Yes! I love the location and the amenities. Is it still available?',
    timestamp: '10:32 AM',
  },
  {
    id: 3,
    senderId: 'other',
    text: 'The property is available for viewing this weekend.',
    timestamp: '10:35 AM',
  },
];

export default function MessagesPage() {
  const { colors } = useMode();
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      // In real app, send message via API
      console.log('Sending:', message);
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 h-full">
            {/* Conversations List */}
            <div className="border-r border-slate-100">
              {/* Search */}
              <div className="p-4 border-b border-slate-100">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="overflow-y-auto h-[calc(100%-65px)]">
                {mockConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left ${
                      selectedConversation?.id === conv.id ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full ${colors.primaryBg} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-slate-800 truncate">{conv.name}</h4>
                        <span className="text-xs text-slate-400">{conv.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1">{conv.property}</p>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className={`w-5 h-5 rounded-full ${colors.primaryBg} text-white text-xs flex items-center justify-center`}>
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${colors.primaryBg} flex items-center justify-center text-white font-semibold`}>
                        {selectedConversation.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-800">{selectedConversation.name}</h3>
                        <p className="text-xs text-slate-500">{selectedConversation.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                        <Phone size={20} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                        <Video size={20} />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Property Context */}
                  <div className={`px-4 py-2 ${colors.primaryBgLight} border-b border-slate-100`}>
                    <p className={`text-sm ${colors.primaryText}`}>
                      Re: <span className="font-medium">{selectedConversation.property}</span>
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            msg.senderId === 'me'
                              ? `${colors.primaryBg} text-white`
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === 'me' ? 'text-white/70' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <button
                        onClick={handleSend}
                        className={`p-3 ${colors.primaryBg} text-white rounded-xl hover:opacity-90 transition-opacity`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-center">
                      🔒 End-to-end encrypted. Your contact info stays private.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div>
                    <MessageSquare size={48} className="text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-800 mb-2">Select a conversation</h3>
                    <p className="text-slate-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
