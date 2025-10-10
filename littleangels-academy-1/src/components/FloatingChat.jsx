import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatList from './ChatList';
import ChatSystem from './ChatSystem';

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSelectedChat(null);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform duration-200 group"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-8 w-8 text-white" />
        ) : (
          <MessageCircle className="h-8 w-8 text-white group-hover:animate-pulse" />
        )}
        {/* Notification Badge */}
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
          3
        </div>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-semibold text-lg">Messages</h3>
                  <p className="text-xs text-white/80">Stay connected with your school</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 flex overflow-hidden bg-gray-50">
            {!selectedChat ? (
              <div className="w-full">
                <ChatList 
                  onSelectChat={handleSelectChat} 
                  selectedChatId={selectedChat?.id}
                />
              </div>
            ) : (
              <div className="w-full">
                <ChatSystem 
                  selectedChat={selectedChat} 
                  onClose={handleCloseChat}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;
