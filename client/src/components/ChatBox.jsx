import React, { useRef, useEffect, useState, useContext } from "react";
import { SocketContext } from "../SocketContext";
import { 
  IconButton, 
  useMediaQuery, 
  useTheme, 
  Badge, 
  Box 
} from "@mui/material";
import { 
  Chat as ChatIcon, 
  Close as CloseIcon, 
  Send as SendIcon 
} from "@mui/icons-material";

const ChatBox = () => {
  const { chatMessages, sendChatMessage, name, roomId } = useContext(SocketContext);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true); // Default open on desktop
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Auto-scroll to bottom when messages change or chat opens
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    };
    
    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatMessages, isOpen]);

  // Force scroll to bottom when chat first opens
  useEffect(() => {
    if (isOpen && chatMessages.length > 0) {
      const timeoutId = setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
      }, 200);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  // Track unread messages
  useEffect(() => {
    if (!isOpen && chatMessages.length > 0) {
      // Only count messages that are not from the current user
      const lastMessage = chatMessages[chatMessages.length - 1];
      if (!lastMessage.self) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [chatMessages, isOpen]);

  // Clear unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSend = () => {
    if (input.trim()) {
      sendChatMessage(input.trim());
      setInput("");
      // Force scroll to bottom after sending
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Chat toggle button for desktop
  if (!isMobile && !isOpen) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            backgroundColor: '#1a73e8',
            color: 'white',
            width: 48,
            height: 48,
            borderRadius: '12px',
            '&:hover': {
              backgroundColor: '#1557b0',
            },
            boxShadow: '0 4px 12px rgba(26, 115, 232, 0.25)',
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      </div>
    );
  }

  // Mobile chat toggle button
  if (isMobile && !isOpen) {
    return (
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px', 
        zIndex: 1000 
      }}>
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <Badge badgeContent={unreadCount} color="error">
            <ChatIcon />
          </Badge>
        </IconButton>
      </div>
    );
  }

  const chatStyles = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: 'linear-gradient(180deg, rgba(32, 33, 36, 0.98) 0%, rgba(28, 29, 32, 0.98) 100%)',
    overflow: 'hidden',
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: isMobile ? '0' : '0 0 0 12px',
    boxShadow: isMobile ? 'none' : '-4px 0 20px rgba(0, 0, 0, 0.15)',
    ...(isMobile && {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      background: 'rgba(32, 33, 36, 1)',
      borderRadius: '0',
    })
  };

  const headerStyles = {
    background: 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)',
    color: '#ffffff',
    padding: '14px 18px',
    fontSize: '0.85rem',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '2px solid rgba(255,255,255,0.15)',
    borderTop: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
    flexShrink: 0,
    backdropFilter: 'blur(12px)',
    boxShadow: '0 4px 12px rgba(26, 115, 232, 0.2)',
    minHeight: '52px',
    borderRadius: isMobile ? '0' : '0 0 0 12px',
  };

  const messagesStyles = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    background: 'linear-gradient(180deg, rgba(32, 33, 36, 0.95) 0%, rgba(28, 29, 32, 0.95) 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderLeft: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
    borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
  };

  const messageStyles = (isSelf) => ({
    padding: '12px 16px',
    borderRadius: '18px',
    maxWidth: '75%',
    wordBreak: 'break-word',
    boxShadow: isSelf 
      ? '0 3px 12px rgba(26, 115, 232, 0.25)' 
      : '0 2px 8px rgba(0, 0, 0, 0.15)',
    alignSelf: isSelf ? 'flex-end' : 'flex-start',
    background: isSelf 
      ? 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)' 
      : 'rgba(255, 255, 255, 0.08)',
    color: isSelf ? '#ffffff' : '#e8eaed',
    marginLeft: isSelf ? 'auto' : '0',
    marginRight: isSelf ? '0' : 'auto',
    border: isSelf 
      ? '1px solid rgba(255, 255, 255, 0.2)' 
      : '1px solid rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(8px)',
  });

  const messageMetaStyles = {
    fontSize: '0.75rem',
    opacity: 0.8,
    marginBottom: '4px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const inputRowStyles = {
    display: 'flex',
    padding: '20px',
    background: 'linear-gradient(180deg, rgba(32, 33, 36, 0.98) 0%, rgba(28, 29, 32, 0.98) 100%)',
    borderTop: '2px solid rgba(255,255,255,0.1)',
    borderLeft: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
    borderRight: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.05)',
    alignItems: 'flex-end',
    gap: '12px',
    flexShrink: 0,
    borderRadius: isMobile ? '0' : '0 0 0 12px',
  };

  const inputStyles = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '22px',
    border: '2px solid rgba(255,255,255,0.15)',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    minHeight: '20px',
    maxHeight: '100px',
    fontFamily: 'inherit',
    lineHeight: '1.4',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#e8eaed',
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  };

  const sendButtonStyles = {
    padding: '12px',
    background: input.trim() 
      ? 'linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)' 
      : 'rgba(255,255,255,0.1)',
    color: input.trim() ? '#ffffff' : 'rgba(232, 234, 237, 0.5)',
    border: input.trim() 
      ? '2px solid rgba(255, 255, 255, 0.2)' 
      : '2px solid rgba(255,255,255,0.15)',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    cursor: input.trim() ? 'pointer' : 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: input.trim() ? '0 4px 12px rgba(26, 115, 232, 0.3)' : 'none',
  };

  const emptyStateStyles = {
    color: '#9aa0a6',
    textAlign: 'center',
    padding: '40px 20px',
    fontSize: '14px',
  };

  return (
    <div style={chatStyles}>
      <div style={headerStyles}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ChatIcon sx={{ fontSize: 12, color: '#ffffff' }} />
          </Box>
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>In-call messages</span>
        </Box>
        {/* Close button - always show for both mobile and desktop */}
        <IconButton 
          onClick={() => setIsOpen(false)}
          sx={{ 
            color: 'white', 
            ml: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </div>
      
      <div style={messagesStyles}>
        {chatMessages.length === 0 ? (
          <div style={emptyStateStyles}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {chatMessages.map((msg, idx) => (
              <div key={idx} style={messageStyles(msg.self)}>
                <div style={messageMetaStyles}>
                  <span style={{ fontWeight: 600 }}>
                    {msg.self ? "You" : msg.senderName || "Unknown"}
                  </span>
                  <span style={{ fontSize: '0.7rem' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: "2-digit", 
                      minute: "2-digit" 
                    })}
                  </span>
                </div>
                <div>{msg.message}</div>
              </div>
            ))}
            <div 
              ref={messagesEndRef} 
              style={{ height: '1px', flexShrink: 0 }}
            />
          </>
        )}
      </div>
      
      <div style={inputRowStyles}>
        <textarea
          style={inputStyles}
          placeholder={roomId ? "Type a message..." : "Join a room to chat"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!roomId}
          rows={1}
        />
        <button
          style={sendButtonStyles}
          onClick={handleSend}
          disabled={!roomId || !input.trim()}
        >
          <SendIcon sx={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;