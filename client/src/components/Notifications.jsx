import React, { useContext } from "react";
import { Button, Typography, Box } from "@mui/material";

import { SocketContext } from "../SocketContext";

const Notifications = () => {
  const { answerCall, call, callAccepted } = useContext(SocketContext);

  return (
    <>
      {call.isReceivedCall && !callAccepted && (
        <Box display="flex" justifyContent="space-around" alignItems="center">
          <Typography variant="h6">{call.name} is calling:</Typography>
          <Button variant="contained" color="primary" onClick={answerCall}>
            Answer
          </Button>
        </Box>
      )}
    </>
  );
};

export default Notifications;
