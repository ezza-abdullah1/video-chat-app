import React, { useContext } from "react";
import { Grid, Typography, Paper, Box, useTheme, useMediaQuery } from "@mui/material";
import { Person, PeopleAlt } from "@mui/icons-material";
import { SocketContext } from "../SocketContext";

const VideoPlayer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    name, 
    callAccepted, 
    myVideo, 
    userVideo, 
    callEnded, 
    stream, 
    call,
    activeUsers,
    showUserCount 
  } = useContext(SocketContext);

  const videoHeight = isMobile ? '40vh' : '50vh';

  return (
    <Box sx={{ width: '100%', mb: { xs: 1, sm: 2 } }}>
      <Grid 
        container 
        spacing={{ xs: 1, sm: 2 }} 
        justifyContent="center"
      >
        {/* My Video */}
        {stream && (
          <Grid item xs={12} sm={callAccepted && !callEnded ? 6 : 12}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                height: videoHeight,
                maxHeight: { xs: '40vh', sm: '50vh' },
                backgroundColor: '#000',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Box 
                component="video"
                ref={myVideo}
                muted
                autoPlay
                playsInline
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: { xs: '2px 8px', sm: '4px 12px' },
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                <Person sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                <Typography variant="body2" fontSize="inherit">{name || 'You'}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* User's Video when in a call */}
        {callAccepted && !callEnded && (
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                height: videoHeight,
                maxHeight: { xs: '40vh', sm: '50vh' },
                backgroundColor: '#000',
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Box 
                component="video"
                ref={userVideo}
                autoPlay
                playsInline
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#fff',
                  padding: { xs: '2px 8px', sm: '4px 12px' },
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                <Person sx={{ fontSize: { xs: 14, sm: 16 }, mr: 0.5 }} />
                <Typography variant="body2" fontSize="inherit">{call.name || 'Caller'}</Typography>
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* User count display (when call ends or no call) */}
        {showUserCount && !callAccepted && (
          <Grid item xs={12} sm={6}>
            <Paper 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                height: videoHeight,
                maxHeight: { xs: '40vh', sm: '50vh' },
                backgroundColor: theme.palette.background.default,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <PeopleAlt sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
              <Typography variant="h6" align="center">
                {activeUsers.length === 1 ? 'No active calls' : `${activeUsers.length} users in this call`}
              </Typography>
              
              {/* Display active users */}
              <Box sx={{ mt: 2, maxWidth: '80%' }}>
                {activeUsers.length > 1 && (
                  <Typography variant="body1" align="center" color="text.secondary">
                    Users: {activeUsers.map(user => user.name).join(', ')}
                  </Typography>
                )}
                {activeUsers.length === 1 && (
                  <Typography variant="body1" align="center" color="text.secondary">
                    Enter an ID to call another user
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default VideoPlayer;