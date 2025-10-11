import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ChatList from '../components/ChatList';
import ChatSystem from '../components/ChatSystem';
import { 
  MessageCircle, 
  Users, 
  Phone, 
  Video, 
  Settings,
  Search,
  Plus,
  Archive,
  Star,
  Pin,
  MoreVertical,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Shield,
  UserPlus,
  LogOut,
  Home,
  BookOpen,
  GraduationCap,
  School,
  Calendar,
  FileText,
  Image,
  Paperclip,
  Mic,
  Send,
  Smile,
  MapPin,
  Download,
  Trash2,
  Edit3,
  Copy,
  Forward,
  Reply,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  UserCheck,
  UserX,
  Lock,
  Globe,
  AtSign,
  Hash,
  Bookmark,
  Heart,
  ThumbsUp,
  Camera,
  Music,
  Video as VideoIcon,
  File,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Wifi,
  WifiOff,
  Battery,
  BatteryCharging
} from 'lucide-react';

const Messaging = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [recording, setRecording] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [typing, setTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState('all');
  const fileInputRef = useRef(null);

  // Mock data for demonstration
  const [chats, setChats] = useState([
    {
      id: '1',
      name: 'Grade 5A Parents',
      type: 'group',
      participants: 24,
      unread: 3,
      lastMessage: 'Field trip permission slips due tomorrow',
      timestamp: '2 min ago',
      avatar: '👨‍👩‍👧‍👦',
      pinned: true,
      muted: false,
      online: true
    },
    {
      id: '2',
      name: 'Mrs. Johnson',
      type: 'teacher',
      subject: 'Mathematics',
      unread: 0,
      lastMessage: 'Great progress on the algebra unit!',
      timestamp: '1 hour ago',
      avatar: '👩‍🏫',
      pinned: true,
      muted: false,
      online: true
    },
    {
      id: '3',
      name: 'School Administration',
      type: 'official',
      unread: 1,
      lastMessage: 'School will be closed next Friday',
      timestamp: '3 hours ago',
      avatar: '🏫',
      pinned: false,
      muted: true,
      online: false
    },
    {
      id: '4',
      name: 'Sports Team Parents',
      type: 'group',
      participants: 18,
      unread: 0,
      lastMessage: 'Practice moved to 4 PM tomorrow',
      timestamp: '5 hours ago',
      avatar: '⚽',
      pinned: false,
      muted: false,
      online: true
    },
    {
      id: '5',
      name: 'Mr. Davis - Science',
      type: 'teacher',
      subject: 'Science',
      unread: 0,
      lastMessage: 'Lab report guidelines attached',
      timestamp: '1 day ago',
      avatar: '🔬',
      pinned: false,
      muted: false,
      online: false
    }
  ]);

  const [settings, setSettings] = useState({
    notifications: true,
    sounds: true,
    readReceipts: true,
    darkMode: false,
    autoDownload: true,
    fontSize: 'medium',
    language: 'english',
    privacy: {
      lastSeen: 'everyone',
      profilePhoto: 'everyone',
      status: 'everyone'
    },
    storage: {
      used: '2.3 GB',
      total: '15 GB'
    },
    security: {
      twoFactor: false,
      appLock: false
    }
  });

  useEffect(() => {
    // Simulate typing indicator
    if (selectedChat) {
      const interval = setInterval(() => {
        setTyping(prev => !prev);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    // Mark as read
    setChats(chats.map(c => 
      c.id === chat.id ? { ...c, unread: 0 } : c
    ));
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setShowSidebar(true);
  };

  const handleNewChat = (type, participants = []) => {
    const newChat = {
      id: Date.now().toString(),
      name: type === 'group' ? 'New Group Chat' : 'New Chat',
      type: type,
      participants: participants.length,
      unread: 0,
      lastMessage: 'Start a conversation...',
      timestamp: 'Just now',
      avatar: type === 'group' ? '👥' : '💬',
      pinned: false,
      muted: false,
      online: true
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newChat);
    setShowNewChatModal(false);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachments(prev => [...prev, ...files.map(file => ({
      id: Date.now().toString(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 
            file.type.startsWith('video/') ? 'video' : 
            file.type.startsWith('audio/') ? 'audio' : 'document',
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }))]);
  };

  const startRecording = () => {
    setRecording(true);
    // In a real app, you would initialize the recording API here
  };

  const stopRecording = () => {
    setRecording(false);
    // In a real app, you would stop recording and send the audio file
  };

  const togglePin = (chatId) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat
    ));
  };

  const toggleMute = (chatId) => {
    setChats(chats.map(chat => 
      chat.id === chatId ? { ...chat, muted: !chat.muted } : chat
    ));
  };

  const archiveChat = (chatId) => {
    setChats(chats.filter(chat => chat.id !== chatId));
    if (selectedChat?.id === chatId) {
      setSelectedChat(null);
    }
  };

  const updateSettings = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter(chat => chat.pinned);
  const otherChats = filteredChats.filter(chat => !chat.pinned);

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Enhanced Header */}
      <div className={`header-modern border-b ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    School Messenger
                  </h1>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-500'}>
                      {onlineStatus ? 'Online' : 'Offline'} • {user?.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Connection Status */}
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-50 text-green-700">
                <Wifi className="h-4 w-4" />
                <span className="text-sm font-medium">Secure</span>
              </div>

              <button 
                onClick={() => setOnlineStatus(!onlineStatus)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </button>

              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Camera className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>

              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        {showSidebar && (
          <div className={`w-full lg:w-80 flex flex-col border-r ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/95 backdrop-blur-xl border-gray-200'
          }`}>
            {/* Search Bar */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages, groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <button 
                  onClick={() => handleNewChat('individual')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors flex-shrink-0"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="text-sm font-medium">New Chat</span>
                </button>
                <button 
                  onClick={() => handleNewChat('group')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors flex-shrink-0"
                >
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">New Group</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors flex-shrink-0">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Events</span>
                </button>
              </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto">
              {/* Pinned Chats */}
              {pinnedChats.length > 0 && (
                <div className="p-4">
                  <h3 className={`text-sm font-semibold mb-3 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    PINNED CHATS
                  </h3>
                  {pinnedChats.map(chat => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      isSelected={selectedChat?.id === chat.id}
                      onSelect={() => handleSelectChat(chat)}
                      onPin={() => togglePin(chat.id)}
                      onMute={() => toggleMute(chat.id)}
                      darkMode={darkMode}
                    />
                  ))}
                </div>
              )}

              {/* All Chats */}
              <div className="p-4">
                <h3 className={`text-sm font-semibold mb-3 ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  ALL CHATS
                </h3>
                {otherChats.map(chat => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChat?.id === chat.id}
                    onSelect={() => handleSelectChat(chat)}
                    onPin={() => togglePin(chat.id)}
                    onMute={() => toggleMute(chat.id)}
                    darkMode={darkMode}
                  />
                ))}
              </div>
            </div>

            {/* User Status Bar */}
            <div className={`p-4 border-t ${
              darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
            }`}>
              <div 
                className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-colors"
                onClick={() => setShowProfileModal(true)}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user?.name}
                  </p>
                  <p className={`text-sm truncate ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {onlineStatus ? 'Online' : 'Offline'}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatSystem 
              selectedChat={selectedChat}
              onClose={handleCloseChat}
              onShowGroupInfo={() => setShowGroupInfo(true)}
              darkMode={darkMode}
              typing={typing}
              attachments={attachments}
              onFileUpload={handleFileUpload}
              fileInputRef={fileInputRef}
              recording={recording}
              onStartRecording={startRecording}
              onStopRecording={stopRecording}
              emojiPicker={emojiPicker}
              onToggleEmojiPicker={() => setEmojiPicker(!emojiPicker)}
            />
          ) : (
            <EmptyState 
              onNewChat={() => setShowNewChatModal(true)}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onNewChat={handleNewChat}
          darkMode={darkMode}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdate={updateSettings}
          onClose={() => setShowSettings(false)}
          activeTab={activeSettingsTab}
          onTabChange={setActiveSettingsTab}
          darkMode={darkMode}
          onDarkModeChange={setDarkMode}
        />
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfileModal(false)}
          darkMode={darkMode}
          onlineStatus={onlineStatus}
          onOnlineStatusChange={setOnlineStatus}
        />
      )}

      {/* Group Info Modal */}
      {showGroupInfo && selectedChat && (
        <GroupInfoModal
          chat={selectedChat}
          onClose={() => setShowGroupInfo(false)}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

// Enhanced Chat List Item Component
const ChatListItem = ({ chat, isSelected, onSelect, onPin, onMute, darkMode }) => (
  <div
    className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
      isSelected
        ? darkMode
          ? 'bg-blue-600 text-white'
          : 'bg-blue-50 border border-blue-200'
        : darkMode
        ? 'hover:bg-gray-700'
        : 'hover:bg-gray-50'
    }`}
    onClick={onSelect}
  >
    <div className="relative">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg">
        {chat.avatar}
      </div>
      {chat.online && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      )}
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <h3 className={`font-semibold truncate ${
          isSelected && !darkMode ? 'text-blue-900' : 
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {chat.name}
        </h3>
        <span className={`text-xs ${
          isSelected && !darkMode ? 'text-blue-700' :
          darkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {chat.timestamp}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 mt-1">
        {chat.type === 'teacher' && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            isSelected && !darkMode ? 'bg-blue-200 text-blue-800' :
            darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
          }`}>
            {chat.subject}
          </span>
        )}
        
        {chat.type === 'group' && (
          <span className={`text-xs flex items-center space-x-1 ${
            isSelected && !darkMode ? 'text-blue-300' :
            darkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Users className="h-3 w-3" />
            <span>{chat.participants}</span>
          </span>
        )}
        
        <p className={`text-sm truncate flex-1 ${
          isSelected && !darkMode ? 'text-blue-800' :
          darkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {chat.lastMessage}
        </p>
      </div>
    </div>
    
    <div className="flex flex-col items-end space-y-1">
      {chat.unread > 0 && (
        <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
          {chat.unread}
        </span>
      )}
      
      <div className="flex items-center space-x-1">
        {chat.pinned && <Pin className="h-3 w-3 text-yellow-500" />}
        {chat.muted && <BellOff className="h-3 w-3 text-gray-500" />}
      </div>
    </div>
  </div>
);

// Empty State Component
const EmptyState = ({ onNewChat, darkMode }) => (
  <div className={`flex-1 flex items-center justify-center ${
    darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-purple-50'
  }`}>
    <div className="text-center max-w-2xl mx-auto px-6">
      <div className="w-32 h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-float">
        <MessageCircle className="h-16 w-16 text-white" />
      </div>
      
      <h2 className={`text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
        School Messenger
      </h2>
      
      <p className={`text-xl mb-12 leading-relaxed max-w-md mx-auto ${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>
        Connect securely with teachers, parents, and staff. Share updates, coordinate events, and stay informed.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <FeatureCard
          icon={<Users className="h-8 w-8" />}
          title="Class Groups"
          description="Connect with your class and grade-level groups"
          color="from-green-500 to-blue-500"
          darkMode={darkMode}
        />
        
        <FeatureCard
          icon={<Shield className="h-8 w-8" />}
          title="Secure & Private"
          description="End-to-end encryption for all school communications"
          color="from-purple-500 to-pink-500"
          darkMode={darkMode}
        />
        
        <FeatureCard
          icon={<FileText className="h-8 w-8" />}
          title="File Sharing"
          description="Share documents, images, and assignments securely"
          color="from-orange-500 to-red-500"
          darkMode={darkMode}
        />
        
        <FeatureCard
          icon={<Calendar className="h-8 w-8" />}
          title="Event Coordination"
          description="Plan and coordinate school events and activities"
          color="from-blue-500 to-teal-500"
          darkMode={darkMode}
        />
      </div>

      <div className="space-y-4 max-w-sm mx-auto">
        <button 
          onClick={onNewChat}
          className="w-full btn-modern bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Start New Conversation
        </button>
        
        <div className="grid grid-cols-2 gap-3">
          <button className={`px-4 py-3 rounded-xl border transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Video className="h-4 w-4 mr-2 inline" />
            Video Call
          </button>
          <button className={`px-4 py-3 rounded-xl border transition-colors ${
            darkMode 
              ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
            <Phone className="h-4 w-4 mr-2 inline" />
            Voice Call
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description, color, darkMode }) => (
  <div className={`p-6 rounded-2xl border transition-all duration-300 hover:scale-105 ${
    darkMode 
      ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
      : 'bg-white border-gray-200 hover:shadow-lg'
  }`}>
    <div className={`w-16 h-16 bg-gradient-to-r ${color} rounded-2xl flex items-center justify-center text-white mb-4 mx-auto`}>
      {icon}
    </div>
    <h3 className={`font-semibold text-center mb-2 ${
      darkMode ? 'text-white' : 'text-gray-900'
    }`}>
      {title}
    </h3>
    <p className={`text-sm text-center ${
      darkMode ? 'text-gray-400' : 'text-gray-600'
    }`}>
      {description}
    </p>
  </div>
);

// New Chat Modal Component
const NewChatModal = ({ onClose, onNewChat, darkMode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`w-full max-w-md rounded-2xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className={`text-lg font-semibold ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          New Conversation
        </h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-6 space-y-4">
        <button 
          onClick={() => onNewChat('individual')}
          className={`w-full p-4 rounded-xl border transition-colors text-left ${
            darkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h4 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                New Individual Chat
              </h4>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Start a private conversation
              </p>
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => onNewChat('group')}
          className={`w-full p-4 rounded-xl border transition-colors text-left ${
            darkMode 
              ? 'border-gray-600 hover:bg-gray-700' 
              : 'border-gray-200 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className={`font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Create Group Chat
              </h4>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                Start a group conversation
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
);

// Settings Modal Component (simplified for brevity)
const SettingsModal = ({ settings, onUpdate, onClose, activeTab, onTabChange, darkMode, onDarkModeChange }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`w-full max-w-4xl h-3/4 rounded-2xl flex ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      {/* Settings Sidebar */}
      <div className={`w-64 border-r ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Settings
          </h3>
        </div>
        <div className="p-4 space-y-1">
          {['general', 'privacy', 'notifications', 'storage', 'security', 'about'].map(tab => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                activeTab === tab
                  ? darkMode
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-50 text-blue-700'
                  : darkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h4 className={`text-xl font-semibold ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Settings
          </h4>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Settings content would go here */}
        <div className="space-y-6">
          <SettingToggle
            label="Dark Mode"
            description="Use dark theme across the app"
            value={darkMode}
            onChange={onDarkModeChange}
            darkMode={darkMode}
          />
          
          <SettingToggle
            label="Notifications"
            description="Receive message notifications"
            value={settings.notifications}
            onChange={(value) => onUpdate('notifications', value)}
            darkMode={darkMode}
          />
          
          <SettingToggle
            label="Read Receipts"
            description="Show when messages are read"
            value={settings.readReceipts}
            onChange={(value) => onUpdate('readReceipts', value)}
            darkMode={darkMode}
          />
        </div>
      </div>
    </div>
  </div>
);

// Setting Toggle Component
const SettingToggle = ({ label, description, value, onChange, darkMode }) => (
  <div className="flex items-center justify-between">
    <div>
      <h5 className={`font-medium ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {label}
      </h5>
      <p className={`text-sm ${
        darkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {description}
      </p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value 
          ? 'bg-blue-500' 
          : darkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  </div>
);

// Profile Modal Component (simplified)
const ProfileModal = ({ user, onClose, darkMode, onlineStatus, onOnlineStatusChange }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`w-full max-w-md rounded-2xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="p-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {user?.name}
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {user?.role} • {user?.email}
          </p>
        </div>
        
        <div className="mt-6 space-y-4">
          <button className={`w-full text-left p-3 rounded-xl transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}>
            <Edit3 className="h-4 w-4 mr-3 inline" />
            Edit Profile
          </button>
          
          <button 
            onClick={onOnlineStatusChange}
            className={`w-full text-left p-3 rounded-xl transition-colors ${
              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-3 ${
                  onlineStatus ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span>Online Status</span>
              </div>
              <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                {onlineStatus ? 'Online' : 'Offline'}
              </span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onClose}
          className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

// Group Info Modal Component (simplified)
const GroupInfoModal = ({ chat, onClose, darkMode }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`w-full max-w-md rounded-2xl ${
      darkMode ? 'bg-gray-800' : 'bg-white'
    }`}>
      <div className="p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl mx-auto mb-4">
            {chat.avatar}
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {chat.name}
          </h3>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            {chat.participants} participants • {chat.type}
          </p>
        </div>
        
        <div className="mt-6 space-y-3">
          <button className={`w-full text-left p-3 rounded-xl transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}>
            <Users className="h-4 w-4 mr-3 inline" />
            View Participants
          </button>
          
          <button className={`w-full text-left p-3 rounded-xl transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
          }`}>
            <BellOff className="h-4 w-4 mr-3 inline" />
            Mute Notifications
          </button>
          
          <button className={`w-full text-left p-3 rounded-xl text-red-600 transition-colors ${
            darkMode ? 'hover:bg-red-900' : 'hover:bg-red-50'
          }`}>
            <LogOut className="h-4 w-4 mr-3 inline" />
            Leave Group
          </button>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={onClose}
          className="w-full p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default Messaging;