import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
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
  LogOut
} from 'lucide-react';

const Messaging = () => {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    if (window.innerWidth < 1024) {
      setShowSidebar(false);
    }
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setShowSidebar(true);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <div className="header-modern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gradient">School Messenger</h1>
                  <p className="text-sm text-gray-500">Connect with your school community</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Bell className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Volume2 className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200 flex flex-col">
            <ChatList 
              onSelectChat={handleSelectChat} 
              selectedChatId={selectedChat?.id}
            />
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <ChatSystem 
              selectedChat={selectedChat} 
              onClose={handleCloseChat}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
                  <MessageCircle className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gradient mb-4">Welcome to School Messenger</h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Stay connected with your school community. Chat with teachers, parents, students, and staff in real-time.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="card-modern text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Group Chats</h3>
                    <p className="text-sm text-gray-600">Connect with your class, grade, or school groups</p>
                  </div>
                  
                  <div className="card-modern text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Voice & Video</h3>
                    <p className="text-sm text-gray-600">Make voice and video calls with your contacts</p>
                  </div>
                  
                  <div className="card-modern text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Secure & Private</h3>
                    <p className="text-sm text-gray-600">End-to-end encryption for all your conversations</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full btn-modern">
                    <Plus className="h-4 w-4 mr-2" />
                    Start New Conversation
                  </button>
                  <button className="w-full px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <Archive className="h-4 w-4 mr-2 inline" />
                    View Archived Chats
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Messaging Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Notifications</h4>
                  <p className="text-sm text-gray-500">Receive message notifications</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Sound</h4>
                  <p className="text-sm text-gray-500">Play sound for new messages</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Read Receipts</h4>
                  <p className="text-sm text-gray-500">Show when messages are read</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Dark Mode</h4>
                  <p className="text-sm text-gray-500">Use dark theme</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition-colors">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut className="h-4 w-4 mr-2 inline" />
                Sign Out of Messenger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messaging;
