import React, { useContext } from "react";
import { Grid, Paper, Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import { SocketContext } from "../SocketContext";

const VideoPlayer = () => {
  const { myVideo, stream, peers, name } = useContext(SocketContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const videoHeight = isMobile ? "30vh" : "40vh";

  return (
    <Box sx={{ width: "100%", mb: { xs: 1, sm: 2 } }}>
      <Grid container spacing={2}>
        {/* Your Video */}
        {stream && (
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                height: videoHeight,
                backgroundColor: "#000",
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
                <Typography variant="body2">{name || "You"}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Render each peer’s video */}
        {peers.map((peerObj) => (
          <Grid key={peerObj.peerID} item xs={12} sm={6} md={4}>
            <PeerVideo peer={peerObj.peer} peerName={peerObj.name} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// A helper component that attaches a ref to the peer stream
const PeerVideo = ({ peer, peerName }) => {
  const ref = React.useRef();

  React.useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        height: "40vh",
        backgroundColor: "#000",
      }}
    >
      <video
        playsInline
        autoPlay
        ref={ref}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
        <Typography variant="body2">{peerName || "User"}</Typography>
      </Box>
    </Paper>
  );
};

export default VideoPlayer;
