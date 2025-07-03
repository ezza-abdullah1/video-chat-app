import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Typography,
  TextField,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  InputAdornment,
} from "@mui/material";
import {
  ContentCopy,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ExitToApp,
  People,
  Chat,
  Settings,
  ScreenShare,
  StopScreenShare,
  Send,
  Person,
} from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

const Options = () => {
  const { 
    me, 
    stream, 
    leaveRoom, 
    name, 
    setName, 
    roomId, 
    peers, 
    myVideo, 
    setStream,
    sendMessage,
    messages,
    sendVideoState,
    sendAudioState
  } = useContext(SocketContext);

  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [originalStream, setOriginalStream] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);

  const participantsCount = peers.length + 1;

  const handleCopyClick = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoEnabled = !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
          track.enabled = newVideoEnabled;
        });
        setVideoEnabled(newVideoEnabled);
        
        // Send video state to other users
        if (sendVideoState) {
          sendVideoState(newVideoEnabled);
        }
      }
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newAudioEnabled = !audioTracks[0].enabled;
        audioTracks.forEach((track) => {
          track.enabled = newAudioEnabled;
        });
        setAudioEnabled(newAudioEnabled);
        
        // Send audio state to other users
        if (sendAudioState) {
          sendAudioState(newAudioEnabled);
        }
      }
    }
  };

  const startScreenShare = async () => {
    try {
      setOriginalStream(stream);
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const audioTrack = screenStream.getAudioTracks()[0];

      if (stream) {
        const existingVideoTrack = stream.getVideoTracks()[0];
        const existingAudioTrack = stream.getAudioTracks()[0];

        if (existingVideoTrack) existingVideoTrack.stop();
        if (existingAudioTrack) existingAudioTrack.stop();

        stream.removeTrack(existingVideoTrack);
        stream.removeTrack(existingAudioTrack);
        stream.addTrack(videoTrack);
        stream.addTrack(audioTrack);
      } else {
        setStream(screenStream);
      }

      if (myVideo.current) {
        myVideo.current.srcObject = screenStream;
      }

      videoTrack.onended = () => {
        stopScreenShare();
      };

      setIsSharingScreen(true);
      setVideoEnabled(true);
      setAudioEnabled(true);
    } catch (err) {
      console.error("Error starting screen share:", err);
      setIsSharingScreen(false);
      if (originalStream && myVideo.current) {
        myVideo.current.srcObject = originalStream;
      }
    }
  };

  const stopScreenShare = () => {
    if (stream && isSharingScreen) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (originalStream) {
      setStream(originalStream);
      if (myVideo.current) {
        myVideo.current.srcObject = originalStream;
      }
      const videoTrack = originalStream.getVideoTracks()[0];
      const audioTrack = originalStream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    } else {
      setVideoEnabled(false);
      setAudioEnabled(false);
    }

    setIsSharingScreen(false);
    setOriginalStream(null);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && sendMessage) {
      sendMessage(chatMessage);
      setChatMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    }
  }, [stream]);

  useEffect(() => {
    if (!showChatPanel && messages && messages.length > 0) {
      setUnreadMessages(messages.length);
    } else if (showChatPanel) {
      setUnreadMessages(0);
    }
  }, [messages, showChatPanel]);

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1a1a1a",
          color: "white",
          gap: { xs: 2, sm: 3 },
        }}
      >
        {/* Meeting Info Section */}
        <Box sx={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 1, 
          alignItems: { xs: 'center', sm: 'flex-start' },
          minWidth: { xs: '100%', sm: '200px' }
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {name || "Meeting"}
          </Typography>
          <Typography variant="body2" sx={{ color: "#b0b0b0" }}>
            Room: {roomId}
            <Tooltip title="Copy Room ID">
              <IconButton 
                onClick={handleCopyClick} 
                size="small" 
                sx={{ ml: 1, color: "#4285f4" }}
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
        </Box>

        {/* Central Controls */}
        <Box sx={{ 
          display: "flex", 
          gap: 1, 
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Tooltip title={audioEnabled ? "Turn off microphone" : "Turn on microphone"}>
            <IconButton
              onClick={toggleAudio}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: audioEnabled ? "rgba(255,255,255,0.1)" : "#ea4335",
                color: "white",
                "&:hover": {
                  backgroundColor: audioEnabled ? "rgba(255,255,255,0.2)" : "#d33b2c",
                },
              }}
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={videoEnabled && !isSharingScreen ? "Turn off camera" : "Turn on camera"}>
            <IconButton
              onClick={toggleVideo}
              disabled={isSharingScreen}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: videoEnabled && !isSharingScreen ? "rgba(255,255,255,0.1)" : "#ea4335",
                color: "white",
                "&:hover": {
                  backgroundColor: videoEnabled && !isSharingScreen ? "rgba(255,255,255,0.2)" : "#d33b2c",
                },
                "&:disabled": {
                  backgroundColor: "#666",
                  color: "#999",
                },
              }}
            >
              {videoEnabled && !isSharingScreen ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={isSharingScreen ? "Stop presenting" : "Present now"}>
            <IconButton
              onClick={isSharingScreen ? stopScreenShare : startScreenShare}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: isSharingScreen ? "#34a853" : "rgba(255,255,255,0.1)",
                color: "white",
                "&:hover": {
                  backgroundColor: isSharingScreen ? "#2d8f3f" : "rgba(255,255,255,0.2)",
                },
              }}
            >
              {isSharingScreen ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Leave call">
            <IconButton
              onClick={leaveRoom}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: "#ea4335",
                color: "white",
                "&:hover": {
                  backgroundColor: "#d33b2c",
                },
              }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Right Side Controls */}
        <Box sx={{ display: "flex", gap: 1, alignItems: 'center' }}>
          <Tooltip title="Show everyone">
            <IconButton
              onClick={() => setShowParticipantsPanel(true)}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Badge badgeContent={participantsCount} color="primary" showZero>
                <People />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Chat with everyone">
            <IconButton
              onClick={() => setShowChatPanel(true)}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Badge badgeContent={unreadMessages} color="error" showZero={false}>
                <Chat />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton
              onClick={() => setShowSettingsModal(true)}
              sx={{
                color: "white",
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Participants Panel */}
      <Dialog 
        open={showParticipantsPanel} 
        onClose={() => setShowParticipantsPanel(false)}
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            People ({participantsCount})
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <List>
            {/* Current User */}
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#4285f4" }}>
                  <Person />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={`${name || "You"} (You)`}
                secondary="Host"
              />
            </ListItem>
            <Divider />
            
            {/* Remote Participants */}
            {peers.map((peer) => (
              <ListItem key={peer.peerID}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "#34a853" }}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={peer.name || "Unknown"}
                  secondary={peer.videoEnabled === false ? "Camera off" : ""}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowParticipantsPanel(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Enhanced Chat Panel */}
      <Dialog 
        open={showChatPanel} 
        onClose={() => setShowChatPanel(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, height: '70vh' }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" component="div">
            Chat
          </Typography>
        </DialogTitle>
        <DialogContent 
          dividers 
          sx={{ 
            p: 0, 
            display: 'flex', 
            flexDirection: 'column',
            height: '50vh'
          }}
        >
          {/* Messages Area */}
          <Box sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            p: 2,
            backgroundColor: '#f8f9fa'
          }}>
            {messages && messages.length > 0 ? (
              messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: msg.sender === me ? '#e3f2fd' : 'white',
                    alignSelf: msg.sender === me ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    boxShadow: 1,
                  }}
                >
                  <Typography variant="caption" color="textSecondary">
                    {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5 }}>
                    {msg.message}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', mt: 4 }}>
                No messages yet. Start the conversation!
              </Typography>
            )}
          </Box>
          
          {/* Message Input */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
            <TextField
              fullWidth
              placeholder="Send a message to everyone"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={3}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={handleSendMessage}
                      disabled={!chatMessage.trim()}
                      color="primary"
                    >
                      <Send />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog 
        open={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Audio & Video
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Microphone
            </Typography>
            <TextField
              select
              fullWidth
              defaultValue="default"
              SelectProps={{
                native: true,
              }}
            >
              <option value="default">Default - Built-in Microphone</option>
            </TextField>
          </Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Camera
            </Typography>
            <TextField
              select
              fullWidth
              defaultValue="default"
              SelectProps={{
                native: true,
              }}
            >
              <option value="default">Default - Built-in Camera</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSettingsModal(false)}>
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Copy Confirmation */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setCopied(false)}>
          Room ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Options;