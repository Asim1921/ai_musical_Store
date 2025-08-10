import React from 'react';
import toast from 'react-hot-toast';
import { chatApi } from './Chat';

const MessageButton = ({ userId, userName, onChatCreated, onOpenChat }) => {
  const [isCreating, setIsCreating] = React.useState(false);

  const handleStartChat = async () => {
    setIsCreating(true);
    try {
      const chat = await chatApi.createChat(userId);
      toast.success(`Started conversation with ${userName}!`);
      
      // Notify parent component that chat was created
      if (onChatCreated) {
        onChatCreated(chat);
      }
      
      // Open the chat interface immediately
      if (onOpenChat) {
        onOpenChat();
      }
    } catch (error) {
      toast.error('Failed to start conversation');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleStartChat}
      disabled={isCreating}
      style={{
        padding: '12px 24px',  // Made same size as Follow button
        background: isCreating ? '#94a3b8' : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',  // Made same weight as Follow button
        cursor: isCreating ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s ease'
      }}
    >
      {isCreating ? (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid #ffffff40',
            borderTop: '2px solid #ffffff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Starting...
        </>
      ) : (
        <>
          💬 Message
        </>
      )}
    </button>
  );
};

export default MessageButton;

