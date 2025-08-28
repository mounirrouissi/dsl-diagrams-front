import React from 'react';

const QuickReplies = ({ replies, onReplyClick }) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="quick-replies">
      <div className="quick-replies-label">Quick replies:</div>
      <div className="quick-replies-buttons">
        {replies.map((reply, index) => (
          <button
            key={index}
            className="quick-reply-button"
            onClick={() => onReplyClick(reply.text || reply)}
          >
            {reply.label || reply}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickReplies;