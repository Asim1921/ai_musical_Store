// ================================================
// STEP 1: CREATE NEW FILE: src/components/Chat.js
// ================================================

// src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

const API_BASE = 'http://localhost:8000/api/social';

// Chat API functions
const chatApi = {
  getChats: async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/chats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching chats:', error);
      return [];
    }
  },

  createChat: async (userId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/chats/create/${userId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  },

  getMessages: async (chatId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/chats/${chatId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },

  sendMessage: async (chatId, content) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/chats/${chatId}/send/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content })
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
};

// Individual Message Component
const MessageBubble = ({ message, isOwn }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: isOwn ? 'flex-end' : 'flex-start',
      marginBottom: '12px'
    }}>
      <div style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        backgroundColor: isOwn ? '#3b82f6' : '#f1f5f9',
        color: isOwn ? 'white' : '#1e293b',
        wordWrap: 'break-word'
      }}>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.4' }}>
          {message.content}
        </p>
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          opacity: 0.7,
          textAlign: 'right'
        }}>
          {message.time_ago}
        </div>
      </div>
    </div>
  );
};

// Chat List Item Component
const ChatListItem = ({ chat, isActive, onClick }) => {
  const otherParticipant = chat.other_participant;
  const lastMessage = chat.last_message;

  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #f1f5f9',
        cursor: 'pointer',
        backgroundColor: isActive ? '#dbeafe' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.target.style.backgroundColor = '#f8fafc';
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.target.style.backgroundColor = 'transparent';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img
          src={otherParticipant.avatar_url}
          alt={otherParticipant.username}
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#1e293b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {otherParticipant.first_name} {otherParticipant.last_name}
            </h4>
            {chat.unread_count > 0 && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {chat.unread_count}
              </span>
            )}
          </div>
          <p style={{
            margin: '2px 0 0 0',
            fontSize: '13px',
            color: '#64748b',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            @{otherParticipant.username}
          </p>
          {lastMessage && (
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: '#94a3b8',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {lastMessage.is_own ? 'You: ' : ''}{lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Chat Interface Component
const ChatInterface = ({ isOpen, onClose }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user_data'));

  // Load chats when component opens
  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChats = async () => {
    setLoading(true);
    try {
      const chatsData = await chatApi.getChats();
      setChats(chatsData);
      
      // Auto-select first chat if available
      if (chatsData.length > 0 && !activeChat) {
        setActiveChat(chatsData[0]);
        loadMessages(chatsData[0].id);
      }
    } catch (error) {
      toast.error('Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    setMessagesLoading(true);
    try {
      const messagesData = await chatApi.getMessages(chatId);
      setMessages(messagesData);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    loadMessages(chat.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    setSending(true);
    try {
      const message = await chatApi.sendMessage(activeChat.id, newMessage.trim());
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update chat list with new message
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === activeChat.id
            ? { ...chat, last_message: message }
            : chat
        )
      );
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '1000px',
        height: '80vh',
        display: 'flex',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        
        {/* Chat List Sidebar */}
        <div style={{
          width: '320px',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px 16px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Messages
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              ×
            </button>
          </div>

          {/* Chats List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              </div>
            ) : chats.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#374151' }}>No conversations yet</h4>
                <p style={{ margin: 0, fontSize: '14px' }}>Start a conversation by visiting someone's profile</p>
              </div>
            ) : (
              chats.map((chat) => (
                <ChatListItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat?.id === chat.id}
                  onClick={() => handleChatSelect(chat)}
                />
              ))
            )}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img
                  src={activeChat.other_participant.avatar_url}
                  alt={activeChat.other_participant.username}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                    {activeChat.other_participant.first_name} {activeChat.other_participant.last_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
                    @{activeChat.other_participant.username}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px 24px',
                backgroundColor: '#fafafa'
              }}>
                {messagesLoading ? (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%'
                  }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '2px solid #e2e8f0',
                      borderTop: '2px solid #3b82f6',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#64748b'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
                    <p>Start your conversation with {activeChat.other_participant.first_name}!</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender.id === currentUser.id}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid #e2e8f0',
                backgroundColor: 'white'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end'
                }}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '20px',
                      resize: 'none',
                      fontFamily: 'inherit',
                      fontSize: '14px',
                      outline: 'none',
                      maxHeight: '100px',
                      overflowY: 'auto'
                    }}
                    onKeyPress={handleKeyPress}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !newMessage.trim()}
                    style={{
                      padding: '12px 20px',
                      background: (sending || !newMessage.trim()) ? '#94a3b8' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: (sending || !newMessage.trim()) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    {sending ? (
                      <>
                        <div style={{
                          width: '16px',
                          height: '16px',
                          border: '2px solid #ffffff40',
                          borderTop: '2px solid #ffffff',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        Send
                        <span style={{ fontSize: '16px' }}>📤</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              flexDirection: 'column'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>Select a conversation</h3>
              <p style={{ margin: 0 }}>Choose a chat to start messaging</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export { ChatInterface, chatApi };
export default ChatInterface;