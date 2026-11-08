import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  User, 
  ShieldCheck, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useItems } from '../contexts/ItemsContext';
import { useAuth } from '../contexts/AuthContext';

export const DirectChatBox = ({ chatRoomId, title, recipientRole, isPrivateGirlMode = false }) => {
  const { messages, sendMessage } = useItems();
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);

  const roomMessages = messages.filter(m => m.chatRoomId === chatRoomId);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setSending(true);
    try {
      await sendMessage({
        chatRoomId,
        senderId: currentUser?.uid,
        senderName: currentUser?.name,
        senderRole: currentUser?.role || 'student',
        text: inputText
      });
      setInputText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="in-app-chat-card animate-fade-in">
      <div className="chat-header-row">
        <div className="flex-row items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          <h4 className="font-bold text-sm">{title || 'Campus Safe Direct Chat'}</h4>
        </div>
        {isPrivateGirlMode && (
          <span className="badge-pill-success text-xs">
            <Lock size={11} /> Girl Safety Shield (No Phone Sharing)
          </span>
        )}
      </div>

      <div className="chat-messages-container">
        {roomMessages.length === 0 ? (
          <div className="empty-chat-state">
            <Sparkles size={24} className="text-muted mb-2" />
            <p className="text-xs text-muted">
              {isPrivateGirlMode 
                ? 'Private chat connected directly between you and the finder! You can coordinate safe campus pickup here without sharing your personal number.' 
                : 'No messages yet. Send a message to coordinate handover!'}
            </p>
          </div>
        ) : (
          roomMessages.map(msg => {
            const isMe = msg.senderId === currentUser?.uid;
            return (
              <div key={msg.id} className={`chat-bubble-row ${isMe ? 'my-bubble' : 'their-bubble'}`}>
                <div className="chat-bubble-content">
                  <div className="chat-sender-info">
                    <span className="font-bold">{msg.senderName}</span>
                    <span className="sender-badge">{msg.senderRole}</span>
                    <span className="chat-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="chat-text">{msg.text}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="chat-input-bar">
        <input 
          type="text" 
          className="form-input flex-1"
          placeholder="Type your message here..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
        />
        <button type="submit" className="primary-btn flex-row items-center gap-1" disabled={sending}>
          <Send size={15} />
          <span>{sending ? '...' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
};
