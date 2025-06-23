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
  Badge, // Added for participants count
  Dialog, // For settings/chat modal
  DialogTitle,
  DialogContent,
  Button, // For general use in dialogs or new actions
} from "@mui/material";
import {
  ContentCopy,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ExitToApp,
  People, // Icon for participants
  Chat, // Icon for messages
  Settings, // Icon for settings
  ScreenShare, // Icon for screen share
  StopScreenShare, // Icon for stopping screen share
} from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

const Options = () => {
  // Destructure all necessary values from SocketContext, including setStream
  const { me, stream, leaveRoom, name, setName, roomId, peers, myVideo, setStream } = useContext(SocketContext);

  // Local states for UI and functionality
  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showChatPanel, setShowChatPanel] = useState(false); // State for chat panel visibility
  const [showSettingsModal, setShowSettingsModal] = useState(false); // State for settings modal visibility
  const [isSharingScreen, setIsSharingScreen] = useState(false); // State for screen sharing status
  const [originalStream, setOriginalStream] = useState(null); // To store original stream before screen share

  // Calculate participants count (local user + remote peers)
  const participantsCount = peers.length + 1; // +1 for the current user

  // Handle copying Room ID to clipboard
  const handleCopyClick = () => {
    if (roomId) {
      const el = document.createElement('textarea');
      el.value = roomId;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Toggle video by manipulating the enabled state of its tracks
  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const newVideoEnabled = !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
          track.enabled = newVideoEnabled;
        });
        setVideoEnabled(newVideoEnabled);
      }
    }
  };

  // Toggle audio similarly by manipulating the enabled state of its tracks
  const toggleAudio = () => {
    if (stream) {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const newAudioEnabled = !audioTracks[0].enabled;
        audioTracks.forEach((track) => {
          track.enabled = newAudioEnabled;
        });
        setAudioEnabled(newAudioEnabled);
      }
    }
  };

  // Function to start screen sharing
  const startScreenShare = async () => {
    try {
      // Store the original camera stream
      setOriginalStream(stream);

      // Get display media (screen share)
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Request audio from screen share too
      });

      // Replace video track in current stream with screen share track
      const videoTrack = screenStream.getVideoTracks()[0];
      const audioTrack = screenStream.getAudioTracks()[0]; // Screen share audio

      if (stream) {
        const existingVideoTrack = stream.getVideoTracks()[0];
        const existingAudioTrack = stream.getAudioTracks()[0];

        // Stop existing camera tracks if they exist
        if (existingVideoTrack) existingVideoTrack.stop();
        if (existingAudioTrack) existingAudioTrack.stop();

        // Replace tracks in the existing stream object
        // This is a simplified approach; in a full WebRTC app, you'd iterate
        // through each peer connection and use `peer.replaceTrack()` for each one.
        // For demonstration purposes, we're replacing tracks directly in the local stream object.
        stream.removeTrack(existingVideoTrack);
        stream.removeTrack(existingAudioTrack);
        stream.addTrack(videoTrack);
        stream.addTrack(audioTrack);
      } else {
        // If no existing stream, set the screen stream as the main stream
        setStream(screenStream); // Now setStream is defined!
      }

      // Update myVideo ref to show screen share
      if (myVideo.current) {
        myVideo.current.srcObject = screenStream;
      }

      // Listen for screen share stopping (user clicks "Stop Sharing" in browser UI)
      videoTrack.onended = () => {
        stopScreenShare();
      };

      setIsSharingScreen(true);
      setVideoEnabled(true); // Video is on if screen sharing
      setAudioEnabled(true); // Audio is on if screen sharing from screen stream
      console.log("Screen sharing started:", screenStream);

    } catch (err) {
      console.error("Error starting screen share:", err);
      setIsSharingScreen(false);
      // Revert to original stream if screen sharing failed (optional)
      if (originalStream && myVideo.current) {
         myVideo.current.srcObject = originalStream;
      }
    }
  };

  // Function to stop screen sharing
  const stopScreenShare = () => {
    if (stream && isSharingScreen) {
      stream.getTracks().forEach((track) => track.stop()); // Stop all current tracks (screen share)
    }

    // Revert to original camera stream if it exists
    if (originalStream) {
      setStream(originalStream); // Now setStream is defined!
      if (myVideo.current) {
        myVideo.current.srcObject = originalStream;
      }
      // Re-enable original audio/video tracks based on their state before screen share
      const videoTrack = originalStream.getVideoTracks()[0];
      const audioTrack = originalStream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    } else {
      // If no original stream, ensure video is off and audio is off
      setVideoEnabled(false);
      setAudioEnabled(false);
    }

    setIsSharingScreen(false);
    setOriginalStream(null); // Clear original stream reference
    console.log("Screen sharing stopped.");
  };


  // Set the initial state of video/audio controls based on the current stream properties
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    }
  }, [stream]); // Re-run if the stream object itself changes

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          display: "flex",
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: "space-around",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Meeting Info Section */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: { xs: 'center', sm: 'flex-start' } }}>
          <TextField
            label="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            size="small"
            variant="outlined"
            disabled={true}
            sx={{ maxWidth: { xs: '100%', sm: '180px' } }}
          />
          {/* Display Room ID explicitly */}
          <Typography variant="body2" color="textSecondary">
              Meeting Room ID: <strong>{roomId}</strong>
              <Tooltip title="Copy Room ID">
                  <IconButton onClick={handleCopyClick} color="primary" size="small" sx={{ ml: 0.5 }}>
                      <ContentCopy fontSize="small" />
                  </IconButton>
              </Tooltip>
          </Typography>
          <Typography variant="caption" color="textSecondary">
              Your User ID: <strong>{me}</strong>
          </Typography>
        </Box>

        {/* Central Call Control Buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Tooltip title={audioEnabled ? "Mute Microphone" : "Unmute Microphone"}>
            <IconButton
              onClick={toggleAudio}
              sx={{
                backgroundColor: audioEnabled ? "rgba(0,0,0,0.05)" : "red",
                color: audioEnabled ? "inherit" : "white",
              }}
            >
              {audioEnabled ? <Mic /> : <MicOff />}
            </IconButton>
          </Tooltip>

          <Tooltip title={videoEnabled && !isSharingScreen ? "Turn off camera" : "Turn on camera"}>
            <IconButton
              onClick={toggleVideo}
              disabled={isSharingScreen} // Disable camera toggle if screen sharing
              sx={{
                backgroundColor: videoEnabled && !isSharingScreen ? "rgba(0,0,0,0.05)" : "red",
                color: videoEnabled && !isSharingScreen ? "inherit" : "white",
              }}
            >
              {videoEnabled && !isSharingScreen ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>

          {/* Screen Share Button */}
          <Tooltip title={isSharingScreen ? "Stop Sharing Screen" : "Share Screen"}>
            <IconButton
              onClick={isSharingScreen ? stopScreenShare : startScreenShare}
              color={isSharingScreen ? "secondary" : "primary"}
            >
              {isSharingScreen ? <StopScreenShare /> : <ScreenShare />}
            </IconButton>
          </Tooltip>

          {/* Leave Meeting Button */}
          <Tooltip title="Leave Meeting">
            <IconButton
              onClick={leaveRoom}
              sx={{ backgroundColor: "red", color: "white" }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Other Meeting Features (Participants, Chat, Settings) */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Participants Count */}
          <Tooltip title="Participants">
            <IconButton>
              <Badge badgeContent={participantsCount} color="primary" showZero>
                <People />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Messages Panel Button */}
          <Tooltip title="Chat Messages">
            <IconButton onClick={() => setShowChatPanel(true)}>
              <Chat />
            </IconButton>
          </Tooltip>

          {/* Settings Button */}
          <Tooltip title="Settings">
            <IconButton onClick={() => setShowSettingsModal(true)}>
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Snackbar for copy to clipboard confirmation */}
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

      {/* Chat Panel Dialog (Placeholder) */}
      <Dialog open={showChatPanel} onClose={() => setShowChatPanel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chat</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ height: 300, overflowY: 'auto', border: '1px solid #eee', p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="textSecondary">
              (Chat messages will appear here. Functionality to send/receive messages needs backend support.)
            </Typography>
          </Box>
          <TextField
            fullWidth
            placeholder="Type your message..."
            variant="outlined"
            size="small"
            // You would add onChange and onSubmit for actual chat functionality
          />
          <Button variant="contained" color="primary" sx={{ mt: 1 }}>Send</Button>
        </DialogContent>
      </Dialog>

      {/* Settings Modal Dialog (Placeholder) */}
      <Dialog open={showSettingsModal} onClose={() => setShowSettingsModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Settings</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="textSecondary">
            (Audio/Video settings and other preferences would go here. For example, device selection.)
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Audio Input</Typography>
            {/* Placeholder for device selection */}
            <TextField select fullWidth label="Microphone" defaultValue="default" variant="outlined" size="small">
              <option value="default">Default Microphone</option>
              {/* Map actual devices here */}
            </TextField>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Video Input</Typography>
            {/* Placeholder for device selection */}
            <TextField select fullWidth label="Camera" defaultValue="default" variant="outlined" size="small">
              <option value="default">Default Camera</option>
              {/* Map actual devices here */}
            </TextField>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Options;
