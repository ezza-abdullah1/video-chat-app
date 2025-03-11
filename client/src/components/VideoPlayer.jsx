import React, { useContext } from "react";
import { Grid, Typography, Paper } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SocketContext } from "../SocketContext";
import { useTheme } from "@mui/material/styles";
const useStyles = makeStyles((theme) => ({
  video: {
    width: "550px",
   
  },
  gridContainer: {
    display: "flex",
    justifyContent: "center",
   
  },
  paper: {
    padding: "10px",
    border: "2px solid black",
    margin: "10px",
  },
}));

const VideoPlayer = () => {
  const context = useContext(SocketContext);
console.log("SocketContext Value: ", context);
  const {name, callAccepted, myVideo, userVideo, callEnded, stream,call} = useContext(SocketContext);
  const classes = useStyles();

  return (
    <Grid container className={classes.gridContainer}>
      {/* Our video */}
      {
        stream && (
          <Paper className={classes.paper}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
            {name || 'Name'}
          </Typography>
          <video playsInline muted ref={myVideo} autoPlay className={classes.video} />
        </Grid>
      </Paper>
      )}
      {
        callAccepted && !callEnded && (
          <Paper className={classes.paper}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5" gutterBottom>
          {call.name || 'Name'}
          </Typography>
          <video playsInline ref={userVideo} autoPlay className={classes.video} />
        </Grid>
      </Paper>
        )
      }
      {/* Other user's video */}
      
    </Grid>
  );
};

export default VideoPlayer;
