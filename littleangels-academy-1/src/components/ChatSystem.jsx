import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Phone, 
  Video, 
  MoreVertical,
  Search,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  Image,
  FileText,
  Mic,
  MicOff,
  X
} from 'lucide-react';

const ChatSystem = ({ selectedChat, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      loadMessages();
      subscribeToMessages();
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!selectedChat) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey(name, avatar, role),
          attachments(*)
        `)
        .eq('chat_id', selectedChat.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const subscribeToMessages = () => {
    if (!selectedChat) return;

    const subscription = supabase
      .channel(`messages:${selectedChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${selectedChat.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const messageData = {
        chat_id: selectedChat.id,
        sender_id: user.id,
        content: newMessage.trim(),
        message_type: 'text',
        attachments: attachments.map(att => att.id)
      };

      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      setAttachments([]);
      
      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      uploadFile(file);
    });
  };

  const uploadFile = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `chat-attachments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('attachments')
        .getPublicUrl(filePath);

      const { data: attachment, error: attachmentError } = await supabase
        .from('attachments')
        .insert([{
          file_name: file.name,
          file_path: filePath,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user.id
        }])
        .select()
        .single();

      if (attachmentError) throw attachmentError;

      setAttachments(prev => [...prev, attachment]);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    // Voice recording implementation would go here
  };

  const stopRecording = () => {
    setIsRecording(false);
    // Stop recording and send voice message
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  const getMessageStatus = (message) => {
    if (message.sender_id === user.id) {
      if (message.read_at) return <CheckCheck className="h-4 w-4 text-blue-500" />;
      if (message.delivered_at) return <CheckCheck className="h-4 w-4 text-gray-400" />;
      return <Check className="h-4 w-4 text-gray-400" />;
    }
    return null;
  };

  const renderMessage = (message, index) => {
    const isOwn = message.sender_id === user.id;
    const prevMessage = messages[index - 1];
    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id;

    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {!isOwn && showAvatar && (
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold mr-2">
              {message.sender?.name?.charAt(0) || 'U'}
            </div>
          )}
          {!isOwn && !showAvatar && <div className="w-8 mr-2" />}
          
          <div className={`chat-bubble ${isOwn ? 'chat-bubble-sent' : 'chat-bubble-received'}`}>
            <div className="flex flex-col">
              {!isOwn && showAvatar && (
                <div className="text-xs text-gray-500 mb-1">{message.sender?.name}</div>
              )}
              <div className="text-sm">{message.content}</div>
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-white/20 rounded-lg">
                      {attachment.file_type.startsWith('image/') ? (
                        <Image className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                      <span className="text-xs truncate">{attachment.file_name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className={`flex items-center justify-end mt-1 space-x-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                <span className="text-xs">{formatTime(message.created_at)}</span>
                {getMessageStatus(message)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <Send className="h-12 w-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Chat</h3>
          <p className="text-gray-500">Choose a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {selectedChat.name?.charAt(0) || 'C'}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{selectedChat.name}</h3>
            <p className="text-sm text-gray-500">
              {selectedChat.participants?.length || 0} participants
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Phone className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Video className="h-5 w-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((message, index) => renderMessage(message, index))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble chat-bubble-received">
              <div className="flex items-center space-x-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-xs text-gray-500 ml-2">Typing...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {attachments.map(attachment => (
              <div key={attachment.id} className="flex items-center space-x-2 bg-white rounded-lg p-2 shadow-sm">
                <FileText className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 truncate max-w-32">{attachment.file_name}</span>
                <button
                  onClick={() => setAttachments(prev => prev.filter(a => a.id !== attachment.id))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Paperclip className="h-5 w-5 text-gray-600" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
              <Smile className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <MicOff className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Mic className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() && attachments.length === 0}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default ChatSystem;
