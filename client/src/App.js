import React, { useContext, useState } from "react";
import {
  Typography,
  AppBar,
  Box,
  Container,
  CssBaseline,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  TextField,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Paper,
  Divider,
  Avatar,
  IconButton,
  Chip,
} from "@mui/material";
import {
  VideoCall,
  People,
  Chat,
  CalendarToday,
  Add,
  ArrowForward,
  HighQuality,
  Security,
  CloudSync,
} from "@mui/icons-material";
import VideoPlayer from "./components/VideoPlayer";
import Options from "./components/Options";
import { SocketContext } from "./SocketContext";
import ChatBox from "./components/ChatBox";

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: "#1a73e8", 
      contrastText: "#ffffff",
      light: "#4285f4",
      dark: "#1557b0" 
    },
    secondary: { 
      main: "#ea4335", 
      contrastText: "#ffffff",
      light: "#ff6659",
      dark: "#c5221f"
    },
    success: {
      main: "#34a853",
      light: "#81c995",
      dark: "#0d652d"
    },
    warning: {
      main: "#fbbc04",
      light: "#fdd835",
      dark: "#f57c00"
    },
    background: { 
      default: "#f8f9fa", 
      paper: "#ffffff" 
    },
    text: {
      primary: "#202124",
      secondary: "#5f6368"
    }
  },
  typography: {
    fontFamily: '"Google Sans", "Roboto", "Arial", sans-serif',
    h1: { fontWeight: 500, fontSize: "2.5rem" },
    h2: { fontWeight: 500, fontSize: "2rem" },
    h3: { fontWeight: 500, fontSize: "1.75rem" },
    h4: { fontWeight: 500, fontSize: "1.5rem" },
    h5: { fontWeight: 500, fontSize: "1.25rem" },
    h6: { fontWeight: 500, fontSize: "1rem" },
    button: { textTransform: "none", fontWeight: 500 },
    body1: { fontSize: "1rem", lineHeight: 1.5 },
    body2: { fontSize: "0.875rem", lineHeight: 1.43 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: { 
        root: { 
          borderRadius: 24, 
          padding: "12px 24px",
          fontSize: "1rem",
          fontWeight: 500,
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          '&:hover': {
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
          }
        },
        contained: {
          '&:hover': {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }
        }
      },
    },
    MuiCard: {
      styleOverrides: { 
        root: { 
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "2px solid transparent",
          transition: "all 0.2s ease-in-out",
          '&:hover': {
            borderColor: "#1a73e8",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)"
          }
        } 
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            fontSize: "1rem"
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        }
      }
    }
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

// Utility function to generate a random room ID (8-character alphanumeric)
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const App = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [inputName, setInputName] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const { name, setName, roomId, setRoomId } = useContext(SocketContext);

  const createRoom = () => {
    const newRoomId = generateRoomId();
    setInputRoomId(newRoomId);
    setSnackbarOpen(true);
  };

  const handleJoinMeeting = () => {
    if (inputName.trim() && inputRoomId.trim()) {
      setName(inputName.trim());
      setRoomId(inputRoomId.trim());
    }
  };

  const isFormValid = inputName.trim().length > 0;
  const isJoinValid = isFormValid && inputRoomId.trim().length > 0;

  // If global name and roomId are not set, show join meeting form with new UI
  if (!name || !roomId) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
          {/* Header */}
          <AppBar 
            position="static" 
            color="transparent" 
            elevation={0}
            sx={{ 
              backgroundColor: "background.paper",
              borderBottom: "1px solid rgba(0,0,0,0.08)"
            }}
          >
            <Container maxWidth="lg">
              <Box sx={{ py: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: "primary.main",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <VideoCall sx={{ color: "white", fontSize: 28 }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                      VideoMeet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Premium video conferencing
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <Chip
                    icon={<People sx={{ fontSize: 16 }} />}
                    label="Up to 20 participants"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    icon={<Chat sx={{ fontSize: 16 }} />}
                    label="Real-time chat"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Container>
          </AppBar>

          {/* Main Content */}
          <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
            {/* Hero Section */}
            <Box sx={{ textAlign: "center", mb: 8 }}>
              <Typography variant="h1" sx={{ fontWeight: 700, mb: 2, color: "text.primary" }}>
                Connect with anyone, anywhere
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: "auto" }}>
                High-quality video calls for teams, friends, and family
              </Typography>
              
              {/* Hero Image Placeholder */}
              <Paper
                sx={{
                  maxWidth: 800,
                  mx: "auto",
                  mb: 8,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  height: { xs: 200, md: 300 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <VideoCall sx={{ fontSize: 80, color: "white", opacity: 0.8 }} />
              </Paper>
            </Box>

            {/* Meeting Cards */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 4, maxWidth: 800, mx: "auto", mb: 8 }}>
              {/* Create Meeting Card */}
              <Card 
                sx={{ 
                  border: "1px solid #e0e0e0",
                  borderRadius: 3,
                  boxShadow: "none",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease-in-out",
                  '&:hover': {
                    borderColor: "#1976d2",
                    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.1)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: "#e3f2fd",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3
                    }}
                  >
                    <Add sx={{ fontSize: 28, color: "#1976d2" }} />
                  </Box>
                  
                  {/* Title and Description */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#2c3e50" }}>
                    Create Meeting
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.5 }}>
                    Start a new meeting and invite others
                  </Typography>
                  
                  {/* Form */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#2c3e50" }}>
                        Your Name
                      </Typography>
                      <TextField
                        placeholder="Enter your name"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: "#1976d2"
                            },
                            '&.Mui-focused': {
                              borderColor: "#1976d2",
                              backgroundColor: "#ffffff"
                            },
                            '& fieldset': {
                              border: 'none'
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: "center",
                            py: 1.5
                          }
                        }}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={!isFormValid}
                      onClick={() => {
                        createRoom();
                        handleJoinMeeting();
                      }}
                      startIcon={<CalendarToday />}
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#7c4dff",
                        fontSize: "1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        boxShadow: "none",
                        '&:hover': {
                          backgroundColor: "#651fff",
                          boxShadow: "0 2px 8px rgba(124, 77, 255, 0.3)"
                        },
                        '&:disabled': {
                          backgroundColor: "#e0e0e0",
                          color: "#9e9e9e"
                        }
                      }}
                    >
                      Create Meeting
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Join Meeting Card */}
              <Card 
                sx={{ 
                  border: "1px solid #e0e0e0",
                  borderRadius: 3,
                  boxShadow: "none",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s ease-in-out",
                  '&:hover': {
                    borderColor: "#4caf50",
                    boxShadow: "0 4px 12px rgba(76, 175, 80, 0.1)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: "#e8f5e8",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3
                    }}
                  >
                    <ArrowForward sx={{ fontSize: 28, color: "#4caf50" }} />
                  </Box>
                  
                  {/* Title and Description */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, color: "#2c3e50" }}>
                    Join Meeting
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.5 }}>
                    Enter a meeting ID to join an existing meeting
                  </Typography>
                  
                  {/* Form */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#2c3e50" }}>
                        Your Name
                      </Typography>
                      <TextField
                        placeholder="Enter your name"
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: "#4caf50"
                            },
                            '&.Mui-focused': {
                              borderColor: "#4caf50",
                              backgroundColor: "#ffffff"
                            },
                            '& fieldset': {
                              border: 'none'
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: "center",
                            py: 1.5
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ textAlign: "left" }}>
                      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: "#2c3e50" }}>
                        Meeting ID
                      </Typography>
                      <TextField
                        placeholder="Enter meeting ID"
                        value={inputRoomId}
                        onChange={(e) => setInputRoomId(e.target.value)}
                        fullWidth
                        variant="outlined"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #e9ecef",
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: "#4caf50"
                            },
                            '&.Mui-focused': {
                              borderColor: "#4caf50",
                              backgroundColor: "#ffffff"
                            },
                            '& fieldset': {
                              border: 'none'
                            }
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: "center",
                            fontFamily: "monospace",
                            py: 1.5
                          }
                        }}
                      />
                    </Box>
                    
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={!isJoinValid}
                      onClick={handleJoinMeeting}
                      startIcon={<People />}
                      sx={{ 
                        py: 1.5,
                        borderRadius: 2,
                        backgroundColor: "#4caf50",
                        fontSize: "1rem",
                        fontWeight: 500,
                        textTransform: "none",
                        boxShadow: "none",
                        '&:hover': {
                          backgroundColor: "#388e3c",
                          boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)"
                        },
                        '&:disabled': {
                          backgroundColor: "#e0e0e0",
                          color: "#9e9e9e"
                        }
                      }}
                    >
                      Join Meeting
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Features Section */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 4, textAlign: "center" }}>
              <Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: "primary.light",
                    mx: "auto",
                    mb: 2
                  }}
                >
                  <HighQuality sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  HD Video & Audio
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crystal clear video calls with adaptive quality
                </Typography>
              </Box>
              <Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: "success.light",
                    mx: "auto",
                    mb: 2
                  }}
                >
                  <Chat sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Real-time Chat
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Send messages instantly during your meetings
                </Typography>
              </Box>
              <Box>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: "warning.light",
                    mx: "auto",
                    mb: 2
                  }}
                >
                  <People sx={{ fontSize: 32 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Up to 20 People
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with teams, friends, and family
                </Typography>
              </Box>
            </Box>
          </Container>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity="success"
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              Room created with ID: {inputRoomId}
            </Alert>
          </Snackbar>
        </Box>
      </ThemeProvider>
    );
  }

  // Meeting room interface with modern Google Meet style
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          height: "100vh",
          backgroundColor: "#202124",
          overflow: "hidden",
        }}
      >
        {/* Main content area */}
        <Box 
          sx={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Modern Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: { xs: 2, sm: 3 },
              py: 1.5, // Reduced padding
              backgroundColor: "rgba(32, 33, 36, 0.98)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              zIndex: 10,
              minHeight: "60px", // Fixed height for consistency
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32, // Reduced size
                  height: 32,
                  backgroundColor: "#1a73e8",
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <VideoCall sx={{ color: "white", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ 
                    color: "#e8eaed", 
                    fontSize: { xs: "1rem", sm: "1.1rem" }, 
                    fontWeight: 600,
                    lineHeight: 1.2
                  }}
                >
                  VideoMeet
                </Typography>
                {!isMobile && (
                  <Typography variant="caption" sx={{ color: "#9aa0a6", fontSize: "0.7rem", lineHeight: 1 }}>
                    {name} • {roomId}
                  </Typography>
                )}
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {isMobile && (
                <Typography variant="caption" sx={{ color: "#9aa0a6", fontSize: "0.7rem" }}>
                  {roomId}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Video Area */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <VideoPlayer />
            
            {/* Controls at bottom */}
            <Box 
              sx={{ 
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: { xs: 2, sm: 3 },
                background: "linear-gradient(transparent, rgba(32, 33, 36, 0.8))",
                zIndex: 10,
              }}
            >
              <Options />
            </Box>
          </Box>
        </Box>
        
        {/* Chat sidebar - hidden on mobile */}
        {!isMobile && (
          <Box
            sx={{
              width: 280, // Reduced width
              minWidth: 280,
              maxWidth: 320,
              borderLeft: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(32, 33, 36, 0.95)",
              display: "flex",
              flexDirection: "column",
              backdropFilter: "blur(8px)",
              zIndex: 2,
            }}
          >
            <ChatBox />
          </Box>
        )}
        
        {/* Mobile chat overlay */}
        {isMobile && <ChatBox />}
      </Box>
    </ThemeProvider>
  );
};

export default App;