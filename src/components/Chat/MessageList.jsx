import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import QuickReplies from './QuickReplies';

const MessageList = ({ messages, onQuickReply }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={message.id} className="message-wrapper">
          <MessageBubble message={message} />
          
          {/* Show quick replies for the last bot message */}
          {message.sender === 'bot' && 
           message.quickReplies && 
           message.quickReplies.length > 0 && 
           index === messages.length - 1 && (
            <QuickReplies 
              replies={message.quickReplies}
              onReplyClick={onQuickReply}
            />
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;