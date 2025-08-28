import React, { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import { sendMessage, getChatHistory } from '../../services/chatApi';
import './Chat.css';

const ChatContainer = () => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userContext, setUserContext] = useState({
    customerId: null,
    customerName: null,
    vehicle: null,
    currentService: null
  });

  // Generate session ID on component mount
  useEffect(() => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Add welcome message
    setMessages([{
      id: 1,
      text: "Hello! I'm your auto service assistant. I can help you with vehicle maintenance, service bookings, and answer questions about your car. What's your name?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
      intent: 'greeting'
    }]);
  }, []);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || !sessionId) return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: messageText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Send message to backend
      const response = await sendMessage({
        sessionId,
        message: messageText,
        context: userContext
      });

      // Add bot response to chat
      const botMessage = {
        id: Date.now() + 1,
        text: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        intent: response.intent,
        quickReplies: response.quickReplies || []
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Update user context if provided
      if (response.context) {
        setUserContext(prev => ({ ...prev, ...response.context }));
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (replyText) => {
    handleSendMessage(replyText);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Auto Service Assistant</h3>
        {userContext.customerName && (
          <span className="customer-info">
            Welcome, {userContext.customerName}
            {userContext.vehicle && ` | ${userContext.vehicle.year} ${userContext.vehicle.make} ${userContext.vehicle.model}`}
          </span>
        )}
      </div>
      
      <MessageList 
        messages={messages} 
        onQuickReply={handleQuickReply}
      />
      
      {isTyping && <TypingIndicator />}
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={isTyping}
      />
    </div>
  );
};

export default ChatContainer;