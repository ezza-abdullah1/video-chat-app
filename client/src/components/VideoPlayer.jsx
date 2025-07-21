import React, { useContext } from "react";
import { Grid, Box, Typography, useTheme, useMediaQuery, Avatar } from "@mui/material";
import { Person, VideocamOff, MicOff } from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

/**
 * PeerVideo Component: Renders a single remote video stream.
 */
const PeerVideo = ({ remoteStream, peerName }) => {
  const videoRef = React.useRef();

  React.useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <Box
      sx={{
        position: "relative",
        height: { xs: "200px", sm: "250px", md: "300px" }, // Better aspect ratio heights
        backgroundColor: "#202124",
        borderRadius: 2,
        overflow: "hidden",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {remoteStream ? (
        <video
          playsInline
          autoPlay
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: "#5f6368",
              fontSize: "1.2rem"
            }}
          >
            <Person sx={{ fontSize: 24 }} />
          </Avatar>
          <Typography variant="body2" sx={{ color: '#e8eaed', textAlign: 'center', fontSize: '0.8rem' }}>
            {peerName || "User"}
            <br />
            <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>Connecting...</span>
          </Typography>
        </Box>
      )}

      {/* Name overlay */}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          right: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(32, 33, 36, 0.9)",
            color: "#e8eaed",
            padding: "4px 8px",
            borderRadius: "12px",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.75rem" }}>
            {peerName || "User"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * VideoPlayer Component: Modern Google Meet style layout
 */
const VideoPlayer = () => {
  // Get required context values
  const { myVideo, stream, peers, name } = useContext(SocketContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Calculate grid layout based on participant count
  const totalParticipants = peers.length + (stream ? 1 : 0);
  const getGridCols = () => {
    if (totalParticipants <= 1) return 6; // Further reduced for better aspect ratio
    if (totalParticipants <= 2) return 6;
    if (totalParticipants <= 4) return 6;
    return 4;
  };

  return (
    <Box 
      sx={{ 
        width: "100%", 
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1, sm: 2 },
        pb: { xs: 12, sm: 14 }, // Add bottom padding to prevent overlap with controls
        minHeight: 0,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: { xs: "500px", sm: "600px", md: "700px" } }}> {/* Responsive max widths */}
        <Grid container spacing={{ xs: 1, sm: 2 }} justifyContent="center">
          {/* Local Video */}
          {stream && (
            <Grid item xs={12} sm={getGridCols()} md={getGridCols()}>
              <Box
                sx={{
                  position: "relative",
                  height: { xs: "200px", sm: "250px", md: "300px" }, // Better aspect ratio heights
                  backgroundColor: "#202124",
                  borderRadius: 2,
                  overflow: "hidden",
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                  border: "2px solid #1a73e8",
                }}
              >
                <video
                  playsInline
                  muted
                  ref={myVideo}
                  autoPlay
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                
                {/* Local video overlay */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    right: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: "rgba(26, 115, 232, 0.9)",
                      color: "#ffffff",
                      padding: "4px 8px",
                      borderRadius: "12px",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.75rem" }}>
                      {name || "You"} (You)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          )}

          {/* Remote Peer Videos */}
          {peers.map((peerObj) => (
            <Grid key={peerObj.peerID} item xs={12} sm={getGridCols()} md={getGridCols()}>
              <PeerVideo remoteStream={peerObj.stream} peerName={peerObj.name} />
            </Grid>
          ))}
        </Grid>

        {/* Empty state when no participants */}
        {!stream && peers.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "200px",
              color: "#5f6368",
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                backgroundColor: "#f1f3f4",
                color: "#5f6368",
                mb: 2,
              }}
            >
              <Person sx={{ fontSize: 30 }} />
            </Avatar>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 500, fontSize: "1.1rem" }}>
              Waiting for others to join
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share the meeting ID to invite participants
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default VideoPlayer;