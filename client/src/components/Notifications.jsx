import React, { useContext } from "react";
import { 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Avatar, 
  IconButton,
  Slide,
  Fade
} from "@mui/material";
import { 
  Call as CallIcon, 
  CallEnd as CallEndIcon,
  Person as PersonIcon
} from "@mui/icons-material";

import { SocketContext } from "../SocketContext";

const Notifications = () => {
  const { answerCall, call, callAccepted } = useContext(SocketContext);

  return (
    <>
      {call.isReceivedCall && !callAccepted && (
        <Fade in={true}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: 'white',
              mb: 2,
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PersonIcon />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {call.name || 'Someone'} is calling you
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Incoming video call
                  </Typography>
                </Box>
              </Box>
              
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<CallEndIcon />}
                  onClick={() => window.location.reload()}
                  sx={{ 
                    borderRadius: 6,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  Decline
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CallIcon />}
                  onClick={answerCall}
                  sx={{ 
                    borderRadius: 6,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  Answer
                </Button>
              </Box>
            </Box>
          </Paper>
        </Fade>
      )}
    </>
  );
};

export default Notifications;