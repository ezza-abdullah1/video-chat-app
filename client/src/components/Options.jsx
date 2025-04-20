import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ContentCopy,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  ExitToApp,
} from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

const Options = () => {
  const { me, stream, leaveRoom } = useContext(SocketContext);
  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(me);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  // Toggle video by reading the current track state
  const toggleVideo = () => {
    if (stream) {
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        // Derive the new enabled value from the current track property
        const newVideoEnabled = !videoTracks[0].enabled;
        videoTracks.forEach((track) => {
          track.enabled = newVideoEnabled;
        });
        setVideoEnabled(newVideoEnabled);
      }
    }
  };

  // Toggle audio similarly by reading the current track state
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

  // Set the initial state based on the current stream properties
  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    }
  }, [stream]);

  return (
    <Box sx={{ width: "100%", position: "relative" }}>
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title={audioEnabled ? "Mute" : "Unmute"}>
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
          <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
            <IconButton
              onClick={toggleVideo}
              sx={{
                backgroundColor: videoEnabled ? "rgba(0,0,0,0.05)" : "red",
                color: videoEnabled ? "inherit" : "white",
              }}
            >
              {videoEnabled ? <Videocam /> : <VideocamOff />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Leave Meeting">
            <IconButton
              onClick={leaveRoom}
              sx={{ backgroundColor: "red", color: "white" }}
            >
              <ExitToApp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy your ID">
            <IconButton onClick={handleCopyClick} color="primary">
              <ContentCopy />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
      >
        <Alert severity="success" onClose={() => setCopied(false)}>
          ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Options;
