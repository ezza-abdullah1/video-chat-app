import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Typography,
  Chip,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  ContentCopy,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  CallEnd,
  People,
  ScreenShare,
  StopScreenShare,
  MoreVert,
  Close,
} from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

const Options = () => {
  const { 
    me, 
    stream, 
    leaveRoom, 
    name, 
    roomId, 
    peers, 
    myVideo, 
    setStream, 
    notifyTrackStateChange, 
    updatePeerStreams 
  } = useContext(SocketContext);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [originalStream, setOriginalStream] = useState(null);
  const [showMeetingInfo, setShowMeetingInfo] = useState(false);

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
        notifyTrackStateChange('video', newVideoEnabled);
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
        notifyTrackStateChange('audio', newAudioEnabled);
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

      setStream(screenStream);
      if (myVideo.current) {
        myVideo.current.srcObject = screenStream;
      }
      updatePeerStreams(screenStream);

      const videoTrack = screenStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          stopScreenShare();
        };
      }

      setIsSharingScreen(true);
      setVideoEnabled(true);
      setAudioEnabled(true);
      notifyTrackStateChange('video', true);
      notifyTrackStateChange('audio', true);
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
      updatePeerStreams(originalStream);
      
      const videoTrack = originalStream.getVideoTracks()[0];
      const audioTrack = originalStream.getAudioTracks()[0];
      
      if (videoTrack) {
        setVideoEnabled(videoTrack.enabled);
        notifyTrackStateChange('video', videoTrack.enabled);
      }
      if (audioTrack) {
        setAudioEnabled(audioTrack.enabled);
        notifyTrackStateChange('audio', audioTrack.enabled);
      }
    }

    setIsSharingScreen(false);
    setOriginalStream(null);
  };

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      if (videoTrack) setVideoEnabled(videoTrack.enabled);
      if (audioTrack) setAudioEnabled(audioTrack.enabled);
    }
  }, [stream]); // Re-run if the stream object itself changes

  return (
    <>
      {/* Control Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          p: { xs: 1, sm: 1.5 }, // Reduced padding
          backgroundColor: "rgba(32, 33, 36, 0.95)",
          borderRadius: { xs: "20px", sm: "24px" }, // More rounded
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.1)",
          maxWidth: "fit-content",
          mx: "auto",
        }}
      >
        {/* Audio Control */}
        <Tooltip title={audioEnabled ? "Turn off microphone" : "Turn on microphone"}>
          <IconButton
            onClick={toggleAudio}
            sx={{
              width: { xs: 40, sm: 48 }, // Reduced size
              height: { xs: 40, sm: 48 },
              backgroundColor: audioEnabled 
                ? "rgba(255,255,255,0.1)" 
                : "#ea4335",
              color: audioEnabled ? "#e8eaed" : "#ffffff",
              border: audioEnabled 
                ? "1px solid rgba(255,255,255,0.2)" 
                : "1px solid #ea4335",
              "&:hover": {
                backgroundColor: audioEnabled 
                  ? "rgba(255,255,255,0.2)" 
                  : "#d33b2c",
              },
            }}
          >
            {audioEnabled ? <Mic sx={{ fontSize: 20 }} /> : <MicOff sx={{ fontSize: 20 }} />} {/* Smaller icons */}
          </IconButton>
        </Tooltip>

        {/* Video Control */}
        <Tooltip title={videoEnabled && !isSharingScreen ? "Turn off camera" : "Turn on camera"}>
          <IconButton
            onClick={toggleVideo}
            disabled={isSharingScreen}
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backgroundColor: videoEnabled && !isSharingScreen
                ? "rgba(255,255,255,0.1)" 
                : "#ea4335",
              color: videoEnabled && !isSharingScreen ? "#e8eaed" : "#ffffff",
              border: videoEnabled && !isSharingScreen
                ? "1px solid rgba(255,255,255,0.2)" 
                : "1px solid #ea4335",
              "&:hover": {
                backgroundColor: videoEnabled && !isSharingScreen
                  ? "rgba(255,255,255,0.2)" 
                  : "#d33b2c",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            {videoEnabled && !isSharingScreen ? <Videocam sx={{ fontSize: 20 }} /> : <VideocamOff sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        {/* Screen Share Control */}
        <Tooltip title={isSharingScreen ? "Stop presenting" : "Present now"}>
          <IconButton
            onClick={isSharingScreen ? stopScreenShare : startScreenShare}
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backgroundColor: isSharingScreen 
                ? "#1a73e8" 
                : "rgba(255,255,255,0.1)",
              color: isSharingScreen ? "#ffffff" : "#e8eaed",
              border: isSharingScreen 
                ? "1px solid #1a73e8" 
                : "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: isSharingScreen 
                  ? "#1557b0" 
                  : "rgba(255,255,255,0.2)",
              },
            }}
          >
            {isSharingScreen ? <StopScreenShare sx={{ fontSize: 20 }} /> : <ScreenShare sx={{ fontSize: 20 }} />}
          </IconButton>
        </Tooltip>

        {/* Participants Count */}
        <Tooltip title={`${participantsCount} participant${participantsCount > 1 ? 's' : ''}`}>
          <Chip
            icon={<People sx={{ fontSize: 16 }} />}
            label={participantsCount}
            size="small"
            sx={{ 
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#e8eaed",
              border: "1px solid rgba(255,255,255,0.2)",
              height: { xs: 32, sm: 36 }, // Smaller height
            }}
          />
        </Tooltip>

        {/* More Options */}
        <Tooltip title="More options">
          <IconButton
            onClick={() => setShowMeetingInfo(true)}
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#e8eaed",
              border: "1px solid rgba(255,255,255,0.2)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.2)",
              },
            }}
          >
            <MoreVert sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Leave Call Button */}
        <Tooltip title="Leave call">
          <IconButton
            onClick={leaveRoom}
            sx={{
              width: { xs: 40, sm: 48 },
              height: { xs: 40, sm: 48 },
              backgroundColor: "#ea4335",
              color: "#ffffff",
              border: "1px solid #ea4335",
              ml: 1,
              "&:hover": {
                backgroundColor: "#d33b2c",
              },
            }}
          >
            <CallEnd sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Meeting Info Dialog */}
      <Dialog 
        open={showMeetingInfo} 
        onClose={() => setShowMeetingInfo(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: "rgba(32, 33, 36, 0.95)",
            color: "#e8eaed",
            backdropFilter: "blur(12px)",
          }
        }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1.1rem" }}>Meeting details</Typography>
          <IconButton onClick={() => setShowMeetingInfo(false)} size="small" sx={{ color: "#e8eaed" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box>
              <Typography variant="body2" color="#9aa0a6" sx={{ mb: 0.5 }}>
                Meeting ID
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                  {roomId}
                </Typography>
                <Tooltip title="Copy meeting ID">
                  <IconButton size="small" onClick={handleCopyClick} sx={{ color: "#e8eaed" }}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="#9aa0a6" sx={{ mb: 0.5 }}>
                Your name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {name}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="#9aa0a6" sx={{ mb: 0.5 }}>
                Participants
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {participantsCount} participant{participantsCount > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setCopied(false)}
          sx={{ 
            borderRadius: 2,
            backgroundColor: "#137333",
            color: "#ffffff",
          }}
        >
          Meeting ID copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default Options;