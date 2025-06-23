import React, { useContext } from "react";
import { Grid, Paper, Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { SocketContext } from "../SocketContext";

/**
 * PeerVideo Component: Renders a single remote video stream.
 * It takes the remote stream and the peer's name as props.
 */
const PeerVideo = ({ remoteStream, peerName }) => {
  const videoRef = React.useRef(); // Ref to attach the video stream to

  // Attach the remote stream to the video element when remoteStream changes
  React.useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]); // Dependency array: run effect when remoteStream changes

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        // Responsive height: full height on mobile, fixed height on desktop
        height: { xs: "25vh", sm: "30vh", md: "40vh" },
        backgroundColor: "#000", // Black background for videos
        display: 'flex', // Use flex for centering content if no stream
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Conditionally render video tag only if remoteStream is available */}
      {remoteStream ? (
        <video
          playsInline // Recommended for mobile to play inline
          autoPlay // Auto-play the video
          ref={videoRef} // Attach the ref
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover", // Cover the container while maintaining aspect ratio
          }}
        />
      ) : (
        // Placeholder when stream is not yet available
        <Typography variant="body1" color="textSecondary" sx={{ color: '#fff' }}>
          {peerName || "User"} (Connecting...)
        </Typography>
      )}

      {/* Overlay box for displaying the peer's name */}
      <Box
        sx={{
          position: "absolute",
          bottom: 8,
          left: 8,
          backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent black background
          color: "#fff", // White text
          padding: "4px 8px",
          borderRadius: 4, // Rounded corners for the name tag
        }}
      >
        <Typography variant="body2">{peerName || "User"}</Typography>
      </Box>
    </Paper>
  );
};

/**
 * VideoPlayer Component: Displays the local user's video and all remote peer videos.
 */
const VideoPlayer = () => {
  // Get required context values
  const { myVideo, stream, peers, name } = useContext(SocketContext);
  const theme = useTheme();
  // Check if it's a mobile device for responsive styling
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Adjust local video height based on screen size
  const myVideoHeight = isMobile ? "25vh" : "40vh";

  return (
    <Box sx={{ width: "100%", mb: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2} justifyContent="center"> {/* Center grid items */}
        {/* Your Local Video */}
        {stream && ( // Only render if local stream is available
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                height: myVideoHeight,
                backgroundColor: "#000",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                playsInline
                muted // Mute local video to prevent echo
                ref={myVideo} // Attach ref to local video element
                autoPlay // Auto-play local video
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  padding: "4px 8px",
                  borderRadius: 4,
                }}
              >
                {/* Display (You) next to the local user's name */}
                <Typography variant="body2">{name || "You"} (You)</Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Render each remote peer’s video */}
        {peers.map((peerObj) => (
          // Only render PeerVideo component if the remote stream is available for this peer
          // The PeerVideo component itself handles showing a "connecting" message if no stream yet
          <Grid key={peerObj.peerID} item xs={12} sm={6} md={4}>
            <PeerVideo remoteStream={peerObj.stream} peerName={peerObj.name} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default VideoPlayer;
