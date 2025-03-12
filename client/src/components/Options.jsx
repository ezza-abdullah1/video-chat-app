import React, { useState, useContext } from "react";
import {
  Button,
  TextField,
  Grid,
  Paper,
  Box,
  IconButton,
  Tooltip,
  Typography,
  Divider,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  ContentCopy,
  Call,
  CallEnd,
  Videocam,
  VideocamOff,
  Mic,
  MicOff,
  Settings,
} from "@mui/icons-material";

import { SocketContext } from "../SocketContext";

const Options = ({ children }) => {
  const {
    me,
    callAccepted,
    name,
    setName,
    callEnded,
    leaveCall,
    callUser,
    stream,
  } = useContext(SocketContext);
  
  const [idToCall, setIdToCall] = useState("");
  const [copied, setCopied] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  
  const theme = useTheme();

  const handleCopyClick = () => {
    navigator.clipboard.writeText(me);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !videoEnabled;
      });
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !audioEnabled;
      });
      setAudioEnabled(!audioEnabled);
    }
  };

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      {/* Controls for ongoing call */}
      {callAccepted && !callEnded && (
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 4,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title={audioEnabled ? "Mute" : "Unmute"}>
              <IconButton 
                onClick={toggleAudio} 
                sx={{ 
                  backgroundColor: audioEnabled ? 'rgba(0,0,0,0.05)' : theme.palette.secondary.main,
                  color: audioEnabled ? 'inherit' : 'white',
                  '&:hover': { 
                    backgroundColor: audioEnabled ? 'rgba(0,0,0,0.1)' : theme.palette.secondary.dark 
                  }
                }}
              >
                {audioEnabled ? <Mic /> : <MicOff />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={videoEnabled ? "Turn off camera" : "Turn on camera"}>
              <IconButton 
                onClick={toggleVideo} 
                sx={{ 
                  backgroundColor: videoEnabled ? 'rgba(0,0,0,0.05)' : theme.palette.secondary.main,
                  color: videoEnabled ? 'inherit' : 'white',
                  '&:hover': { 
                    backgroundColor: videoEnabled ? 'rgba(0,0,0,0.1)' : theme.palette.secondary.dark 
                  }
                }}
              >
                {videoEnabled ? <Videocam /> : <VideocamOff />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title="End call">
              <IconButton 
                onClick={leaveCall} 
                sx={{ 
                  backgroundColor: theme.palette.secondary.main,
                  color: 'white',
                  '&:hover': { backgroundColor: theme.palette.secondary.dark }
                }}
              >
                <CallEnd />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Settings">
              <IconButton sx={{ backgroundColor: 'rgba(0,0,0,0.05)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.1)' } }}>
                <Settings />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      {/* Call setup form */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          background: 'white',
        }}
      >
        <Grid container spacing={3}>
          {/* Your Info */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Your Info
            </Typography>
            <TextField
              label="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1, flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ID: {me}
              </Typography>
              <Tooltip title="Copy your ID">
                <IconButton onClick={handleCopyClick} color="primary" size="small">
                  <ContentCopy />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary">
              Make a Call
            </Typography>
            <TextField
              label="ID to Call"
              value={idToCall}
              onChange={(e) => setIdToCall(e.target.value)}
              fullWidth
              variant="outlined"
              margin="normal"
              InputProps={{
                sx: { borderRadius: 1.5 }
              }}
            />
            {!callAccepted && !callEnded && (
              <Button
                variant="contained"
                startIcon={<Call />}
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => {
                  if (!idToCall) {
                    alert("Please enter a valid ID to call.");
                    return;
                  }
                  callUser(idToCall);
                }}
                disabled={!idToCall}
              >
                Call
              </Button>
            )}
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3 }}>
          {children}
        </Box>
      </Paper>
      
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          ID copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Options;