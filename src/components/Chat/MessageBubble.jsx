import React from 'react';

const MessageBubble = ({ message }) => {
  const { text, sender, timestamp, isError } = message;
  
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  console.log('MessageBubble rendering:', sender, text);
  
  return (
    <div className={`message-bubble ${sender} ${isError ? 'error' : ''}`} style={{border: '2px solid red', margin: '5px'}}>
      
      <div className="message-content" style={{
        maxWidth: '70%',
        padding: '12px 16px',
        borderRadius: '18px',
        background: sender === 'user' ? '#2563eb' : '#f3f4f6',
        color: sender === 'user' ? 'white' : '#374151',
        margin: '8px 0'
      }}>
        <p className="message-text" style={{margin: 0, lineHeight: 1.4}}>{text}</p>
        <span className="message-time" style={{fontSize: '11px', opacity: 0.7, marginTop: '4px', display: 'block'}}>
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;