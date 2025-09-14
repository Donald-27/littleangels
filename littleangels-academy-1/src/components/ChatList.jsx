import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  Users, 
  Phone, 
  Video,
  MoreVertical,
  Settings,
  Archive,
  Star,
  Pin,
  Check,
  CheckCheck,
  Clock,
  Image,
  FileText,
  Mic
} from 'lucide-react';

const ChatList = ({ onSelectChat, selectedChatId }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateChat, setShowCreateChat] = useState(false);

  useEffect(() => {
    loadChats();
    subscribeToChats();
  }, [user]);

  const loadChats = async () => {
    try {
      setIsLoading(true);
      
      // Get chats where user is a participant
      const { data: userChats, error: userChatsError } = await supabase
        .from('chat_participants')
        .select(`
          chat_id,
          chats!inner(
            id,
            name,
            type,
            created_at,
            last_message_id,
            last_message:messages!chats_last_message_id_fkey(
              id,
              content,
              created_at,
              sender_id,
              message_type,
              sender:users!messages_sender_id_fkey(name)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (userChatsError) throw userChatsError;

      // Get unread message counts
      const chatIds = userChats?.map(uc => uc.chat_id) || [];
      const { data: unreadCounts, error: unreadError } = await supabase
        .from('messages')
        .select('chat_id')
        .in('chat_id', chatIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      if (unreadError) throw unreadError;

      // Combine data
      const chatsWithUnread = userChats?.map(uc => {
        const unreadCount = unreadCounts?.filter(ucount => ucount.chat_id === uc.chat_id).length || 0;
        return {
          ...uc.chats,
          unread_count: unreadCount
        };
      }) || [];

      setChats(chatsWithUnread);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToChats = () => {
    const subscription = supabase
      .channel(`user_chats:${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=in.(${chats.map(c => c.id).join(',')})`
      }, () => {
        loadChats(); // Reload chats when messages change
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const createNewChat = async (chatName, chatType = 'group') => {
    try {
      const { data: chat, error: chatError } = await supabase
        .from('chats')
        .insert([{
          name: chatName,
          type: chatType,
          created_by: user.id,
          school_id: user.school_id
        }])
        .select()
        .single();

      if (chatError) throw chatError;

      // Add creator as participant
      const { error: participantError } = await supabase
        .from('chat_participants')
        .insert([{
          chat_id: chat.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (participantError) throw participantError;

      setShowCreateChat(false);
      loadChats();
      toast.success('Chat created successfully');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to create chat');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const getMessageIcon = (messageType) => {
    switch (messageType) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'file': return <FileText className="h-4 w-4" />;
      case 'voice': return <Mic className="h-4 w-4" />;
      default: return null;
    }
  };

  const getMessageStatus = (message) => {
    if (!message || message.sender_id !== user.id) return null;
    
    if (message.read_at) return <CheckCheck className="h-4 w-4 text-blue-500" />;
    if (message.delivered_at) return <CheckCheck className="h-4 w-4 text-gray-400" />;
    return <Check className="h-4 w-4 text-gray-400" />;
  };

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gradient">Messages</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateChat(true)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No chats yet</h3>
            <p className="text-gray-500 mb-4">Start a conversation with your school community</p>
            <button
              onClick={() => setShowCreateChat(true)}
              className="btn-modern"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start New Chat
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center space-x-3 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {chat.name.charAt(0).toUpperCase()}
                  </div>
                  {chat.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {chat.unread_count > 9 ? '9+' : chat.unread_count}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chat.name}</h3>
                    <div className="flex items-center space-x-1">
                      {chat.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.last_message.created_at)}
                        </span>
                      )}
                      {getMessageStatus(chat.last_message)}
                    </div>
                  </div>
                  
                  {chat.last_message ? (
                    <div className="flex items-center space-x-2">
                      {getMessageIcon(chat.last_message.message_type)}
                      <p className="text-sm text-gray-600 truncate">
                        {chat.last_message.sender_id === user.id ? 'You: ' : ''}
                        {chat.last_message.content || `${chat.last_message.message_type} message`}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No messages yet</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Chat</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chat Name</label>
                <input
                  type="text"
                  placeholder="Enter chat name..."
                  className="input-modern"
                  id="chatName"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chat Type</label>
                <select className="input-modern" id="chatType">
                  <option value="group">Group Chat</option>
                  <option value="channel">Channel</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateChat(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const name = document.getElementById('chatName').value;
                  const type = document.getElementById('chatType').value;
                  if (name.trim()) {
                    createNewChat(name.trim(), type);
                  }
                }}
                className="btn-modern"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatList;
